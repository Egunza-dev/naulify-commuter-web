'use client';
import { SelectedRoute } from "./PaymentFlow";
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

interface PaymentConfirmationProps {
  plate: string;
  selectedRoutes: SelectedRoute[];
  phoneNumber: string;
  onSetPhoneNumber: (value: string) => void;
  isLoading: boolean;
  onPayNow: () => void;
  onBack: () => void;
}

export const PaymentConfirmation = ({ plate, selectedRoutes, phoneNumber, onSetPhoneNumber, isLoading, onPayNow, onBack }: PaymentConfirmationProps) => {
  const total = selectedRoutes.reduce((sum, route) => sum + route.fare * route.quantity, 0);

  return (
    <div className="p-4 space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors">
        <ArrowLeftIcon className="h-5 w-5" />
        <span className="font-semibold">Back to Selection</span>
      </button>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Confirm Payment</h1>
        <p className="text-text-secondary">Vehicle: {plate}</p>
      </div>

      {/* Summary Card */}
      <div className="bg-card p-4 rounded-lg space-y-2 border border-border">
        <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2 mb-2">FINAL SUMMARY</h2>
        {selectedRoutes.map(route => (
          <div key={route.id} className="flex justify-between text-text-primary">
            <span>{route.quantity}x {route.description}</span>
            <span>KSH {(route.fare * route.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xl font-bold text-text-primary border-t border-border pt-2 mt-2">
          <span>TOTAL TO PAY:</span>
          <span>KSH {total.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Phone Number Input */}
      <div>
        <label htmlFor="phone" className="block mb-2 font-semibold text-text-primary">Enter your M-PESA phone number:</label>
        <input
          type="tel"
          id="phone"
          value={phoneNumber}
          onChange={(e) => onSetPhoneNumber(e.target.value)}
          placeholder="e.g., 254712345678"
          className="w-full bg-background p-3 rounded-lg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
        <p className="text-xs text-text-secondary mt-1">(An STK push will be sent to your phone)</p>
      </div>

      {/* Pay Now Button */}
      <button
        onClick={onPayNow}
        disabled={isLoading || phoneNumber.length < 10}
        className="w-full bg-success text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-success-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : `PAY KSH ${total.toFixed(2)}`}
      </button>
    </div>
  );
};
