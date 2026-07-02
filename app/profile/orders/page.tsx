"use client";
import { useState } from "react";
import { Search, ShoppingBag, ChevronDown } from "lucide-react";
import { mockOrders } from "../lib/mockData";
import { Order } from "../types";

const TABS: Order["status"][] = ["Purchased"];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Order["status"]>("Purchased");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recently Added");

  const filtered = mockOrders.filter(
    (o) => o.status === activeTab && (
      o.productName.toLowerCase().includes(query.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-800">Orders</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 whitespace-nowrap">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:border-[#C9A96E] cursor-pointer"
            >
              <option>Recently Added</option>
              <option>Oldest First</option>
              <option>Price: High to Low</option>
              <option>Price: Low to High</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Product name or order number"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "text-[#C9A96E] border-b-2 border-[#C9A96E]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center">
            <ShoppingBag size={28} className="text-[#C9A96E]" strokeWidth={1.5} />
          </div>
          <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} items found</p>
          {activeTab === "Purchased" && (
            <a href="#" className="text-sm font-medium text-[#C9A96E] hover:underline">Browse products →</a>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-lg bg-cream-100 shrink-0 flex items-center justify-center">
                  {order.imageUrl ? (
                    <img src={order.imageUrl} alt={order.productName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ShoppingBag size={20} className="text-[#C9A96E]" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{order.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">#{order.orderNumber} · {order.date}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right shrink-0 pl-[72px] sm:pl-0">
                <p className="text-sm font-semibold text-gray-800">${order.price.toLocaleString()}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cream-100 text-[#A07840] font-medium">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
