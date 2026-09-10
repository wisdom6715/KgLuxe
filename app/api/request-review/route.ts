import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

// Public site origin the /review/[orderId] link is built against.
// Set NEXT_PUBLIC_SITE_URL in your environment (.env.local / hosting provider env vars).
const SITE_URL = "https://kgluxee.com";

type PaymentCurrency = "USD" | "NGN";

const formatMoney = (value: number, currency: PaymentCurrency) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "NGN" ? 0 : 2,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(Number(value) || 0);

// Order items don't consistently carry the same image field name across the
// codebase — mirrors the lookup used when building order-confirmation emails.
const getItemImage = (it: any): string | null =>
  it.product?.imageUrls?.[0] ?? it.image ?? it.imageUrl ?? it.photoURL ?? null;

const buildItemsHtml = (items: any[]) =>
  items
    .map((it: any) => {
      const imageUrl = getItemImage(it);
      const label = `${typeof it.product === "string" ? it.product : it.product?.name ?? "Item"}${
        it.color ? ` (${it.color})` : ""
      }${it.size ? ` - ${it.size}` : ""}`;
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
        </tr>`;
    })
    .join("");

const buildReviewRequestEmailHtml = ({
  name,
  itemsHtml,
  reviewUrl,
}: {
  name: string;
  itemsHtml: string;
  reviewUrl: string;
}) => `
  <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
    <div style="text-align:center; margin-bottom:24px;">
      <img src="https://firebasestorage.googleapis.com/v0/b/kgluxe.firebasestorage.app/o/IMG-20260718-WA0002.jpg?alt=media&token=fa734fd5-bf36-411e-a7c5-7b34187b9ca4" alt="KgLuxe" style="height:40px;" />
    </div>
    <h2 style="color:#A07840;">How was your order, ${name}?</h2>
    <p style="color:#333; line-height:1.6;">
      We hope you're loving what you ordered. It would mean a lot if you could
      take a minute to share a quick review — it helps other customers and
      helps our small team keep improving.
    </p>
    <table style="width:100%; border-collapse:collapse; margin-top:16px;">
      <thead>
        <tr style="border-bottom:1px solid #eee; text-align:left;">
          <th style="padding:8px 0;">Item</th>
          <th style="padding:8px 0;text-align:center;">Qty</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="text-align:center; margin-top:32px;">
      <a href="${reviewUrl}"
         style="display:inline-block; background:#1A1A1A; color:#ffffff; text-decoration:none;
                padding:14px 32px; border-radius:8px; font-weight:600; font-size:14px;
                letter-spacing:0.03em; text-transform:uppercase;">
        Leave a review
      </a>
    </div>
    <div style="margin-top:28px; padding-top:20px; border-top:1px solid #eee; font-size:13px; color:#555; line-height:1.6;">
      <p style="margin:0; font-style:italic;">— The KgLuxe team</p>
    </div>
  </div>
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, productId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: "Missing productId." }, { status: 400 });
    }

    // 1. Fetch the order
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    const orderData = orderSnap.data()!;

    // 2. Fetch the buyer's profile server-side — same source-of-truth pattern
    //    used when confirming orders. The order doc itself doesn't store email.
    const userSnap = await adminDb.collection("users").doc(orderData.user_id).get();
    const userData = userSnap.data();
    const email: string | undefined = userData?.email;
    const name =
      userData?.displayName ||
      `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim() ||
      orderData.username ||
      "there";

    if (!email) {
      return NextResponse.json(
        { error: "This buyer has no email on file." },
        { status: 400 }
      );
    }

    // 3. Build the review link and email
    const reviewUrl = `${SITE_URL}/${productId}?GhravexulnqzopmTyrakvulbexonqjzFarnivexoqplumZykrexiphazulvorqenathryxomqevulzankriphexodramulqazvynothrexipulmarkevonqzathryxulvexomqipanidrulzeforvynaqixomthrazulpeknivexorqazulmyrathopvexinulqazomryxevandulphorqaziknexulvyratomqevinaxulphorqazymexidravulnqorixepanqzomulvethryxakopvexinulmux=true`;
    const itemsHtml = buildItemsHtml(orderData.items ?? []);

    const { error: sendError } = await resend.emails.send({
      from: "KgLuxe Orders <noreply@kgluxee.store>",
      to: email,
      subject: `How was your KgLuxe order? Leave a review ✨`,
      html: buildReviewRequestEmailHtml({ name, itemsHtml, reviewUrl }),
    });

    if (sendError) {
      console.error("Review request email failed:", sendError);
      return NextResponse.json(
        { error: "Failed to send the review request email." },
        { status: 502 }
      );
    }

    // 4. Record that a review was requested (idempotent — safe to call again for a resend)
    await orderRef.update({
      reviewRequestedAt: FieldValue.serverTimestamp(),
      reviewRequestCount: FieldValue.increment(1),
    });

    return NextResponse.json({ success: true, reviewUrl });
  } catch (err) {
    console.error("Request review failed:", err);
    return NextResponse.json(
      { error: "Something went wrong sending the review request." },
      { status: 500 }
    );
  }
}