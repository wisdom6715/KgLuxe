"use client";

import { useState } from "react";
import { Check, Info, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomMeasurementFields, {
  type Measurement,
} from "@/components/CustomMeasurementFields";
import { db } from "@/lib/firebase.config";
import { type CartItem, useCart } from "@/hook/useAddToCart";
import { useCurrency } from "@/hook/useCurrency";

interface ProductOptions {
  sizes: string[];
  colors: string[];
  stock: number;
}

interface EditDraft {
  size: string;
  color: string;
  quantity: number;
  measurements: Measurement[];
}

const PERKS = [
  "In-Store Pick Up",
  "Pay on Delivery",
  "Refer and Earn",
  "Warranty Covered",
];



const isCustomSize = (size: string | null | undefined) =>
  (size ?? "").trim().toLowerCase() === "custom";

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

function CartItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm animate-pulse">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="mt-1 h-8 w-32 rounded bg-gray-200" />
      </div>
      <div className="h-24 w-28 shrink-0 rounded-xl bg-gray-100" />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-cream-50 py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A96E]/10">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-[#C9A96E]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500">Your cart is empty</p>
      <a
        href="/"
        className="text-sm font-semibold text-[#C9A96E] hover:underline"
      >
        Browse products →
      </a>
    </div>
  );
}

