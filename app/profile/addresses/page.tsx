"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { MapPin, Plus, Pencil, Trash2, Star, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase.config";
import { useCurrentUser } from "@/hook/useCurrentUser";
import { Address } from "../types";

export default function AddressesPage() {
  const { user } = useCurrentUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Address>>({});

  useEffect(() => {
    if (!user) return;

    const addrRef = collection(db, "users", user.uid, "address");
    const unsub = onSnapshot(
      addrRef,
      (snap) => {
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
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load addresses:", err);
        toast.error("Failed to load addresses.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const startAdd = () => {
    setDraft({ label: "", phone_number: "", street: "", city: "", state: "", zip: "", country: "Nigeria", isDefault: false });
    setAdding(true);
    setEditingId(null);
  };

  const startEdit = (addr: Address) => {
    setDraft({ ...addr });
    setEditingId(addr.id);
    setAdding(false);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditingId(null);
    setDraft({});
  };

  const saveAdd = async () => {
    if (!user) {
      toast.error("Please wait a moment and try again.");
      return;
    }

    setSaving(true);
    try {
      const addrRef = collection(db, "users", user.uid, "address");

      // If this is set as default, unset any existing default first
      if (draft.isDefault) {
        const batch = writeBatch(db);
        addresses
          .filter((a) => a.isDefault)
          .forEach((a) => batch.update(doc(addrRef, a.id), { isDefault: false }));
        await batch.commit();
      }

      await addDoc(addrRef, {
        userId: user.uid,
        label: draft.label || "Address",
        phone_number: draft.phone_number || "",
        street: draft.street || "",
        city: draft.city || "",
        state: draft.state || "",
        zip: draft.zip || "",
        country: draft.country || "",
        isDefault: draft.isDefault || false,
        createdAt: serverTimestamp(),
      });

      toast.success("Address added");
      setAdding(false);
      setDraft({});
    } catch (err) {
      console.error("Failed to add address:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!user || !editingId) return;

    setSaving(true);
    try {
      const addrRef = collection(db, "users", user.uid, "address");

      if (draft.isDefault) {
        const batch = writeBatch(db);
        addresses
          .filter((a) => a.isDefault && a.id !== editingId)
          .forEach((a) => batch.update(doc(addrRef, a.id), { isDefault: false }));
        await batch.commit();
      }

      await updateDoc(doc(addrRef, editingId), {
        userId: user.uid,
        label: draft.label ?? "",
        phone_number: draft.phone_number ?? "",
        street: draft.street ?? "",
        city: draft.city ?? "",
        state: draft.state ?? "",
        zip: draft.zip ?? "",
        country: draft.country ?? "",
        isDefault: draft.isDefault ?? false,
        updatedAt: serverTimestamp(),
      });

      toast.success("Address updated");
      setEditingId(null);
      setDraft({});
    } catch (err) {
      console.error("Failed to update address:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddr = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "address", id));
      toast.success("Address removed");
    } catch (err) {
      console.error("Failed to delete address:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    try {
      const addrRef = collection(db, "users", user.uid, "address");
      const batch = writeBatch(db);
      addresses.forEach((a) =>
        batch.update(doc(addrRef, a.id), { isDefault: a.id === id })
      );
      await batch.commit();
    } catch (err) {
      console.error("Failed to set default address:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const AddressForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-white rounded-xl border border-[#C9A96E]/30 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{adding ? "Add New Address" : "Edit Address"}</h3>
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
              value={(draft as Record<string, string>)[key] || ""}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              placeholder={placeholder}
              disabled={saving}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all disabled:opacity-60"
            />
          </div>
        ))}
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={!!draft.isDefault}
            onChange={(e) => setDraft((d) => ({ ...d, isDefault: e.target.checked }))}
            disabled={saving}
            className="accent-[#C9A96E]"
          />
          <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default address</label>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#C9A96E] text-white hover:bg-[#A07840] transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Save Address
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-800">Addresses</h1>
        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C9A96E] text-white hover:bg-[#A07840] transition-colors whitespace-nowrap">
          <Plus size={14} /> Add New Address
        </button>
      </div>

      {adding && <AddressForm onSave={saveAdd} onCancel={cancelForm} />}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          Loading addresses…
        </div>
      ) : addresses.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center">
            <MapPin size={28} className="text-[#C9A96E]" strokeWidth={1.5} />
          </div>
          <p className="text-gray-500 text-sm">No saved addresses yet</p>
          <button onClick={startAdd} className="text-sm font-medium text-[#C9A96E] hover:underline">Add your first address →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((addr) => (
            editingId === addr.id ? (
              <AddressForm key={addr.id} onSave={saveEdit} onCancel={cancelForm} />
            ) : (
              <div key={addr.id} className={`bg-white rounded-xl border shadow-sm p-5 ${addr.isDefault ? "border-[#C9A96E]/40" : "border-gray-100"}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center">
                      <MapPin size={14} className="text-[#C9A96E]" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#C9A96E]/15 text-[#A07840] font-medium">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!addr.isDefault && (
                      <button onClick={() => setDefault(addr.id)} title="Set as default" className="p-1.5 rounded-lg text-gray-400 hover:text-[#C9A96E] hover:bg-cream-100 transition-all">
                        <Star size={14} />
                      </button>
                    )}
                    <button onClick={() => startEdit(addr)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#C9A96E] hover:bg-cream-100 transition-all">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteAddr(addr.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600 leading-relaxed pl-10">
                  <p>{addr.phone_number}</p>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zip}</p>
                  <p>{addr.country}</p>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}