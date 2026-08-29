"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CurrencyCode = "USD" | "NGN"

const NGN_BUFFER = 100;
const COUNTRY_ENDPOINT = "https://ipapi.co/country/";
const RATE_ENDPOINT = "https://open.er-api.com/v6/latest/USD";
const STORAGE_KEY = "kgluxe_currency";

type ExchangeRateResponse = {
  rates?: {
    NGN?: number;
  };
};

/**
 * DB prices are always stored in USD.
 *
 * This hook always fetches the live USD->NGN rate (needed everywhere now,
 * since product cards show both currencies side by side, not just for
 * Nigerian visitors) and geo-detects the visitor's country to pick a
 * sensible *default* selected currency.
 *
 * The user can override that default at any time via `setCurrency` — that
 * choice is what checkout uses, and it's remembered in localStorage so a
 * returning visitor keeps their preference instead of being re-detected.
 *
 * The ₦100 buffer is added after USD-to-NGN conversion, per displayed/paid
 * item amount. USD values are returned unchanged.
 */
export function useCurrency() {
  const [usdToNgn, setUsdToNgn] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [userPicked, setUserPicked] = useState(false);

  // Restore a previously chosen currency immediately, before geo-detection
  // even runs, so a returning visitor never sees their currency flip.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved === "USD" || saved === "NGN") {
        setCurrencyState(saved);
        setUserPicked(true);
      }
    } catch {
      // localStorage unavailable (SSR / private mode) — fall through to detection
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadRateAndDetect() {
      try {
        const rateResponse = await fetch(RATE_ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        const rateData = (await rateResponse.json()) as ExchangeRateResponse;
        const rate = Number(rateData.rates?.NGN);
        if (Number.isFinite(rate) && rate > 0 && active) {
          setUsdToNgn(rate);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Exchange rate fetch failed; NGN prices unavailable:", error);
        }
      }

      // Only geo-detect a default if the user hasn't already chosen one
      // (checked here, at call time, not as an effect dependency — we want
      // this to run once on mount, not re-fire every time currency changes).
      if (!userPicked) {
        try {
          const countryResponse = await fetch(COUNTRY_ENDPOINT, {
            signal: controller.signal,
            headers: { Accept: "text/plain" },
          });
          const country = (await countryResponse.text()).trim().toUpperCase();
          if (active && country === "NG") {
            setCurrencyState("NGN");
          }
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            console.error("Country detection failed; defaulting to USD:", error);
          }
        }
      }

      if (active) setRateLoading(false);
    }

    loadRateAndDetect();

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    setUserPicked(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // persistence is a nice-to-have, not required
    }
  }, []);

  // Converts a USD amount into `target`'s smallest-sensible display unit.
  // Returns null for NGN if the rate isn't loaded yet — callers should check
  // `loading` / handle null rather than ever show a mis-converted price.
  const convertTo = useCallback(
    (usdAmount: number, target: CurrencyCode): number | null => {
      const amount = Number(usdAmount) || 0;
      if (target === "USD") return amount;
      if (!usdToNgn) return null;
      return Math.ceil(amount * usdToNgn) + NGN_BUFFER;
    },
    [usdToNgn]
  );

  const formatIn = useCallback(
    (usdAmount: number, target: CurrencyCode): string | null => {
      const converted = convertTo(usdAmount, target);
      if (converted === null) return null;
      return new Intl.NumberFormat(target === "NGN" ? "en-NG" : "en-US", {
        style: "currency",
        currency: target,
        minimumFractionDigits: target === "NGN" ? 0 : 2,
        maximumFractionDigits: target === "NGN" ? 0 : 2,
      }).format(converted);
    },
    [convertTo]
  );

  // Format in whichever currency is currently selected.
  const formatPrice = useCallback(
    (usdAmount: number) => formatIn(usdAmount, currency),
    [formatIn, currency]
  );

  const convertPrice = useCallback(
    (usdAmount: number) => convertTo(usdAmount, currency),
    [convertTo, currency]
  );

  // For side-by-side display on product cards: primary is whichever
  // currency is selected/detected, secondary is the other one. Secondary is
  // null while the rate is still loading — render nothing for it then,
  // rather than a flashed/incorrect number.
  const formatBoth = useCallback(
    (usdAmount: number) => {
      const secondaryCode: CurrencyCode = currency === "USD" ? "NGN" : "USD";
      return {
        primary: formatIn(usdAmount, currency),
        secondary: formatIn(usdAmount, secondaryCode),
        primaryCode: currency,
        secondaryCode,
      };
    },
    [formatIn, currency]
  );

  // For checkout: the actual amount to send to Flutterwave. Null if NGN is
  // selected but the rate hasn't loaded — gate your "Pay" button on this
  // being non-null rather than falling back silently.
  const getPaymentAmount = useCallback(
    (usdAmount: number) => convertTo(usdAmount, currency),
    [convertTo, currency]
  );

  return useMemo(
    () => ({
      currency,
      setCurrency,
      loading: rateLoading,
      usdToNgn,
      convertPrice,
      formatPrice,
      formatBoth,
      formatIn,
      getPaymentAmount,
    }),
    [
      currency,
      setCurrency,
      rateLoading,
      usdToNgn,
      convertPrice,
      formatPrice,
      formatBoth,
      formatIn,
      getPaymentAmount,
    ]
  );
}

export { NGN_BUFFER };

export default useCurrency;