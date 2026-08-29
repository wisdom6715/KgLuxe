"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CurrencyCode = "USD" | "NGN";

const NGN_BUFFER = 100;
const COUNTRY_ENDPOINT = "https://ipapi.co/country/";
const RATE_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

type ExchangeRateResponse = {
  rates?: {
    NGN?: number;
  };
};

/**
 * Detects whether the visitor is in Nigeria and converts DB prices, which are
 * always stored in USD, to NGN for Nigerian visitors only.
 *
 * The ₦100 buffer is added after the USD-to-NGN conversion and is applied per
 * displayed/paid item amount. USD values are returned unchanged.
 */
export function useCurrency() {
  const [isNigeria, setIsNigeria] = useState(false);
  const [usdToNgn, setUsdToNgn] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function detectCurrency() {
      try {
        const countryResponse = await fetch(COUNTRY_ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: "text/plain" },
        });
        const country = (await countryResponse.text()).trim().toUpperCase();
        const visitorIsNigeria = country === "NG";

        if (!active) return;
        setIsNigeria(visitorIsNigeria);

        if (!visitorIsNigeria) return;

        const rateResponse = await fetch(RATE_ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        const rateData = (await rateResponse.json()) as ExchangeRateResponse;
        const rate = Number(rateData.rates?.NGN);

        if (!Number.isFinite(rate) || rate <= 0) {
          throw new Error("A valid USD-to-NGN exchange rate was not returned.");
        }

        if (active) setUsdToNgn(rate);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error(
            "Currency detection failed; keeping USD pricing:",
            error,
          );
          if (active) {
            setIsNigeria(false);
            setUsdToNgn(null);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    detectCurrency();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // Keep USD until the NGN rate is available; this avoids rendering a raw USD
  // number with a naira symbol during the short loading window.
  const currency: CurrencyCode = isNigeria && usdToNgn ? "NGN" : "USD";

  const convertPrice = useCallback(
    (usdAmount: number) => {
      const amount = Number(usdAmount) || 0;
      if (currency === "USD" || !usdToNgn) return amount;
      return Math.ceil(amount * usdToNgn) + NGN_BUFFER;
    },
    [currency, usdToNgn],
  );

  const formatPrice = useCallback(
    (usdAmount: number) =>
      new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "NGN" ? 0 : 2,
        maximumFractionDigits: currency === "NGN" ? 0 : 2,
      }).format(convertPrice(usdAmount)),
    [convertPrice, currency],
  );

  const getPaymentAmount = useCallback(
    (usdAmount: number) => convertPrice(usdAmount),
    [convertPrice],
  );

  return useMemo(
    () => ({
      currency,
      isNigeria,
      loading,
      usdToNgn,
      convertPrice,
      formatPrice,
      getPaymentAmount,
    }),
    [
      convertPrice,
      currency,
      formatPrice,
      getPaymentAmount,
      isNigeria,
      loading,
      usdToNgn,
    ],
  );
}

export { NGN_BUFFER };

export default useCurrency;
