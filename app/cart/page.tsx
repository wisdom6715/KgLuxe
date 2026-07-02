"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db, auth } from "@/lib/firebase.config";
import { toast } from "sonner"

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  size: string | null;
  color: string | null;
  quantity: number;
}

const PERKS = ["In-Store Pick Up", "Pay on Delivery", "Refer and Earn", "Warranty Covered"];
const formatPrice = (amount: number) => `$ ${amount}`;

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
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border border-gray-100 rounded-2xl bg-white shadow-sm px-6 py-5 hover:border-[#C9A96E]/30 transition-colors"
              >
                <div className="flex flex-col gap-3 min-w-0 flex-1">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>
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
                            style={{ backgroundColor: item.color.toLowerCase() }}
                          />
                          <span className="text-gray-700 capitalize">{item.color}</span>
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Price: <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
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
                      onClick={() => removeItem(item.id)}
                      disabled={mutatingId === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-400 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
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
            ))}
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
                disabled={items.length === 0}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: items.length === 0 ? "#C9A96E" : "#C9A96E",
                }}
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