"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hook/useAddToCart";
import { useWishlist } from "@/hook/useAddToWishList";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  subCategory: string;
  sizes: string[];
  colors: string[];
  sku?: string;
  badge?: string;
  stock?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[&]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const COLORS = [
  { name: "black",    hex: "#1C1C1C" },
  { name: "white",    hex: "#F2F0EC" },
  { name: "gray",     hex: "#9E9E9E" },
  { name: "darkgray", hex: "#555555" },
  { name: "tan",      hex: "#D4B896" },
];

const SORT_OPTIONS = [
  "Latest Arrivals",
  "Price: Low to High",
  "Price: High to Low",
];

const ITEMS_PER_PAGE = 10;
const MAX_PRICE = 2_000_000;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Breadcrumb({ label }: { label: string }) {
  const router = useRouter();
  return (
    <nav className="flex items-center gap-2 text-xs text-gray-400 mb-5 font-medium tracking-wide overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link href="/" className="hover:text-dark-brown transition-colors uppercase flex-shrink-0">
        Home
      </Link>
      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span
        className="text-dark-brown uppercase font-bold cursor-pointer flex-shrink-0"
        onClick={() => router.back()}
      >
        Products
      </span>
      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-dark-brown uppercase font-bold flex-shrink-0">{label}</span>
    </nav>
  );
}

