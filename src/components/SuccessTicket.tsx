'use client';
import { SelectedRoute } from "./PaymentFlow";

interface SuccessTicketProps {
  plate: string;
  selectedRoutes: SelectedRoute[];
  resultData: any; // Contains ref, amount, date
}

export const SuccessTicket = ({ plate, selectedRoutes, resultData }: SuccessTicketProps) => {
  return (
    <div className="p-4 text-center space-y-4">
      <div className="text-green-400">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <div className="bg-gray-100 text-black p-4 rounded-lg text-left font-mono space-y-1">
        <p className="text-center font-sans font-bold text-lg mb-2">NAULIFY DIGITAL TICKET</p>
        <p><strong>Vehicle:</strong> {plate}</p>
        <p><strong>Paid:</strong> KSH {resultData.amount.toFixed(2)}</p>
        <p><strong>Ref:</strong> {resultData.ref}</p>
        <p><strong>Date:</strong> {new Date(resultData.date).toLocaleString()}</p>
        <hr className="my-2 border-gray-400"/>
        <p><strong>TICKETS BOUGHT:</strong></p>
        {selectedRoutes.map(route => (
          <p key={route.id}>- {route.quantity}x {route.description}</p>
        ))}
      </div>
      <p className="text-gray-400">Show this screen to the conductor.</p>
    </div>
  );
};
