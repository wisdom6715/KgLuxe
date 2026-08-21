import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms of Service — KGLUXEE",
  description:
    "The terms governing purchases, payments, delivery, returns, and use of the KGLUXEE website.",
};

const EFFECTIVE_DATE = "21 August 2026";
const SUPPORT_EMAIL = "hello@kgluxee.com";
const BUSINESS_ADDRESS = "No 9 George street, Alakuko , Lagos state";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] text-neutral-900">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-16">
        <header className="mb-12 border-b border-neutral-200 pb-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-400">
            LEGAL FRAMEWORK
          </p>
          <h1 className="font-serif text-5xl text-neutral-900 sm:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-5 text-xs font-medium tracking-[0.1em] text-neutral-500">
            EFFECTIVE: {EFFECTIVE_DATE} · VERSION 3.0
          </p>
        </header>


        <div className="space-y-12 text-[15px] leading-relaxed text-neutral-700">
          <Section title="1. Who we are">
            <p>
              These Terms of Service (the <strong>“Terms”</strong>) govern your
              use of the KGLUXEE website, digital showroom, customer support
              channels, and online store (together, the{" "}
              <strong>“Services”</strong>). The Services are operated by
              KGLUXEE, a business operated by
              <strong> KG LUXEE LIMITED</strong>, with its
              principal commercial address at{" "}
              <strong>{BUSINESS_ADDRESS}</strong>.
            </p>
            <p className="mt-4">
              You can contact us about an order, payment, delivery, return, or
              privacy request at <strong>{SUPPORT_EMAIL}</strong> or reach us by phone at
              <strong> +14314588817 or +2348055909074</strong>.
            </p>
          </Section>

          <Section title="2. Acceptance and eligibility">
            <p>
              By accessing the Services, creating an account, placing an order,
              or selecting an acceptance checkbox at checkout, you confirm that
              you have read and accepted these Terms and the Privacy Policy. If
              you do not accept them, do not use the Services or place an order.
            </p>
            <p className="mt-4">
              You must be at least 18 years old, or the age of legal majority in
              your location, to place an order. We do not knowingly sell to
              children. If you use the Services for a company or another person,
              you confirm that you have authority to bind that person or entity.
            </p>
          </Section>

          <Section title="3. Guest checkout and customer accounts">
            <p>
              You may browse, add products to your cart, and complete checkout
              without creating an account where the checkout page offers that
              option. A guest cart may be stored locally on your device until
              you clear it, complete checkout, or sign in and synchronize it to
              your account.
            </p>
            <p className="mt-4">
              If you create an account, you must provide accurate information
              and protect your login credentials. You are responsible for
              activity performed through your account. Notify us promptly at
              <strong> {SUPPORT_EMAIL}</strong> if you suspect unauthorized
              access.
            </p>
          </Section>

          <Section title="4. Products, prices, and availability">
            <p>
              We describe our products, measurements, colours, materials, and
              available options as accurately as reasonably possible. Screen
              settings may affect how colours appear. Product availability,
              prices, discounts, and delivery estimates may change without prior
              notice, but a change will not affect an order already accepted and
              paid for except where correction is required for an obvious error
              or fraud prevention.
            </p>
            <p className="mt-4">
              Before payment, checkout will display the product price, quantity, applicable taxes or fees known to us, currency,
              and total amount. You are responsible for reviewing these details
              before submitting payment.
            </p>
          </Section>

          <Section title="5. Orders and payment">
            <p>
              An order request is submitted when you select the purchase button
              and complete the payment steps. An order becomes accepted when we
              send an order confirmation or begin fulfilment, whichever occurs
              first. We may decline or cancel an order where a product is
              unavailable, a price or listing error occurred, payment is not
              authorized, the order appears fraudulent, or delivery cannot be
              made to the supplied address. If we cancel an order after payment,
              we will refund the amount paid to the original payment method.
            </p>
            <p className="mt-4">
              Payments are processed by Flutterwave or another payment provider
              displayed at checkout. KGLUXEE does not request or store your full
              card number, CVV, PIN, or online-banking password. You must use a
              payment method that you are authorized to use. Suspected fraud may
              be reported to the payment provider or relevant authorities.
            </p>
            <p className="mt-4">
              Your bank, card issuer, payment provider, or foreign-exchange
              provider may apply separate conversion fees or charges. Those
              third-party charges are not controlled by KGLUXEE.
            </p>
          </Section>

          <Section title="6. Delivery and international orders">
            <p>
              Our standard delivery estimate is up to 10 business days after
              order confirmation, unless a different estimate is displayed at
              checkout. Delivery may take longer because of product preparation,
              courier delays, customs, public holidays, or events outside our
              reasonable control. We will provide shipping or tracking updates
              where available.
            </p>
            <p className="mt-4">
              For delivery outside Nigeria, the customer is the importer of
              record and is responsible for providing accurate delivery and
              customs information and paying import duties, customs charges,
              destination taxes, brokerage charges, and other charges imposed by
              the destination country unless checkout expressly states that
              KGLUXEE has included them. We cannot guarantee that a destination
              authority will not delay, inspect, or refuse a shipment.
            </p>
          </Section>

          <Section title="7. Returns and refunds">
            <p>
              Returns and refunds are governed by our Refund and Return Policy.
              In summary, contact customer support immediately and no later than
              <strong> five calendar days after receiving the product</strong>.
              We will provide return instructions and a return authorization
              process. Do not send a product back before receiving our written
              instructions.
            </p>
            <p className="mt-4">
              Approved refunds are issued to the original payment method after
              the returned product is received and inspected. We process an
              approved refund within <strong>three business days</strong> after
              inspection. Banks and payment providers may take an additional
              <strong> five to ten business days</strong>, and international
              transactions may take up to 15 business days, to display the
              credit.
            </p>
          </Section>

          <Section title="8. Intellectual property and permitted use">
            <p>
              The KGLUXEE name, logos, designs, photographs, text, product
              descriptions, software, layouts, and other content are owned by or
              licensed to KGLUXEE and are protected by applicable intellectual
              property laws. We grant you a limited, revocable, non-exclusive
              right to use the Services for personal, lawful shopping purposes.
            </p>
            <p className="mt-4">
              You must not copy, reproduce, republish, sell, scrape, reverse
              engineer, frame, modify, or commercially exploit any part of the
              Services without our prior written permission. You must not use
              the Services to upload malicious code, interfere with another
              person’s access, or attempt unauthorized access to our systems.
            </p>
          </Section>

          <Section title="9. Disclaimers and liability">
            <p>
              We will provide the Services with reasonable care and skill. To
              the maximum extent permitted by applicable law, we do not warrant
              that the website will always be uninterrupted, error-free, or free
              of harmful components, and we are not responsible for failures
              caused by internet providers, banks, payment processors, couriers,
              customs authorities, or other third parties.
            </p>
            <p className="mt-4">
              Nothing in these Terms excludes or limits liability that cannot be
              excluded or limited under applicable law, including liability for
              fraud, fraudulent misrepresentation, death or personal injury
              caused by negligence, or your statutory consumer rights. Subject
              to that limitation, KGLUXEE will not be liable for indirect,
              incidental, special, or consequential losses. Our total liability
              for a claim connected with an order will not exceed the amount you
              paid for that order.
            </p>
          </Section>

          <Section title="10. Events outside our control">
            <p>
              We are not responsible for delay or failure caused by events
              beyond our reasonable control, including natural disasters,
              epidemic, war, civil unrest, strikes, government restrictions,
              customs action, courier disruption, payment-network outages, power
              failure, or cyber incidents affecting a third-party provider. We
              will take reasonable steps to communicate material delays and
              resume performance when practicable.
            </p>
          </Section>

          <Section title="11. Changes, suspension, and termination">
            <p>
              We may update these Terms by publishing a revised version with a
              new effective date. Changes apply prospectively and do not remove
              rights that already accrued under an accepted order. We may
              suspend or terminate access where necessary to prevent fraud,
              abuse, security harm, unlawful activity, or material breach of
              these Terms.
            </p>
          </Section>

          <Section title="12. Governing law and contact">
            <p>
              These Terms are governed by the laws of the Federal Republic of
              Nigeria, without prejudice to mandatory consumer protections that
              apply in your country of residence. The parties will first attempt
              in good faith to resolve a dispute through customer support. If it
              is not resolved, either party may seek relief from a court of
              competent jurisdiction in Nigeria or another forum required by
              mandatory law.
            </p>
            <p className="mt-4">
              Legal notices and customer-support requests should be sent to:
              <br />
              <strong>KG LUXEE LIMITED</strong>
              <br />
              {BUSINESS_ADDRESS}
              <br />
              {SUPPORT_EMAIL}
              <br />
              +14314588817 or +2348055909074
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
      <h2 className="mb-4 font-serif text-3xl text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}
