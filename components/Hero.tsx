import { hero } from "@/data";

export default function Hero() {
  return (
    <section className="relative w-full h-[420px] sm:h-[480px] md:h-[550px] lg:h-[600px] overflow-hidden px-4 sm:px-8 md:px-12 lg:px-20 md:rounded-2xl">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:rounded-2xl"
        style={{ backgroundImage: `url('/images/hero.png')` }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg px-4 sm:px-6">
          <h1 className="font-serif text-[32px] sm:text-[40px] md:text-[52px] lg:text-[64px] font-medium leading-tight mb-3 sm:mb-4 drop-shadow-sm">
            {hero.title}
          </h1>
          <p className="text-[13px] sm:text-[14px] md:text-[16px] text-white/80 leading-relaxed mb-6 sm:mb-8 max-w-[240px] sm:max-w-xs mx-auto">
            {hero.subtitle}
          </p>
          <a
            href="/products/all"
            className="inline-flex rounded-xl items-center gap-2 bg-white text-dark-brown text-[10px] sm:text-xs font-bold tracking-widest uppercase px-5 sm:px-7 py-2.5 sm:py-3 hover:bg-dark-brown hover:text-white transition-colors duration-300"
          >
            {hero.ctaLabel}
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}