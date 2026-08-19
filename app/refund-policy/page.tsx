import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Refund Policy — KGLUXEE",
  description:
    "The policy governing delivery timelines, returns, and refunds for KGLUXEE's digital showroom, boutique locations, and online archival sales.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] text-neutral-900">
      <Header />
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[1fr_1px_380px]">
        {/* ---------------- Left column ---------------- */}
        <div className="px-6 py-16 sm:px-10 lg:px-16">
          {/* Header */}
          <header className="mb-10">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-400">
              LEGAL FRAMEWORK
            </p>
            <h1 className="font-serif text-6xl text-neutral-900 sm:text-7xl">
              Refund Policy
            </h1>
            <div className="mt-8 h-px w-full bg-neutral-200" />
            <p className="mt-5 text-xs font-medium tracking-[0.1em] text-neutral-500">
              LAST UPDATED: JULY 10, 2026&nbsp;&nbsp;
              <span className="text-neutral-300">•</span>&nbsp;&nbsp;VERSION
              2.1
            </p>
          </header>

          {/* Notice callout */}
          <div className="mb-16 flex items-start gap-4 border border-neutral-200 bg-neutral-100/60 p-6">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white">
              i
            </span>
            <div>
              <p className="mb-1 text-[15px] font-semibold text-neutral-900">
                Please read carefully.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                This policy governs delivery timelines, return eligibility,
                and refunds for orders placed through KGLUXEE&apos;s digital
                showroom, boutique locations, and online archival sales.
              </p>
            </div>
          </div>

          <div className="space-y-16">
            {/* 01. Delivery Timelines */}
            <section id="delivery">
              <SectionHeading number="01" title="Delivery Timelines" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                Standard delivery takes up to 10 business days from the
                date your order is confirmed. Delivery estimates are
                provided in good faith and may vary depending on your
                location, courier availability, and item preparation.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                You will receive a confirmation once your order has shipped.
                We recommend inspecting your item promptly upon arrival, as
                the timelines below for returns and authorisation begin from
                the date of receipt.
              </p>
            </section>

            {/* 02. Return Eligibility */}
            <section id="return-eligibility">
              <SectionHeading number="02" title="Return Eligibility" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                Items may be returned within 2 days of receipt, provided
                they are unworn, unwashed, and returned in their original
                condition with all tags, packaging, and accompanying
                materials intact.
              </p>
              <p className="mb-8 text-[15px] leading-relaxed text-neutral-600">
                KGLUXEE reserves the right to refuse a return or reduce the
                refund amount if the item shows signs of use, damage, or
                alteration outside of what is required to evaluate the
                product.
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="border border-neutral-200 p-6">
                  <ClockIcon className="mb-4 h-5 w-5 text-neutral-900" />
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-neutral-500">
                    Return Window
                  </p>
                  <p className="text-[14px] leading-relaxed text-neutral-600">
                    Returns must be initiated within 2 days of receiving
                    your item. Requests made after this window cannot be
                    accepted.
                  </p>
                </div>
                <div className="border border-neutral-200 p-6">
                  <ShieldIcon className="mb-4 h-5 w-5 text-neutral-900" />
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-neutral-500">
                    Original Condition
                  </p>
                  <p className="text-[14px] leading-relaxed text-neutral-600">
                    Items must be returned unused and in the same condition
                    they were delivered, with original packaging.
                  </p>
                </div>
              </div>
            </section>

            {/* 03. Return Authorisation */}
            <section id="authorisation">
              <SectionHeading number="03" title="Return Authorisation" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                Before sending an item back, you must contact our support
                team to request a return authorisation. This request must
                be made within 24 hours of receiving the item.
              </p>
              <p className="mb-10 text-[15px] leading-relaxed text-neutral-600">
                Items returned without prior authorisation, or after the
                24-hour window has passed, may be declined or delayed.
                Our support team will provide instructions and any
                required documentation once your request is confirmed.
              </p>
            </section>

            {/* 04. Refund Processing */}
            <section id="refund-processing">
              <SectionHeading number="04" title="Refund Processing" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                Once your returned item is received and inspected, we will
                notify you of the approval or rejection of your refund. If
                approved, your refund will be processed to your original
                method of payment.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Please note that depending on your bank or payment provider,
                it may take additional time for the refunded amount to
                appear on your statement.
              </p>
            </section>

            {/* 05. Non-Returnable Items */}
            <section id="non-returnable">
              <SectionHeading number="05" title="Non-Returnable Items" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                Certain items, including final-sale pieces, archival or
                one-of-a-kind items, and items marked as non-returnable at
                the time of purchase, are not eligible for return or refund
                under this policy.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Our failure to enforce any right or provision of this policy
                will not be considered a waiver of those rights. If any
                provision of this policy is held to be invalid or
                unenforceable by a court, the remaining provisions will
                remain in effect.
              </p>
            </section>
          </div>
        </div>

        {/* ---------------- Divider ---------------- */}
        <div className="hidden bg-neutral-200 lg:block" />

        {/* ---------------- Right sidebar ---------------- */}
        <aside className="bg-[#FAFAF7] px-6 py-16 sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-10">
          <h2 className="font-serif text-3xl text-neutral-900">
            Refund Policy
          </h2>
          <p className="mt-2 text-xs font-medium tracking-[0.1em] text-neutral-500">
            EFFECTIVE DATE: JUNE 2026
          </p>
          <div className="mt-5 h-px w-full bg-neutral-200" />

          <div className="mt-10 space-y-10">
            <div>
              <h3 className="mb-3 font-serif text-xl text-neutral-900">
                1. Delivery
              </h3>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                Standard delivery takes up to 10 business days from order
                confirmation. Delivery windows begin from the date your
                order is placed and may vary by destination.
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">
                Return and authorisation timelines are calculated from the
                date of receipt, not the date of purchase, reflecting our
                commitment to a fair and transparent returns process.
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-serif text-xl text-neutral-900">
                2. Returns
              </h3>
              <p className="mb-4 text-[14px] leading-relaxed text-neutral-600">
                To be eligible for a return, your item must meet the
                conditions below. Items that do not meet these requirements
                will not be accepted.
              </p>
              <ul className="space-y-2">
                {[
                  "Returned within 2 days of receipt.",
                  "Item must be in original, unused condition.",
                  "Contact support for return authorisation within 24 hours of receiving the item.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[14px] leading-relaxed text-neutral-600"
                  >
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-neutral-200 bg-white p-6">
              <h3 className="mb-3 font-serif text-xl text-neutral-900">
                3. Authorisation
              </h3>
              <p className="mb-3 text-[14px] leading-relaxed text-neutral-600">
                All returns require prior authorisation from our support
                team. Requests must be submitted within 24 hours of
                receiving your item, and returns will not be accepted
                without an authorisation reference.
              </p>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                Contact support with your order number to begin the
                authorisation process and receive return instructions.
              </p>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
              <Image
                src="/hero.png"
                alt="Folded natural linen fabric detail"
                fill
                sizes="380px"
                className="object-cover"
              />
            </div>

            <div>
              <h3 className="mb-3 font-serif text-xl text-neutral-900">
                4. Refunds
              </h3>
              <p className="mb-3 text-[14px] leading-relaxed text-neutral-600">
                Approved refunds are issued to the original method of
                payment after inspection of the returned item. Processing
                times may vary by payment provider.
              </p>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                To the full extent permissible by applicable law, KGLUXEE
                is not liable for delays caused by third-party banks or
                payment processors once a refund has been issued.
              </p>
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </main>
  );
}

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <span className="text-xs font-semibold text-neutral-400">
        {number}
      </span>
      <h2 className="font-serif text-3xl text-neutral-900">{title}</h2>
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5L16 9" />
    </svg>
  );
}