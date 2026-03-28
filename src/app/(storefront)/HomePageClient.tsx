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

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarouselSection({ products }: ProductCarouselProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const categories = ["ALL", "WOMEN", "MEN", "ACCESSORIES", "CHILDREN"];

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "ALL") return products;
    return products.filter(p => p.type?.toUpperCase() === activeCategory);
  }, [products, activeCategory]);

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
                layoutId={`activeCategory-${products?.[0]?.id || 'default'}`}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {filteredProducts && filteredProducts.length > 0 ? (
        <HorizontalProductScroll products={filteredProducts} />
      ) : (
        <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-400 text-sm font-light uppercase tracking-widest">More items coming soon</p>
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
    <AnimatedSection className="py-24 md:py-48 bg-neutral-50 dark:bg-zinc-950/50 border-y border-black/5 dark:border-white/5">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <span className="text-[10px] font-bold tracking-[0.5em] text-neutral-400 uppercase mb-8 block">Exclusive Access</span>
        <h2 className="text-4xl md:text-6xl font-serif italic mb-8 md:mb-12">{newsletter.title}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-12 md:mb-16 max-w-lg mx-auto leading-relaxed text-lg">
          {newsletter.description}
        </p>
        <Link href="/account" className="inline-flex items-center gap-6 group">
          <span className="text-sm font-bold tracking-[0.3em] uppercase border-b-2 border-black dark:border-white pb-1 group-hover:opacity-50 transition-all duration-300">
            {newsletter.ctaText}
          </span>
          <div className="w-12 h-12 rounded-full border border-black dark:border-white flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-500 scale-100 group-hover:scale-110 shadow-xl">
            <Plus className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" />
          </div>
        </Link>
      </div>
    </AnimatedSection>
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

export function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedHero({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative z-20 text-center px-4 max-w-5xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
