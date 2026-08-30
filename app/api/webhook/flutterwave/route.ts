// app/api/webhooks/flutterwave/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { finalizeOrder } from "@/lib/finalize-order";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("flutterwave-signature") || "";
  const secretHash = process.env.FLW_SECRET_HASH!;

  const expected = crypto.createHmac("sha256", secretHash).update(rawBody).digest("base64");
  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  if (payload.type === "charge.completed" && payload.data.status === "succeeded") {
    const txRef = payload.data.reference;
    const pendingSnap = await adminDb.collection("pending_orders").doc(txRef).get();
    if (pendingSnap.exists) {
      const pending = pendingSnap.data()!;
      await finalizeOrder({
        uid: pending.uid,
        items: pending.items,
        address: pending.address,
        phone: pending.phone,
        amount: pending.amount,
        currency: pending.currency,
        txRef,
        chargeId: pending.chargeId,
      });
    }
  }

  return NextResponse.json({ received: true });
}