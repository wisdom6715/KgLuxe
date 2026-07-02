"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { toast } from "sonner";
import {
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/firebase.config";
import { CATEGORIES, getStockStatus, type Product } from "./type";
import CreateProductModal from "./CreateProductModal";

const PAGE_SIZE = 10;

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

function StockBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock);
  if (status === "out-of-stock") {
    return (
      <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        Out of Stock
      </span>
    );
  }
  if (status === "low-stock") {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-600 text-sm font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {stock} left (Low)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {stock} in stock
    </span>
  );
}

export default function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "low-stock" | "out-of-stock"
  >("all");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [stockDropdownOpen, setStockDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Live Firestore listener — no mock data, table always reflects the DB
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load products:", err);
        toast.error("Couldn't load products. Please refresh.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" || getStockStatus(p.stock) === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  // Reset to page 1 whenever filters change so we don't land on an empty page
  useEffect(() => setPage(1), [search, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const allSelected = pageItems.every((p) => prev.has(p.id));
      const next = new Set(prev);
      pageItems.forEach((p) => (allSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This can't be undone.`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "products", product.id));
      // Note: the product image lives on S3 (uploaded via
      // app.nexovea.com/nexoviia/v1/upload-resources) — there's no client-side
      // delete for it. Wire up a DELETE endpoint on the backend if you want to
      // clean up orphaned S3 objects when a product is removed.
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      toast.success(`${product.name} removed from inventory`);
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Couldn't delete the product. Please try again.");
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to export.");
      return;
    }
    const headers = ["Name", "SKU", "Category", "Stock", "Price"];
    const rows = filtered.map((p) => [
      p.name,
      p.sku,
      p.category,
      String(p.stock),
      String(p.price),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="flex-1 bg-[#FAF9F6] min-h-screen">
      {/* Page header */}
      <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-400 mt-2">
            Dashboard / <span className="text-gray-700 font-medium">Products</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:border-gray-300 transition-colors"
          >
            <Download size={15} />
            EXPORT DATA
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-black hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Plus size={15} />
            ADD PRODUCT
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU or category…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCategoryDropdownOpen((v) => !v);
                setStockDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-300 transition-colors"
            >
              CATEGORY:{" "}
              <span className="font-medium">
                {categoryFilter === "all"
                  ? "ALL"
                  : CATEGORIES.find((c) => c.value === categoryFilter)?.label.toUpperCase()}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("all");
                    setCategoryDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FAF8F3] transition-colors"
                >
                  All
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(c.value);
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FAF8F3] transition-colors"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stock filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStockDropdownOpen((v) => !v);
                setCategoryDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-300 transition-colors"
            >
              STOCK:{" "}
              <span className="font-medium">
                {stockFilter === "all"
                  ? "ALL STATUS"
                  : stockFilter.replace("-", " ").toUpperCase()}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {stockDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]">
                {(["all", "in-stock", "low-stock", "out-of-stock"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStockFilter(s);
                        setStockDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FAF8F3] transition-colors"
                    >
                      {s === "all" ? "All Status" : s.replace("-", " ")}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={async () => {
                const confirmed = window.confirm(
                  `Delete ${selectedIds.size} selected product(s)? This can't be undone.`
                );
                if (!confirmed) return;
                const toDelete = products.filter((p) => selectedIds.has(p.id));
                await Promise.all(toDelete.map((p) => handleDelete(p)));
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6 lg:px-10 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[40px_2.5fr_1fr_1fr_1.3fr_1fr_100px] items-center px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold tracking-wide text-gray-500">
                <input
                  type="checkbox"
                  checked={
                    pageItems.length > 0 && pageItems.every((p) => selectedIds.has(p.id))
                  }
                  onChange={toggleSelectAllOnPage}
                  className="accent-black"
                />
                <span>PRODUCT</span>
                <span>SKU</span>
                <span>CATEGORY</span>
                <span>STOCK LEVEL</span>
                <span>PRICE</span>
                <span className="text-right">ACTIONS</span>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  Loading products…
                </div>
              ) : pageItems.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  {products.length === 0
                    ? "No products yet — add your first one to get started."
                    : "No products match your filters."}
                </div>
              ) : (
                pageItems.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[40px_2.5fr_1fr_1fr_1.3fr_1fr_100px] items-center px-6 py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="accent-black"
                    />
                    <div className="flex items-center gap-3 pr-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-md object-cover border border-gray-100 flex-shrink-0"
                      />
                      <div>
                        <p className="font-serif text-[15px] text-gray-900 leading-tight">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.colors?.[0]} / {p.subCategory}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 font-mono">{p.sku}</span>
                    <span className="text-sm text-gray-600 capitalize">{p.category}</span>
                    <StockBadge stock={p.stock} />
                    <span className="text-sm text-gray-900 font-medium">
                      {formatNaira(p.price)}
                    </span>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        title="Editing is coming soon"
                        className="text-gray-400 hover:text-gray-700 transition-colors cursor-not-allowed"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3 mt-5 pb-10">
            <p className="text-sm text-gray-400">
              SHOWING {startEntry} TO {endEntry} OF {filtered.length} ENTRIES
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 5)
                .map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                      n === page
                        ? "bg-black text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}