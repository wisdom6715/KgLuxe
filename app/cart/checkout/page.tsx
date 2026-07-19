"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { MapPin, Phone, CheckCircle2, Loader2, Plus, Pencil, Star, X, Check } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase.config";
import { useCurrentUser } from "@/hook/useCurrentUser";
import useCheckoutPayment from "@/hook/useFlutterwave";
import type { Address, CheckoutItem } from "@/types/checkout";

const formatPrice = (amount: number) => `$ ${amount}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // ── Inline address form state (mirrors AddressesPage exactly) ──────────
  const [addingAddr, setAddingAddr] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrDraft, setAddrDraft] = useState<Partial<Address>>({});
  const [savingAddr, setSavingAddr] = useState(false);

  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);

  // Fetch cart items
  useEffect(() => {
    if (!user) return;
    const cartRef = collection(db, "users", user.uid, "add-to-cart");
    const unsub = onSnapshot(cartRef, (snap) => {
      const rows: CheckoutItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          product_id: data.product_id,
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl,
          size: data.size ?? null,
          color: data.color ?? null,
          quantity: data.quantity ?? 1,
        };
      });
      setItems(rows);
      setItemsLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Fetch addresses
  useEffect(() => {
    if (!user) return;
    const addrRef = collection(db, "users", user.uid, "address");
    const unsub = onSnapshot(addrRef, (snap) => {
      const rows: Address[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          label: data.label ?? "",
          phone_number: data.phone_number ?? "",
          street: data.street ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zip: data.zip ?? "",
          country: data.country ?? "",
          isDefault: !!data.isDefault,
        };
      });
      setAddresses(rows);
      const def = rows.find((a) => a.isDefault) ?? rows[0];
      setSelectedAddressId((prev) => prev ?? def?.id ?? null);
      setAddressesLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Prefill phone from profile or selected address
  useEffect(() => {
    if (phone) return;
    const selected = addresses.find((a) => a.id === selectedAddressId);
    if (selected?.phone_number) setPhone(selected.phone_number);
    else if (user?.phone) setPhone(user.dialCode ? `+${user.dialCode}${user.phone}` : user.phone);
  }, [selectedAddressId, addresses, user, phone]);

  // ── Address CRUD — identical logic to AddressesPage ─────────────────────
  const startAddAddr = () => {
    setAddrDraft({ label: "", phone_number: "", street: "", city: "", state: "", zip: "", country: "Nigeria", isDefault: addresses.length === 0 });
    setAddingAddr(true);
    setEditingAddrId(null);
  };

  const startEditAddr = (addr: Address) => {
    setAddrDraft({ ...addr });
    setEditingAddrId(addr.id);
    setAddingAddr(false);
  };

  const cancelAddrForm = () => {
    setAddingAddr(false);
    setEditingAddrId(null);
    setAddrDraft({});
  };

  const saveAddAddr = async () => {
    if (!user) {
      toast.error("Please wait a moment and try again.");
      return;
    }
    setSavingAddr(true);
    try {
      const addrRef = collection(db, "users", user.uid, "address");

      if (addrDraft.isDefault) {
        const batch = writeBatch(db);
        addresses
          .filter((a) => a.isDefault)
          .forEach((a) => batch.update(doc(addrRef, a.id), { isDefault: false }));
        await batch.commit();
      }

      const newDoc = await addDoc(addrRef, {
        userId: user.uid,
        label: addrDraft.label || "Address",
        phone_number: addrDraft.phone_number || "",
        street: addrDraft.street || "",
        city: addrDraft.city || "",
        state: addrDraft.state || "",
        zip: addrDraft.zip || "",
        country: addrDraft.country || "",
        isDefault: addrDraft.isDefault || false,
        createdAt: serverTimestamp(),
      });

      toast.success("Address added");
      setAddingAddr(false);
      setAddrDraft({});
      // Immediately select the newly created address for this order
      setSelectedAddressId(newDoc.id);
    } catch (err) {
      console.error("Failed to add address:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSavingAddr(false);
    }
  };

  const saveEditAddr = async () => {
    if (!user || !editingAddrId) return;
    setSavingAddr(true);
    try {
      const addrRef = collection(db, "users", user.uid, "address");

      if (addrDraft.isDefault) {
        const batch = writeBatch(db);
        addresses
          .filter((a) => a.isDefault && a.id !== editingAddrId)
          .forEach((a) => batch.update(doc(addrRef, a.id), { isDefault: false }));
        await batch.commit();
      }

      await updateDoc(doc(addrRef, editingAddrId), {
        userId: user.uid,
        label: addrDraft.label ?? "",
        phone_number: addrDraft.phone_number ?? "",
        street: addrDraft.street ?? "",
        city: addrDraft.city ?? "",
        state: addrDraft.state ?? "",
        zip: addrDraft.zip ?? "",
        country: addrDraft.country ?? "",
        isDefault: addrDraft.isDefault ?? false,
        updatedAt: serverTimestamp(),
      });

      toast.success("Address updated");
      setEditingAddrId(null);
      setAddrDraft({});
    } catch (err) {
      console.error("Failed to update address:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSavingAddr(false);
    }
  };

  const setDefaultAddr = async (id: string) => {
    if (!user) return;
    try {
      const addrRef = collection(db, "users", user.uid, "address");
      const batch = writeBatch(db);
      addresses.forEach((a) => batch.update(doc(addrRef, a.id), { isDefault: a.id === id }));
      await batch.commit();
    } catch (err) {
      console.error("Failed to set default address:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Same inline form UI as AddressesPage, reused here
  const AddressForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-white rounded-xl border border-[#C9A96E]/30 shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-4">{addingAddr ? "Add New Address" : "Edit Address"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ["Label", "label", "e.g. Home, Office"],
          ["Phone Number", "phone_number", "+234"],
          ["Street Address", "street", "123 Main Street"],
          ["City", "city", "Lagos"],
          ["State", "state", "Lagos State"],
          ["ZIP Code", "zip", "100001"],
          ["Country", "country", "Nigeria"],
        ].map(([label, key, placeholder]) => (
          <div key={key} className={key === "street" ? "sm:col-span-2" : ""}>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</label>
            <input
              type="text"
              value={(addrDraft as Record<string, string>)[key] || ""}
              onChange={(e) => setAddrDraft((d) => ({ ...d, [key]: e.target.value }))}
              placeholder={placeholder}
              disabled={savingAddr}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all disabled:opacity-60"
            />
          </div>
        ))}
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefaultCheckout"
            checked={!!addrDraft.isDefault}
            onChange={(e) => setAddrDraft((d) => ({ ...d, isDefault: e.target.checked }))}
            disabled={savingAddr}
            className="accent-[#C9A96E]"
          />
          <label htmlFor="isDefaultCheckout" className="text-sm text-gray-600">Set as default address</label>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          disabled={savingAddr}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#C9A96E] text-white hover:bg-[#A07840] transition-colors disabled:opacity-60"
        >
          {savingAddr ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Save Address
        </button>
        <button
          onClick={onCancel}
          disabled={savingAddr}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const canPay = !!selectedAddress && phone.trim().length >= 7 && items.length > 0 && !paying;

  const txRef = useMemo(
    () => (user ? `ORDER_${user.uid.slice(0, 6)}_${Date.now()}` : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.uid]
  );

  const { handleFlutterPayment, scriptReady } = useCheckoutPayment({
    amount: total,
    email: user?.email ?? "",
    phone,
    name: user?.displayName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Customer",
    txRef,
  });

  const confirmOrder = async (transactionId: number | string) => {
    if (!user || !selectedAddress) return;
    setPaying(true);
    try {
      const res = await fetch("/api/order/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          items: items.map((i) => ({
            product: i.name,
            product_id: i.product_id,
            price: i.price,
            quantity: i.quantity,
            color: i.color,
            size: i.size,
            cartItemId: i.id, // the Firestore cart doc id, so the route can delete exactly this item
          })),
          address: selectedAddress,
          phone,
          amount: total,
          txRef,
          transactionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not confirm your order.");
        return;
      }

      setOrderPlaced(data.orderId);
      toast.success("Order confirmed! A receipt is on its way to your email.");
    } catch (err) {
      console.error("Order confirmation failed:", err);
      toast.error("Payment succeeded but confirming the order failed. Contact support.");
    } finally {
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (!canPay) {
      toast.error("Please add a delivery address and phone number first.");
      return;
    }
    if (!scriptReady) {
      toast.error("Payment is still initializing — please try again in a second.");
      return;
    }
    handleFlutterPayment({
      callback: async (response) => {
        if (response.status === "successful") {
          await confirmOrder(response.transaction_id);
        } else {
          toast.error("Payment was not completed.");
        }
      },
      onClose: () => {},
    });
  };

  // ── Order success state ──────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="h-full bg-white">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#C9A96E]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order confirmed!</h1>
          <p className="text-gray-500 text-sm">
            We've emailed your receipt. Order ID: <span className="font-mono text-gray-700">{orderPlaced}</span>
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C9A96E] hover:bg-[#A07840] transition-all"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const loading = userLoading || itemsLoading || addressesLoading;

  return (
    <div className="h-full bg-white">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2 text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading checkout…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-gray-100 rounded-2xl">
            <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
            <a href="/" className="text-sm font-semibold text-[#C9A96E] hover:underline">
              Browse products →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: items + address + phone */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Items */}
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border border-gray-100 rounded-2xl bg-white shadow-sm px-6 py-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                          {item.size || item.color ? " · " : ""}Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Address — fully inline, no route-outs */}
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin size={15} className="text-[#C9A96E]" /> Delivery Address
                  </h2>
                  {!addingAddr && !editingAddrId && (
                    <button
                      onClick={startAddAddr}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#C9A96E] hover:underline"
                    >
                      <Plus size={13} /> Add New Address
                    </button>
                  )}
                </div>

                {(addingAddr || editingAddrId) && (
                  <div className="mb-4">
                    <AddressForm
                      onSave={addingAddr ? saveAddAddr : saveEditAddr}
                      onCancel={cancelAddrForm}
                    />
                  </div>
                )}

                {addresses.length === 0 && !addingAddr ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-2">You need an address to check out.</p>
                    <button
                      onClick={startAddAddr}
                      className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-[#C9A96E] text-white hover:bg-[#A07840] transition-colors"
                    >
                      Add an address
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {addresses.map((addr) =>
                      editingAddrId === addr.id ? null : (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? "border-[#C9A96E] bg-[#C9A96E]/5"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            className="mt-1 accent-[#C9A96E]"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                          />
                          <div className="text-sm flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="font-semibold text-gray-800">
                                {addr.label} {addr.isDefault && <span className="text-xs text-[#A07840]">(Default)</span>}
                              </p>
                              <div className="flex items-center gap-1">
                                {!addr.isDefault && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setDefaultAddr(addr.id); }}
                                    title="Set as default"
                                    className="p-1 rounded-md text-gray-400 hover:text-[#C9A96E] hover:bg-cream-100 transition-all"
                                  >
                                    <Star size={13} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); startEditAddr(addr); }}
                                  className="p-1 rounded-md text-gray-400 hover:text-[#C9A96E] hover:bg-cream-100 transition-all"
                                >
                                  <Pencil size={13} />
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-500 mt-0.5">
                              {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                            </p>
                          </div>
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <Phone size={15} className="text-[#C9A96E]" /> Contact Phone Number
                </h2>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">Used for delivery updates and payment confirmation.</p>
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:col-span-1">
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 sticky top-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-medium text-gray-800">Calculated at delivery</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between mb-6">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                </div>

                <button
                  onClick={handlePay}
                  disabled={!canPay}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#C9A96E] hover:bg-[#A07840] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? <Loader2 size={15} className="animate-spin" /> : null}
                  {paying ? "Confirming order…" : "Pay Now"}
                </button>
                {!selectedAddress && (
                  <p className="text-xs text-red-400 mt-2 text-center">Add a delivery address to continue</p>
                )}
                {selectedAddress && phone.trim().length < 7 && (
                  <p className="text-xs text-red-400 mt-2 text-center">Enter a valid phone number to continue</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}