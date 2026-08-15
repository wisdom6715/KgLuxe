"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

// Adjust to your real launch moment. Example: 5pm the day after launch prep begins.
const LAUNCH_DATE = new Date("2026-08-16T19:00:00");

const STORAGE_KEY_LAUNCHED = "kgluxe_launch_complete";
const STORAGE_KEY_SESSION_DISMISS = "kgluxe_popup_dismissed_session";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function DigitCase({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 sm:w-16 rounded-md border border-[#C9A227]/30 bg-[#161311] py-2 text-center shadow-inner">
        <span className="font-mono text-xl sm:text-2xl tracking-tight text-[#F5EFE6] tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#A8A29E]">
        {label}
      </span>
    </div>
  );
}

export default function WelcomeLaunchPopup() {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [launched, setLaunched] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY_SESSION_DISMISS, "true");
  }, []);

  // Decide whether to show, on mount
  useEffect(() => {
    const alreadyLaunched = localStorage.getItem(STORAGE_KEY_LAUNCHED) === "true";
    const dismissedThisSession = sessionStorage.getItem(STORAGE_KEY_SESSION_DISMISS) === "true";
    const isPastLaunch = Date.now() >= LAUNCH_DATE.getTime();

    if (isPastLaunch) {
      localStorage.setItem(STORAGE_KEY_LAUNCHED, "true");
      setLaunched(true);
      return; // never show once launch has happened
    }

    if (!alreadyLaunched && !dismissedThisSession) {
      setVisible(true);
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!visible) return;
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => {
      const t = getTimeLeft();
      setTimeLeft(t);
      if (Date.now() >= LAUNCH_DATE.getTime()) {
        localStorage.setItem(STORAGE_KEY_LAUNCHED, "true");
        setLaunched(true);
        setVisible(false);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  // Escape to close
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  if (!visible || launched) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Launch announcement"
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
            Something we've been crafting is almost here
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#A8A29E]">
            Thank you for being here early. The full KgLuxe collection opens its doors soon —
            here's exactly when.
          </p>

          <div className="mt-6 flex justify-center gap-3 sm:gap-4">
            <DigitCase value={timeLeft.days} label="Days" />
            <DigitCase value={timeLeft.hours} label="Hrs" />
            <DigitCase value={timeLeft.minutes} label="Min" />
            <DigitCase value={timeLeft.seconds} label="Sec" />
          </div>

          <button
            onClick={close}
            className="mt-7 w-full rounded-md border border-[#574301] bg-transparent py-2.5 text-sm uppercase tracking-[0.1em] text-[#F5EFE6] transition hover:bg-[#685105] hover:text-[#0F0D0C]"
          >
            I'll be here
          </button>
        </div>
      </div>
    </div>
  );
}