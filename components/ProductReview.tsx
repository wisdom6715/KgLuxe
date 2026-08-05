// components/ProductReviews.tsx
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";
import { Star } from "lucide-react";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  fullName: string;
  rating: number;
  review: string;
  createdAt: any;
}

interface ProductReviewsProps {
  product_id: string;
}

const PAGE_SIZE = 5;

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "text-[#C9A96E] fill-[#C9A96E]" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

function formatDate(ts: any): string {
  if (!ts) return "";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProductReviews({ product_id }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Initial load
  useEffect(() => {
    if (!product_id) return;
    setLoading(true);
    setReviews([]);
    setLastDoc(null);

    const q = query(
      collection(db, "reviews"),
      where("product_id", "==", product_id),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    getDocs(q)
      .then((snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
        setReviews(items);
        setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
        setHasMore(snap.docs.length === PAGE_SIZE);

        if (items.length > 0) {
          const sum = items.reduce((acc, r) => acc + r.rating, 0);
          setAvgRating(sum / items.length);
          setTotalCount(items.length);
        }
      })
      .catch((err) => console.error("Failed to load reviews:", err))
      .finally(() => setLoading(false));
  }, [product_id]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);

    const q = query(
      collection(db, "reviews"),
      where("product_id", "==", product_id),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    try {
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
      setReviews((prev) => [...prev, ...items]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setTotalCount((prev) => prev + items.length);
    } catch (err) {
      console.error("Failed to load more reviews:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-12 border-t border-neutral-200 pt-10">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-neutral-200 pt-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-serif text-2xl text-neutral-900 mb-1">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="text-sm text-neutral-500">
                {avgRating.toFixed(1)} · {totalCount} {totalCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {reviews.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-neutral-400">No reviews yet. Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold tracking-wide">
                {initials(r.fullName)}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-neutral-900">{r.fullName}</span>
                  <span className="text-xs text-neutral-400">{formatDate(r.createdAt)}</span>
                </div>
                <StarDisplay rating={r.rating} />
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{r.review}</p>
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 border border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-900 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Show more reviews"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}