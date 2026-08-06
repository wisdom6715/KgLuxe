// components/admin/DiscountModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { X, Loader2, Tag, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase.config";
import { DISCOUNT_DOC_ID, type Discount } from "@/lib/discount";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  existing: Discount | null; // pass current discount to prefill
}

const today = () => new Date().toISOString().split("T")[0];

export default function DiscountModal({
  isOpen,
  onClose,
  existing,
}: DiscountModalProps) {
  const [percentage, setPercentage] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setError("");
      return;
    }
    if (existing) {
      setPercentage(String(existing.percentage));
      setStartDate(existing.startDate);
      setEndDate(existing.endDate);
    } else {
      setPercentage("");
      setStartDate(today());
      setEndDate("");
    }
  }, [isOpen, existing]);

  if (!isOpen) return null;

  const validate = () => {
    const pct = Number(percentage);
    if (!percentage || isNaN(pct) || pct <= 0 || pct > 100)
      return "Enter a discount between 1% and 100%.";
    if (!startDate) return "Start date is required.";
    if (!endDate) return "End date is required.";
    if (new Date(endDate) < new Date(startDate))
      return "End date must be on or after start date.";
    return "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setSubmitting(true);
    try {
      await setDoc(doc(db, "discounts", DISCOUNT_DOC_ID), {
        percentage: Number(percentage),
        startDate,
        endDate,
        active: true,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`${percentage}% discount saved`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save discount. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!existing) return;
    const confirmed = window.confirm("Remove the active discount?");
    if (!confirmed) return;
    setRemoving(true);
    try {
      await deleteDoc(doc(db, "discounts", DISCOUNT_DOC_ID));
      toast.success("Discount removed");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Couldn't remove discount.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag size={17} className="text-[#C9A96E]" />
            <h2 className="font-serif text-xl text-gray-900">
              {existing ? "Edit Discount" : "Create Discount"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Percentage */}
          <div>
            <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
              DISCOUNT (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                %
              </span>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
                START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
                END DATE
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 -mt-1">
            The discount applies to all products during this date range and
            affects all prices site-wide.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            {existing ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                {removing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Remove
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-black hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Saving…" : existing ? "Update" : "Activate"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}