"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Mail,
  Star,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// ---------- Types ----------

interface OrderItem {
  cartItemId: string;
  color: string | null;
  price: number;
  product: string;
  product_id: string;
  quantity: number;
  size: string | null;
  // Not all of these will exist on every order — resolved defensively, see getItemImage.
  image?: string;
  imageUrl?: string;
  photoURL?: string;
}

interface Order {
  docId: string;
  amount: number;
  createdAt: Date | null;
  items: OrderItem[];
  status: string;
  tx_ref: string;
  user_id: string;
  username: string;
  email: string | null;
  reviewRequestedAt: Date | null;
  reviewSubmittedAt: Date | null;
}

interface ReviewDoc {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: Date | null;
}

type ReviewFilter = "all" | "not_requested" | "requested" | "reviewed";

const PAGE_SIZE = 5;

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (value instanceof Date) return value;
  return null;
}

function getInitials(name: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Same defensive lookup used when building order-confirmation emails —
// order items don't consistently carry the same image field name.
function getItemImage(item: OrderItem): string | null {
  return item.imageUrl ?? item.image ?? item.photoURL ?? null;
}

const AVATAR_COLORS = [
  "bg-stone-200 text-stone-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-700",
];

function avatarColorFor(seed: string) {
  const idx = (seed || "?").charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function reviewStatus(order: Order): "reviewed" | "requested" | "not_requested" {
  if (order.reviewSubmittedAt) return "reviewed";
  if (order.reviewRequestedAt) return "requested";
  return "not_requested";
}

function ReviewStatusBadge({ order }: { order: Order }) {
  const status = reviewStatus(order);
  const config = {
    reviewed: { label: "Reviewed", className: "bg-emerald-50 text-emerald-700" },
    requested: { label: "Requested", className: "bg-amber-50 text-amber-700" },
    not_requested: { label: "Not requested", className: "bg-stone-200 text-stone-600" },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${config.className}`}
    >
      {status === "reviewed" && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />}
      {config.label}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-[#C9A96E] text-[#C9A96E]" : "text-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

// ---------- View review modal ----------

function ViewReviewModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [reviews, setReviews] = useState<ReviewDoc[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchReviews() {
      try {
        setLoading(true);
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("orderId", "==", order.docId)
        );
        const snap = await getDocs(reviewsQuery);
        if (cancelled) return;
        const fetched: ReviewDoc[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            productId: data.productId,
            productName: data.productName,
            rating: data.rating,
            comment: data.comment ?? "",
            createdAt: toDate(data.createdAt),
          };
        });
        setReviews(fetched);
        setError(null);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (!cancelled) setError("Couldn't load this order's reviews.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [order.docId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-stone-100 px-8 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Review
            </p>
            <h2 className="mt-1 font-serif text-2xl font-medium text-stone-900">
              {order.tx_ref}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{order.username}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-8 py-6">
          {loading && (
            <p className="py-8 text-center text-sm text-stone-400">
              Loading review…
            </p>
          )}
          {!loading && error && (
            <p className="py-8 text-center text-sm text-rose-500">{error}</p>
          )}
          {!loading && !error && reviews && reviews.length === 0 && (
            <p className="py-8 text-center text-sm text-stone-400">
              No review content found for this order.
            </p>
          )}
          {!loading &&
            !error &&
            reviews &&
            reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-stone-100 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-stone-900">{r.productName}</p>
                  <Stars rating={r.rating} />
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {r.comment}
                  </p>
                )}
                <p className="mt-2 text-xs text-stone-400">
                  Submitted {formatDate(r.createdAt)}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function ReviewsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const ordersQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(ordersQuery);
        const fetched: Order[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            docId: docSnap.id,
            amount: data.amount,
            createdAt: toDate(data.createdAt),
            items: data.items ?? [],
            status: data.status,
            tx_ref: data.tx_ref,
            user_id: data.user_id,
            username: data.username,
            email: null,
            reviewRequestedAt: toDate(data.reviewRequestedAt),
            reviewSubmittedAt: toDate(data.reviewSubmittedAt),
          };
        });

        const uniqueUserIds = Array.from(
          new Set(fetched.map((o) => o.user_id).filter(Boolean))
        );
        const emailEntries = await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              const userSnap = await getDoc(doc(db, "users", uid));
              return [uid, userSnap.exists() ? (userSnap.data().email ?? null) : null] as const;
            } catch (err) {
              console.error(`Failed to fetch email for user ${uid}:`, err);
              return [uid, null] as const;
            }
          })
        );
        const emailByUserId = new Map(emailEntries);

        setOrders(
          fetched.map((o) => ({ ...o, email: emailByUserId.get(o.user_id) ?? null }))
        );
        setError(null);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Couldn't load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        reviewFilter === "all" || reviewStatus(order) === reviewFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        order.username?.toLowerCase().includes(q) ||
        order.email?.toLowerCase().includes(q) ||
        order.tx_ref?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [orders, reviewFilter, searchQuery]);

  const totalResults = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const pageOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleRequestReview(order: Order, productId: string) {
    if (!order.email) {
      toast.error("This buyer has no email on file.");
      return;
    }
    try {
      setRequestingId(order.docId);
      const res = await fetch("/api/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.docId, productId: productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to send review request.");
      }
      toast.success(`Review request sent to ${order.email}`);
      setOrders((prev) =>
        prev.map((o) =>
          o.docId === order.docId ? { ...o, reviewRequestedAt: new Date() } : o
        )
      );
    } catch (err: any) {
      console.error("Failed to request review:", err);
      toast.error(err?.message ?? "Failed to send review request.");
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 sm:px-10 lg:px-16">
      <div>
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-xl">
            <h1 className="font-serif text-5xl font-medium tracking-tight text-stone-900">
              Reviews
            </h1>
            <p className="mt-4 text-base leading-relaxed text-stone-500">
              Request reviews from customers after delivery and read what
              they've said about their orders.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <select
                value={reviewFilter}
                onChange={(e) => {
                  setReviewFilter(e.target.value as ReviewFilter);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-lg border border-stone-300 bg-white py-2.5 pl-4 pr-9 text-sm font-semibold uppercase tracking-wide text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="all">Review: All</option>
                <option value="not_requested">Not requested</option>
                <option value="requested">Requested</option>
                <option value="reviewed">Reviewed</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search orders..."
                className="w-full rounded-lg border-0 bg-stone-100 py-2.5 pl-10 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  <th className="px-8 py-4">Order Ref</th>
                  <th className="px-4 py-4">Customer</th>
                  <th className="px-4 py-4">Products</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Review</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-sm text-stone-400">
                      Loading orders…
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-sm text-rose-500">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && pageOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-sm text-stone-400">
                      No orders match your filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  pageOrders.map((order) => {
                    const status = reviewStatus(order);
                    const firstItem = order.items[0];
                    const thumb = firstItem ? getItemImage(firstItem) : null;

                    return (
                      <tr key={order.docId} className="text-stone-800">
                        <td className="whitespace-nowrap px-8 py-6 font-medium">
                          {order.tx_ref?.length > 18
                            ? `${order.tx_ref.slice(0, 18)}…`
                            : order.tx_ref}
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColorFor(
                                order.username ?? ""
                              )}`}
                            >
                              {getInitials(order.username ?? "?")}
                            </span>
                            <div>
                              <p className="font-medium">{order.username}</p>
                              <p className="text-xs text-stone-400">
                                {order.email ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex items-center gap-2">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumb}
                                alt=""
                                className="h-9 w-9 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-400" />
                            )}
                            <span className="text-sm text-stone-600">
                              {order.items.length} item
                              {order.items.length === 1 ? "" : "s"}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-6 text-stone-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-6">
                          <ReviewStatusBadge order={order} />
                        </td>
                        <td className="whitespace-nowrap px-8 py-6 text-right">
                          {status === "reviewed" ? (
                            <button
                              type="button"
                              onClick={() => setViewingOrder(order)}
                              className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-700 transition hover:bg-stone-50"
                            >
                              View review
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={requestingId === order.docId || !order.email}
                              onClick={() => handleRequestReview(order, order.items[0]?.product_id ?? "")}
                              title={!order.email ? "No email on file for this buyer" : undefined}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {requestingId === order.docId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Mail className="h-3.5 w-3.5" />
                              )}
                              {status === "requested" ? "Resend" : "Request review"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex flex-col items-center justify-between gap-4 bg-stone-50 px-8 py-4 sm:flex-row">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {totalResults === 0
                ? "No results"
                : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
                    currentPage * PAGE_SIZE,
                    totalResults
                  )} of ${totalResults} results`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-300 text-stone-500 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition ${
                    page === currentPage
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-300 text-stone-500 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewingOrder && (
        <ViewReviewModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
      )}
    </main>
  );
}