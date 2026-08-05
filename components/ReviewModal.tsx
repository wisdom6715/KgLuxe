// components/ReviewModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";
import { toast } from "sonner";
import { X, Star, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hook/useCurrentUser";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The product the user just purchased */
  product_id: string;
  productName: string;
  /** The order doc ID — used to guard against duplicate review submissions */
  order_id: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  product_id,
  productName,
  order_id,
}: ReviewModalProps) {
  const { user, loading: userLoading } = useCurrentUser();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [checking, setChecking] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);

  // Check if user already reviewed this order
  useEffect(() => {
    if (!isOpen || !user || !order_id) return;
    setChecking(true);

    getDocs(
      query(
        collection(db, "reviews"),
        where("order_id", "==", order_id),
        where("user_id", "==", user.uid)
      )
    )
      .then((snap) => setAlreadyReviewed(!snap.empty))
      .catch(console.error)
      .finally(() => setChecking(false));
  }, [isOpen, user, order_id]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHovered(0);
      setReview("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.displayName || "Anonymous"
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("You must be logged in to leave a review."); return; }
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    if (!review.trim()) { toast.error("Please write a review."); return; }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        product_id,
        order_id,
        user_id: user.uid,
        fullName,
        rating,
        review: review.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Thanks for your review!");
      onClose();
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error("Couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabel = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  const activeRating = hovered || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl text-gray-900">Leave a Review</h2>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{productName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {userLoading || checking ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 size={22} className="animate-spin text-gray-400" />
            </div>
          ) : alreadyReviewed ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">You've already reviewed this order.</p>
              <button onClick={onClose} className="mt-4 text-sm font-medium underline text-gray-700">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Reviewer name (read-only) */}
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 mb-1">REVIEWING AS</p>
                <p className="text-sm text-gray-800 font-medium">{fullName || "—"}</p>
              </div>

              {/* Star rating */}
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">RATING</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          star <= activeRating
                            ? "text-[#C9A96E] fill-[#C9A96E]"
                            : "text-gray-200 fill-gray-200 hover:text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {activeRating > 0 && (
                    <span className="ml-2 text-sm text-gray-500">{starLabel[activeRating]}</span>
                  )}
                </div>
              </div>

              {/* Review text */}
              <div>
                <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
                  YOUR REVIEW
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  maxLength={600}
                  placeholder="Tell others what you thought about this product…"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1 text-right">{review.length}/600</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-neutral-900 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}