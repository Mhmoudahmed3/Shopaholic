"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HorizontalProductScroll } from "@/components/shop/HorizontalProductScroll";
import type { Product } from "@/lib/types";

interface BestSellersProps {
  bestSellers: Product[];
}

export function BestSellersSection({ bestSellers }: BestSellersProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const categories = ["ALL", "WOMEN", "MEN", "ACCESSORIES", "CHILDREN"];

  const filteredBestSellers = useMemo(() => {
    if (!bestSellers) return [];
    if (activeCategory === "ALL") return bestSellers;
    return bestSellers.filter(p => p.type?.toUpperCase() === activeCategory);
  }, [bestSellers, activeCategory]);

  return (
    <>
      <div className="flex gap-6 md:gap-10 overflow-x-auto pb-2 no-scrollbar w-full pr-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? "ALL" : cat)}
            className="group relative pb-2 whitespace-nowrap flex-shrink-0"
          >
            <span className={`text-[11px] font-bold tracking-[0.3em] uppercase transition-colors duration-300 ${
              activeCategory === cat ? 'text-black dark:text-white' : 'text-neutral-400 hover:text-black dark:hover:text-white'
            }`}>
              {cat}
            </span>
            {activeCategory === cat && (
              <motion.div 
                layoutId="activeCategory"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {filteredBestSellers && filteredBestSellers.length > 0 ? (
        <HorizontalProductScroll products={filteredBestSellers} />
      ) : (
        <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-400 text-sm font-light uppercase tracking-widest">New arrivals coming soon</p>
        </div>
      )}
    </>
  );
}
