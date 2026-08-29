// app/[product_id]/Component.tsx
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase.config";
import { toast } from "sonner";
import CustomMeasurementFields, {
  type Measurement,
} from "@/components/CustomMeasurementFields";
import SizeGuideModal from "./SizeGuideModal";
import { useDiscount } from "@/hook/useDiscount";
import { applyDiscount, isDiscountActive } from "@/lib/discount";
import {
  resolveSizePrice,
  type SizePricing,
} from "@/app/console/admin/product/_components/type";
import ProductReviews from "@/components/ProductReview";
import { useCart } from "@/hook/useAddToCart";
import { useCurrency } from "@/hook/useCurrency";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  category: string;
  subCategory: string;
  sku: string;
  imageUrls: string[];
  sizePricing?: SizePricing;
}

const PLACEHOLDER_IMAGE = "/placeholder-product.png";



const isCustomSize = (size: string) => size.trim().toLowerCase() === "custom";

const SWIPE_THRESHOLD_PX = 50;

function ProductImageSlider({
  images,
  altBase,
}: {
  images: string[];
  altBase: string;
}) {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const hasMultiple = images.length > 1;

  const goTo = (next: number) =>
    setIndex((next + images.length) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD_PX)
      goTo(touchDeltaX < 0 ? index + 1 : index - 1);
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  return (
    <div
      className="relative w-full h-[420px] sm:h-[520px] md:h-[650px] lg:h-[800px] overflow-hidden bg-[#F0EDE8] select-none touch-pan-y"
      onTouchStart={hasMultiple ? handleTouchStart : undefined}
      onTouchMove={hasMultiple ? handleTouchMove : undefined}
      onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${url}-${i}`}
            src={url}
            alt={`${altBase}${images.length > 1 ? ` — image ${i + 1}` : ""}`}
            className="w-full h-full object-contain flex-shrink-0"
            draggable={false}
          />
        ))}
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-neutral-800 shadow-sm transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-neutral-800 shadow-sm transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-neutral-900"
                    : "w-1.5 bg-neutral-900/30 hover:bg-neutral-900/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const swatchColor = (color: string) => {
  const known: Record<string, string> = {
    black: "#111111",
    white: "#ffffff",
    cream: "#F5F0E6",
    beige: "#E8DCC8",
    navy: "#1B2A4A",
    tan: "#D2B48C",
    olive: "#708238",
    burgundy: "#6D1B2C",
  };
  return known[color.toLowerCase()] ?? color.toLowerCase();
};

function ProductSkeleton() {
  return (
    <main className="bg-white px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 text-neutral-900">
      <div className="grid lg:grid-cols-[1fr_480px]">
        <div className="animate-pulse">
          <div className="w-full h-[420px] sm:h-[520px] md:h-[650px] lg:h-[800px] bg-gray-200" />
        </div>
        <div className="px-5 sm:px-8 md:px-12 py-8 sm:py-10 animate-pulse flex flex-col gap-4">
          <div className="h-3 w-40 bg-gray-200 rounded" />
          <div className="h-9 w-3/4 bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-px w-12 bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded w-40 mt-2" />
          <div className="h-12 bg-gray-900 rounded mt-4" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </main>
  );
}

function PriceDisplay({
  basePrice,
  discountedPrice,
  hasDiscount,
  formatPrice,
}: {
  basePrice: number;
  discountedPrice: number;
  hasDiscount: boolean;
  formatPrice: (value: number) => string;
}) {
  if (!hasDiscount) {
    return (
      <p className="text-lg text-neutral-700 mb-6">{formatPrice(basePrice)}</p>
    );
  }
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <p className="text-lg text-neutral-900 font-semibold">
        {formatPrice(discountedPrice)}
      </p>
      <p className="text-base text-neutral-400 line-through">
        {formatPrice(basePrice)}
      </p>
    </div>
  );
}

export default function Component() {
  const params = useParams();
  const productId = params?.product_id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<"details" | "shipping" | null>(
    null,
  );

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addToCart, isAdding } = useCart();
  const { formatPrice } = useCurrency();

  const { discount } = useDiscount();
  const discountLive = isDiscountActive(discount);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", productId));
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        const data = { id: snap.id, ...snap.data() } as Product;
        setProduct(data);
        setSelectedSize(data.sizes?.[0] ?? "");
        setSelectedColor(data.colors?.[0] ?? "");
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!isCustomSize(selectedSize)) setMeasurements([]);
  }, [selectedSize]);

  if (loading) return <ProductSkeleton />;
  if (notFound || !product) {
    return (
      <main className="bg-white px-4 sm:px-8 md:px-16 xl:px-40 py-24 sm:py-32 text-center text-neutral-500 text-sm">
        Product not found.
      </main>
    );
  }

  const soldOut = product.stock === 0;
  const breadcrumb = [product.category, product.subCategory, product.name];
  const gallery = product.imageUrls?.length
    ? product.imageUrls
    : [PLACEHOLDER_IMAGE];
  const customSelected = isCustomSize(selectedSize);

  const sizeBasePrice = resolveSizePrice(product, selectedSize);
  const effectivePrice = applyDiscount(sizeBasePrice, discount);
  const priceChanged = discountLive && effectivePrice !== sizeBasePrice;

  const handleAddToCart = async () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }

    if (customSelected) {
      if (measurements.length === 0) {
        toast.error("Please add at least one measurement (in inches).");
        return;
      }

      if (measurements.some((measurement) => !measurement.value.trim())) {
        toast.error("Please enter a value for each measurement you've added.");
        return;
      }
    }

    if (product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color.");
      return;
    }

    await addToCart({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      imageUrl: gallery[0],
      stock: product.stock,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      sizeMeasurements: customSelected ? measurements : null,
      quantity,
    });
  };

  return (
    <main className="bg-white px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 text-neutral-900 mt-6 sm:mt-10">
      <div className="grid lg:grid-cols-[1fr_480px]">
        {/* LEFT: image slider — on desktop, reviews sit here below the image */}
        <div className="flex flex-col gap-2">
          <ProductImageSlider
            key={productId}
            images={gallery}
            altBase={product.name}
          />
          {/* Desktop-only reviews (below image, left column) */}
          <div className="hidden lg:block">
            <ProductReviews product_id={productId} />
          </div>
        </div>

        <SizeGuideModal
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
        />

        {/* RIGHT: product info */}
        <div className="px-5 sm:px-8 md:px-12 py-8 sm:py-10 lg:sticky lg:top-0 lg:h-fit">
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-500 mb-5 sm:mb-6">
            {breadcrumb.map((step, i) => (
              <span key={step}>
                {i > 0 && " / "}
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? "text-neutral-900 font-medium"
                      : ""
                  }
                >
                  {step}
                </span>
              </span>
            ))}
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl mb-3">
            {product.name}
          </h1>

          <PriceDisplay
            basePrice={sizeBasePrice}
            discountedPrice={effectivePrice}
            hasDiscount={priceChanged}
            formatPrice={formatPrice}
          />

          {priceChanged && discount && (
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-semibold tracking-wide rounded-full">
              <span>🏷</span>
              {discount.percentage}% OFF
            </div>
          )}

          <div className="h-px w-12 bg-neutral-300 mb-6" />

          <p className="text-sm text-neutral-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* SIZE */}
          {product.sizes.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-[0.15em] uppercase font-medium">
                  Size
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs underline text-neutral-600"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                {product.sizes.map((size) => {
                  const tierPrice = resolveSizePrice(product, size);
                  const showPriceHint = tierPrice !== product.price;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border py-2 text-sm transition-colors flex flex-col items-center ${
                        selectedSize === size
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-300 text-neutral-900 hover:border-neutral-900"
                      }`}
                    >
                      <span>{size}</span>
                    </button>
                  );
                })}
              </div>

              {customSelected && (
                <div className="mb-8 border border-neutral-200 rounded-md p-4">
                  <p className="text-xs tracking-[0.15em] uppercase font-medium mb-2">
                    Custom Measurements <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    Choose a measurement, enter its size in inches, then add
                    another if needed. At least one is required.
                  </p>
                  <CustomMeasurementFields
                    measurements={measurements}
                    onChange={setMeasurements}
                  />
                </div>
              )}
            </>
          )}

          {/* COLOR */}
          {product.colors.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-[0.15em] uppercase font-medium">
                  Color
                </span>
                {selectedColor && (
                  <span className="text-xs text-neutral-500 capitalize">
                    {selectedColor}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                    title={color}
                    className={`rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-neutral-900 scale-105"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <span
                      className="block w-12 h-12 rounded-full"
                      style={{
                        backgroundColor: swatchColor(color),
                        boxShadow:
                          color.toLowerCase() === "white"
                            ? "inset 0 0 0 1px #e5e5e5"
                            : undefined,
                      }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* QUANTITY */}
          <span className="text-xs tracking-[0.15em] uppercase font-medium block mb-3">
            Quantity
          </span>
          <div className="flex items-center gap-3 mb-8 w-fit">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 sm:w-11 sm:h-11 border border-neutral-300 flex items-center justify-center"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 h-10 sm:w-11 sm:h-11 border border-neutral-300 flex items-center justify-center text-sm">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={soldOut}
              className="w-10 h-10 sm:w-11 sm:h-11 border border-neutral-300 flex items-center justify-center disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {quantity > 1 && (
            <p className="text-sm text-neutral-500 mb-4">
              Total:{" "}
              <span className="font-semibold text-neutral-900">
                {formatPrice(effectivePrice * quantity)}
              </span>
              {priceChanged && (
                <span className="ml-2 text-neutral-400 line-through text-xs">
                  {formatPrice(sizeBasePrice * quantity)}
                </span>
              )}
            </p>
          )}

          {/* CTAs */}
          {soldOut ? (
            <button
              disabled
              className="w-full bg-neutral-300 text-neutral-500 text-xs tracking-[0.15em] uppercase py-4 mb-3 cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAdding(product.id)}

              className="w-full bg-neutral-900 text-white text-xs tracking-[0.15em] uppercase py-4 mb-1 hover:bg-neutral-700 transition-colors disabled:opacity-60"
            >
              {isAdding(product.id) ? "Adding..." : "Add to Cart"}
            </button>
          )}

          {/* ACCORDION */}
          <div className="border-t border-neutral-200">
            {(
              [
                {
                  key: "details" as const,
                  label: "Details & Composition",
                  body: `SKU: ${product.sku} · Category: ${product.category} · Subcategory: ${product.subCategory}${product.colors.length > 0 ? ` · Available in: ${product.colors.join(", ")}` : ""}`,
                },
                {
                  key: "shipping" as const,
                  label: "Shipping & Returns",
                  body: "Standard delivery takes 10 business days, items can be returned within 2 days of receipt in original condition and contact support for return authorisation within 24 hours of receiving the item.",
                },
              ] as const
            ).map((section) => (
              <div key={section.key} className="border-b border-neutral-200">
                <button
                  onClick={() =>
                    setOpenSection((current) =>
                      current === section.key ? null : section.key,
                    )
                  }
                  className="w-full flex items-center justify-between py-4 text-xs tracking-[0.15em] uppercase font-medium"
                >
                  {section.label}
                  <span
                    className={`transition-transform inline-block ${openSection === section.key ? "rotate-180" : ""}`}
                  >
                    ⌄
                  </span>
                </button>
                {openSection === section.key && (
                  <p className="text-sm text-neutral-600 leading-relaxed pb-4">
                    {section.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/tablet-only reviews — rendered below the entire product grid */}
      <div className="lg:hidden mt-4 border-t border-neutral-200 pt-8">
        <ProductReviews product_id={productId} />
      </div>
    </main>
  );
}