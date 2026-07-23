"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db, auth } from "@/lib/firebase.config";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import CustomMeasurementFields, {
  type Measurement,
} from "@/components/CustomMeasurementFields";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  size: string | null;
  color: string | null;
  sizeMeasurements?: Measurement[] | null;
  quantity: number;
}

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

const PERKS = ["In-Store Pick Up", "Pay on Delivery", "Refer and Earn", "Warranty Covered"];
const formatPrice = (amount: number) => `$ ${amount}`;

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
    <div className="flex items-center justify-between gap-4 border border-gray-100 rounded-2xl bg-white shadow-sm px-6 py-5 animate-pulse">
      <div className="flex flex-col gap-3 flex-1">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-28 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-32 bg-gray-200 rounded mt-1" />
      </div>
      <div className="w-28 h-24 rounded-xl bg-gray-100 shrink-0" />
    </div>
  );
}

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const router = useRouter()

  // ── Edit state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [productOptions, setProductOptions] = useState<Record<string, ProductOptions>>({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch((err) => console.error("Anonymous sign-in failed:", err));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const cartRef = collection(db, "users", user.uid, "add-to-cart");

    const unsub = onSnapshot(cartRef, (snap) => {
      const rows: CartItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          product_id: data.product_id,
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl,
          stock: data.stock,
          size: data.size ?? null,
          color: data.color ?? null,
          sizeMeasurements: data.sizeMeasurements ?? null,
          quantity: data.quantity ?? 1,
        };
      });
      setItems(rows);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const updateQty = async (item: CartItem, delta: number) => {
    if (!user) return;
    const nextQty = item.quantity + delta;

    setMutatingId(item.id);
    try {
      if (nextQty <= 0) {
        await deleteDoc(doc(db, "users", user.uid, "add-to-cart", item.id));
        toast.success('Item removed from cart');
      } else {
        await updateDoc(doc(db, "users", user.uid, "add-to-cart", item.id), {
          quantity: Math.min(nextQty, item.stock || Infinity),
        });
        toast.success('Quantity updated');
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
      toast.error('Failed to update quantity');
    } finally {
      setMutatingId(null);
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    setMutatingId(id);
    try {
      await deleteDoc(doc(db, "users", user.uid, "add-to-cart", id));
      toast.success('Item removed from cart');
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setMutatingId(null);
    }
  };

  // ── Edit handlers ──

  const startEdit = async (item: CartItem) => {
    setEditingId(item.id);
    setEditDraft({
      size: item.size ?? "",
      color: item.color ?? "",
      quantity: item.quantity,
      measurements: item.sizeMeasurements ?? [],
    });

    if (!productOptions[item.product_id]) {
      setLoadingOptions(true);
      try {
        const snap = await getDoc(doc(db, "products", item.product_id));
        if (snap.exists()) {
          const data = snap.data();
          setProductOptions((prev) => ({
            ...prev,
            [item.product_id]: {
              sizes: data.sizes ?? [],
              colors: data.colors ?? [],
              stock: data.stock ?? item.stock,
            },
          }));
        }
      } catch (err) {
        console.error("Failed to load product options:", err);
        toast.error("Couldn't load size/color options for this item.");
      } finally {
        setLoadingOptions(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async (item: CartItem) => {
    if (!user || !editDraft) return;
    const options = productOptions[item.product_id];

    if (options?.sizes?.length && !editDraft.size) {
      toast.error("Please select a size.");
      return;
    }
    if (isCustomSize(editDraft.size)) {
      if (editDraft.measurements.length === 0) {
        toast.error("Please add at least one measurement (in cm).");
        return;
      }
      const hasEmpty = editDraft.measurements.some((m) => !m.value.trim());
      if (hasEmpty) {
        toast.error("Please enter a value for each measurement you've added.");
        return;
      }
    }
    if (options?.colors?.length && !editDraft.color) {
      toast.error("Please select a color.");
      return;
    }
    if (editDraft.quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    const maxStock = options?.stock ?? item.stock;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid, "add-to-cart", item.id), {
        size: editDraft.size || null,
        color: editDraft.color || null,
        sizeMeasurements: isCustomSize(editDraft.size) ? editDraft.measurements : null,
        quantity: Math.min(editDraft.quantity, maxStock || editDraft.quantity),
      });
      toast.success("Item updated");
      setEditingId(null);
      setEditDraft(null);
    } catch (err) {
      console.error("Failed to update item:", err);
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="h-full bg-white">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart</h1>

        <div className="flex flex-wrap items-center gap-x-1 mb-8">
          {PERKS.map((perk, i) => (
            <span key={perk} className="flex items-center">
              <a href="#" className="text-sm text-[#C9A96E] hover:text-[#A07840] transition-colors">
                {perk}
              </a>
              {i < PERKS.length - 1 && <span className="mx-1.5 text-gray-300 text-sm">•</span>}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-gray-100 rounded-2xl bg-cream-50">
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#C9A96E]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
            <a href="/" className="text-sm font-semibold text-[#C9A96E] hover:underline">
              Browse products →
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const options = productOptions[item.product_id];

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border border-gray-100 rounded-2xl bg-white shadow-sm px-6 py-5 hover:border-[#C9A96E]/30 transition-colors"
                >
                  <div className="flex flex-col gap-3 min-w-0 flex-1">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>

                      {!isEditing && (
                        <>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                            {item.size && (
                              <p className="text-sm text-gray-500">
                                Size: <span className="text-gray-700">{item.size}</span>
                              </p>
                            )}
                            {item.color && (
                              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                Color:
                                <span
                                  className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300"
                                  style={{ backgroundColor: swatchColor(item.color) }}
                                />
                                <span className="text-gray-700 capitalize">{item.color}</span>
                              </p>
                            )}
                          </div>
                          {isCustomSize(item.size) && item.sizeMeasurements && item.sizeMeasurements.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Measurements:{" "}
                              {item.sizeMeasurements
                                .map((m) => `${m.type}: ${m.value} cm`)
                                .join(", ")}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-0.5">
                            Price: <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                          </p>
                        </>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => updateQty(item, -1)}
                          disabled={mutatingId === item.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all disabled:opacity-40"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item, 1)}
                          disabled={mutatingId === item.id || item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all disabled:opacity-40"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:border-[#C9A96E] hover:text-[#A07840] transition-all"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={mutatingId === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-400 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-40"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                        {loadingOptions && !options ? (
                          <p className="text-xs text-gray-400">Loading options…</p>
                        ) : (
                          <>
                            {/* SIZE */}
                            {options?.sizes && options.sizes.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-2">Size</p>
                                <div className="flex flex-wrap gap-2">
                                  {options.sizes.map((size) => (
                                    <button
                                      key={size}
                                      onClick={() =>
                                        setEditDraft((prev) => (prev ? { ...prev, size } : prev))
                                      }
                                      className={`border rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                        editDraft?.size === size
                                          ? "bg-gray-900 text-white border-gray-900"
                                          : "border-gray-300 text-gray-700 hover:border-gray-900"
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* CUSTOM SIZE MEASUREMENTS */}
                            {editDraft && isCustomSize(editDraft.size) && (
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-2">
                                  Custom Measurements <span className="text-red-500">*</span>
                                </p>
                                <CustomMeasurementFields
                                  measurements={editDraft.measurements}
                                  onChange={(measurements) =>
                                    setEditDraft((prev) => (prev ? { ...prev, measurements } : prev))
                                  }
                                />
                              </div>
                            )}

                            {/* COLOR */}
                            {options?.colors && options.colors.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-2">Color</p>
                                <div className="flex flex-wrap gap-2">
                                  {options.colors.map((color) => (
                                    <button
                                      key={color}
                                      onClick={() =>
                                        setEditDraft((prev) => (prev ? { ...prev, color } : prev))
                                      }
                                      title={color}
                                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        editDraft?.color === color
                                          ? "border-gray-900 scale-105"
                                          : "border-gray-200 hover:border-gray-400"
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
                              </div>
                            )}

                            {/* QUANTITY */}
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-2">Quantity</p>
                              <div className="flex items-center gap-3 w-fit">
                                <button
                                  onClick={() =>
                                    setEditDraft((prev) =>
                                      prev ? { ...prev, quantity: Math.max(1, prev.quantity - 1) } : prev
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-800">
                                  {editDraft?.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    setEditDraft((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            quantity: Math.min(
                                              options?.stock ?? item.stock,
                                              prev.quantity + 1
                                            ),
                                          }
                                        : prev
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {/* SAVE / CANCEL */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => saveEdit(item)}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-60"
                            style={{ background: "#C9A96E" }}
                          >
                            <Check size={13} />
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-100 disabled:opacity-60"
                          >
                            <X size={13} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 64 64" className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
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
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-base font-semibold text-gray-900">
              Total: <span className="text-lg">{formatPrice(total)}</span>
            </p>
            <div className="flex items-center gap-3">
              <a
                href="/products/all"
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:border-[#C9A96E] hover:text-[#A07840] transition-all text-center"
              >
                Continue Shopping
              </a>
              <button
                onClick={() => router.push("/cart/checkout")}
                disabled={items.length === 0}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#C9A96E" }}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}