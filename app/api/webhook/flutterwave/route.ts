import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAndWriteOrder } from "@/lib/order";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("verif-hash");
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = await req.json();
    if (payload.event !== "charge.completed") {
      return NextResponse.json({ received: true }); // not a payment event, ignore
    }

    const transactionId = payload.data.id;
    const txRef = payload.data.tx_ref;

    const pendingRef = adminDb.collection("pending_orders").doc(txRef);
    const pendingSnap = await pendingRef.get();
    if (!pendingSnap.exists) {
      return NextResponse.json({ received: true }); // already handled, or nothing staged
    }

    const { uid, items, address, phone, amount, currency } = pendingSnap.data()!;
    const result = await verifyAndWriteOrder({ uid, items, address, phone, amount, currency, txRef, transactionId });

    if (!("error" in result)) {
      await pendingRef.delete();
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook order confirmation failed:", err);
    return NextResponse.json({ received: true }); // return 200 so Flutterwave doesn't retry-storm you
  }
}