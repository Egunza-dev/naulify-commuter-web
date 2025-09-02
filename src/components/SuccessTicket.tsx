'use client';
import { SelectedRoute } from "./PaymentFlow";
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface SuccessTicketProps {
  plate: string;
  selectedRoutes: SelectedRoute[];
  resultData: any; // Contains the full document data from Firestore
}

export const SuccessTicket = ({ plate, selectedRoutes, resultData }: SuccessTicketProps) => {

  const getTransactionDate = () => {
    if (!resultData || !resultData.paidAt) return new Date().toLocaleString();
    if (resultData.paidAt._seconds) { // Firestore Timestamps serialize to { seconds, nanoseconds }
      return new Date(resultData.paidAt.seconds * 1000).toLocaleString();
    }
    return new Date(resultData.paidAt).toLocaleString();
  };

  // Graceful fallbacks for data
  const amountPaid = resultData?.amountPaid ?? 0;
  const receiptNumber = resultData?.mpesaReceiptNumber ?? 'N/A';

  return (
    <div className="p-4 text-center space-y-4 animate-fadeIn">
      {/* Icon and Title */}
      <div className="flex flex-col items-center gap-2 text-success">
        <CheckCircleIcon className="h-16 w-16" />
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
      </div>
      
      {/* Digital Ticket */}
      <div className="bg-card border-2 border-dashed border-success p-4 rounded-lg text-left text-text-primary space-y-1">
        <p className="text-center font-bold text-lg mb-2">NAULIFY DIGITAL TICKET</p>
        <div className="flex justify-between">
          <span className="text-text-secondary">VEHICLE:</span>
          <strong className="font-mono">{plate}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">AMOUNT PAID:</span>
          <strong className="font-mono">KSH {amountPaid.toFixed(2)}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">M-PESA REF:</span>
          <strong className="font-mono">{receiptNumber}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">DATE:</span>
          <strong className="font-mono">{getTransactionDate()}</strong>
        </div>

        <hr className="my-2 border-border"/>

        <p className="text-text-secondary">TICKETS BOUGHT:</p>
        {selectedRoutes.map(route => (
          <div key={route.id} className="flex justify-between items-center ml-2">
            <span className="text-sm">{route.quantity}x {route.description}</span>
            <span className="text-sm font-mono">KSH {(route.quantity * route.fare).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <p className="text-text-secondary">Show this screen to the conductor.</p>
    </div>
  );
};
