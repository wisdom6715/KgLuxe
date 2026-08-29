"use client";
import { useCallback } from "react";
import type { CurrencyCode } from "@/hook/useCurrency";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
    ApplePaySession?: any;
  }
}

interface PaymentParams {
  amount: number;
  currency?: CurrencyCode;
  email: string;
  phone: string;
  name: string;
  txRef: string;
}

interface PayHandlers {
  callback: (response: any) => void;
  onClose: () => void;
}

// "banktransfer" was already listed here — if it isn't appearing in the
// checkout modal, that's almost always a Flutterwave dashboard setting
// (Settings → Compliance / Payment Methods on your merchant account) rather
// than something this config object controls.
//
// "applepay" has been removed from this list on purpose: Flutterwave's v3
// Inline Checkout (FlutterwaveCheckout / checkout.flutterwave.com/v3.js) has
// no backend behind that option — it's only wired through v4's Customer ->
// Payment Method -> Charge -> redirect flow. Leaving "applepay" here is what
// produced "We are unable to generate a session token". Apple Pay is now
// handled separately below via handleApplePay, which hits your own
// /api/payments/apple-pay route instead of going through this widget.
const PAYMENT_OPTIONS = "card, banktransfer, ussd, mobilemoney";

// Exported so a checkout button can decide whether to render the Apple Pay
// button at all — only true on Safari (macOS/iOS) with a card in Wallet.
export function isApplePayAvailable() {
  return (
    typeof window !== "undefined" &&
    !!window.ApplePaySession &&
    window.ApplePaySession.canMakePayments()
  );
}

export default function useCheckoutPayment({
  amount,
  currency = "USD",
  email,
  phone,
  name,
  txRef,
}: PaymentParams) {
  const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

  const handleFlutterPayment = useCallback(
    (handlers: PayHandlers) => {
      if (typeof window === "undefined" || !window.FlutterwaveCheckout) {
        console.error("Flutterwave checkout script has not loaded yet.");
        handlers.onClose?.();
        return;
      }
      if (!publicKey) {
        console.error("NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is missing.");
        return;
      }

      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: txRef,
        amount,
        currency,
        payment_options: PAYMENT_OPTIONS,
        customer: {
          email,
          phone_number: phone,
          name,
        },
        customizations: {
          title: "Order Payment",
          description: "Payment for items in cart",
          logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
        },
        callback: handlers.callback,
        onclose: handlers.onClose,
      });
    },
    [publicKey, txRef, amount, currency, email, phone, name]
  );

  // Apple Pay path: v4 API, driven by your own backend route, then a
  // browser redirect to Flutterwave's hosted authorization page. Does not
  // touch window.FlutterwaveCheckout at all.
  const handleApplePay = useCallback(async () => {
    const res = await fetch("/api/payments/apple-pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, email, phone, name, txRef }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Apple Pay init failed:", data.error);
      return;
    }
    window.location.href = data.redirectUrl;
  }, [amount, currency, email, phone, name, txRef]);

  return {
    handleFlutterPayment,
    handleApplePay,
    scriptReady: typeof window !== "undefined" && !!window.FlutterwaveCheckout,
    hasPublicKey: !!publicKey,
  };
}