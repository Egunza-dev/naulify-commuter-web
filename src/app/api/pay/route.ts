import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import admin from 'firebase-admin';

// --- NEW: Firebase Admin Initialization ---
// We need to initialize the admin SDK to interact with Firestore from the server.

// Check if the app is already initialized to prevent errors during hot-reloading
if (!admin.apps.length) {
  // Get the credentials from Vercel's environment variables
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// --- (getAccessToken function remains the same) ---
const getAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Daraja API credentials are not configured.");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};


export async function POST(request: NextRequest) {
  try {
    const { psvId, phoneNumber, selections } = await request.json();
    if (!psvId || !phoneNumber || !selections || !Array.isArray(selections)) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const totalAmount = selections.reduce((sum, item) => sum + item.fare * item.quantity, 0);

    if (totalAmount < 1) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }
    
    // --- NEW LOGIC: Prepare for STK Push and Database Write ---
    const accessToken = await getAccessToken();
    const darajaShortcode = process.env.DARAJA_SHORTCODE;
    const darajaPasskey = process.env.DARAJA_PASSKEY;
    const darajaCallbackUrl = process.env.DARAJA_CALLBACK_URL;
    const darajaTransactionType = process.env.DARAJA_TRANSACTION_TYPE;
    
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${darajaShortcode}${darajaPasskey}${timestamp}`).toString("base64");

    const stkPushPayload = {
      BusinessShortCode: darajaShortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: darajaTransactionType,
      Amount: 1, // Use 1 for sandbox testing
      PartyA: phoneNumber,
      PartyB: darajaShortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: darajaCallbackUrl,
      AccountReference: "Naulify Fare Payment",
      TransactionDesc: "Payment for PSV fare",
    };

    const darajaResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushPayload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!darajaResponse.data || darajaResponse.data.ResponseCode !== "0") {
        throw new Error(darajaResponse.data.errorMessage || "M-PESA request failed to initialize.");
    }
      
    const checkoutRequestID = darajaResponse.data.CheckoutRequestID;

    // ** NEW: Create a 'pending' document in Firestore **
    const paymentRef = db.collection('psvs').doc(psvId).collection('payments').doc();
    
    await paymentRef.set({
      status: 'pending',
      checkoutRequestID: checkoutRequestID,
      psvId: psvId,
      phoneNumber: phoneNumber,
      selections: selections,
      amountPaid: totalAmount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // ** CHANGED: Respond to the client with only the necessary ID **
    return NextResponse.json({
        message: "Payment request initiated successfully. Please check your phone.",
        checkoutRequestID: checkoutRequestID,
    });

  } catch (error: any) {
    console.error("Error processing payment:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.errorMessage || error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
