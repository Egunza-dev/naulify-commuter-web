'use client';
import { SelectedRoute } from "./PaymentFlow";

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
    <div className="p-4 space-y-6">
      <button onClick={onBack} className="text-blue-400 hover:underline">
        &lt; Back to Selection
      </button>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Confirm Your Payment</h1>
        <p className="text-gray-400">for vehicle {plate}</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg space-y-2">
        <h2 className="text-lg font-bold border-b border-gray-600 pb-2 mb-2">FINAL SUMMARY</h2>
        {selectedRoutes.map(route => (
          <div key={route.id} className="flex justify-between">
            <span>{route.quantity}x {route.description}</span>
            <span>KSH {(route.fare * route.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xl font-bold border-t border-gray-600 pt-2 mt-2">
          <span>TOTAL TO PAY:</span>
          <span>KSH {total.toFixed(2)}</span>
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="block mb-2 font-semibold">Enter your M-PESA phone number:</label>
        <input
          type="tel"
          id="phone"
          value={phoneNumber}
          onChange={(e) => onSetPhoneNumber(e.target.value)}
          placeholder="e.g., 2547..."
          className="w-full bg-gray-800 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">(A confirmation will be sent to your phone)</p>
      </div>
      <button
        onClick={onPayNow}
        disabled={isLoading || phoneNumber.length < 10}
        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-green-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'PAY NOW'}
      </button>
    </div>
  );
};
