// components/admin/CustomersPageContent.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  Search,
  Users,
  Banknote,
  RefreshCw,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase.config";

type CustomerStatus = "vip" | "subscriber" | "active";

interface Customer {
  id: string;
  name: string;
  email: string;
  location: string;
  orders: number;
  spend: number;
  status: CustomerStatus;
}

const PAGE_SIZE = 4;

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  if (status === "vip") {
    return (
      <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide bg-black text-white">
        VIP
      </span>
    );
  }
  return (
    <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide border border-gray-300 text-gray-700">
      {status.toUpperCase()}
    </span>
  );
}

function normalizeStatus(value: unknown): CustomerStatus {
  if (value === "vip" || value === "subscriber" || value === "active") {
    return value;
  }
  return "active";
}

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function fetchCustomers() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "users"));
        if (cancelled) return;

        const rows: Customer[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? data.displayName ?? "Unnamed",
            email: data.email ?? "—",
            location: data.location ?? "—",
            orders: typeof data.orders === "number" ? data.orders : (data.totalOrders ?? 0),
            spend: typeof data.spend === "number" ? data.spend : (data.totalSpend ?? 0),
            status: normalizeStatus(data.status),
          };
        });

        setCustomers(rows);
      } catch (err) {
        console.error("Failed to load customers:", err);
        if (!cancelled) toast.error("Failed to load customers. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCustomers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term)
    );
  }, [search, customers]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, safePage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  const stats = useMemo(() => {
    const totalClients = customers.length;
    const avgLtv = totalClients
      ? customers.reduce((sum, c) => sum + c.spend, 0) / totalClients
      : 0;
    const activeSubscriptions = customers.filter((c) => c.status === "subscriber").length;

    return [
      { label: "Total Clients", value: totalClients.toLocaleString(), change: null, icon: Users },
      { label: "Avg LTV", value: formatUsd(avgLtv), change: null, icon: Banknote },
      {
        label: "Active Subscriptions",
        value: activeSubscriptions.toLocaleString(),
        subtitle: "Editorial Tier 1",
        icon: RefreshCw,
      },
    ];
  }, [customers]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex-1 bg-[#FAF9F6] min-h-screen">
      {/* Page header */}
      <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-6 flex items-start justify-between flex-wrap gap-4">
        <div className="max-w-lg">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gray-900">Registered Customers</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Manage your premium client base and analyze individual spending
            patterns within the editorial ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search customers…"
              className="pl-9 pr-4 py-2.5 w-full sm:w-56 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-4 sm:px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {stats.map(({ label, value, change, subtitle, icon: Icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-gray-500">
              {label.toUpperCase()}
              <Icon size={16} className="text-gray-400" />
            </div>
            <p className="font-serif text-3xl text-gray-900 mt-3">{value}</p>
            {change ? (
              <p className="flex items-center gap-1 text-xs font-medium mt-2 text-emerald-600">
                <ArrowUp size={12} />
                {change}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Customers table */}
      <div className="px-4 sm:px-6 lg:px-10 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[2.2fr_1.3fr_1fr_1.1fr_1fr_60px] items-center px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold tracking-wide text-gray-500">
                <span>CUSTOMER</span>
                {/* <span>LOCATION</span> */}
                <span>TOTAL ORDERS</span>
                <span>TOTAL SPEND</span>
                <span>STATUS</span>
              </div>

              {loading ? (
                <div className="px-6 py-16 flex items-center justify-center text-sm text-gray-400 gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Loading customers…
                </div>
              ) : pageItems.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  No customers match your search.
                </div>
              ) : (
                pageItems.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-[2.2fr_1.3fr_1fr_1.1fr_1fr_60px] items-center px-6 py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-800 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {initials(c.name)}
                      </div>
                      <div>
                        <p className="font-serif text-[15px] text-gray-900 leading-tight">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.email}</p>
                      </div>
                    </div>
                    {/* <span className="text-sm text-gray-600">{c.location}</span> */}
                    <span className="text-sm text-gray-700">{c.orders}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatUsd(c.spend)}
                    </span>
                    <span>
                      <StatusBadge status={c.status} />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-6 py-4 bg-gray-50">
              <p className="text-sm text-gray-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} results
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                      n === safePage
                        ? "bg-black text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}