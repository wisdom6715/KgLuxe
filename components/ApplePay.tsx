"use client";
import { useEffect, useState } from "react";
import useCheckoutPayment, { isApplePayAvailable } from "@/hook/useFlutterwave";
import type { CurrencyCode } from "@/hook/useCurrency";

interface CheckoutButtonsProps {
  amount: number;
  currency?: CurrencyCode;
  email: string;
  phone: string;
  name: string;
  txRef: string;
  onCardPaymentSuccess: (response: any) => void;
  onClose: () => void;
}

export function CheckoutButtons({
  onCardPaymentSuccess,
  onClose,
  ...paymentParams
}: CheckoutButtonsProps) {
  const { handleApplePay } =
    useCheckoutPayment(paymentParams);

  const [showApplePay, setShowApplePay] = useState(false);
  const [applePayLoading, setApplePayLoading] = useState(false);

  // Must run client-side only — window.ApplePaySession doesn't exist during SSR
  useEffect(() => {
    setShowApplePay(isApplePayAvailable());
  }, []);

  const onApplePayClick = async () => {
    setApplePayLoading(true);
    try {
      await handleApplePay();
    } finally {
      setApplePayLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {showApplePay && (
        <button
          type="button"
          onClick={onApplePayClick}
          disabled={applePayLoading}
          aria-label="Pay with Apple Pay"
          className="apple-pay-button apple-pay-button-black w-full h-11 rounded-lg disabled:opacity-60"
        />
      )}
    </div>
  );
}