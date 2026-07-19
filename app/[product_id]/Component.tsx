// app/[product_id]/Component.tsx
"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase.config";
import { toast } from "sonner";
import Link from "next/link";

// ─── Firestore shape ──────────────────────────────────────────────────────────

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
  imageUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <main className="bg-white px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 text-neutral-900">
      <div className="grid lg:grid-cols-[1fr_480px]">
        <div className="animate-pulse flex flex-col gap-2">
          <div className="w-full h-[420px] sm:h-[520px] md:h-[650px] lg:h-[800px] bg-gray-200" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-[260px] sm:h-[320px] md:h-[400px] lg:h-[480px] bg-gray-200" />
            <div className="h-[260px] sm:h-[320px] md:h-[400px] lg:h-[480px] bg-gray-200" />
          </div>
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function Component() {
  const params = useParams();
  const productId = params?.product_id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<"details" | "shipping" | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "added">("idle");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        signInAnonymously(auth).catch((err) =>
          console.error("Anonymous sign-in failed:", err)
        );
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!productId) return;

    const fetch = async () => {
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

    fetch();
  }, [productId]);

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

  const handleAddToCart = async () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color.");
      return;
    }
    if (!user) {
      toast.error("Please wait a moment and try again.");
      return;
    }

    setAddStatus("adding");
    try {
      const cartRef = collection(db, "users", user.uid, "add-to-cart");

      // Check if this exact product+size+color combo is already in the cart —
      // if so, bump quantity instead of creating a duplicate row.
      const dupQuery = query(
        cartRef,
        where("product_id", "==", product.id),
        where("size", "==", selectedSize || null),
        where("color", "==", selectedColor || null)
      );
      const dupSnap = await getDocs(dupQuery);

      if (!dupSnap.empty) {
        const existing = dupSnap.docs[0];
        const newQty = existing.data().quantity + quantity;
        await updateDoc(doc(cartRef, existing.id), {
          quantity: Math.min(newQty, product.stock),
        });
      } else {
        await addDoc(cartRef, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          size: selectedSize || null,
          color: selectedColor || null,
          quantity,
          createdAt: serverTimestamp(),
        });
      }

      setAddStatus("added");
      toast.success("Added to cart");
      setTimeout(() => setAddStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setAddStatus("idle");
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="bg-white px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 text-neutral-900 mt-6 sm:mt-10">
      <div className="grid lg:grid-cols-[1fr_480px]">

        {/* LEFT: image(s) */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full h-[420px] sm:h-[520px] md:h-[650px] lg:h-[800px] overflow-hidden bg-[#F0EDE8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

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

          <h1 className="font-serif text-3xl sm:text-4xl mb-3">{product.name}</h1>

          <p className="text-lg text-neutral-700 mb-6">
            {formatNaira(product.price)}
          </p>

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
                <Link href={'/size-guide'} className="text-xs underline text-neutral-600" >
                  Size Guide
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border py-3 text-sm transition-colors ${
                      selectedSize === size
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "border-neutral-300 text-neutral-900 hover:border-neutral-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
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
                    className={`w-6 h-w-6 rounded-full sm:w-11 sm:h-11 border-2 transition-all ${
                      selectedColor === color
                        ? "border-neutral-900 scale-105"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <span
                      className="block w-full h-full rounded-full"
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
              disabled={addStatus === "adding"}
              className="w-full bg-neutral-900 text-white text-xs tracking-[0.15em] uppercase py-4 mb-1 hover:bg-neutral-700 transition-colors disabled:opacity-60"
            >
              {addStatus === "adding"
                ? "Adding..."
                : addStatus === "added"
                ? "Added to Cart ✓"
                : "Add to Cart"}
            </button>
          )}
          {/* <button className="w-full border border-neutral-900 text-neutral-900 text-xs tracking-[0.15em] uppercase py-4 mb-8 mt-2 hover:bg-neutral-50 transition-colors">
            Buy Now
          </button> */}

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
                  body: "Standard delivery takes 3–5 business days. Express options are available at checkout. Items can be returned within 14 days of receipt in original condition. Please contact support for return authorisation.",
                },
              ] as const
            ).map((section) => (
              <div key={section.key} className="border-b border-neutral-200">
                <button
                  onClick={() =>
                    setOpenSection((current) =>
                      current === section.key ? null : section.key
                    )
                  }
                  className="w-full flex items-center justify-between py-4 text-xs tracking-[0.15em] uppercase font-medium"
                >
                  {section.label}
                  <span
                    className={`transition-transform inline-block ${
                      openSection === section.key ? "rotate-180" : ""
                    }`}
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
    </main>
  );
}