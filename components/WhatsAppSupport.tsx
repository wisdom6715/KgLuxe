"use client";

import { useState } from "react";

type WhatsAppButtonProps = {
  /** Phone number in international format, digits only — e.g. "2348012345678" (no + or spaces). */
  phoneNumber?: string;
  /** Pre-filled message the user's WhatsApp chat opens with. */
  message?: string;
  /** "left" | "right" — which corner to float in. Defaults to "right". */
  position?: "left" | "right";
};

/**
 * Floating WhatsApp support button.
 * Fixed to the viewport (not the page), so it stays put on scroll and sits
 * above all other content. Drop it once in your root layout, or per-page —
 * it's self-contained and needs no props to work if you set
 * NEXT_PUBLIC_WHATSAPP_NUMBER in your environment.
 *
 * Usage:
 *   <WhatsAppButton />
 *   <WhatsAppButton phoneNumber="2348012345678" message="Hi, I have a question about my order" />
 */
export default function WhatsAppButton({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  message = "Hi KgLuxe, I'd like some help with an order.",
  position = "right",
}: WhatsAppButtonProps) {
  const [hovered, setHovered] = useState(false);

  if (!phoneNumber) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "WhatsAppButton: no phone number set. Pass a phoneNumber prop or set NEXT_PUBLIC_WHATSAPP_NUMBER."
      );
    }
    return null;
  }

  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const sideClass = position === "left" ? "left-5" : "right-5";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with KgLuxe on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed bottom-5 ${sideClass} z-[9999] w-12 h-12 flex items-center justify-center  gap-2 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform duration-200 ease-out hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A07840]`}
    >
      <svg
        viewBox="0 0 24 24"
        width="30"
        height="30"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.33 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm0 18.2h-.01a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.26-8.25 2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.84c0 4.55-3.7 8.25-8.26 8.25Zm4.52-6.19c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.13-.16.25-.64.8-.78.96-.15.16-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.42.06-.65.31-.22.25-.85.84-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.22-.17-.47-.29Z" />
      </svg>
      <span
        className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-200 ease-out ${
          hovered ? "max-w-[140px] opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        Chat with us
      </span>
    </a>
  );
}