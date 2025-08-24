import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (safe to call in multiple files)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * This is the route handler for POST requests to /api/callback.
 * It is called by the M-PESA Daraja API, not our frontend.
 */
export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    console.log("Received M-PESA Callback:", JSON.stringify(callbackData, null, 2));

    const result = callbackData.Body.stkCallback;
    const checkoutRequestID = result.CheckoutRequestID;

    // Use a collection group query to find the payment document
    const paymentsRef = db.collectionGroup('payments');
    const querySnapshot = await paymentsRef.where('checkoutRequestID', '==', checkoutRequestID).limit(1).get();
    
    if (querySnapshot.empty) {
      console.error(`Callback received for unknown CheckoutRequestID: ${checkoutRequestID}`);
      // Acknowledge the request to M-PESA even if we can't find the doc
      return NextResponse.json({ message: "Acknowledged" });
    }

    const paymentDocRef = querySnapshot.docs[0].ref;
    
    // Check the result code to determine success or failure
    if (result.ResultCode === 0) {
      // Payment was successful
      const metadata = result.CallbackMetadata.Item;
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;

      await paymentDocRef.update({
        status: 'success',
        mpesaReceiptNumber: mpesaReceiptNumber,
        paidAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp for accuracy
        callbackMetadata: metadata, // Store all metadata for auditing
      });

      console.log(`Successfully updated payment for ${checkoutRequestID} to success.`);

    } else {
      // Payment failed or was cancelled by the user
      await paymentDocRef.update({
        status: 'failed',
        failureReason: result.ResultDesc,
        callbackResultCode: result.ResultCode,
      });
      
      console.log(`Updated payment for ${checkoutRequestID} to failed. Reason: ${result.ResultDesc}`);
    }

    // Acknowledge receipt of the callback to the M-PESA API
    return NextResponse.json({ message: "Callback received and processed." });

  } catch (error: any) {
    console.error("Error in M-PESA callback handler:", error);
    // Return a generic error to M-PESA, but log the specific error
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
