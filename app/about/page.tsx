"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

/**
 * Simple scroll-reveal hook.
 * Adds `.in` to any element with the `data-fade` attribute once it enters the viewport.
 * Respects prefers-reduced-motion by doing nothing (elements are visible by default via CSS).
 */
function useFadeUp() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = root.querySelectorAll<HTMLElement>("[data-fade]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return rootRef;
}

const WHY_CHOOSE = [
  {
    title: "Premium Quality",
    copy: "Uncompromising standards in every stitch.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.2 2.2L16 9.5" />
      </>
    ),
  },
  {
    title: "Timeless Elegance",
    copy: "Designs that transcend seasonal trends.",
    icon: (
      <>
        <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3z" />
        <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
      </>
    ),
  },
  {
    title: "Exclusive Designs",
    copy: "Limited edition pieces for a unique identity.",
    icon: <path d="M12 2l3 5 5 1-4 4 1 5-5-3-5 3 1-5-4-4 5-1z" />,
  },
  {
    title: "Expert Tailoring",
    copy: "Artisanal precision in every garment.",
    icon: (
      <>
        <circle cx="7" cy="6" r="2.4" />
        <circle cx="7" cy="18" r="2.4" />
        <path d="M20 6L9 17M12.5 14.5L20 18" />
      </>
    ),
  },
  {
    title: "Intl Size Guide",
    copy: "Seamless fit selection for global clients.",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="1.5" />
        <path d="M3 9h18M7 14h3" />
      </>
    ),
  },
  {
    title: "Luxury Packaging",
    copy: "An unboxing experience that mirrors our craft.",
    icon: (
      <>
        <path d="M4 8l8-4 8 4-8 4-8-4z" />
        <path d="M4 8v8l8 4 8-4V8" />
        <path d="M12 12v8" />
      </>
    ),
  },
  {
    title: "Worldwide Shipping",
    copy: "Bringing KGLUXEE to your doorstep anywhere.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.4 2.6 3.6 5.7 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.7-3.6-9S9.6 5.6 12 3z" />
      </>
    ),
  },
  {
    title: "Exceptional Service",
    copy: "Dedicated support for your luxury journey.",
    icon: <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0112 6.5 5.4 5.4 0 0121.3 12c-2.3 4.4-9.3 9-9.3 9z" />,
  },
];

const QUALITY_POINTS = [
  {
    n: "01",
    title: "Premium Fabrics",
    copy: "Sourcing superior silks, linens, and fine-woven textiles for longevity and comfort.",
  },
  {
    n: "02",
    title: "Expert Craftsmanship",
    copy: "Each piece is hand-finished by master tailors with decades of experience in high-fashion construction.",
  },
  {
    n: "03",
    title: "Precision Tailoring",
    copy: "Focusing on the architecture of the garment to ensure a perfect fit for diverse silhouettes.",
  },
];


