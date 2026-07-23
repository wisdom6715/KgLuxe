import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy — KGLUXEE",
  description:
    "How KGLUXEE collects, uses, and protects your personal information.",
};

type Section = {
  id: string;
  number: string;
  title: string;
};

const sections: Section[] = [
  { id: "introduction", number: "01", title: "Introduction" },
  { id: "data-collection", number: "02", title: "Data Collection" },
  { id: "use-of-information", number: "03", title: "Use of Information" },
  { id: "cookies", number: "04", title: "Cookies" },
  { id: "third-party-sharing", number: "05", title: "Third-Party Sharing" },
  { id: "security", number: "06", title: "Security" },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
        <Header />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-16 sm:px-10 lg:grid-cols-[1fr_380px] lg:gap-20 lg:px-16">
        {/* ---------------- Left column ---------------- */}
        <div>
          {/* Header */}
          <header className="mb-14">
            <h1 className="font-serif text-6xl italic tracking-tight text-neutral-900 sm:text-7xl">
              Privacy Policy
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-neutral-600">
              KGLUXEE is committed to protecting the privacy and security of
              our clients. This policy outlines how we handle your personal
              information with the same level of care we apply to our
              craftsmanship.
            </p>
            <p className="mt-6 text-xs font-medium tracking-[0.15em] text-neutral-400">
              EFFECTIVE DATE: July 10, 2026
            </p>
          </header>

          <div className="mb-14 h-px w-full bg-neutral-200" />

          {/* Body grid: side nav + content */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-[200px_1fr]">
            {/* In-page nav */}
            <nav aria-label="Table of contents" className="hidden sm:block">
              <ul className="space-y-4">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-start gap-2 border-l-2 border-neutral-900 pl-3 text-[13px] font-medium tracking-wide text-neutral-900 hover:text-neutral-500"
                    >
                      {s.number}. {s.title.toUpperCase()}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content */}
            <div className="max-w-2xl space-y-20">
              {/* 01. Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <h2 className="mb-6 font-serif text-3xl italic text-neutral-900">
                  01. Introduction
                </h2>
                <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                  Welcome to KGLUXEE. Your privacy is paramount to us. This
                  Privacy Policy describes how your personal information is
                  collected, used, and shared when you visit or make a
                  purchase from our boutique storefront. By using our
                  services, you agree to the practices described in this
                  document.
                </p>
                <p className="text-[15px] leading-relaxed text-neutral-600">
                  We treat every piece of data as a valuable asset, ensuring
                  that our digital experience mirrors the exclusivity and
                  integrity of our physical collections. We do not sell your
                  personal information to third parties.
                </p>
              </section>

              {/* 02. Data Collection */}
              <section id="data-collection" className="scroll-mt-24">
                <h2 className="mb-8 font-serif text-3xl italic text-neutral-900">
                  02. Data Collection
                </h2>

                <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-serif text-lg text-neutral-900">
                      Information You Provide
                    </h3>
                    <p className="text-[15px] leading-relaxed text-neutral-600">
                      We collect information you provide directly to us, such
                      as when you create an account, subscribe to our
                      newsletter, or finalize a transaction. This includes
                      name, billing address, shipping address, payment
                      information, and email address.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-3 font-serif text-lg text-neutral-900">
                      Automated Information
                    </h3>
                    <p className="text-[15px] leading-relaxed text-neutral-600">
                      When you browse KGLUXEE, we automatically collect
                      certain information about your device, including
                      information about your web browser, IP address, and
                      time zone. This helps us optimize our editorial
                      presentation for your specific interface.
                    </p>
                  </div>
                </div>
              </section>

              {/* 03. Use of Information */}
              <section id="use-of-information" className="scroll-mt-24">
                <h2 className="mb-6 font-serif text-3xl italic text-neutral-900">
                  03. Use of Information
                </h2>
                <p className="mb-8 text-[15px] leading-relaxed text-neutral-600">
                  We use the Order Information that we collect generally to
                  fulfill any orders placed through the Site (including
                  processing your payment information, arranging for
                  shipping, and providing you with invoices and/or order
                  confirmations).
                </p>

                <dl className="space-y-5 border-t border-neutral-200 pt-6">
                  <div>
                    <dt className="inline text-[13px] font-semibold uppercase tracking-wide text-neutral-900">
                      Communication:
                    </dt>{" "}
                    <dd className="inline text-[15px] leading-relaxed text-neutral-600">
                      To communicate with you regarding your orders or
                      bespoke inquiries.
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-[13px] font-semibold uppercase tracking-wide text-neutral-900">
                      Risk Assessment:
                    </dt>{" "}
                    <dd className="inline text-[15px] leading-relaxed text-neutral-600">
                      To screen our orders for potential risk or fraud.
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-[13px] font-semibold uppercase tracking-wide text-neutral-900">
                      Personalization:
                    </dt>{" "}
                    <dd className="inline text-[15px] leading-relaxed text-neutral-600">
                      When in line with the preferences you have shared with
                      us, provide you with information or advertising
                      relating to our products.
                    </dd>
                  </div>
                </dl>
              </section>

              {/* 04. Cookies */}
              <section
                id="cookies"
                className="scroll-mt-24 bg-neutral-50 p-8 sm:p-10"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="mb-4 font-serif text-3xl italic text-neutral-900">
                      04. Cookies
                    </h2>
                    <p className="max-w-md text-[15px] leading-relaxed text-neutral-600">
                      We use cookies to maintain your shopping bag across
                      sessions and to understand how our visitors interact
                      with our lookbooks. These are small data files placed
                      on your device. You can choose to disable cookies
                      through your browser settings, though some boutique
                      features may be limited.
                    </p>
                  </div>
                  <div className="hidden h-20 w-20 shrink-0 items-center justify-center border border-neutral-300 sm:flex">
                    <CookieIcon className="h-8 w-8 text-neutral-400" />
                  </div>
                </div>
              </section>

              {/* 05. Third-Party Sharing */}
              <section id="third-party-sharing" className="scroll-mt-24">
                <h2 className="mb-6 font-serif text-3xl italic text-neutral-900">
                  05. Third-Party Sharing
                </h2>
                <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                  We share your Personal Information with third parties to
                  help us use your Personal Information, as described above.
                  For example, we use Shopify to power our online
                  store—you can read more about how Shopify uses your
                  Personal Information here:{" "}
                  <a
                    href="https://www.shopify.com/legal/privacy"
                    className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
                  >
                    shopify.com/legal/privacy
                  </a>
                  .
                </p>
                <p className="text-[15px] leading-relaxed text-neutral-600">
                  Finally, we may also share your Personal Information to
                  comply with applicable laws and regulations, to respond to
                  a subpoena, search warrant or other lawful request for
                  information we receive, or to otherwise protect our
                  rights.
                </p>
              </section>

              {/* 06. Security */}
              <section id="security" className="scroll-mt-24">
                <h2 className="mb-6 font-serif text-3xl italic text-neutral-900">
                  06. Security
                </h2>
                <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
                  To protect your personal information, we take reasonable
                  precautions and follow industry best practices to make
                  sure it is not inappropriately lost, misused, accessed,
                  disclosed, altered or destroyed.
                </p>
                <p className="mb-8 text-[15px] leading-relaxed text-neutral-600">
                  Credit card information is encrypted using secure socket
                  layer technology (SSL) and stored with AES-256 encryption.
                  We follow all PCI-DSS requirements and implement
                  additional generally accepted industry standards.
                </p>

                <div className="flex items-start gap-4 border border-neutral-300 p-6">
                  <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-neutral-900" />
                  <div>
                    <p className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-neutral-900">
                      Bespoke Protection
                    </p>
                    <p className="text-[14px] leading-relaxed text-neutral-600">
                      Our data infrastructure is audited quarterly to ensure
                      the highest standards of digital luxury and client
                      confidentiality.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* ---------------- Right sidebar ---------------- */}
        <aside className="lg:sticky lg:top-16 lg:h-fit">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-400">
            LEGAL &amp; TRANSPARENCY
          </p>
          <h2 className="mb-6 font-serif text-4xl italic text-neutral-900">
            Privacy Policy
          </h2>
          <div className="mb-6 h-px w-10 bg-neutral-900" />
          <p className="mb-8 text-[14px] leading-relaxed text-neutral-600">
            At KGLUXEE, we believe in the quiet luxury of privacy. Your data
            is treated with the same intentionality as our archival
            collections—guarded, respected, and used only to enhance your
            experience.
          </p>

          <div className="relative mb-10 aspect-[4/3] w-full overflow-hidden bg-neutral-100">
            <Image
              src="/images/privacy-still-life.jpg"
              alt="A sprig of foliage resting on a pale marble surface"
              fill
              sizes="380px"
              className="object-cover"
            />
          </div>

          <div className="space-y-10 divide-y divide-neutral-200">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-neutral-400">
                01&nbsp;&nbsp;Introduction
              </p>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                This Privacy Policy describes how KGLUXEE (&quot;we&quot;,
                &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares
                your personal information when you visit or make a purchase
                from our boutique.
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">
                By using our services, you agree to the collection and use of
                information in accordance with this policy. We prioritize the
                security of our clientele&apos;s data above all else,
                ensuring a seamless and safe acquisition process.
              </p>
            </div>

            <div className="pt-10">
              <p className="mb-3 text-xs font-semibold tracking-wide text-neutral-400">
                02&nbsp;&nbsp;Data Collection
              </p>

              <div className="mb-3 bg-neutral-50 p-4">
                <p className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-neutral-900">
                  Device Information
                </p>
                <p className="text-[13px] leading-relaxed text-neutral-500">
                  IP address, browser type, time zone, and cookies installed
                  on your device.
                </p>
              </div>
              <div className="mb-4 bg-neutral-50 p-4">
                <p className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-neutral-900">
                  Order Information
                </p>
                <p className="text-[13px] leading-relaxed text-neutral-500">
                  Name, billing address, shipping address, payment
                  information, and email address.
                </p>
              </div>

              <p className="text-[14px] leading-relaxed text-neutral-600">
                We collect personal information directly from you when you
                interact with our website, subscribe to our newsletter, or
                finalize a purchase from our seasonal archives.
              </p>
            </div>

            <div className="pt-10">
              <p className="mb-3 text-xs font-semibold tracking-wide text-neutral-400">
                03&nbsp;&nbsp;Use of Information
              </p>
              <ul className="space-y-2">
                {[
                  "Processing orders and ensuring bespoke fulfillment",
                  "Communicating updates regarding shipping and delivery",
                  "Screening for potential risk or fraud",
                  "Providing curated information and boutique advertisements based on preferences",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[14px] leading-relaxed text-neutral-600"
                  >
                    <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-900" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-10">
              <p className="mb-3 text-xs font-semibold tracking-wide text-neutral-400">
                04&nbsp;&nbsp;Cookies
              </p>
              <p className="mb-4 text-[14px] leading-relaxed text-neutral-600">
                We use cookies to maintain your session and remember your
                aesthetic preferences. These are small data files placed on
                your device.
              </p>

              <div className="bg-neutral-900 p-6 text-white">
                <p className="mb-1 font-serif text-xl italic">
                  Manage your preferences
                </p>
                <p className="mb-4 text-[13px] leading-relaxed text-neutral-300">
                  Adjust how KGLUXEE interacts with your browser data.
                </p>
                <button
                  type="button"
                  className="border border-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-neutral-900"
                >
                  Cookie Settings
                </button>
              </div>
            </div>

            <div className="pt-10">
              <p className="mb-3 text-xs font-semibold tracking-wide text-neutral-400">
                05&nbsp;&nbsp;Security
              </p>
              <p className="mb-3 text-[14px] leading-relaxed text-neutral-600">
                The security of your Personal Information is important to
                us, but remember that no method of transmission over the
                Internet, or method of electronic storage, is 100% secure.
              </p>
              <p className="text-[14px] leading-relaxed text-neutral-600">
                While we strive to use commercially acceptable means to
                protect your Personal Information, including high-level
                encryption and secure server protocols, we cannot guarantee
                its absolute security.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  );
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a9 9 0 1 0 9 9c0-.5-.05-1-.14-1.46a3 3 0 0 1-3.86-3.86A9 9 0 0 0 12 2Z" />
      <circle cx="9" cy="9" r="0.6" fill="currentColor" />
      <circle cx="14" cy="12" r="0.6" fill="currentColor" />
      <circle cx="10" cy="15" r="0.6" fill="currentColor" />
    </svg>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}