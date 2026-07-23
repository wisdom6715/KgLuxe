"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase.config";
import { useCart } from "@/hook/useAddToCart";
import { useWishlist } from "@/hook/useAddToWishList";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  category: string;
  subCategory?: string;
  badge?: string;
  stock?: number; // optional until it's added to every product doc
}

const PLACEHOLDER_IMAGE = "/placeholder-product.png";

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  wishlistBusy: boolean;
  onToggleWishlist: () => void;
  onQuickAdd: () => void;
  addBusy: boolean;
}

function ProductCard({
  product,
  wishlisted,
  wishlistBusy,
  onToggleWishlist,
  onQuickAdd,
  addBusy,
}: ProductCardProps) {
  const router = useRouter();
  const soldOut = product.stock === 0;
  const coverImage = product.imageUrls?.[0] ?? PLACEHOLDER_IMAGE;

  return (
    <div className="group cursor-pointer w-full" onClick={() => router.push(`/${product.id}`)}>
      <div className="relative overflow-hidden rounded-lg bg-warm-gray h-[240px] xs:h-[300px] sm:h-[380px] md:h-[420px] lg:h-[470px] w-full mb-3 sm:mb-4">
        <img
          src={coverImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {product.badge && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className="bg-dark-brown text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2 sm:px-2.5 py-1">
              {product.badge}
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          disabled={wishlistBusy}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 disabled:opacity-50"
          aria-label="Add to wishlist"
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              wishlisted ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-600"
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

        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            disabled={soldOut || addBusy}
            className="w-full bg-dark-brown text-white text-[10px] sm:text-xs font-medium tracking-wider uppercase py-2.5 sm:py-3 hover:bg-mid-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {soldOut ? "Sold Out" : addBusy ? "Adding..." : "Quick Add"}
          </button>
        </div>
      </div>

      <div>
        <p className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1">
          {product.subCategory ?? product.category}
        </p>
        <h3 className="text-xs sm:text-sm font-medium text-dark-brown group-hover:text-mid-brown transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-dark-brown font-semibold mt-1">
          {formatNaira(product.price)}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse w-full">
      <div className="rounded-lg bg-gray-200 h-[240px] xs:h-[300px] sm:h-[380px] md:h-[420px] lg:h-[470px] w-full mb-3 sm:mb-4" />
      <div className="h-2.5 bg-gray-200 rounded w-20 mb-2" />
      <div className="h-3.5 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-3.5 bg-gray-200 rounded w-24" />
    </div>
  );
}

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // One shared listener each for the whole grid — not one per card.
  const { addToCart, isAdding } = useCart();
  const { isWishlisted, toggleWishlist, isMutating } = useWishlist();

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered =
    activeTab === "All"
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <section className="py-8 sm:py-10 md:py-12 border-t border-gray-100 px-4 sm:px-6 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12 md:mb-16">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-dark-brown">Popular products</h2>
        {!loading && categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium tracking-wide transition-all flex-shrink-0 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-dark-brown text-white"
                    : "border border-gray-300 text-gray-500 hover:border-dark-brown hover:text-dark-brown"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlisted={isWishlisted(product.id)}
              wishlistBusy={isMutating(product.id)}
              addBusy={isAdding(product.id)}
              onToggleWishlist={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrls?.[0] ?? PLACEHOLDER_IMAGE,
                })
              }
              onQuickAdd={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrls?.[0] ?? PLACEHOLDER_IMAGE,
                  stock: product.stock,
                  quantity: 1,
                })
              }
            />
          ))}
        </div>
      ) : (
        <div className="py-16 sm:py-20 text-center text-text-muted text-sm">
          No products in this category yet.
        </div>
      )}
    </section>
  );
}