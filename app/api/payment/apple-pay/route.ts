import { NextRequest, NextResponse } from "next/server";
import { createApplePayCharge } from "@/lib/flutterwave-v4";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, email, phone, name, txRef } = await req.json();
    if (!amount || !currency || !email || !name || !txRef) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const charge = await createApplePayCharge({
      amount, currency, email, phone, name,
      reference: txRef,
      redirectUrl: `${origin}/payment/callback?tx_ref=${txRef}`,
    });

    const redirectUrl = charge?.next_action?.redirect_url?.url;
    if (!redirectUrl) {
      return NextResponse.json({ error: "No redirect URL returned" }, { status: 502 });
    }
    return NextResponse.json({ redirectUrl, chargeId: charge.id });
  } catch (err: any) {
    console.error("Apple Pay charge failed:", err);
    return NextResponse.json({ error: err.message || "Apple Pay failed" }, { status: 500 });
  }
}