export default function CartPage() {
  // Use the user returned by the same useCart instance. This prevents the
  // cart page and cart hook from briefly disagreeing during auth hydration.
  const {
    user,
    items,
    loading,
    syncing,
    isGuest,
    updateQuantity,
    updateItem,
    removeFromCart,
  } = useCart();
  const router = useRouter();
  const { formatPrice, formatBoth } = useCurrency();

  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [productOptions, setProductOptions] = useState<
    Record<string, ProductOptions>
  >({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateQty = async (item: CartItem, delta: number) => {
    const nextQuantity = item.quantity + delta;
    setMutatingId(item.id);

    try {
      await updateQuantity(item.id, nextQuantity, item.stock);
      toast.success(
        nextQuantity <= 0 ? "Item removed from cart" : "Quantity updated",
      );
    } finally {
      setMutatingId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setMutatingId(itemId);

    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } finally {
      setMutatingId(null);
    }
  };

  const startEdit = async (item: CartItem) => {
    setEditingId(item.id);
    setEditDraft({
      size: item.size ?? "",
      color: item.color ?? "",
      quantity: item.quantity,
      measurements: item.sizeMeasurements ?? [],
    });

    if (productOptions[item.product_id]) return;

    setLoadingOptions(true);
    try {
      const snapshot = await getDoc(doc(db, "products", item.product_id));

      if (snapshot.exists()) {
        const data = snapshot.data();
        setProductOptions((current) => ({
          ...current,
          [item.product_id]: {
            sizes: Array.isArray(data.sizes) ? data.sizes : [],
            colors: Array.isArray(data.colors) ? data.colors : [],
            stock: Number(data.stock ?? item.stock),
          },
        }));
      }
    } catch (error) {
      console.error("Failed to load product options:", error);
      toast.error("Could not load size and color options.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async (item: CartItem) => {
    if (!editDraft) return;

    const options = productOptions[item.product_id];

    if (options?.sizes.length && !editDraft.size) {
      toast.error("Please select a size.");
      return;
    }

    if (isCustomSize(editDraft.size)) {
      if (editDraft.measurements.length === 0) {
        toast.error("Please add at least one measurement in cm.");
        return;
      }

      if (
        editDraft.measurements.some((measurement) => !measurement.value.trim())
      ) {
        toast.error("Please enter a value for every measurement.");
        return;
      }
    }

    if (options?.colors.length && !editDraft.color) {
      toast.error("Please select a color.");
      return;
    }

    if (editDraft.quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    const maxStock = Number(options?.stock ?? item.stock);
    const quantity =
      maxStock > 0
        ? Math.min(editDraft.quantity, maxStock)
        : editDraft.quantity;

    setSaving(true);
    try {
      await updateItem(item.id, {
        size: editDraft.size || null,
        color: editDraft.color || null,
        sizeMeasurements: isCustomSize(editDraft.size)
          ? editDraft.measurements
          : null,
        quantity,
        stock: maxStock,
      });
      toast.success("Item updated");
      cancelEdit();
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = () => {
    if (loading || syncing || items.length === 0) return;

    // if (!user) {
    //   router.push(`/login?redirect=${encodeURIComponent("/cart/checkout")}`);
    //   return;
    // }

    router.push("/cart/checkout");
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0,
  );

  return (
    <div className="min-h-full bg-white">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Your Cart</h1>

        <div className="mb-6 flex flex-wrap items-center gap-x-1">
          {PERKS.map((perk, index) => (
            <span key={perk} className="flex items-center">
              <span className="text-sm text-[#C9A96E]">{perk}</span>
              {index < PERKS.length - 1 && (
                <span className="mx-1.5 text-sm text-gray-300">•</span>
              )}
            </span>
          ))}
        </div>

        {isGuest && !loading && items.length > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#C9A96E]/20 bg-[#C9A96E]/10 px-4 py-3 text-sm text-[#7a5f30]">
            <Info size={16} className="shrink-0" />
            <span>
              You are browsing as a guest. This cart is saved on this device.{" "}
              <button
                type="button"
                onClick={() =>
                  router.push(`/login?redirect=${encodeURIComponent("/cart")}`)
                }
                className="font-semibold underline hover:text-[#A07840]"
              >
                Sign in
              </button>{" "}
              to save it to your account.
            </span>
          </div>
        )}

        {syncing && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Saving your guest cart to your account…
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const options = productOptions[item.product_id];
              const atStockLimit =
                item.stock > 0 && item.quantity >= item.stock;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm transition-colors hover:border-[#C9A96E]/30"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {item.name}
                      </h2>

                      {!isEditing && (
                        <>
                          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
                            {item.size && (
                              <p className="text-sm text-gray-500">
                                Size:{" "}
                                <span className="text-gray-700">
                                  {item.size}
                                </span>
                              </p>
                            )}

                            {item.color && (
                              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                                Color:
                                <span
                                  className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300"
                                  style={{
                                    backgroundColor: swatchColor(item.color),
                                  }}
                                />
                                <span className="capitalize text-gray-700">
                                  {item.color}
                                </span>
                              </p>
                            )}
                          </div>

                          {isCustomSize(item.size) &&
                            item.sizeMeasurements &&
                            item.sizeMeasurements.length > 0 && (
                              <p className="mt-1 text-xs text-gray-500">
                                Measurements:{" "}
                                {item.sizeMeasurements
                                  .map(
                                    (measurement) =>
                                      `${measurement.type}: ${measurement.value} cm`,
                                  )
                                  .join(", ")}
                              </p>
                            )}

                          <p className="mt-0.5 text-sm text-gray-500">
                            Price:{" "}
                            <span className="font-semibold text-gray-900">{formatBoth(item.price).primary}</span>
                            {formatBoth(item.price).secondary && (
                              <span className="ml-1 text-xs text-gray-400">({formatBoth(item.price).secondary})</span>
                            )}
                          </p>
                        </>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQty(item, -1)}
                          disabled={mutatingId === item.id || syncing}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:opacity-40"
                        >
                          <Minus size={13} />
                        </button>

                        <span className="w-5 text-center text-sm font-semibold text-gray-800">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQty(item, 1)}
                          disabled={
                            mutatingId === item.id || atStockLimit || syncing
                          }
                          aria-label={`Increase ${item.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:opacity-40"
                        >
                          <Plus size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          disabled={syncing}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:border-[#C9A96E] hover:text-[#A07840] disabled:opacity-40"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={mutatingId === item.id || syncing}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-400 transition-all hover:border-red-300 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                        {loadingOptions && !options ? (
                          <p className="text-xs text-gray-400">
                            Loading options…
                          </p>
                        ) : (
                          <>
                            {options?.sizes.length ? (
                              <div>
                                <p className="mb-2 text-xs font-medium text-gray-600">
                                  Size
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {options.sizes.map((size) => (
                                    <button
                                      type="button"
                                      key={size}
                                      onClick={() =>
                                        setEditDraft((current) =>
                                          current
                                            ? { ...current, size }
                                            : current,
                                        )
                                      }
                                      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                                        editDraft?.size === size
                                          ? "border-gray-900 bg-gray-900 text-white"
                                          : "border-gray-300 text-gray-700 hover:border-gray-900"
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {editDraft && isCustomSize(editDraft.size) && (
                              <div>
                                <p className="mb-2 text-xs font-medium text-gray-600">
                                  Custom Measurements{" "}
                                  <span className="text-red-500">*</span>
                                </p>
                                <CustomMeasurementFields
                                  measurements={editDraft.measurements}
                                  onChange={(measurements) =>
                                    setEditDraft((current) =>
                                      current
                                        ? { ...current, measurements }
                                        : current,
                                    )
                                  }
                                />
                              </div>
                            )}

                            {options?.colors.length ? (
                              <div>
                                <p className="mb-2 text-xs font-medium text-gray-600">
                                  Color
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {options.colors.map((color) => (
                                    <button
                                      type="button"
                                      key={color}
                                      onClick={() =>
                                        setEditDraft((current) =>
                                          current
                                            ? { ...current, color }
                                            : current,
                                        )
                                      }
                                      title={color}
                                      aria-label={`Select ${color}`}
                                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                                        editDraft?.color === color
                                          ? "scale-105 border-gray-900"
                                          : "border-gray-200 hover:border-gray-400"
                                      }`}
                                    >
                                      <span
                                        className="block h-full w-full rounded-full"
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
                              </div>
                            ) : null}

                            <div>
                              <p className="mb-2 text-xs font-medium text-gray-600">
                                Quantity
                              </p>
                              <div className="flex w-fit items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditDraft((current) =>
                                      current
                                        ? {
                                            ...current,
                                            quantity: Math.max(
                                              1,
                                              current.quantity - 1,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600"
                                >
                                  <Minus size={13} />
                                </button>

                                <span className="w-8 text-center text-sm font-semibold text-gray-800">
                                  {editDraft?.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditDraft((current) => {
                                      if (!current) return current;
                                      const stock = Number(
                                        options?.stock ?? item.stock,
                                      );
                                      return {
                                        ...current,
                                        quantity:
                                          stock > 0
                                            ? Math.min(
                                                stock,
                                                current.quantity + 1,
                                              )
                                            : current.quantity + 1,
                                      };
                                    })
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(item)}
                            disabled={saving}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                            style={{ background: "#C9A96E" }}
                          >
                            <Check size={13} />
                            {saving ? "Saving…" : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-60"
                          >
                            <X size={13} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 64 64"
                        className="h-10 w-10 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <rect x="8" y="8" width="48" height="48" rx="6" />
                        <circle cx="24" cy="24" r="5" />
                        <path d="M8 42l14-14 10 10 8-8 14 14" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-base font-semibold text-gray-900">
                Total: <span className="text-lg">{formatPrice(total)}</span>
              </p>

              <div className="flex items-center gap-3">
                <a
                  href="/products/all"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-center text-sm font-medium text-gray-600 transition-all hover:border-[#C9A96E] hover:text-[#A07840]"
                >
                  Continue Shopping
                </a>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={items.length === 0 || loading || syncing}
                  className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: "#C9A96E" }}
                >
                  {syncing ? "Saving Cart…" : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
