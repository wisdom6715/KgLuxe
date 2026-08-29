"use client";

import type { CurrencyCode } from "@/hook/useCurrency";

interface CurrencySwitcherProps {
  currency: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  disabled?: boolean;
  className?: string;
}

const OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($)" },
  { code: "NGN", label: "NGN (₦)" },
];

export default function CurrencySwitcher({
  currency,
  onChange,
  disabled = false,
  className = "",
}: CurrencySwitcherProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Checkout currency"
      className={`inline-flex items-center rounded-full border border-gray-300 p-1 ${className}`}
    >
      {OPTIONS.map((opt) => {
        const active = currency === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(opt.code)}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              active ? "bg-dark-brown text-white" : "text-gray-500 hover:text-dark-brown"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}