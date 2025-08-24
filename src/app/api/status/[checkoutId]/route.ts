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
 * This is the route handler for GET requests to /api/status/[checkoutId].
 * It checks the status of a payment document in Firestore.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { checkoutId: string } }
) {
  try {
    const { checkoutId } = params;

    if (!checkoutId) {
      return NextResponse.json({ error: "Checkout ID is required." }, { status: 400 });
    }

    // Firestore queries for a document within a collection group.
    // This is a powerful query that finds a document in any 'payments' subcollection
    // without needing to know the psvId first.
    const paymentsRef = db.collectionGroup('payments');
    const querySnapshot = await paymentsRef.where('checkoutRequestID', '==', checkoutId).limit(1).get();

    if (querySnapshot.empty) {
      // This can happen if the polling starts before the initial document is created.
      // We'll treat it as 'pending' on the frontend.
      return NextResponse.json({ status: 'not_found' });
    }

    const paymentDoc = querySnapshot.docs[0];
    const paymentData = paymentDoc.data();

    // Respond with the current status and the full data of the document.
    return NextResponse.json({ 
      status: paymentData.status, // e.g., 'pending', 'success', 'failed'
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
