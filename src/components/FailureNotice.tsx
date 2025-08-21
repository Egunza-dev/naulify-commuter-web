'use client';

interface FailureNoticeProps {
  resultData: any; // Contains reason
  onTryAgain: () => void;
}

export const FailureNotice = ({ resultData, onTryAgain }: FailureNoticeProps) => {
  return (
    <div className="p-4 text-center space-y-4">
      <div className="text-red-500">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Payment Failed</h1>
      <div className="bg-gray-700 p-4 rounded-lg text-left">
        <p>Your transaction could not be completed.</p>
        <p>No money has been deducted from your account.</p>
        <p className="mt-2"><strong>Reason:</strong> {resultData?.reason || 'An unknown error occurred.'}</p>
      </div>
      <button
        onClick={onTryAgain}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-blue-700 transition"
      >
        TRY AGAIN
      </button>
      <p className="text-gray-400">Or pay fare using cash.</p>
    </div>
  );
};
