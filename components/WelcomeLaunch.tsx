"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

const STORAGE_KEY_SESSION_DISMISS = "kgluxe_popup_dismissed_session";

export default function WelcomeLaunchPopup() {
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY_SESSION_DISMISS, "true");
  }, []);

  // Decide whether to show, on mount
  useEffect(() => {
    const dismissedThisSession = sessionStorage.getItem(STORAGE_KEY_SESSION_DISMISS) === "true";
    if (!dismissedThisSession) {
      setVisible(true);
    }
  }, []);

  // Escape to close
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome announcement"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-lg border border-[#C9A227]/25 bg-[#0F0D0C] shadow-2xl animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Close */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#C9A227]/30 text-[#F5EFE6]/70 transition hover:border-[#C9A227] hover:text-[#F5EFE6]"
        >
          ✕
        </button>

        {/* CEO portrait */}
        <div className="relative h-72 w-full">
          <Image
            src="/ceo.jpeg"
            alt="Founder & CEO of KgLuxe"
            fill
            className="object-cover object-top opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-[#0F0D0C]/20 to-transparent" />
        </div>

        <div className="px-6 pb-7 pt-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#574301]">
            A Note From Our Founder
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#F5EFE6]">
            Welcome to KgLuxee
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#A8A29E]">
            Thank you for stopping by. Enjoy 10% off your first order as our
            way of welcoming you to the collection.
          </p>

          <button
            onClick={close}
            className="mt-7 w-full rounded-md border border-[#574301] bg-transparent py-2.5 text-sm uppercase tracking-[0.1em] text-[#F5EFE6] transition hover:bg-[#685105] hover:text-[#0F0D0C]"
          >
            Start Shopping
          </button>
        </div>
      </div>
    </div>
  );
}