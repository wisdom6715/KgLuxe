import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

type PaymentCurrency = "USD" | "NGN";

const formatMoney = (value: number, currency: PaymentCurrency) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "NGN" ? 0 : 2,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(Number(value) || 0);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, items, address, phone, amount, txRef, transactionId } = body;
    const currency: PaymentCurrency = body.currency === "NGN" ? "NGN" : "USD";

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
      verifyData.data?.currency === currency;

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
      currency,
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
              <td style="padding:8px 0;text-align:right;">${formatMoney(it.paymentPrice ?? it.price, currency)}</td>
            </tr>`
        )
        .join("");

      await resend.emails.send({
        from: "KgLuxe Orders <noreply@kgluxee.store>",
        to: email,
        subject: `KgLuxe Order Confirmed — #${orderRef.id.slice(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
            <div style="text-align:center; margin-bottom:24px;">
              <img src="https://firebasestorage.googleapis.com/v0/b/kgluxe.firebasestorage.app/o/IMG-20260718-WA0002.jpg?alt=media&token=fa734fd5-bf36-411e-a7c5-7b34187b9ca4" alt="KgLuxe" style="height:40px;" />
            </div>
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
            <p style="margin-top:16px; font-weight:600;">Total: ${formatMoney(amount, currency)}</p>
            <p style="margin-top:8px; color:#666; font-size:13px;">
              Delivering to: ${address.street}, ${address.city}, ${address.state}, ${address.country}
            </p>
            <div style="margin-top:28px; padding-top:20px; border-top:1px solid #eee; font-size:13px; color:#555; line-height:1.6;">
              <p style="margin:0 0 8px;">
                A personal thank you for shopping with us — every order means a great deal to our small team, and we're grateful for your trust.
              </p>
              <p style="margin:0; font-style:italic;">— [CEO Name], Founder & CEO, KgLuxe</p>
            </div>
            <p style="margin-top:24px; color:#000; font-size:12px;">Order ID: ${orderRef.id}</p>
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