'use client'; 

import { FareStage } from "@/services/firebase";
import { useState } from "react";
import { PaymentConfirmation } from "./PaymentConfirmation";
import { RouteSelection } from "./RouteSelection";
import { SuccessTicket } from "./SuccessTicket";
import { FailureNotice } from "./FailureNotice";

export interface SelectedRoute {
  id: string;
  description: string;
  fare: number;
  quantity: number;
}

type PaymentStep = 'selection' | 'confirmation' | 'success' | 'failure';

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

  const handleProceedToPay = () => {
    setStep('confirmation');
  };

  const handleBackToSelection = () => {
    setStep('selection');
  };

  const handlePayNow = async () => {
    setIsLoading(true);

    const payload = {
      psvId: psvId,
      phoneNumber: phoneNumber,
      selections: selectedRoutes.map(route => ({
        routeId: route.id,
        description: route.description,
        fare: route.fare,
        quantity: route.quantity,
      })),
    };

    try {
      // --- THE ONLY CHANGE IS HERE ---
      // The URL is now a simple, relative path to our new Route Handler.
      const functionUrl = '/api/pay';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'An unknown error occurred on the server.');
      }
      
      setResultData(responseData);
      setStep('success');

    } catch (error: any) {
      console.error("Payment failed:", error);
      setResultData({
        reason: error.message || 'Could not connect to the payment service.',
      });
      setStep('failure');
    } finally {
      setIsLoading(false);
    }
  };
  
  // The switch statement for rendering components remains unchanged.
  switch (step) {
    case 'selection':
      return (
        <RouteSelection 
          fareStages={initialFareStages} 
          selectedRoutes={selectedRoutes}
          onSetSelectedRoutes={setSelectedRoutes}
          onProceed={handleProceedToPay}
        />
      );
    case 'confirmation':
      return (
        <PaymentConfirmation 
          plate={plate}
          selectedRoutes={selectedRoutes}
          phoneNumber={phoneNumber}
          onSetPhoneNumber={setPhoneNumber}
          isLoading={isLoading}
          onPayNow={handlePayNow}
          onBack={handleBackToSelection}
        />
      );
    case 'success':
      return (
        <SuccessTicket 
          plate={plate} 
          selectedRoutes={selectedRoutes} 
          resultData={resultData} 
        />
      );
    case 'failure':
      return (
        <FailureNotice 
          resultData={resultData} 
          onTryAgain={() => setStep('confirmation')} 
        />
      );
    default:
      return null;
  }
}
