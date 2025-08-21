import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to get M-PESA API access token
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

// This is the main function that handles POST requests to /api/pay
export async function POST(request: NextRequest) {
  try {
    // 1. Input Validation
    const { psvId, phoneNumber, selections } = await request.json();
    if (!psvId || !phoneNumber || !selections || !Array.isArray(selections)) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    // 2. Server-Side Amount Calculation (CRITICAL FOR SECURITY)
    const totalAmount = selections.reduce((sum, item) => sum + item.fare * item.quantity, 0);

    if (totalAmount < 1) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    // 3. Prepare M-PESA STK Push Request
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

    // 4. Initiate the STK Push
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushPayload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // 5. Respond to the client
    if (response.data && response.data.ResponseCode === "0") {
      return NextResponse.json({
        message: "Payment request initiated successfully. Please check your phone.",
        data: {
          MerchantRequestID: response.data.MerchantRequestID,
          CheckoutRequestID: response.data.CheckoutRequestID,
        },
      });
    } else {
      throw new Error(response.data.errorMessage || "M-PESA request failed.");
    }
  } catch (error: any) {
    console.error("Error processing payment:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.errorMessage || error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
