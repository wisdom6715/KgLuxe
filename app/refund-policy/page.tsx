import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Refund and Return Policy — KGLUXEE",
  description:
    "Clear return eligibility, return authorization, refund processing, and international-order terms for KGLUXEE.",
};

const EFFECTIVE_DATE = "21 August 2026";
const SUPPORT_EMAIL = "hello@kgluxee.com";
const SUPPORT_PHONE = "+14314588817";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] text-neutral-900">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-16">
        <header className="mb-12 border-b border-neutral-200 pb-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-400">
            CUSTOMER PROTECTION
          </p>
          <h1 className="font-serif text-5xl text-neutral-900 sm:text-6xl">
            Refund and Return Policy
          </h1>
          <p className="mt-5 text-xs font-medium tracking-[0.1em] text-neutral-500">
            EFFECTIVE: {EFFECTIVE_DATE} · VERSION 3.0
          </p>
        </header>

        <div className="mb-10 border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-serif text-2xl text-neutral-900">
            The short version
          </h2>
          <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-neutral-700">
            <li>
              Contact customer support immediately and no later than
              <strong> five calendar days after delivery</strong>.
            </li>
            <li>
              Include your order ID, the product name, the reason for the
              return, and clear photographs where the product is damaged, wrong,
              or defective.
            </li>
            <li>
              Wait for our return authorization and follow the return
              instructions. Do not send the product to an address not supplied
              by KGLUXEE.
            </li>
            <li>
              After the returned product is received and inspected, we process
              an approved refund immediately and no later than
              <strong> three business days</strong>.
            </li>
            <li>
              Your bank or payment provider may take a further
              <strong> five to ten business days</strong> to show the refund.
              For some international transactions, posting can take up to 15
              business days.
            </li>
          </ol>
        </div>

        <div className="space-y-12 text-[15px] leading-relaxed text-neutral-700">
          <Section title="1. Scope">
            <p>
              This Refund and Return Policy applies to products purchased
              through KGLUXEE&apos;s website or another KGLUXEE sales channel
              that refers to this policy. It explains when a product may be
              returned, how to request authorization, who pays return shipping,
              and how refunds are issued. It does not limit any mandatory
              consumer rights that apply to you under the law of your country.
            </p>
          </Section>

          <Section title="2. Return request deadline">
            <p>
              You must contact KGLUXEE customer support immediately and no later
              than{" "}
              <strong>
                five calendar days after the date you received the product
              </strong>
              . The date shown by the courier or delivery record is the delivery
              date. A request submitted after the five-day period is outside
              this policy and may be refused unless applicable law requires a
              longer period.
            </p>
            <p className="mt-4">
              Contact us at <strong>{SUPPORT_EMAIL}</strong> or
              <strong> {SUPPORT_PHONE}</strong>. Your message must include your
              order ID, full name, delivery address, product name, and a
              clear description of the issue. For a damaged, incorrect, or
              defective product, attach photographs of the product, packaging,
              shipping label, and visible damage.
            </p>
          </Section>

          <Section title="3. Return authorization process">
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                We acknowledge a complete return request within
                <strong> one business day</strong>.
              </li>
              <li>
                If the request is eligible, we issue a return authorization and
                provide the return address, carrier instructions, packaging
                requirements, and deadline for dispatch.
              </li>
              <li>
                You must not dispatch the product until you receive our written
                authorization. Products sent without authorization may be
                delayed, rejected, or returned to you at your cost.
              </li>
              <li>
                You must dispatch an authorized return within
                <strong> three calendar days after authorization</strong>,
                unless our written instructions specify a different period
                because of international shipping or customs requirements.
              </li>
              <li>
                Send us the tracking number on the day the return is dispatched.
                We will confirm receipt when the package reaches us.
              </li>
            </ol>
          </Section>

          <Section title="4. Conditions for an approved return">
            <p>
              Except for a product that arrived damaged, wrong, or defective,
              the product must be unworn, unwashed, unaltered, free from
              perfume, makeup, stains, hair, and other signs of use, and
              returned with all original tags, packaging, accessories, and
              documentation. You may inspect a product as reasonably necessary,
              but you must not use it beyond that inspection.
            </p>
            <p className="mt-4">
              We inspect every returned product. If it does not meet these
              conditions, we may refuse the refund or deduct the documented loss
              in value to the extent permitted by applicable law. We will notify
              you of the inspection outcome and the reason for any refusal or
              deduction.
            </p>
          </Section>

          <Section title="5. Products that are not returnable">
            <p>
              The following products are not eligible for return or refund
              unless they are defective, incorrect, or applicable law requires
              otherwise: final-sale products; products expressly marked
              non-returnable before purchase; bespoke, personalized, altered, or
              made-to-measure products; and products that have been worn,
              washed, damaged, stained, perfumed, or returned without original
              tags and packaging.
            </p>
            <p className="mt-4">
              If a product is defective or we sent the wrong product, contact us
              within the same five-day period. We may offer a replacement or a
              full refund, including reasonable documented return shipping
              costs, subject to inspection and applicable law.
            </p>
          </Section>

          <Section title="6. Return shipping costs">
            <p>
              If you are returning a product because you changed your mind,
              selected the wrong size or colour, or no longer want the product,
              you are responsible for the return shipping cost, customs charges,
              duties, and insurance. We recommend using a trackable service and
              retaining proof of dispatch.
            </p>
            <p className="mt-4">
              If the product arrived defective, damaged, or materially different
              from the product ordered, KGLUXEE will provide return instructions
              and reimburse reasonable, documented return shipping costs after
              the return is approved. We do not reimburse optional expedited
              shipping, insurance upgrades, customs penalties caused by
              incorrect information, or charges not approved in writing.
            </p>
          </Section>

          <Section title="7. Refund approval and timing">
            <p>
              We issue the refund after the returned product is delivered to us
              and passes inspection. We will email you the inspection decision
              within <strong>two business days of receipt</strong>. If approved,
              KGLUXEE will submit the refund to the original payment method
              immediately and no later than{" "}
              <strong>three business days of the inspection decision</strong>.
            </p>
            <p className="mt-4">
              The payment provider or bank controls when the credit appears in
              your account. Allow five to ten business days after we submit the
              refund. International card or bank transactions may take up to 15
              business days because of banking, settlement, or foreign-exchange
              processes. KGLUXEE cannot change a provider&apos;s posting time
              after the refund has been submitted, but we will provide the
              refund reference on request.
            </p>
          </Section>

          <Section title="8. Refund amount and method">
            <p>
              An approved refund is returned to the payment method used for the
              order. We do not pay cash refunds or send refunds to a different
              card or bank account except where required by law or approved by
              the payment provider. Unless the product was wrong, defective, or
              damaged, original delivery charges, return shipping, customs fees,
              duties, and foreign-exchange charges are not refundable.
            </p>
            <p className="mt-4">
              If only part of an order is returned, we refund the approved price
              of that product and any return-shipping amount we have agreed to
              reimburse. Promotional discounts are recalculated where the
              returned product means the remaining order no longer qualifies for
              the promotion.
            </p>
          </Section>

          <Section title="9. Missing, delayed, or rejected returns">
            <p>
              You are responsible for the product until it is delivered to the
              return address we provide. If a return is lost, damaged, or held
              by customs, send us the carrier claim number and proof of
              dispatch. We will reasonably assist, but a refund is not due until
              the product is received or the carrier confirms the loss and the
              applicable law requires a refund.
            </p>
            <p className="mt-4">
              If we reject a return, we will tell you why. You may request a
              review by replying to the rejection email within five calendar
              days. If the product is to be sent back to you, you must pay the
              return delivery cost within seven calendar days of our notice.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Start every return request by emailing
              <strong> {SUPPORT_EMAIL}</strong> with the subject line
              <strong> “Return Request — [ORDER ID]”</strong>. Customer
              support telephone: <strong>{SUPPORT_PHONE}</strong>.
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
