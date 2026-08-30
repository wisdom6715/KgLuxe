// lib/flutterwave-v4.ts
const FLW_ENV = process.env.FLW_ENV === "production" ? "production" : "sandbox";

const BASE_URL =
  FLW_ENV === "production"
    ? "https://f4bexperience.flutterwave.com"
    : "https://developersandbox-api.flutterwave.com";

const TOKEN_URL =
  "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token";

const CLIENT_ID = process.env.FLW_V4_CLIENT_ID!;
const CLIENT_SECRET = process.env.FLW_V4_CLIENT_SECRET!;

let cachedToken: { value: string; expiresAt: number } | null = null;

console.log("CLIENT_ID present:", !!CLIENT_ID, "length:", CLIENT_ID?.length);
console.log("CLIENT_SECRET present:", !!CLIENT_SECRET, "length:", CLIENT_SECRET?.length);

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error(`Flutterwave OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000, // expires_in is seconds, ~600s
  };
  return cachedToken.value;
}

export async function flwFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const traceId = crypto.randomUUID();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Trace-Id": traceId,
      "X-Idempotency-Key": crypto.randomUUID(),
      ...(init.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    const err = new Error(`Flutterwave v4 error [trace: ${traceId}] on ${path}: ${res.status} ${JSON.stringify(data)}`);
    (err as any).status = res.status;
    (err as any).body = data;
    throw err;
  }
  return data;
}

export { BASE_URL, FLW_ENV };