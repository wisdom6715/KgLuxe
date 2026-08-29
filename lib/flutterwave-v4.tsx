const isProd = process.env.NODE_ENV === "production";

const FLW_BASE_URL = isProd
  ? "https://f4bexperience.flutterwave.com"
  : "https://developersandbox-api.flutterwave.com";

const FLW_CLIENT_ID = process.env.FLW_V4_CLIENT_ID!;
const FLW_CLIENT_SECRET = process.env.FLW_V4_CLIENT_SECRET!;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.token;
  }
  const res = await fetch(
    "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: FLW_CLIENT_ID,
        client_secret: FLW_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    }
  );
  if (!res.ok) throw new Error(`Flutterwave OAuth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function flwFetch(path: string, init: RequestInit) {
  const token = await getAccessToken();
  const res = await fetch(`${FLW_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Trace-Id": crypto.randomUUID(),
      "X-Idempotency-Key": crypto.randomUUID(),
      ...(init.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Flutterwave request failed: ${res.status}`);
  return data;
}

export async function createApplePayCharge({
  amount, currency, email, phone, name, reference, redirectUrl,
}: {
  amount: number; currency: string; email: string; phone?: string;
  name: string; reference: string; redirectUrl: string;
}) {
  const customer = await flwFetch("/customers", {
    method: "POST",
    body: JSON.stringify({
      email,
      name: { first: name.split(" ")[0] || name, last: name.split(" ").slice(1).join(" ") || "-" },
      ...(phone ? { phone: { country_code: "234", number: phone } } : {}),
    }),
  });

  const paymentMethod = await flwFetch("/payment-methods", {
    method: "POST",
    body: JSON.stringify({ type: "applepay", applepay: { card_holder_name: name } }),
  });

  const charge = await flwFetch("/charges", {
    method: "POST",
    body: JSON.stringify({
      reference,
      currency,
      amount,
      customer_id: customer.data.id,
      payment_method_id: paymentMethod.data.id,
      redirect_url: redirectUrl,
    }),
  });

  return charge.data; // charge.data.next_action.redirect_url.url is what you redirect to
}