export default function AboutPage() {
  const rootRef = useFadeUp();

  return (
    <div
      ref={rootRef}
      className={`${playfair.variable} ${inter.variable} font-sans bg-[#faf9f6] text-[#161513] antialiased`}
    >
      <style jsx global>{`
        .font-serif {
          font-family: var(--font-serif), serif;
        }
        [data-fade] {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        [data-fade].in {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-fade] {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      {/* ============ HEADER ============ */}
      <Header />

      <main>
        {/* ============ HERO ============ */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div data-fade className="order-2 lg:order-1">
              <p className="tracking-[0.14em] uppercase text-[11px] text-[#6b6860] mb-5">
                Established Craftsmanship
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.98] mb-7">
                About
                <br />
                KGLUXEE
              </h1>
              <p className="text-[15px] leading-relaxed text-[#6b6860] max-w-md mb-8">
                Founded on a passion for understated elegance, KGLUXEE is a sanctuary for those who seek the
                extraordinary in the everyday. Our narrative is woven from threads of quality, precision, and an
                unwavering commitment to timeless style.
              </p>
              <Link
                href="/products/all"
                className="inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase border-b border-[#161513] pb-1 group"
              >
                Explore Collections
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

            <div data-fade className="order-1 lg:order-2 relative">
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#efeee9]">
                <Image
                  src="/images/women-welcome.jpg"
                  alt="A woman in a cream draped dress standing in a minimalist gallery space"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-8 -left-4 sm:-left-8 w-28 sm:w-36 md:w-44 aspect-square bg-white p-2 shadow-xl">
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src="/images/fabrics.png"
                    alt="Close-up detail of hand-finished tailoring stitchwork"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROMISE QUOTE BAND ============ */}
        <section data-fade className="bg-[#efeee9] border-y border-[#dedad2] py-16 md:py-20 mt-10 md:mt-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl leading-snug mb-4">
              Luxury in Every Detail
            </p>
            <p className="tracking-[0.08em] uppercase text-[11px] text-[#6b6860]">The KGLUXEE Promise</p>
          </div>
        </section>

        {/* ============ WHO IS KGLUXEE ============ */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div data-fade>
              <h2 className="font-serif text-3xl sm:text-4xl mb-6">Who is KGLUXEE?</h2>
              <p className="text-[15px] leading-relaxed text-[#6b6860] mb-5">
                KGLUXEE is more than a fashion house; it is a manifestation of modern femininity. We specialize in
                the curation and creation of tailored dresses, kaftans, boubous, and abayas that resonate with the
                global woman.
              </p>
              <p className="text-[15px] leading-relaxed text-[#6b6860]">
                Our resort wear collections are inspired by the intersection of traditional silhouettes and
                contemporary design. Every piece we create is an homage to the timeless fashion that allows our
                clients to move through the world with effortless grace.
              </p>
            </div>

            <div data-fade className="grid sm:grid-cols-2 gap-10 lg:gap-8">
              <div>
                <p className="tracking-[0.14em] uppercase text-[11px] text-[#6b6860] mb-3">Our Vision</p>
                <p className="text-[15px] leading-relaxed">
                  To emerge as a globally recognized emblem of luxury, defining the standard for premium
                  craftsmanship and sophisticated design within the modest and resort wear markets.
                </p>
              </div>
              <div>
                <p className="tracking-[0.14em] uppercase text-[11px] text-[#6b6860] mb-3">Our Mission</p>
                <p className="text-[15px] leading-relaxed">
                  Committed to delivering timeless pieces through the marriage of premium quality materials and
                  exceptional service. We strive to empower our community through precision tailoring and an
                  unparalleled luxury experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ COMMITMENT TO QUALITY (dark) ============ */}
        <section data-fade className="bg-[#161513] text-[#faf9f6] py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:h-[520px] overflow-hidden bg-neutral-800 order-1">
                <Image
                  src="/images/wedding.jpg"
                  alt="A black satin slip dress hanging on a rail"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="order-2">
                <h2 className="font-serif text-4xl sm:text-5xl leading-tight mb-6">
                  Commitment
                  <br />
                  to Quality
                </h2>
                <p className="text-[15px] leading-relaxed text-neutral-400 max-w-md mb-10">
                  At the heart of KGLUXEE lies a relentless pursuit of perfection. We source only the most exquisite
                  fabrics from around the world, ensuring that every garment feels as extraordinary as it looks.
                </p>

                <ol className="divide-y divide-neutral-700 border-t border-neutral-700">
                  {QUALITY_POINTS.map((point) => (
                    <li key={point.n} className="py-6 grid grid-cols-[auto_1fr] gap-5 sm:gap-8">
                      <span className="font-serif italic text-2xl text-neutral-500">{point.n}</span>
                      <div>
                        <p className="tracking-[0.08em] uppercase text-xs mb-2">{point.title}</p>
                        <p className="text-sm text-neutral-400 leading-relaxed">{point.copy}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ============ WHY CHOOSE KGLUXEE ============ */}
        <section data-fade className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 md:py-24">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl mb-4">Why Choose KGLUXEE</h2>
            <span className="inline-block w-12 h-px bg-[#161513]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-14 text-center">
            {WHY_CHOOSE.map((item) => (
              <div key={item.title}>
                <svg
                  className="mx-auto mb-4"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.3}
                >
                  {item.icon}
                </svg>
                <p className="tracking-[0.08em] uppercase text-xs mb-2">{item.title}</p>
                <p className="text-xs text-[#6b6860] leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CTA BANNER ============ */}
        <section data-fade className="relative overflow-hidden py-24 md:py-36">
          <Image src="/images/abaya.png" alt="" fill aria-hidden className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-[#faf9f649]" />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl leading-snug mb-6">
              &ldquo;Look elegant. Feel confident.&rdquo;
            </h2>
            <p className="text-[15px] text-[#6b6860] leading-relaxed mb-9 max-w-lg mx-auto">
              Our final promise to you is simple: a KGLUXEE piece is an investment in your self-expression. We
              invite you to experience the harmony of comfort and couture.
            </p>
            <Link
              href="/products/all"
              className="inline-block bg-[#161513] text-[#faf9f6] text-xs tracking-[0.14em] uppercase px-8 py-4 hover:bg-neutral-800 transition-colors"
            >
              Discover the Collection
            </Link>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}