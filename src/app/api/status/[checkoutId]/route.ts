import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors during hot-reloading
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * THE DEFINITIVE FIX:
 * We remove the manual typing from the second argument. By destructuring
 * `{ params }` and letting TypeScript infer its type, we avoid any
 * conflict with Next.js's internal complex types.
 */
export async function GET(request: NextRequest, { params }: any) {
  try {
    const { checkoutId } = params;

    if (!checkoutId) {
      return NextResponse.json({ error: "Checkout ID is required." }, { status: 400 });
    }

    const paymentsRef = db.collectionGroup('payments');
    const querySnapshot = await paymentsRef.where('checkoutRequestID', '==', checkoutId).limit(1).get();

    if (querySnapshot.empty) {
      return NextResponse.json({ status: 'not_found' });
    }

    const paymentDoc = querySnapshot.docs[0];
    const paymentData = paymentDoc.data();

    return NextResponse.json({ 
      status: paymentData.status,
      data: paymentData 
    });

  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while checking status." },
      { status: 500 }
    );
  }
}
