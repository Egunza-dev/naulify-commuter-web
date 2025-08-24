'use client';

interface PaymentWaitingProps {
  phoneNumber: string;
  onCancel: () => void;
}

export const PaymentWaiting = ({ phoneNumber, onCancel }: PaymentWaitingProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 space-y-6 animate-fadeIn">
      {/* Spinner Icon */}
      <div>
        <svg 
          className="animate-spin h-12 w-12 text-blue-400" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl font-bold">Confirm on Your Phone</h1>

      {/* Instructional Text */}
      <p className="text-gray-300">
        We have sent a payment request to{' '}
        <span className="font-bold text-white">{phoneNumber}</span>.
        Please enter your M-PESA PIN to complete the transaction.
      </p>

      {/* Separator */}
      <div className="w-full border-t border-gray-700"></div>

      {/* Cancel Button */}
      <p className="text-sm text-gray-500">
        {/* THE FIX IS HERE: Replaced "don't" with "don&apos;t" */}
        If you don&apos;t receive a prompt, or if you made a mistake, you can cancel.
      </p>
      <button
        onClick={onCancel}
        className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition"
      >
        CANCEL
      </button>
    </div>
  );
};
