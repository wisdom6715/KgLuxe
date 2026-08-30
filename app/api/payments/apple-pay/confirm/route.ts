// app/api/payments/apple-pay/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { flwFetch } from "@/lib/flutterwave-v4";
import { finalizeOrder } from "@/lib/finalize-order";

export async function POST(req: NextRequest) {
  try {
    const { txRef } = await req.json();
    if (!txRef) return NextResponse.json({ error: "Missing txRef." }, { status: 400 });

    const pendingSnap = await adminDb.collection("pending_orders").doc(txRef).get();
    if (!pendingSnap.exists) {
      // Either already finalized by the webhook, or never existed
      const existing = await adminDb.collection("orders").where("tx_ref", "==", txRef).limit(1).get();
      if (!existing.empty) {
        return NextResponse.json({ success: true, orderId: existing.docs[0].id, duplicate: true });
      }
      return NextResponse.json({ error: "No matching pending order." }, { status: 404 });
    }

    const pending = pendingSnap.data()!;

    // Never trust the redirect — re-verify server-side against Flutterwave
    const chargeRes = await flwFetch(`/charges/${pending.chargeId}`);
    const charge = chargeRes.data;

    const isValid =
      charge.status === "succeeded" &&
      charge.reference === txRef &&
      Number(charge.amount) >= Number(pending.amount) &&
      charge.currency === pending.currency;

    if (!isValid) {
      return NextResponse.json({ error: "Payment not confirmed yet.", status: charge.status }, { status: 400 });
    }

    const result = await finalizeOrder({
      uid: pending.uid,
      items: pending.items,
      address: pending.address,
      phone: pending.phone,
      amount: pending.amount,
      currency: pending.currency,
      txRef,
      chargeId: pending.chargeId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Apple Pay confirm failed:", err);
    return NextResponse.json({ error: "Something went wrong confirming your Apple Pay order." }, { status: 500 });
  }
}