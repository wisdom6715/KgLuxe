"use client";
import { useCallback } from "react";
import type { CurrencyCode } from "@/hook/useCurrency";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
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
// "applepay" additionally needs, outside of this code, all of:
//   1. Apple Pay turned on for your merchant account in the Flutterwave dashboard.
//   2. The domain verification file Flutterwave gives you, hosted at
//      https://<your-domain>/.well-known/apple-developer-merchantid-domain-association
//   3. The site served over HTTPS on your real domain — Apple Pay never
//      appears on localhost or plain HTTP.
//   4. The visitor on Safari (macOS or iOS) with a card already added to
//      Apple Wallet — it won't show in Chrome/Firefox or on Android, which
//      can look like a bug when it's actually just not applicable there.
const PAYMENT_OPTIONS = "card, banktransfer, ussd, mobilemoney, applepay";

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

  return {
    handleFlutterPayment,
    scriptReady: typeof window !== "undefined" && !!window.FlutterwaveCheckout,
    hasPublicKey: !!publicKey,
  };
}