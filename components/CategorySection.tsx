"use client";

import { useState } from "react";
import { categories, categoryTabs } from "@/data";
import type { Category } from "@/types";

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="relative group overflow-hidden rounded-lg cursor-pointer aspect-square">
      <img
        src={category.image}
        alt={category.label}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
      {/* Tag */}
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
        <span className="bg-white/90 backdrop-blur-sm text-dark-brown text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-widest uppercase px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-xl">
          {category.tag}
        </span>
      </div>
    </div>
  );
}

export default function CategorySection() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <section className="py-8 sm:py-10 md:py-12 border-t border-gray-100 px-4 sm:px-6 md:px-0">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-dark-brown">
          Browse by categories
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium tracking-wide transition-all flex-shrink-0 whitespace-nowrap ${
                activeTab === tab
                  ? "bg-dark-brown text-white"
                  : "border border-gray-300 text-gray-500 hover:border-dark-brown hover:text-dark-brown"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}