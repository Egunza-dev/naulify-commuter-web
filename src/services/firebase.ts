// Import the functions you need from the SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration, read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely for Next.js server-side rendering
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * Interface for a single fare stage, based on the SDS for the 'routes' subcollection.
 */
export interface FareStage {
  id: string;
  description: string;
  fare: number;
}

/**
 * Fetches the list of available fare stages for a given PSV.
 * This function will be called by our server component.
 * 
 * @param psvId The unique ID of the PSV (from the QR code).
 * @returns A promise that resolves to an array of FareStage objects.
 */
export const getFareStages = async (psvId: string): Promise<FareStage[]> => {
  try {
    const routesCollectionRef = collection(db, 'psvs', psvId, 'routes');
    const querySnapshot = await getDocs(routesCollectionRef);

    if (querySnapshot.empty) {
      console.log(`No fare stages found for psvId: ${psvId}`);
      return [];
    }

    const stages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      description: doc.data().description,
      fare: doc.data().fare,
    })) as FareStage[];

    return stages;

  } catch (error) {
    console.error(`Error fetching fare stages for psvId: ${psvId}`, error);
    // In a real app, you might want to throw a more specific error here.
    throw new Error("Could not fetch fare stages.");
  }
};
