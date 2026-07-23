import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service — KGLUXEE",
  description:
    "The terms governing your access to and use of KGLUXEE's digital showroom, boutique locations, and online archival sales.",
};

export default function TermsOfServicePage() {
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
              Terms of Service
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
                These terms govern your access to and use of KGLUXEE&apos;s
                services, including our digital showroom, boutique
                locations, and online archival sales.
              </p>
            </div>
          </div>

          <div className="space-y-16">
            {/* 01. Acceptance of Terms */}
            <section id="acceptance">
              <SectionHeading number="01" title="Acceptance of Terms" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                By accessing or using the KGLUXEE platform, you acknowledge
                that you have read, understood, and agree to be bound by
                these Terms of Service. If you do not agree with any part of
                these terms, you must immediately cease all use of our
                services.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                We reserve the right to modify these terms at any time.
                Changes will be effective immediately upon posting to the
                website. Your continued use of the site following the
                posting of changes will mean that you accept and agree to
                the changes.
              </p>
            </section>

            {/* 02. User Accounts */}
            <section id="accounts">
              <SectionHeading number="02" title="User Accounts" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                To access certain features of the KGLUXEE boutique
                experience, you may be required to register for an account.
                You are responsible for maintaining the confidentiality of
                your account credentials and for all activities that occur
                under your account.
              </p>
              <p className="mb-8 text-[15px] leading-relaxed text-neutral-600">
                You agree to provide accurate, current, and complete
                information during the registration process. KGLUXEE
                reserves the right to suspend or terminate accounts that
                provide false information or violate our security protocols.
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="border border-neutral-200 p-6">
                  <ShieldIcon className="mb-4 h-5 w-5 text-neutral-900" />
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-neutral-500">
                    Eligibility
                  </p>
                  <p className="text-[14px] leading-relaxed text-neutral-600">
                    You must be at least 18 years of age or the age of legal
                    majority in your jurisdiction to create an account.
                  </p>
                </div>
                <div className="border border-neutral-200 p-6">
                  <LockIcon className="mb-4 h-5 w-5 text-neutral-900" />
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-neutral-500">
                    Security
                  </p>
                  <p className="text-[14px] leading-relaxed text-neutral-600">
                    Notify us immediately of any unauthorized use of your
                    account or any other breach of security.
                  </p>
                </div>
              </div>
            </section>

            {/* 03. Intellectual Property */}
            <section id="ip">
              <SectionHeading number="03" title="Intellectual Property" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                All content included on this site, such as text, graphics,
                logos, button icons, images, audio clips, digital downloads,
                data compilations, and software, is the property of KGLUXEE
                or its content suppliers and protected by international
                copyright laws.
              </p>
              <p className="mb-10 text-[15px] leading-relaxed text-neutral-600">
                The compilation of all content on this site is the exclusive
                property of KGLUXEE. You may not reproduce, duplicate, copy,
                sell, resell, or otherwise exploit any portion of the
                service without express written consent from our legal
                department.
              </p>

              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-400">
                <div className="absolute left-8 top-8 max-w-[55%]">
                  <p className="font-serif text-2xl text-white">
                    Terms of Service
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/70">
                    This is a live view of the terms currently in effect for
                    KGLUXEE&apos;s digital showroom and boutique network.
                  </p>
                </div>
                <p className="absolute bottom-8 left-8 max-w-[70%] font-serif text-xl italic text-white">
                  &ldquo;Design is the silent ambassador of your
                  brand.&rdquo;
                </p>
              </div>
            </section>

            {/* 04. Limitation of Liability */}
            <section id="liability">
              <SectionHeading number="04" title="Limitation of Liability" />
              <p className="mb-4 text-[13px] font-medium uppercase leading-relaxed tracking-wide text-neutral-600">
                KGLUXEE and its affiliates shall not be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use,
                goodwill, or other intangible losses.
              </p>
              <p className="text-[13px] font-medium uppercase leading-relaxed tracking-wide text-neutral-600">
                In no event shall the aggregate liability of KGLUXEE exceed
                the greater of one hundred U.S. dollars (U.S. $100.00) or
                the amount you paid KGLUXEE, if any, in the past six months
                for the services giving rise to the claim.
              </p>
            </section>

            {/* 05. Governing Law */}
            <section id="governing-law">
              <SectionHeading number="05" title="Governing Law" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                These Terms shall be governed and construed in accordance
                with the laws of the jurisdiction in which KGLUXEE is
                headquartered, without regard to its conflict of law
                provisions.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Our failure to enforce any right or provision of these Terms
                will not be considered a waiver of those rights. If any
                provision of these Terms is held to be invalid or
                unenforceable by a court, the remaining provisions of these
                Terms will remain in effect.
              </p>
            </section>
          </div>
        </div>

        {/* ---------------- Divider ---------------- */}
        <div className="hidden bg-neutral-200 lg:block" />

        {/* ---------------- Right sidebar ---------------- */}
        <aside className="bg-[#FAFAF7] px-6 py-16 sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-10">
          <h2 className="font-serif text-3xl text-neutral-900">
            Terms of Service
          </h2>
          <p className="mt-2 text-xs font-medium tracking-[0.1em] text-neutral-500">
            EFFECTIVE DATE: OCTOBER 2024
          </p>
          <div className="mt-5 h-px w-full bg-neutral-200" />

          <div className="mt-10 space-y-10">
            <div>
              <h3 className="mb-3 font-serif text-xl text-neutral-900">
                1. Acceptance
              </h3>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                By accessing and using KGLUXEE, you acknowledge that you
                have read, understood, and agreed to be bound by these Terms
                of Service. These terms constitute a legally binding
                agreement between you and KGLUXEE regarding your use of our
                digital platforms and services.
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">
                If you do not agree to these terms, please refrain from
                using our services. We reserve the right to modify these
                terms at any time without prior notice, reflecting our
                commitment to evolving editorial excellence and legal
                compliance.
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-serif text-xl text-neutral-900">
                2. Accounts
              </h3>
              <p className="mb-4 text-[14px] leading-relaxed text-neutral-600">
                To access certain features of the Boutique, you may be
                required to create a member account. You are responsible
                for maintaining the confidentiality of your credentials and
                for all activities that occur under your account.
              </p>
              <ul className="space-y-2">
                {[
                  "Provide accurate and complete registration information.",
                  "Notify us immediately of any unauthorized use of your account.",
                  "Users must be at least 18 years of age to establish a purchasing account.",
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
                3. IP Rights
              </h3>
              <p className="mb-3 text-[14px] leading-relaxed text-neutral-600">
                All content included on this site—such as text, graphics,
                logos, images, audio clips, digital downloads, and data
                compilations—is the property of KGLUXEE or its content
                suppliers and is protected by international copyright laws.
              </p>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                The &ldquo;KGLUXEE&rdquo; trademark and the visual identity
                of our editorial layouts may not be used in connection with
                any product or service that is not ours, in any manner that
                is likely to cause confusion among customers.
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
                4. Liability
              </h3>
              <p className="mb-3 text-[14px] leading-relaxed text-neutral-600">
                KGLUXEE provides this site and its contents on an
                &ldquo;as is&rdquo; basis. We make no representations or
                warranties of any kind, express or implied, as to the
                operation of the site or the information, content,
                materials, or products included.
              </p>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                To the full extent permissible by applicable law, KGLUXEE
                will not be liable for any damages of any kind arising from
                the use of this site, including but not limited to direct,
                indirect, incidental, punitive, and consequential damages.
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
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