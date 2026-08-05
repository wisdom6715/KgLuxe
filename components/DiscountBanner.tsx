// components/DiscountBanner.tsx
"use client";

import { useDiscount } from "@/hook/useDiscount";
import { isDiscountActive } from "@/lib/discount";

/**
 * Sliding marquee banner shown whenever a discount is active.
 * Drop this anywhere — header, layout root, etc.
 * Renders nothing when there's no active discount.
 */
export default function DiscountBanner() {
  const { discount, loading } = useDiscount();

  if (loading || !discount || !isDiscountActive(discount)) return null;

  const message = `🎉 ${discount.percentage}% OFF EVERYTHING — Sale ends ${new Date(
    discount.endDate
  ).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  // Repeat the message so the marquee always fills the strip
  const repeated = Array(6).fill(message).join("   ·   ");

  return (
    <div className="w-full bg-neutral-900 text-white overflow-hidden py-2.5 select-none">
      <style>{`
        @keyframes discount-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .discount-track {
          display: flex;
          width: max-content;
          animation: discount-scroll 28s linear infinite;
          will-change: transform;
        }
        .discount-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="discount-track text-sm font-medium tracking-wide whitespace-nowrap">
        <span>{repeated}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
        {/* duplicate for seamless loop */}
        <span aria-hidden="true">{repeated}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
      </div>
    </div>
  );
}