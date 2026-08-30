// app/api/payments/apple-pay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { flwFetch } from "@/lib/flutterwave-v4";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, items, address, phone, amount, txRef } = body;
    const currency = body.currency === "NGN" ? "NGN" : "USD";
    const email: string | undefined = body.email;
    const name: string = body.name || "Customer";

    if (!uid || !items?.length || !address || !phone || !amount || !txRef || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Guard against re-initiating a charge for a tx_ref that's already in flight/paid
    const existingOrder = await adminDb.collection("orders").where("tx_ref", "==", txRef).limit(1).get();
    if (!existingOrder.empty) {
      return NextResponse.json({ error: "This order has already been processed." }, { status: 409 });
    }

        // Turn "+234 800 000 0000" / "0800 000 0000" / "800 000 0000" into
    // { countryCode: "234", number: "8000000000" }
    function normalizePhone(raw: string) {
      let digits = raw.replace(/\D/g, "");
      let countryCode = "234";
      if (digits.startsWith("234")) {
        digits = digits.slice(3);
      }
      if (digits.startsWith("0")) {
        digits = digits.slice(1);
      }
      return { countryCode, number: digits };
    }

    // Free-text country names from the address form -> ISO2. Extend as needed.
    function toISO2(country: string) {
      const map: Record<string, string> = {
        nigeria: "NG",
        "united states": "US",
        "united kingdom": "GB",
        ghana: "GH",
        kenya: "KE",
        "south africa": "ZA",
      };
      const key = (country || "").trim().toLowerCase();
      if (map[key]) return map[key];
      if (country && country.length === 2) return country.toUpperCase();
      return "NG";
    }

    const { countryCode, number } = normalizePhone(phone);
    console.log("RAW PHONE:", JSON.stringify(phone));
    console.log("NORMALIZED:", { countryCode, number, length: number.length });

    // 1. Create the customer, or reuse the existing one if this email
    // already has a Flutterwave customer record.
    const [firstName, ...rest] = name.trim().split(" ");
    let customerId: string;
    try {
      const customerRes = await flwFetch("/customers", {
        method: "POST",
        body: JSON.stringify({
          email,
          name: { first: firstName || "Customer", last: rest.join(" ") || "-" },
          phone: { country_code: countryCode, number },
          address: {
            country: toISO2(address.country),
            city: address.city,
            state: address.state,
            line1: address.street,
            postal_code: address.zip || "100001",
          },
        }),
      });
      customerId = customerRes.data.id;
    } catch (err: any) {
      if (err.status === 409) {
        const lookupRes = await flwFetch(`/customers?email=${encodeURIComponent(email)}`);
        console.log("Existing customer lookup result:", JSON.stringify(lookupRes.data));
        const existing = Array.isArray(lookupRes.data) ? lookupRes.data[0] : lookupRes.data;
        if (!existing?.id) {
          throw new Error("Customer already exists but lookup by email returned no id.");
        }
        customerId = existing.id;
      } else {
        throw err;
      }
    }

     // 2. Create the Apple Pay payment method
    console.log("Creating Apple Pay payment method...");
    const paymentMethodRes = await flwFetch("/payment-methods", {
      method: "POST",
      body: JSON.stringify({
        type: "applepay",
        applepay: { card_holder_name: name },
      }),
    });
    console.log("Payment method created:", paymentMethodRes.data.id);
    const paymentMethodId = paymentMethodRes.data.id;

    // 3. Where Flutterwave sends the browser back to after the Apple Pay sheet closes
    const origin = req.nextUrl.origin;
    const redirectBackUrl = `${origin}/checkout/apple-pay-callback?ref=${encodeURIComponent(txRef)}`;

    // 4. Create the charge
    const chargeRes = await flwFetch("/charges", {
      method: "POST",
      body: JSON.stringify({
        reference: txRef,
        currency,
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        redirect_url: redirectBackUrl,
        amount,
      }),
    });

    const chargeId = chargeRes.data.id;
    const redirectUrl = chargeRes.data.next_action?.redirect_url?.url;

    if (!redirectUrl) {
      return NextResponse.json({ error: "Flutterwave did not return an Apple Pay redirect." }, { status: 502 });
    }

    // 5. Stash the order so the callback route can finish the job — the browser
    //    is about to fully navigate away and loses all client state.
    await adminDb.collection("pending_orders").doc(txRef).set({
      uid,
      items,
      address,
      phone,
      amount,
      currency,
      txRef,
      chargeId,
      customerId,
      status: "initiated",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ redirectUrl });
  } catch (err) {
    console.error("Apple Pay init failed:", err);
    return NextResponse.json({ error: "Could not start Apple Pay payment." }, { status: 500 });
  }
}