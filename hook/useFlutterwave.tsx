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

const PAYMENT_OPTIONS = "card, banktransfer, ussd, mobilemoney";

export default function useCheckoutPayment({
  amount,
  currency,
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
        amount: 100,
        currency: "NGN",
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