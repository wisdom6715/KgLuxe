import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy — KGLUXEE",
  description:
    "How KGLUXEE collects, uses, shares, stores, and protects personal data under Nigerian data-protection law.",
};

const EFFECTIVE_DATE = "21 August 2026";
const PRIVACY_EMAIL = "privacy@kgluxee.com";
const SUPPORT_EMAIL = "hello@kgluxee.com";
const BUSINESS_ADDRESS = "No 9 George street, Alakuko , Lagos state";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-16">
        <header className="mb-12 border-b border-neutral-200 pb-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-400">
            LEGAL &amp; TRANSPARENCY
          </p>
          <h1 className="font-serif text-5xl italic tracking-tight text-neutral-900 sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-neutral-600">
            This policy explains, in plain language, what personal data KGLUXEE
            collects, why we use it, which service providers receive it, how
            long we keep it, and how you can exercise your rights.
          </p>
          <p className="mt-5 text-xs font-medium tracking-[0.15em] text-neutral-400">
            EFFECTIVE: {EFFECTIVE_DATE} · VERSION 3.0
          </p>
        </header>

        <div className="space-y-12 text-[15px] leading-relaxed text-neutral-700">
          <Section title="1. Who controls your data">
            <p>
              KGLUXEE, operated by
              <strong> KG LUXEE LIMITED</strong>, is the
              controller responsible for personal data collected through the
              KGLUXEE website, online store, customer-support channels, and
              related services. Our commercial address is
              <strong> {BUSINESS_ADDRESS}</strong>.
            </p>
            <p className="mt-4">
              Privacy requests should be sent to our privacy contact or Data
              Protection Officer at <strong>{PRIVACY_EMAIL}</strong>. Customer
              service requests may be sent to <strong>{SUPPORT_EMAIL}</strong>.
            </p>
            <p className="mt-4">
              This policy is designed to provide the transparency required by
              Nigerian data-protection law, including the Nigeria Data
              Protection Act 2023 and applicable implementation directions. It
              also addresses the clarity principles in the{" "}
              <a
                href="https://oblp.org/wp-content/uploads/2021/01/NDPR-NDPR-NDPR-Nigeria-Data-Protection-Regulation.pdf"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Nigeria Data Protection Regulation 2019
              </a>{" "}
              document supplied for this policy review. Current regulatory
              information is available from the{" "}
              <a
                href="https://ndpc.gov.ng/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Nigeria Data Protection Commission
              </a>
              . Where a newer law or binding direction applies, that law or
              direction prevails.
            </p>
          </Section>

          <Section title="2. Personal data we collect">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-300">
                    <th className="px-3 py-3 font-semibold text-neutral-900">
                      Category
                    </th>
                    <th className="px-3 py-3 font-semibold text-neutral-900">
                      Examples
                    </th>
                    <th className="px-3 py-3 font-semibold text-neutral-900">
                      How collected
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3 font-medium">
                      Identity and contact
                    </td>
                    <td className="px-3 py-3">
                      Name, email, telephone number, account details
                    </td>
                    <td className="px-3 py-3">
                      Account, checkout, customer support, newsletter
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3 font-medium">
                      Order and delivery
                    </td>
                    <td className="px-3 py-3">
                      Products, sizes, measurements, delivery address, order
                      history
                    </td>
                    <td className="px-3 py-3">
                      Cart, checkout, order fulfilment, returns
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3 font-medium">
                      Payment and transaction
                    </td>
                    <td className="px-3 py-3">
                      Amount, currency, transaction reference, payment status
                    </td>
                    <td className="px-3 py-3">
                      Flutterwave and other payment providers
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3 font-medium">Device and usage</td>
                    <td className="px-3 py-3">
                      IP address, browser, device type, pages viewed, time zone,
                      logs
                    </td>
                    <td className="px-3 py-3">
                      Cookies, local storage, security logs, analytics
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 font-medium">Communications</td>
                    <td className="px-3 py-3">
                      Messages, reviews, support records, return photographs
                    </td>
                    <td className="px-3 py-3">
                      Email, forms, chat, customer-support channels
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5">
              We do not ask for your full card number, CVV, PIN, or
              online-banking password. Payment credentials are entered directly
              into the payment provider&apos;s secure environment and are
              handled under that provider&apos;s privacy and security terms.
            </p>
          </Section>

          <Section title="3. Why we use personal data and our lawful bases">
            <p>
              We use only the data reasonably needed for the purpose described.
              Depending on the activity, our lawful basis is contract
              performance, steps requested before a contract, compliance with a
              legal obligation, our legitimate interests in operating and
              securing the store, or your consent where consent is required.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-300">
                    <th className="px-3 py-3 font-semibold text-neutral-900">
                      Purpose
                    </th>
                    <th className="px-3 py-3 font-semibold text-neutral-900">
                      Lawful basis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">Create and manage an account</td>
                    <td className="px-3 py-3">
                      Contract or requested pre-contract steps
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">
                      Process orders, payments, delivery, returns, and refunds
                    </td>
                    <td className="px-3 py-3">
                      Contract; legal obligations; fraud prevention
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">
                      Respond to questions and support requests
                    </td>
                    <td className="px-3 py-3">
                      Contract or legitimate interest
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">
                      Secure the website, prevent fraud, and maintain records
                    </td>
                    <td className="px-3 py-3">
                      Legitimate interest; legal obligation
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3">
                      Send optional marketing communications
                    </td>
                    <td className="px-3 py-3">
                      Consent or lawful marketing basis; you may object free of
                      charge
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Consent and marketing choices">
            <p>
              Where we rely on consent, it must be freely given, specific,
              informed, and unambiguous. A checkout purchase is not conditional
              on agreeing to optional marketing. You may withdraw marketing
              consent at any time by selecting the unsubscribe link in a
              marketing email or contacting <strong>{PRIVACY_EMAIL}</strong>.
              Withdrawal does not affect processing already carried out lawfully
              before withdrawal.
            </p>
            <p className="mt-4">
              We will not sell your personal data. We will not use your data for
              unrelated purposes without a lawful basis and, where required,
              additional notice or consent.
            </p>
          </Section>

          <Section title="5. Cookies, local storage, and similar technology">
            <p>
              We use essential cookies and browser local storage to keep you
              signed in, protect sessions, remember preferences, maintain a
              guest shopping cart, prevent fraud, and operate checkout. For
              example, the guest cart may be stored on your device until you
              remove it, complete checkout, or sign in and synchronize it to
              your account.
            </p>
            <p className="mt-4">
              If we use non-essential analytics or advertising cookies, we will
              provide the required notice and choice mechanism before activating
              them where applicable. You can control cookies through your
              browser, but disabling essential storage may prevent cart or
              checkout functions from working.
            </p>
          </Section>

          <Section title="6. Who receives personal data">
            <p>
              We share personal data only where necessary for the purposes in
              this policy, under a written contract or other lawful arrangement,
              and subject to confidentiality and security obligations.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-300">
                    <th className="px-3 py-3 font-semibold text-neutral-900">
                      Provider or recipient
                    </th>
                    <th className="px-3 py-3 font-semibold text-neutral-900">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">
                      Flutterwave or the payment provider shown at checkout
                    </td>
                    <td className="px-3 py-3">
                      Payment authorization, settlement, fraud monitoring,
                      refunds, and transaction support
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">
                      Firebase / Google Cloud services used by KGLUXEE
                    </td>
                    <td className="px-3 py-3">
                      Authentication, database, hosting, storage, security, and
                      application operation
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">
                      Courier, logistics, and customs partners
                    </td>
                    <td className="px-3 py-3">
                      Delivery, tracking, customs clearance, and returns
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-200">
                    <td className="px-3 py-3">
                      Professional advisers and authorities
                    </td>
                    <td className="px-3 py-3">
                      Legal compliance, dispute resolution, fraud investigation,
                      or protection of rights
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3">
                      Analytics or marketing providers, if enabled
                    </td>
                    <td className="px-3 py-3">
                      Only the measurement or marketing functions disclosed at
                      the time of collection
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5">
              We do not authorize service providers to use your personal data
              for their own unrelated marketing. Update this table if your
              technical stack changes or if you enable another provider.
            </p>
          </Section>

          <Section title="7. International processing and transfers">
            <p>
              Some providers that support payment, hosting, authentication,
              security, email, analytics, or delivery may process personal data
              outside Nigeria. Before making such a transfer, KGLUXEE will use a
              lawful transfer mechanism required by applicable Nigerian law,
              which may include an adequacy decision, contractual safeguards,
              necessity for performing your order, or explicit informed consent
              where required. We will not transfer more data than necessary for
              the stated purpose.
            </p>
            <p className="mt-4">
              By placing an order that requires an overseas payment, hosting,
              courier, or customs provider, you acknowledge that the data needed
              for that service may be processed in the provider&apos;s country.
              Contact <strong>{PRIVACY_EMAIL}</strong> if you need information
              about the relevant safeguard for a specific transfer.
            </p>
          </Section>

          <Section title="8. Retention">
            <p>
              We keep personal data only for as long as reasonably necessary for
              the purpose collected, including order fulfilment, customer
              support, fraud prevention, accounting, tax, legal claims, and
              regulatory obligations. As a guide, order and payment records are
              retained for the period required by tax, accounting,
              payment-network, and legal rules; support and return records are
              retained for as long as needed to resolve the matter and defend or
              establish a claim; and account data is deleted or anonymized after
              account closure unless a lawful retention reason remains.
            </p>
            <p className="mt-4">
              When retention is no longer required, we securely delete,
              anonymize, or irreversibly de-identify the data. Backups may
              retain deleted data for a limited disaster-recovery cycle before
              secure overwriting.
            </p>
          </Section>

          <Section title="9. Security and data breaches">
            <p>
              We use reasonable technical and organizational measures
              appropriate to the risk, including access controls,
              authentication, least privilege, provider security controls,
              encrypted connections, monitoring, backups, and staff
              confidentiality obligations. Payment card credentials are handled
              by the payment provider and are not stored by KGLUXEE in full.
            </p>
            <p className="mt-4">
              No online system is completely risk-free. If we identify a
              personal data breach, we will investigate, contain, document, and
              remedy it, notify the Nigeria Data Protection Commission and other
              authorities where required, and notify affected individuals where
              the breach is likely to create a relevant risk. We will
              communicate practical steps you can take and provide a contact for
              questions.
            </p>
          </Section>

          <Section title="10. Your data-protection rights">
            <p>
              Subject to applicable legal exceptions and identity verification,
              you may request access to your personal data; correction of
              inaccurate or incomplete data; deletion where retention is no
              longer necessary; restriction or objection to processing;
              withdrawal of consent; portability of data where applicable; and
              information about the processing and safeguards used for
              international transfers. You may object to direct marketing free
              of charge.
            </p>
            <p className="mt-4">
              Send a request to <strong>{PRIVACY_EMAIL}</strong> with the
              subject
              <strong> “Data Rights Request”</strong>, the right you wish to
              exercise, the email or order identifier connected with your
              request, and any details needed to locate the data. We may request
              reasonable information to verify identity. We will respond without
              undue delay and normally within <strong>one month</strong> of
              receiving a complete request. If a request is complex or
              repetitive, we will explain any lawful extension or refusal and
              the reason.
            </p>
          </Section>

          <Section title="11. Children">
            <p>
              The Services are not directed to children under 18. We do not
              knowingly collect children&apos;s personal data for an order. If
              you believe a child has provided personal data, contact
              <strong> {PRIVACY_EMAIL}</strong> so we can review and delete it
              where appropriate.
            </p>
          </Section>

          <Section title="12. Complaints and remedies">
            <p>
              If you believe we have handled your personal data improperly,
              contact us first at <strong>{PRIVACY_EMAIL}</strong>. We will
              review the complaint, provide a written response, and take
              corrective action where appropriate. If you are not satisfied, you
              may contact the Nigeria Data Protection Commission or another
              competent supervisory or judicial authority in accordance with
              applicable law.
            </p>
          </Section>

          <Section title="13. Changes to this policy">
            <p>
              We may update this policy when our services, providers,
              technology, or legal obligations change. We will publish the new
              effective date at the top of the policy. For material changes, we
              will provide a prominent notice or direct communication where
              required.
            </p>
          </Section>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-neutral-200 pt-8">
      <h2 className="mb-4 font-serif text-3xl italic text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
