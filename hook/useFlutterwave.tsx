"use client";
import { useCallback } from "react";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
  }
}

interface PaymentParams {
  amount: number;
  currency?: string;
  email: string;
  phone: string;
  name: string;
  txRef: string;
}

interface PayHandlers {
  callback: (response: any) => void;
  onClose: () => void;
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

  // Stable function — reads live values at call time, doesn't rebuild config
  // on every keystroke, and doesn't touch the script at all.
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
        payment_options: "card, banktransfer, ussd, mobilemoney",
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