// components/AddReviewForm.tsx
"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase.config";
import { toast } from "sonner";
import { useCurrentUser } from "@/hook/useCurrentUser";

/** The shape handed back to the parent the moment a review is posted.
 *  This form never renders it — the parent decides where/how to show it. */
export interface PostedReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: Date;
}

interface AddReviewFormProps {
  productId: string;
  productName: string;
  onSubmitted?: (review: PostedReview) => void;
}

function getInitials(first?: string, last?: string, fallback?: string) {
  const f = first?.trim()?.[0];
  const l = last?.trim()?.[0];
  if (f && l) return (f + l).toUpperCase();
  if (fallback) {
    const parts = fallback.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

function getRatingColor(value: number) {
  if (value <= 1) return "#171717";
  if (value <= 3) return "#f97316";
  return "#C9A227";
}

// Exported so the parent can render the same star visuals for the
// "just posted" card without duplicating this markup.
export function StarRow({
  value,
  size = 22,
  interactive = false,
  hoverValue,
  onHover,
  onLeave,
  onPick,
}: {
  value: number;
  size?: number;
  interactive?: boolean;
  hoverValue?: number;
  onHover?: (n: number) => void;
  onLeave?: () => void;
  onPick?: (n: number) => void;
}) {
  const active = hoverValue || value;
  const color = getRatingColor(active);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = active >= n;
        const star = (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={filled ? color : "#a3a3a3"} strokeWidth={1.5}>
            <path d="M12 2.5l2.9 6.16 6.6.72-4.9 4.62 1.28 6.5L12 17.3l-5.88 3.2 1.28-6.5-4.9-4.62 6.6-.72L12 2.5z" strokeLinejoin="round" />
          </svg>
        );
        if (!interactive) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onPick?.(n)}
            onMouseEnter={() => onHover?.(n)}
            onMouseLeave={() => onLeave?.()}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}

export default function AddReviewForm({
  productId,
  productName,
  onSubmitted,
}: AddReviewFormProps) {
  const { user, loading: authLoading } = useCurrentUser();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // We still check once whether this user already reviewed this product —
  // but only to stop a second submission, never to render the review itself.
  const [checkingReviewed, setCheckingReviewed] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!cancelled && snap.exists()) {
          const data = snap.data();
          setProfile({ firstName: data.firstName, lastName: data.lastName });
        }
      } catch (err) {
        console.error("Failed to fetch reviewer profile:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      setHasReviewed(false);
      setCheckingReviewed(false);
      return;
    }
    let cancelled = false;
    setCheckingReviewed(true);
    (async () => {
      try {
        const q = query(
          collection(db, "reviews"),
          where("productId", "==", productId),
          where("reviewerUid", "==", user.uid),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!cancelled) setHasReviewed(!snap.empty);
      } catch (err) {
        console.error("Failed to check existing review:", err);
      } finally {
        if (!cancelled) setCheckingReviewed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, user?.uid, authLoading]);

  const fullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    user?.displayName ||
    "Anonymous";
  const initials = getInitials(profile?.firstName, profile?.lastName, user?.displayName ?? undefined);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!user?.uid) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    if (hasReviewed) {
      toast.error("You've already reviewed this product.");
      return;
    }
    try {
      setSubmitting(true);
      const trimmedComment = comment.trim();
      const docRef = await addDoc(collection(db, "reviews"), {
        productId,
        productName,
        orderId: orderId || null,
        reviewerUid: user.uid,
        reviewerName: fullName,
        rating,
        comment: trimmedComment,
        createdAt: serverTimestamp(),
      });

      setHasReviewed(true);
      setJustSubmitted(true);

      // Hand the posted review straight to the parent — this component
      // is done with it. The parent decides where it shows up.
      onSubmitted?.({
        id: docRef.id,
        rating,
        comment: trimmedComment,
        reviewerName: fullName,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error("Couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingReviewed) {
    return <div className="border border-neutral-200 rounded-lg px-5 py-6 mb-8 h-[140px] animate-pulse bg-neutral-50" />;
  }

  if (hasReviewed) {
    return (
      <div className="border border-neutral-200 rounded-lg px-5 py-5 mb-8 text-center">
        <p className="text-sm text-neutral-600">
          {justSubmitted
            ? "Thanks — your review has been posted below."
            : "You've already reviewed this product."}
        </p>
      </div>
    );
  }

  if (!authLoading && !user) {
    return (
      <div className="border border-neutral-200 rounded-lg px-5 py-6 mb-8 text-center">
        <p className="text-sm text-neutral-600">
          Sign in to your account to leave a review for this product.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 rounded-lg px-5 py-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-9 h-9 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {authLoading ? "…" : initials}
        </span>
        <div>
          <p className="text-sm font-medium text-neutral-900">{authLoading ? "Loading…" : fullName}</p>
          <p className="text-xs text-neutral-500">Reviewing {productName}</p>
        </div>
      </div>

      <p className="text-xs tracking-[0.15em] uppercase font-medium mb-2">Your rating</p>
      <div className="mb-4">
        <StarRow
          value={rating}
          interactive
          hoverValue={hoverRating}
          onHover={setHoverRating}
          onLeave={() => setHoverRating(0)}
          onPick={setRating}
        />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share a few words about this product (optional)"
        rows={3}
        className="w-full border border-neutral-200 rounded-lg px-3.5 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 shadow-sm bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors resize-none mb-4"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-neutral-900 text-white text-xs tracking-[0.15em] uppercase py-3 px-6 hover:bg-neutral-700 transition-colors disabled:opacity-60"
      >
        {submitting ? "Posting…" : "Post review"}
      </button>
    </div>
  );
}