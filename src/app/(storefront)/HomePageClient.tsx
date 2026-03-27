"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HorizontalProductScroll } from "@/components/shop/HorizontalProductScroll";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { clsx } from "clsx";
import type { Product, HomepageNewsletter } from "@/lib/types";

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
            className="group relative pb-2 whitespace-nowrap shrink-0"
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
interface NewsletterSectionProps {
  newsletter: HomepageNewsletter & { ctaText: string };
}

export function NewsletterSection({ newsletter }: NewsletterSectionProps) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) return null;

  return (
    <section className="py-16 md:py-32 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-serif mb-6 md:mb-8">{newsletter.title}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 md:mb-12 max-w-md mx-auto leading-relaxed">
          {newsletter.description}
        </p>
        <Link href="/account" className="inline-flex items-center gap-4 group">
          <span className="text-sm font-bold tracking-widest uppercase border-b-2 border-black dark:border-white pb-1 group-hover:opacity-70 transition-opacity">{newsletter.ctaText}</span>
          <div className="w-10 h-10 rounded-full border border-black dark:border-white flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
            <Plus className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </section>
  );
}
export function DragScrollContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragDistanceRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
    dragDistanceRef.current = 0;
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    dragDistanceRef.current = Math.abs(walk);
    e.preventDefault();
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      if (dragDistanceRef.current > 10) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener('click', handleClick, true);
    return () => el.removeEventListener('click', handleClick, true);
  }, [isDragging]);

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onDragStart={(e) => e.preventDefault()}
      className={clsx(
        "overflow-x-auto no-scrollbar",
        isDragging ? "cursor-grabbing select-none" : "cursor-grab scroll-smooth",
        className
      )}
    >
      {children}
    </div>
  );
}
