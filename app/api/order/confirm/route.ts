import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, items, address, phone, amount, txRef, transactionId } = body;

    if (!uid || !items?.length || !address || !phone || !amount || !txRef || !transactionId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Re-verify the transaction directly with Flutterwave — never trust client-reported success
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json();

    const isValid =
      verifyData.status === "success" &&
      verifyData.data?.status === "successful" &&
      verifyData.data?.tx_ref === txRef &&
      Number(verifyData.data?.amount) >= Number(amount) &&
      verifyData.data?.currency === "USD";

    if (!isValid) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // 2. Idempotency: don't double-write if this tx_ref was already processed
    const existing = await adminDb.collection("orders").where("tx_ref", "==", txRef).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ success: true, orderId: existing.docs[0].id, duplicate: true });
    }

    // 3. Fetch the user's profile server-side (source of truth for email/name)
    const userSnap = await adminDb.collection("users").doc(uid).get();
    const userData = userSnap.data();
    const email = userData?.email;
    const name =
      userData?.displayName ||
      `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim() ||
      "Customer";

    // 4. Write the order
    const orderRef = await adminDb.collection("orders").add({
      user_id: uid,
      username: name,
      items,
      address,
      phone,
      amount,
      tx_ref: txRef,
      flw_transaction_id: transactionId,
      flw_ref: verifyData.data?.flw_ref ?? null,
      status: "confirmed",
      createdAt: FieldValue.serverTimestamp(),
    });

    // 5. Delete only the ordered items from the cart — targeted by cart doc id,
    //    same technique CartPage uses (deleteDoc by id), just via adminDb server-side.
    //    Anything added to the cart mid-checkout is left untouched.
    const cartCollection = adminDb.collection("users").doc(uid).collection("add-to-cart");
    const batch = adminDb.batch();
    items.forEach((it: any) => {
      if (it.cartItemId) {
        batch.delete(cartCollection.doc(it.cartItemId));
      }
    });
    await batch.commit();

    // 6. Send confirmation email via Resend
    if (email) {
      const itemsHtml = items
        .map(
          (it: any) => `
            <tr>
              <td style="padding:8px 0;">${it.product}${it.color ? ` (${it.color})` : ""}${it.size ? ` - ${it.size}` : ""}</td>
              <td style="padding:8px 0;text-align:center;">${it.quantity}</td>
              <td style="padding:8px 0;text-align:right;">$${it.price}</td>
            </tr>`
        )
        .join("");

      await resend.emails.send({
        from: "Orders <noreply@kgluxee.store>",
        to: email,
        subject: `Order Confirmed — #${orderRef.id.slice(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
            <h2 style="color:#A07840;">Thanks for your order, ${name}!</h2>
            <p>Your payment was successful and your order is being processed.</p>
            <table style="width:100%; border-collapse:collapse; margin-top:16px;">
              <thead>
                <tr style="border-bottom:1px solid #eee; text-align:left;">
                  <th style="padding:8px 0;">Item</th>
                  <th style="padding:8px 0;text-align:center;">Qty</th>
                  <th style="padding:8px 0;text-align:right;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <p style="margin-top:16px; font-weight:600;">Total: $${amount}</p>
            <p style="margin-top:8px; color:#666; font-size:13px;">
              Delivering to: ${address.street}, ${address.city}, ${address.state}, ${address.country}
            </p>
            <p style="margin-top:24px; color:#999; font-size:12px;">Order ID: ${orderRef.id}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (err) {
    console.error("Order confirmation failed:", err);
    return NextResponse.json({ error: "Something went wrong confirming your order." }, { status: 500 });
  }
}