function FilterContent({
  selectedSizes,
  toggleSize,
  selectedColor,
  setSelectedColor,
  priceRange,
  setPriceRange,
  maxPrice,
}: {
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  selectedColor: string | null;
  setSelectedColor: (c: string | null) => void;
  priceRange: number;
  setPriceRange: (v: number) => void;
  maxPrice: number;
}) {
  return (
    <>
      {/* SIZE */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-dark-brown uppercase mb-4">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-10 h-9 text-xs font-medium border transition-all ${
                selectedSizes.includes(size)
                  ? "bg-dark-brown text-white border-dark-brown"
                  : "bg-white text-dark-brown border-gray-300 hover:border-dark-brown"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      {/* COLOR */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-dark-brown uppercase mb-4">
          Color
        </p>
        <div className="flex items-center gap-2.5">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() =>
                setSelectedColor(selectedColor === color.name ? null : color.name)
              }
              title={color.name}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                selectedColor === color.name
                  ? "border-dark-brown scale-110"
                  : "border-transparent hover:border-gray-300"
              }`}
              style={{
                backgroundColor: color.hex,
                boxShadow:
                  color.name === "white" ? "inset 0 0 0 1px #ddd" : undefined,
              }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      {/* PRICE */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-dark-brown uppercase mb-5">
          Price
        </p>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={5000}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-dark-brown cursor-pointer"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">$0</span>
          <span className="text-xs text-gray-500">{formatNaira(priceRange)}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8 lg:hidden" />
    </>
  );
}

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  wishlistBusy: boolean;
  onToggleWishlist: () => void;
  addBusy: boolean;
  onQuickAdd: () => void;
}

function ProductCard({
  product,
  wishlisted,
  wishlistBusy,
  onToggleWishlist,
  addBusy,
  onQuickAdd,
}: ProductCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const soldOut = product.stock === 0;

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/${product.id}`)}
    >
      <div
        className="relative overflow-hidden bg-[#F0EDE8] mb-4"
        style={{ aspectRatio: "3/4" }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {soldOut && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-dark-brown text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 sm:px-3">
            Sold Out
          </div>
        )}

        {product.badge && !soldOut && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-dark-brown text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 sm:px-3">
            {product.badge}
          </div>
        )}

        {/* Quick add: always visible on touch (no hover), hover-reveal on lg */}
        <div
          className={`absolute bottom-0 inset-x-0 transition-transform duration-300 lg:${
            hovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            className={`w-full py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold tracking-widest uppercase transition-colors ${
              soldOut
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-dark-brown text-white hover:bg-mid-brown disabled:opacity-60"
            }`}
            disabled={soldOut || addBusy}
          >
            {soldOut ? "Notify Me" : addBusy ? "Adding..." : "Quick Add"}
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          disabled={wishlistBusy}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 disabled:opacity-50"
          aria-label="Add to wishlist"
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              wishlisted ? "fill-red-500 stroke-red-500" : "fill-none stroke-[#2C2015]"
            }`}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </button>
      </div>

      <h3 className="font-serif text-[13px] sm:text-[15px] font-semibold text-dark-brown leading-snug mb-1">
        {product.name}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500">{formatNaira(product.price)}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 mb-4 w-full" style={{ aspectRatio: "3/4" }} />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3.5 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (n: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Show at most 5 page buttons centred around current page
  const range = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1
  );

  // Insert ellipsis markers
  const withEllipsis: (number | "…")[] = [];
  range.forEach((n, i) => {
    if (i > 0 && n - (range[i - 1] as number) > 1) withEllipsis.push("…");
    withEllipsis.push(n);
  });

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 sm:mt-14 mb-10 flex-wrap">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 text-dark-brown hover:border-dark-brown disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {withEllipsis.map((n, i) =>
        n === "…" ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs text-gray-400">
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => onPageChange(n as number)}
            className={`w-8 h-8 sm:w-9 sm:h-9 text-xs font-semibold border transition-colors ${
              n === page
                ? "bg-dark-brown text-white border-dark-brown"
                : "border-gray-300 text-dark-brown hover:border-dark-brown"
            }`}
          >
            {n}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 text-dark-brown hover:border-dark-brown disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const isAll = slug === "all";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<number>(MAX_PRICE);
  const [sortBy, setSortBy] = useState("Latest Arrivals");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // One shared listener each for the whole grid — not one per card.
  const { addToCart, isAdding } = useCart();
  const { isWishlisted, toggleWishlist, isMutating } = useWishlist();

  // Live Firestore listener
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];
        setAllProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Reset filters whenever the slug changes
  useEffect(() => {
    setPage(1);
    setSelectedSizes([]);
    setSelectedColor(null);
    setPriceRange(MAX_PRICE);
  }, [slug]);

  // Lock body scroll while mobile filter drawer is open
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setPage(1);
  };

  // Breadcrumb label — use stored subCategory string if we can find a match,
  // otherwise humanise the slug
  const breadcrumbLabel = useMemo(() => {
    if (isAll) return "All Products";
    const match = allProducts.find((p) => toSlug(p.subCategory) === slug);
    return match?.subCategory ?? slug.replace(/-/g, " ");
  }, [allProducts, slug, isAll]);

  // Max price driven by products currently in scope (not all products)
  const maxPrice = useMemo(() => {
    const scope = isAll
      ? allProducts
      : allProducts.filter((p) => toSlug(p.subCategory) === slug);
    const prices = scope.map((p) => p.price);
    return prices.length > 0 ? Math.max(...prices) : MAX_PRICE;
  }, [allProducts, slug, isAll]);

  const filtered = useMemo(() => {
    // Scope: all products or only those matching the subcategory slug
    let list = isAll
      ? [...allProducts]
      : allProducts.filter((p) => toSlug(p.subCategory) === slug);

    // Sidebar filters
    if (selectedSizes.length > 0)
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));

    if (selectedColor)
      list = list.filter((p) =>
        p.colors.some((c) => c.toLowerCase() === selectedColor)
      );

    list = list.filter((p) => p.price <= priceRange);

    // Sort
    if (sortBy === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") list.sort((a, b) => b.price - a.price);

    return list;
  }, [allProducts, slug, isAll, selectedSizes, selectedColor, priceRange, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const showingStart = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(page * ITEMS_PER_PAGE, filtered.length);

  const activeFilterCount =
    selectedSizes.length + (selectedColor ? 1 : 0) + (priceRange < maxPrice ? 1 : 0);

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColor(null);
    setPriceRange(maxPrice);
    setPage(1);
  };

  return (
    <div className="h-full bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-0">
        <Breadcrumb label={breadcrumbLabel} />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar — inline on desktop only */}
          <aside className="hidden lg:block w-[210px] flex-shrink-0">
            <FilterContent
              selectedSizes={selectedSizes}
              toggleSize={toggleSize}
              selectedColor={selectedColor}
              setSelectedColor={(c) => { setSelectedColor(c); setPage(1); }}
              priceRange={priceRange}
              setPriceRange={(v) => { setPriceRange(v); setPage(1); }}
              maxPrice={maxPrice}
            />
          </aside>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 flex-wrap">
              <div className="flex items-center gap-3 order-2 sm:order-1 w-full sm:w-auto justify-between sm:justify-start">
                {/* Filters button — mobile/tablet only */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-xs font-medium text-dark-brown border border-gray-300 px-3.5 py-2 hover:border-dark-brown transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6M11 16h2" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-dark-brown text-white text-[9px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <p className="text-[11px] sm:text-xs text-gray-400 font-medium tracking-wide">
                  {loading ? (
                    <span className="inline-block w-36 sm:w-44 h-3.5 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <>
                      {showingStart}–{showingEnd} of{" "}
                      <span className="text-dark-brown font-semibold">
                        {filtered.length}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Sort */}
              <div className="relative order-1 sm:order-2 ml-auto sm:ml-0">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 text-xs font-medium text-dark-brown hover:text-mid-brown transition-colors"
                >
                  <span className="hidden sm:inline text-gray-400 font-normal">Sort by:</span>
                  <span className="truncate max-w-[110px] sm:max-w-none">{sortBy}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${sortOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-lg z-20 w-48 sm:w-52 py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false); setPage(1); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                          sortBy === opt
                            ? "bg-warm-gray text-dark-brown font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-dark-brown"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : paginated.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-10">
                {paginated.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlisted={isWishlisted(product.id)}
                    wishlistBusy={isMutating(product.id)}
                    onToggleWishlist={() =>
                      toggleWishlist({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                      })
                    }
                    addBusy={isAdding(product.id)}
                    onQuickAdd={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        stock: product.stock,
                        color:
                          product.colors && product.colors.length > 0
                            ? product.colors[0]
                            : undefined,
                        quantity: 1,
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 sm:py-24 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  No products match your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-dark-brown underline underline-offset-2 hover:text-mid-brown transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile/tablet filter drawer */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <p className="text-sm font-bold text-dark-brown uppercase tracking-wide">
                Filters
              </p>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="p-1.5 -m-1.5 text-gray-500 hover:text-dark-brown transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-6">
              <FilterContent
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                selectedColor={selectedColor}
                setSelectedColor={(c) => { setSelectedColor(c); setPage(1); }}
                priceRange={priceRange}
                setPriceRange={(v) => { setPriceRange(v); setPage(1); }}
                maxPrice={maxPrice}
              />
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 text-xs font-semibold border border-gray-300 text-dark-brown hover:border-dark-brown transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold bg-dark-brown text-white hover:opacity-90 transition-opacity"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}