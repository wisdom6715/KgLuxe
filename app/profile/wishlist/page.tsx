"use client";

import { Heart, Trash2, ShoppingCart, Package } from "lucide-react";
import { useWishlist } from "@/hook/useAddToWishList";
import { useCart } from "@/hook/useAddToCart";

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function WishlistPage() {
  const { items, loading, removeItem, isMutating } = useWishlist();
  const { addToCart, isAdding } = useCart();

  const handleAddToCart = (item: (typeof items)[number]) => {
    addToCart({
      id: item.product_id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      stock: item.stock,
      quantity: 1,
    });
  };

  const handleAddAllToCart = () => {
    items
      .filter((item) => (item.stock ?? 1) !== 0)
      .forEach((item) => handleAddToCart(item));
  };

  const inStockCount = items.filter((item) => (item.stock ?? 1) !== 0).length;

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Wishlist</h1>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                <div className="h-3.5 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Wishlist</h1>
        <span className="text-sm text-gray-400">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center">
            <Heart size={28} className="text-[#C9A96E]" strokeWidth={1.5} />
          </div>
          <p className="text-gray-500 text-sm">Your wishlist is empty</p>
          <a href="#" className="text-sm font-medium text-[#C9A96E] hover:underline">
            Explore products →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => {
            const inStock = (item.stock ?? 1) !== 0;
            const removing = isMutating(item.product_id);
            const adding = isAdding(item.product_id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg bg-cream-100 shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package size={20} className="text-[#C9A96E]" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-base font-bold text-[#A07840] mt-0.5">
                      {formatNaira(item.price)}
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        inStock ? "text-emerald-600" : "text-red-400"
                      }`}
                    >
                      {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pl-[80px] sm:pl-0">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!inStock || adding}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      inStock
                        ? "bg-[#C9A96E] text-white hover:bg-[#A07840] disabled:opacity-60"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart size={13} />
                    {adding ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    disabled={removing}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}