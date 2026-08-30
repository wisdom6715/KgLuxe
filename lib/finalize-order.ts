// lib/finalize-order.ts
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

export async function finalizeOrder(pending: {
  uid: string;
  items: any[];
  address: any;
  phone: string;
  amount: number;
  currency: PaymentCurrency;
  txRef: string;
  chargeId: string;
}) {
  const { uid, items, address, phone, amount, currency, txRef, chargeId } = pending;

  // Idempotency — same guard your v3 route uses
  const existing = await adminDb.collection("orders").where("tx_ref", "==", txRef).limit(1).get();
  if (!existing.empty) {
    return { orderId: existing.docs[0].id, duplicate: true };
  }

  const userSnap = await adminDb.collection("users").doc(uid).get();
  const userData = userSnap.data();
  const email = userData?.email;
  const name =
    userData?.displayName || `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim() || "Customer";

  const orderRef = await adminDb.collection("orders").add({
    user_id: uid,
    username: name,
    items,
    address,
    phone,
    amount,
    currency,
    tx_ref: txRef,
    flw_charge_id: chargeId,
    payment_provider: "flutterwave_v4_applepay",
    status: "confirmed",
    createdAt: FieldValue.serverTimestamp(),
  });

  const cartCollection = adminDb.collection("users").doc(uid).collection("add-to-cart");
  const batch = adminDb.batch();
  items.forEach((it: any) => {
    if (it.cartItemId) batch.delete(cartCollection.doc(it.cartItemId));
  });
  await batch.commit();

  await adminDb.collection("pending_orders").doc(txRef).delete().catch(() => {});

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
          <p style="margin-top:16px; font-weight:600;">Total: ${formatMoney(amount, currency)}</p>
          <p style="margin-top:8px; color:#666; font-size:13px;">
            Delivering to: ${address.street}, ${address.city}, ${address.state}, ${address.country}
          </p>
          <p style="margin-top:24px; color:#000; font-size:12px;">Order ID: ${orderRef.id}</p>
        </div>
      `,
    });
  }

  return { orderId: orderRef.id, duplicate: false };
}