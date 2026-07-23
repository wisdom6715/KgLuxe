"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────

type Unit = "in" | "cm";
type Category = "fitted" | "free" | "kids";

interface Measured {
  in: string;
  cm: string;
}

interface Column {
  key: string;
  label: string;
  plain?: boolean; // true = display the raw string value, no unit switching
}

// ─── Data (transcribed from the KGLuxee size charts) ───────────────────────

const FITTED_COLUMNS: Column[] = [
  { key: "size", label: "Size", plain: true },
  { key: "uk", label: "UK", plain: true },
  { key: "us", label: "US", plain: true },
  { key: "eu", label: "EU", plain: true },
  { key: "bust", label: "Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "length", label: "Dress Length" },
];

const FITTED_ROWS: Record<string, string | Measured>[] = [
  { size: "S", uk: "8–10", us: "4–6", eu: "36–38", bust: { in: "34–36", cm: "86–91" }, waist: { in: "28–30", cm: "71–76" }, hip: { in: "38–40", cm: "97–102" }, length: { in: "56–58", cm: "142–147" } },
  { size: "M", uk: "12–14", us: "8–10", eu: "40–42", bust: { in: "38–40", cm: "97–102" }, waist: { in: "32–34", cm: "81–86" }, hip: { in: "42–44", cm: "107–112" }, length: { in: "58–60", cm: "147–152" } },
  { size: "L", uk: "16–18", us: "12–14", eu: "44–46", bust: { in: "42–44", cm: "107–112" }, waist: { in: "36–38", cm: "91–97" }, hip: { in: "46–48", cm: "117–122" }, length: { in: "60–62", cm: "152–157" } },
  { size: "XL", uk: "20", us: "16", eu: "48", bust: { in: "46–48", cm: "117–122" }, waist: { in: "40–42", cm: "102–107" }, hip: { in: "50–52", cm: "127–132" }, length: { in: "62–64", cm: "157–163" } },
  { size: "XXL", uk: "22–24", us: "18–20", eu: "50–52", bust: { in: "50–52", cm: "127–132" }, waist: { in: "44–46", cm: "112–117" }, hip: { in: "54–56", cm: "137–142" }, length: { in: "62–64", cm: "157–163" } },
];

const LENGTH_OPTIONS: { label: string; in: string; cm: string }[] = [
  { label: "Petite", in: "54–56", cm: "137–142" },
  { label: "Regular", in: "58–60", cm: "147–152" },
  { label: "Tall", in: "62–64", cm: "157–163" },
];

const FREE_COLUMNS: Column[] = [
  { key: "size", label: "Size", plain: true },
  { key: "uk", label: "UK", plain: true },
  { key: "bust", label: "Bust (fits up to)" },
  { key: "waist", label: "Waist (fits up to)" },
  { key: "hip", label: "Hip (fits up to)" },
];

const FREE_ROWS: Record<string, string | Measured>[] = [
  { size: "S", uk: "8–10", bust: { in: "42", cm: "107" }, waist: { in: "36", cm: "91" }, hip: { in: "44", cm: "112" } },
  { size: "M", uk: "12–14", bust: { in: "46", cm: "117" }, waist: { in: "40", cm: "102" }, hip: { in: "48", cm: "122" } },
  { size: "L", uk: "16–18", bust: { in: "50", cm: "127" }, waist: { in: "44", cm: "112" }, hip: { in: "52", cm: "132" } },
  { size: "XL", uk: "20", bust: { in: "54", cm: "137" }, waist: { in: "48", cm: "122" }, hip: { in: "56", cm: "142" } },
  { size: "XXL", uk: "22–24", bust: { in: "60", cm: "152" }, waist: { in: "54", cm: "137" }, hip: { in: "60", cm: "152" } },
];

const KIDS_COLUMNS: Column[] = [
  { key: "age", label: "Age", plain: true },
  { key: "height", label: "Height" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "dress", label: "Dresses" },
  { key: "trousers", label: "Trousers" },
  { key: "romper", label: "Romper" },
];

const KIDS_ROWS: Record<string, string | Measured>[] = [
  { age: "2–3 yrs", height: { in: "36.2–38.6", cm: "92–98" }, chest: { in: "21.3", cm: "54" }, waist: { in: "20.1", cm: "51" }, hip: { in: "22.4", cm: "57" }, dress: { in: "20.5–22.0", cm: "52–56" }, trousers: { in: "19.7–21.7", cm: "50–55" }, romper: { in: "18.9–20.5", cm: "48–52" } },
  { age: "4–5 yrs", height: { in: "40.9–43.3", cm: "104–110" }, chest: { in: "22.8", cm: "58" }, waist: { in: "20.9", cm: "53" }, hip: { in: "24.4", cm: "62" }, dress: { in: "22.8–24.4", cm: "58–62" }, trousers: { in: "22.0–24.4", cm: "56–62" }, romper: { in: "21.3–22.8", cm: "54–58" } },
  { age: "6–7 yrs", height: { in: "45.7–48.0", cm: "116–122" }, chest: { in: "24.4", cm: "62" }, waist: { in: "22.0", cm: "56" }, hip: { in: "26.0", cm: "66" }, dress: { in: "25.2–26.8", cm: "64–68" }, trousers: { in: "24.4–26.8", cm: "62–68" }, romper: { in: "23.6–25.2", cm: "60–64" } },
  { age: "8–9 yrs", height: { in: "50.4–52.8", cm: "128–134" }, chest: { in: "26.4", cm: "67" }, waist: { in: "23.6", cm: "60" }, hip: { in: "28.3", cm: "72" }, dress: { in: "27.6–29.1", cm: "70–74" }, trousers: { in: "26.8–29.1", cm: "68–74" }, romper: { in: "26.0–27.6", cm: "66–70" } },
  { age: "10–12 yrs", height: { in: "55.1–59.8", cm: "140–152" }, chest: { in: "29.9", cm: "76" }, waist: { in: "26.0", cm: "66" }, hip: { in: "31.9", cm: "81" }, dress: { in: "29.9–32.3", cm: "76–82" }, trousers: { in: "29.1–32.3", cm: "74–82" }, romper: { in: "28.3–30.7", cm: "72–78" } },
];

const HOW_TO_MEASURE: Record<Category, { label: string; body: string }[]> = {
  fitted: [
    { label: "Bust", body: "Measure around the fullest part of your bust." },
    { label: "Waist", body: "Measure around the smallest part of your waist." },
    { label: "Hip", body: "Measure around the fullest part of your hips." },
    { label: "Length", body: "Measure from the shoulder (or highest point) down to your desired length." },
  ],
  free: [
    { label: "Bust", body: "Measure around the fullest part of your bust." },
    { label: "Waist", body: "Measure around the smallest part of your waist." },
    { label: "Hip", body: "Measure around the fullest part of your hips." },
  ],
  kids: [
    { label: "Height", body: "Measure from the top of the head to the floor without shoes." },
    { label: "Chest", body: "Measure around the fullest part of the chest." },
    { label: "Waist", body: "Measure around the natural waistline." },
    { label: "Hip", body: "Measure around the fullest part of the hips." },
  ],
};

// ─── Small building blocks ─────────────────────────────────────────────────

function cell(value: string | Measured | undefined, unit: Unit) {
  if (value === undefined) return "—";
  if (typeof value === "string") return value;
  return value[unit];
}

function SizeTable({
  columns,
  rows,
  unit,
}: {
  columns: Column[];
  rows: Record<string, string | Measured>[];
  unit: Unit;
}) {
  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
      <table className="w-full min-w-[560px] sm:min-w-0 border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-900 text-white">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-3 px-3 text-left font-medium text-[11px] tracking-[0.12em] uppercase first:rounded-tl-md last:rounded-tr-md whitespace-nowrap"
              >
                {col.label}
                {!col.plain && (
                  <span className="ml-1 normal-case text-neutral-400">
                    ({unit})
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-3 whitespace-nowrap border-b border-neutral-200 ${
                    col.key === "size" || col.key === "age"
                      ? "font-semibold text-neutral-900"
                      : "text-neutral-600"
                  }`}
                >
                  {cell(row[col.key], unit)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main modal ─────────────────────────────────────────────────────────────

const CATEGORY_LABELS: { key: Category; label: string }[] = [
  { key: "fitted", label: "Fitted Outfits" },
  { key: "free", label: "Free Styles" },
  { key: "kids", label: "Kids" },
];

export default function SizeGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [unit, setUnit] = useState<Unit>("in");
  const [category, setCategory] = useState<Category>("fitted");
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Mount → animate in. Animate out → unmount after the transition ends.
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  const columns =
    category === "fitted" ? FITTED_COLUMNS : category === "free" ? FREE_COLUMNS : KIDS_COLUMNS;
  const rows = category === "fitted" ? FITTED_ROWS : category === "free" ? FREE_ROWS : KIDS_ROWS;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Size guide"
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 sm:scale-100 opacity-100"
            : "translate-y-full sm:translate-y-4 sm:scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="bg-neutral-900 px-5 sm:px-8 pt-6 pb-5 relative">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white font-serif text-sm tracking-wide">
              KG
            </span>
            <div>
              <p className="font-serif text-xl sm:text-2xl text-white leading-tight">
                Size Guide
              </p>
              <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-neutral-400">
                Luxury in every detail
              </p>
            </div>
          </div>
        </div>

        {/* Tabs row */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-3 border-b border-neutral-200 bg-neutral-50">
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORY_LABELS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-full border transition-colors ${
                  category === c.key
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex-shrink-0 flex rounded-full border border-neutral-900 overflow-hidden text-xs">
            {(["in", "cm"] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-3 py-1.5 uppercase tracking-wide transition-colors ${
                  unit === u
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-900/5"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 sm:px-8 py-5 flex-1">
          <SizeTable columns={columns} rows={rows} unit={unit} />

          {category === "fitted" && (
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-600">
              <span className="uppercase tracking-[0.12em] text-[11px] font-medium text-neutral-900">
                Length options:
              </span>
              {LENGTH_OPTIONS.map((l) => (
                <span key={l.label}>
                  {l.label}{" "}
                  <span className="text-neutral-500">
                    {unit === "in" ? l.in : l.cm} {unit}
                  </span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-neutral-200 pt-4">
            <p className="text-[11px] tracking-[0.15em] uppercase font-medium text-neutral-900 mb-2">
              How to measure
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-neutral-600">
              {HOW_TO_MEASURE[category].map((m) => (
                <div key={m.label}>
                  <p className="font-medium text-neutral-800 mb-0.5">{m.label}</p>
                  <p className="leading-snug">{m.body}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-[11px] text-neutral-500 leading-relaxed">
            Measurements may vary by ±1 inch (±2.5 cm) due to handmade tailoring,
            fabric type, and design details. For the best fit, compare your own
            measurements against this guide before placing your order. Need a
            custom fit? Contact us for made-to-measure sizing.
          </p>
        </div>
      </div>
    </div>
  );
}