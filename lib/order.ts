import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);
const ADMIN_ORDER_EMAIL = "olayiwolaibrahim46@gmail.com";

export type PaymentCurrency = "USD" | "NGN";

export const formatMoney = (value: number, currency: PaymentCurrency) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "NGN" ? 0 : 2,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(Number(value) || 0);

const getItemImage = (it: any): string | null =>
  it.product?.imageUrls?.[0] ?? it.image ?? it.imageUrl ?? it.photoURL ?? null;

const buildItemsHtml = (items: any[], currency: PaymentCurrency) =>
  items
    .map((it: any) => {
      const imageUrl = getItemImage(it);
      const label = `${it.product}${it.color ? ` (${it.color})` : ""}${it.size ? ` - ${it.size}` : ""}`;
      const thumbCell = imageUrl
        ? `<td style="padding-right:10px; width:48px;">
             <img src="${imageUrl}" width="48" height="48" alt=""
                  style="width:48px;height:48px;object-fit:cover;border-radius:6px;display:block;" />
           </td>`
        : "";
      return `
        <tr>
          <td style="padding:8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                ${thumbCell}
                <td style="vertical-align:middle;">${label}</td>
              </tr>
            </table>
          </td>
          <td style="padding:8px 0;text-align:center;">${it.quantity}</td>
          <td style="padding:8px 0;text-align:right;">${formatMoney(it.paymentPrice ?? it.price, currency)}</td>
        </tr>`;
    })
    .join("");

const buildBuyerEmailHtml = ({
  name, amount, currency, address, itemsHtml, orderId,
}: {
  name: string; amount: number; currency: PaymentCurrency;
  address: any; itemsHtml: string; orderId: string;
}) => `
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
    <p style="margin-top:24px; color:#000; font-size:12px;">Order ID: ${orderId}</p>
  </div>
`;

const buildAdminEmailHtml = ({
  name, email, phone, amount, currency, address, itemsHtml, orderId, txRef, flwRef,
}: {
  name: string; email?: string; phone: string; amount: number; currency: PaymentCurrency;
  address: any; itemsHtml: string; orderId: string; txRef: string; flwRef: string | null;
}) => `
  <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
    <h2 style="color:#A07840;">New order confirmed — #${orderId.slice(0, 8).toUpperCase()}</h2>
    <p style="margin:0 0 16px;">A payment has been verified and an order was created. Details below for fulfillment.</p>

    <h3 style="margin:0 0 8px; font-size:14px;">Customer</h3>
    <p style="margin:0 0 4px;">${name}${email ? ` — ${email}` : ""}</p>
    <p style="margin:0 0 16px;">${phone}</p>

    <h3 style="margin:0 0 8px; font-size:14px;">Items</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
      <thead>
        <tr style="border-bottom:1px solid #eee; text-align:left;">
          <th style="padding:8px 0;">Item</th>
          <th style="padding:8px 0;text-align:center;">Qty</th>
          <th style="padding:8px 0;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="margin:0 0 16px; font-weight:600;">Total: ${formatMoney(amount, currency)}</p>

    <h3 style="margin:0 0 8px; font-size:14px;">Delivery address</h3>
    <p style="margin:0 0 16px; color:#333;">
      ${address.street}, ${address.city}, ${address.state}, ${address.country}
    </p>

    <h3 style="margin:0 0 8px; font-size:14px;">Payment reference</h3>
    <p style="margin:0; color:#666; font-size:13px;">tx_ref: ${txRef}</p>
    <p style="margin:0 0 16px; color:#666; font-size:13px;">flw_ref: ${flwRef ?? "n/a"}</p>

    <p style="margin-top:24px; color:#000; font-size:12px;">Order ID: ${orderId}</p>
  </div>
`;

export async function verifyAndWriteOrder({
  uid, items, address, phone, amount, currency, txRef, transactionId,
}: {
  uid: string; items: any[]; address: any; phone: string;
  amount: number; currency: PaymentCurrency; txRef: string; transactionId: number | string;
}) {
  // 1. Re-verify the transaction directly with Flutterwave — never trust the caller
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
    return { error: "Payment verification failed." as const };
  }

  // 2. Idempotency: don't double-write if this tx_ref was already processed
  const existing = await adminDb.collection("orders").where("tx_ref", "==", txRef).limit(1).get();
  if (!existing.empty) {
    return { orderId: existing.docs[0].id, duplicate: true as const };
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

  // 5. Cart cleanup — anything added mid-checkout is left untouched
  const cartCollection = adminDb.collection("users").doc(uid).collection("add-to-cart");
  const batch = adminDb.batch();
  items.forEach((it: any) => {
    if (it.cartItemId) batch.delete(cartCollection.doc(it.cartItemId));
  });
  await batch.commit();

  // 6. Send confirmation emails — never fail the order over an email failure
  const itemsHtml = buildItemsHtml(items, currency);
  const emailJobs: Promise<any>[] = [];

  if (email) {
    emailJobs.push(
      resend.emails.send({
        from: "KgLuxe Orders <noreply@kgluxee.store>",
        to: email,
        subject: `KgLuxe Order Confirmed — #${orderRef.id.slice(0, 8).toUpperCase()}`,
        html: buildBuyerEmailHtml({ name, amount, currency, address, itemsHtml, orderId: orderRef.id }),
      })
    );
  }

  emailJobs.push(
    resend.emails.send({
      from: "KgLuxe Orders <noreply@kgluxee.store>",
      to: ADMIN_ORDER_EMAIL,
      subject: `New order — #${orderRef.id.slice(0, 8).toUpperCase()} — ${formatMoney(amount, currency)}`,
      html: buildAdminEmailHtml({
        name, email, phone, amount, currency, address, itemsHtml,
        orderId: orderRef.id, txRef, flwRef: verifyData.data?.flw_ref ?? null,
      }),
    })
  );

  const emailResults = await Promise.allSettled(emailJobs);
  emailResults.forEach((result, i) => {
    if (result.status === "rejected") {
      const recipient = i === 0 && email ? "buyer" : "admin";
      console.error(`Order confirmation email failed (${recipient}):`, result.reason);
    }
  });

  return { orderId: orderRef.id, duplicate: false as const };
}