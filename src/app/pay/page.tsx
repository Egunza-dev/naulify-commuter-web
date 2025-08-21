// **1. Import the official PageProps type from Next.js**
import type { PageProps } from 'next';
import { getFareStages, FareStage } from '@/services/firebase';
import { decode } from 'base-64';
import PaymentFlow from '@/components/PaymentFlow'; 

/**
 * **2. Use the official PageProps type.**
 * This ensures our component's props are always compatible with Next.js.
 * The `searchParams` are part of this official type.
 */
export default async function PayPage({ searchParams }: PageProps) {
  const encodedData = searchParams?.data; // Added optional chaining for extra safety

  // --- 1. Data Validation and Decoding ---
  if (typeof encodedData !== 'string' || !encodedData) {
    return <ErrorState message="Invalid QR Code. Please scan a valid code." />;
  }

  let psvId: string;
  let plate: string;

  try {
    const jsonString = decode(encodedData);
    const payload = JSON.parse(jsonString);
    psvId = payload.psvId;
    plate = payload.plate;

    if (!psvId || !plate) {
      throw new Error("Missing required data in QR code payload.");
    }
  } catch (error) {
    console.error("Failed to decode or parse QR code data:", error);
    return <ErrorState message="The scanned QR code is malformed or invalid." />;
  }

  // --- 2. Data Fetching ---
  let initialFareStages: FareStage[] = [];
  try {
    initialFareStages = await getFareStages(psvId);
  } catch (error) {
    // Note: The ESLint warning about 'error' being unused is correct.
    // We can ignore it for now as our config turns it into a warning, not an error.
    return <ErrorState message="Could not connect to the service to get fare stages." />;
  }
  
  // --- 3. Render the Client Component with initial data ---
  return (
    <main className="container mx-auto max-w-md p-4">
      <PaymentFlow 
        psvId={psvId} 
        plate={plate} 
        initialFareStages={initialFareStages} 
      />
    </main>
  );
}

/**
 * A simple component to display a full-page error message.
 */
const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center">
    <h1 className="text-2xl font-bold text-red-500">Operation Failed</h1>
    <p className="mt-2 text-lg text-gray-400">{message}</p>
  </div>
);
