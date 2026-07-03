// /product/[slug]/Component.tsx
import Image from "next/image";
import Link from "next/link";
import type { CategoryBlock, CategoryData } from "./data";

// Single image tile, reused by the grid rows below.
// Kept inside this file (not its own file) on purpose — it's an
// implementation detail of the grid layout, not a standalone component.
function ImageTile({ block }: { block: CategoryBlock }) {
  const isOverlay = block.labelPosition === "overlay";
  const height = block.heightClass ?? "h-[240px] sm:h-[300px] md:h-[360px]";

  const image = (
    <div className={`relative w-full overflow-hidden ${height}`}>
      <Image
        src={block.image}
        alt={block.label}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {isOverlay && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 sm:gap-4 p-4 sm:p-6">
          <span className="font-serif italic text-base sm:text-lg text-white">
            {block.label}
          </span>
          {block.cta && (
            <span className="shrink-0 border border-white/70 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] tracking-[0.2em] text-white uppercase">
              {block.cta}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="col-span-12 md:[grid-column:span_var(--tile-span)_/_span_12]"
      style={{ ["--tile-span" as string]: block.span }}
    >
      {block.href ? <Link href={block.href}>{image}</Link> : image}
      {!isOverlay && (
        <p className="mt-3 text-xs tracking-[0.15em] text-neutral-500 uppercase">
          {block.label}
        </p>
      )}
    </div>
  );
}

export default function Component({ data }: { data: CategoryData }) {
  return (
    <main className="h-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 text-white py-10 sm:py-16 mx-auto">
      {/* Header — same for every category */}
      <header className="mb-8 sm:mb-10">
        <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-600">
            {data.title}
          </h1>
          {data.meta && (
            <span className="text-xs tracking-[0.2em] text-neutral-500 uppercase">
              {data.meta}
            </span>
          )}
        </div>
        <div className="h-px bg-neutral-300 mt-4" />
      </header>

      {/* GRID + FEATURE — Women, Men, Accessories, Occasion */}
      {(data.type === "grid" || data.type === "feature") && data.blocks && (
        <div className="space-y-4 sm:space-y-6">
          {[...new Set(data.blocks.map((b) => b.row))]
            .sort((a, b) => a - b)
            .map((row) => (
              <div key={row} className="grid grid-cols-12 gap-4 sm:gap-6">
                {data
                  .blocks!.filter((b) => b.row === row)
                  .map((block) => (
                    <ImageTile key={block.id} block={block} />
                  ))}
              </div>
            ))}
        </div>
      )}

      {/* TEXT PANEL — Children */}
      {data.type === "text-panel" && data.textPanel && (
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <div className="col-span-12 md:col-span-6">
            <div className="relative h-[280px] sm:h-[360px] md:h-[420px] w-full overflow-hidden">
              <Image
                src={data.textPanel.image}
                alt={data.textPanel.imageLabel}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-xs tracking-[0.15em] text-neutral-500 uppercase">
              {data.textPanel.imageLabel}
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 flex">
            <div className="bg-neutral-100 text-neutral-900 p-6 sm:p-8 md:p-10 flex flex-col justify-center w-full">
              <h2 className="font-serif italic text-xl sm:text-2xl mb-3 sm:mb-4">
                {data.textPanel.title}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-5 sm:mb-6 max-w-xs">
                {data.textPanel.description}
              </p>
              <div className="flex gap-4 sm:gap-6 flex-wrap">
                {data.textPanel.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-xs tracking-[0.1em] uppercase border-b border-neutral-900 pb-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILL GRID — Fabrics */}
      {data.type === "pill-grid" && data.pills && (
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {data.pills.map((pill) => (
            <Link
              key={pill}
              href={`/products/${pill.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-neutral-100 text-neutral-900 text-xs tracking-[0.15em] uppercase px-4 py-3 sm:px-6 sm:py-4 hover:bg-white transition-colors"
            >
              {pill}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}