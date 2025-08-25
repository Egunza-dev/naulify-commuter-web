'use client'; 

import { FareStage } from "@/services/firebase";
import { useState, useEffect, useRef } from "react";
import { PaymentConfirmation } from "./PaymentConfirmation";
import { RouteSelection } from "./RouteSelection";
import { SuccessTicket } from "./SuccessTicket";
import { FailureNotice } from "./FailureNotice";
import { PaymentWaiting } from "./PaymentWaiting";

export interface SelectedRoute {
  id: string;
  description: string;
  fare: number;
  quantity: number;
}

type PaymentStep = 'selection' | 'confirmation' | 'waiting' | 'success' | 'failure';

interface PaymentFlowProps {
  psvId: string;
  plate: string;
  initialFareStages: FareStage[];
}

export default function PaymentFlow({ psvId, plate, initialFareStages }: PaymentFlowProps) {
  const [step, setStep] = useState<PaymentStep>('selection'); 
  const [selectedRoutes, setSelectedRoutes] = useState<SelectedRoute[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 'waiting' && checkoutRequestID) {
      
      const cleanupTimers = () => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/status/${checkoutRequestID}`);
          const data = await response.json();

          if (data.status === 'success') {
            cleanupTimers();
            setResultData(data.data);
            setStep('success');
          } else if (data.status === 'failed') {
            cleanupTimers();
            setResultData(data.data);
            setStep('failure');
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 4000);

      timeoutRef.current = setTimeout(() => {
        cleanupTimers();
        setResultData({ reason: "Transaction timed out. Please try again." });
        setStep('failure');
      }, 90000);

      return () => cleanupTimers();
    }
  }, [step, checkoutRequestID]);

  const handleProceedToPay = () => setStep('confirmation');
  const handleBackToSelection = () => setStep('selection');

  const handleCancelPayment = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStep('confirmation');
  };

  const handlePayNow = async () => {
    setIsLoading(true);
    const payload = { psvId, phoneNumber, selections: selectedRoutes };

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to initiate payment.');
      }
      
      setCheckoutRequestID(responseData.checkoutRequestID);
      setStep('waiting');

    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      setResultData({ reason: error.message });
      setStep('failure');
    } finally {
      setIsLoading(false);
    }
  };
  
  switch (step) {
    case 'selection':
      // --- THE ONLY CHANGE IS HERE ---
      return <RouteSelection 
        plate={plate} // Pass the plate prop down
        fareStages={initialFareStages} 
        selectedRoutes={selectedRoutes} 
        onSetSelectedRoutes={setSelectedRoutes} 
        onProceed={handleProceedToPay} 
      />;
    case 'confirmation':
      return <PaymentConfirmation plate={plate} selectedRoutes={selectedRoutes} phoneNumber={phoneNumber} onSetPhoneNumber={setPhoneNumber} isLoading={isLoading} onPayNow={handlePayNow} onBack={handleBackToSelection} />;
    case 'waiting':
      return <PaymentWaiting phoneNumber={phoneNumber} onCancel={handleCancelPayment} />;
    case 'success':
      return <SuccessTicket plate={plate} selectedRoutes={selectedRoutes} resultData={{...resultData, amount: resultData.amountPaid}} />;
    case 'failure':
      return <FailureNotice resultData={{reason: resultData.failureReason}} onTryAgain={() => setStep('confirmation')} />;
    default:
      return null;
  }
}
