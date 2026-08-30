"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

export default function ApplePayCallback() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <ApplePayCallbackInner />
    </Suspense>
  );
}

function CallbackFallback() {
  return (
    <div className="h-full bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-4">
        <Loader2 className="w-10 h-10 text-[#C9A96E] animate-spin" />
        <h1 className="text-xl font-bold text-gray-900">Confirming your payment…</h1>
      </div>
      <Footer />
    </div>
  );
}

function ApplePayCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<"checking" | "success" | "error">("checking");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const txRef = params.get("ref");
    if (!txRef) {
      setState("error");
      return;
    }

    let cancelled = false;

    async function attemptConfirm(attempt: number) {
      try {
        const res = await fetch("/api/payments/apple-pay/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txRef }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.success) {
          setOrderId(data.orderId);
          setState("success");
          return;
        }

        if (res.status === 202 && data.pending && attempt < MAX_ATTEMPTS) {
          setTimeout(() => attemptConfirm(attempt + 1), RETRY_DELAY_MS);
          return;
        }

        setState("error");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    attemptConfirm(1);
    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="h-full bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-4">
        {state === "checking" && (
          <>
            <Loader2 className="w-10 h-10 text-[#C9A96E] animate-spin" />
            <h1 className="text-xl font-bold text-gray-900">Confirming your payment…</h1>
            <p className="text-gray-500 text-sm">
              Please don't close this page — this only takes a few seconds.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#C9A96E]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Order confirmed!</h1>
            <p className="text-gray-500 text-sm">
              We've emailed your receipt. Order ID:{" "}
              <span className="font-mono text-gray-700">{orderId}</span>
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C9A96E] hover:bg-[#A07840] transition-all"
            >
              Continue Shopping
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">We couldn't confirm this payment</h1>
            <p className="text-gray-500 text-sm max-w-sm">
              If Apple Pay showed a successful payment on your end, don't worry — your money is
              safe. Please contact support with your order reference and we'll sort it out.
            </p>
            <button
              onClick={() => router.push("/cart/checkout")}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C9A96E] hover:bg-[#A07840] transition-all"
            >
              Back to Checkout
            </button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}