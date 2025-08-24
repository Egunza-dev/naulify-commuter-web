'use client'; 

import { FareStage } from "@/services/firebase";
import { useState, useEffect, useRef } from "react";
import { PaymentConfirmation } from "./PaymentConfirmation";
import { RouteSelection } from "./RouteSelection";
import { SuccessTicket } from "./SuccessTicket";
import { FailureNotice } from "./FailureNotice";
import { PaymentWaiting } from "./PaymentWaiting"; // 1. Import our new component

export interface SelectedRoute {
  id: string;
  description: string;
  fare: number;
  quantity: number;
}

// 2. Add the new 'waiting' step to our type
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
  
  // NEW: State to hold the ID we need for polling
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);

  // NEW: Refs to manage the polling intervals and timeouts
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- NEW: Polling Logic ---
  useEffect(() => {
    // This effect runs ONLY when the step changes to 'waiting'
    if (step === 'waiting' && checkoutRequestID) {
      
      // Function to clean up timers
      const cleanupTimers = () => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };

      // Start polling the status endpoint every 4 seconds
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/status/${checkoutRequestID}`);
          const data = await response.json();

          if (data.status === 'success') {
            cleanupTimers();
            setResultData(data.data); // Use the final data from the DB
            setStep('success');
          } else if (data.status === 'failed') {
            cleanupTimers();
            setResultData(data.data);
            setStep('failure');
          }
          // If status is 'pending' or 'not_found', do nothing and let it poll again.
        } catch (error) {
          console.error("Polling error:", error);
          // Optional: handle polling network errors
        }
      }, 4000); // Poll every 4 seconds

      // Set a timeout for the entire process (e.g., 90 seconds)
      timeoutRef.current = setTimeout(() => {
        cleanupTimers();
        setResultData({ reason: "Transaction timed out. Please try again." });
        setStep('failure');
      }, 90000); // 90 second timeout

      // Cleanup function to run if the component unmounts
      return () => cleanupTimers();
    }
  }, [step, checkoutRequestID]);


  // --- Logic Handlers ---
  const handleProceedToPay = () => setStep('confirmation');
  const handleBackToSelection = () => setStep('selection');

  const handleCancelPayment = () => {
    // This allows the user to exit the waiting screen
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStep('confirmation');
  };

  // --- REWRITTEN: Payment Initiation Logic ---
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
      
      // On success, save the checkoutID and move to the 'waiting' step
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
  
  // --- UPDATED: Switch statement to include the new 'waiting' case ---
  switch (step) {
    case 'selection':
      return <RouteSelection fareStages={initialFareStages} selectedRoutes={selectedRoutes} onSetSelectedRoutes={setSelectedRoutes} onProceed={handleProceedToPay} />;
    case 'confirmation':
      return <PaymentConfirmation plate={plate} selectedRoutes={selectedRoutes} phoneNumber={phoneNumber} onSetPhoneNumber={setPhoneNumber} isLoading={isLoading} onPayNow={handlePayNow} onBack={handleBackToSelection} />;
    case 'waiting':
      return <PaymentWaiting phoneNumber={phoneNumber} onCancel={handleCancelPayment} />;
    case 'success':
      // We now pass the amount from the resultData, as it's the source of truth
      return <SuccessTicket plate={plate} selectedRoutes={selectedRoutes} resultData={{...resultData, amount: resultData.amountPaid}} />;
    case 'failure':
      return <FailureNotice resultData={{reason: resultData.failureReason}} onTryAgain={() => setStep('confirmation')} />;
    default:
      return null;
  }
}
