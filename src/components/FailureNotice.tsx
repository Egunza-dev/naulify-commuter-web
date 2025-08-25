'use client';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface FailureNoticeProps {
  resultData: any; // Contains reason
  onTryAgain: () => void;
}

export const FailureNotice = ({ resultData, onTryAgain }: FailureNoticeProps) => {
  return (
    <div className="p-4 text-center space-y-4 animate-fadeIn">
      {/* Icon and Title */}
      <div className="flex flex-col items-center gap-2 text-danger">
        <XCircleIcon className="h-16 w-16" />
        <h1 className="text-2xl font-bold">Payment Failed</h1>
      </div>

      {/* Reason Card */}
      <div className="bg-card border border-border p-4 rounded-lg text-left text-text-primary">
        <p>Your transaction could not be completed, and no money has been deducted from your account.</p>
        <p className="mt-2">
          <strong className="text-text-secondary">Reason:</strong> {resultData?.reason || 'An unknown error occurred.'}
        </p>
      </div>
      
      {/* Action Button */}
      <button
        onClick={onTryAgain}
        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-primary-hover transition-colors"
      >
        TRY AGAIN
      </button>

      <p className="text-text-secondary">Or pay fare using cash.</p>
    </div>
  );
};
