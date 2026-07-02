import { subHeroCards } from "@/data";
import type { SubHeroCard } from "@/types";

function SubHeroCard({ card }: { card: SubHeroCard }) {
  return (
    <div
      className="flex-1 rounded-lg overflow-hidden flex items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 w-full h-[220px] xs:h-[260px] sm:h-[280px] md:h-[300px] lg:h-[320px] relative"
      style={{ backgroundColor: card.bgColor }}
    >
      {/* Text side */}
      <div className="p-4 sm:p-6 md:p-8 z-10">
        <p className="font-serif text-[16px] xs:text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-medium text-dark-brown leading-snug mb-1">
          {card.title}
        </p>
        <p className="font-serif text-[16px] xs:text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-medium text-dark-brown leading-snug mb-3 sm:mb-4 md:mb-6">
          {card.subtitle}
        </p>
        <a
          href="#"
          className="inline-block rounded-xl border border-dark-brown text-dark-brown text-[10px] sm:text-xs font-medium px-3.5 sm:px-4 md:px-5 py-1.5 sm:py-2 hover:bg-dark-brown hover:text-white transition-colors"
        >
          {card.ctaLabel}
        </a>
      </div>

      <img
        src={`${card.image}`}
        alt={`${card.title} ${card.subtitle}`}
        className="h-[160px] xs:h-[190px] sm:h-[210px] md:h-[230px] lg:h-[256px] w-[130px] xs:w-[160px] sm:w-[190px] md:w-[250px] lg:w-[300px] object-cover object-top flex-shrink-0"
      />
    </div>
  );
}

export default function SubHero() {
  return (
    <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-0">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
        {subHeroCards.map((card) => (
          <SubHeroCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}