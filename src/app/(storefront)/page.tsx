"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { useHomeStore } from "@/store/useHomeStore";
import { useEffect, useState, useMemo } from "react";
import { HorizontalProductScroll } from "@/components/shop/HorizontalProductScroll";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const { content, fetchContent } = useHomeStore();
  const { hero, collections, promo, newsletter, bestSellers } = content;

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const [activeCategory, setActiveCategory] = useState("ALL");
  const categories = ["ALL", "WOMEN", "MEN", "ACCESSORIES", "CHILDREN"];

  const filteredBestSellers = useMemo(() => {
    if (!bestSellers) return [];
    if (activeCategory === "ALL") return bestSellers;
    return bestSellers.filter(p => p.category?.toUpperCase() === activeCategory);
  }, [bestSellers, activeCategory]);
  
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          {hero.backgroundImage && hero.backgroundImage.trim() ? (
            <Image
              src={hero.backgroundImage}
              alt={hero.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </motion.div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-white/70 text-sm font-medium tracking-[0.3em] uppercase mb-4 block">{hero.subtitle}</span>
            <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-serif italic mb-8 leading-tight">
              {hero.title} <br />
              <span className="not-italic font-sans font-light tracking-tighter">{hero.titleAccent}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light mb-12 tracking-wide max-w-2xl mx-auto leading-relaxed">
              {hero.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href={hero.ctaLink && hero.ctaLink.trim() ? hero.ctaLink : "/shop"}
                className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden border border-white text-white font-medium tracking-widest uppercase transition-all duration-300 hover:text-black"
              >
                <span className="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {hero.ctaText} <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href={hero.secondaryLink && hero.secondaryLink.trim() ? hero.secondaryLink : "/shop"}
                className="text-white/70 hover:text-white text-sm font-medium tracking-widest uppercase transition-colors border-b border-white/20 hover:border-white pb-1"
              >
                {hero.secondaryLinkText}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
        >
          <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] [writing-mode:vertical-lr]">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent"></div>
        </motion.div>
      </section>

      {/* Collections Showcase - Dynamic Horizontal Slider */}
      <section className="bg-[#f5f5f5] dark:bg-zinc-950 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8"
          >
            <div className="max-w-xl">

              <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif italic mb-8 leading-tight">Collections</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm uppercase tracking-widest leading-loose max-w-sm">
                A vision of contemporary luxury. Each series reflects our commitment to form, function, and artistic expression.
              </p>
            </div>
            <Link href="/shop" className="group flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase border-b-2 border-black dark:border-white pb-2 hover:opacity-50 transition-all">
              Explore All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Horizontal Auto-Scrolling Container - Now inside max-w-7xl */}
          <div className="relative w-full">
            <motion.div
              className="flex gap-8 pb-12 overflow-x-auto no-scrollbar scroll-smooth"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {collections.map((collection, index) => (
                <motion.div 
                  key={collection.id} 
                  variants={fadeIn} 
                  className="flex-none w-[85vw] md:w-[45vw] lg:w-[35vw] group relative overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl aspect-[16/10]"
                >
                  <Link href={collection.link} className="absolute inset-0 z-30">
                    <span className="sr-only">View {collection.title}</span>
                  </Link>
                  
                  {collection.image && collection.image.trim() ? (
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 35vw"
                      className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                    />
                  ) : null}
                  
                  {/* Minimalist Constant Overlay for Legibility */}
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 z-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                    <div className="flex items-end justify-between transition-transform duration-700">
                      <div className="max-w-[80%]">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/70 mb-2 block">{collection.subtitle}</span>
                        <h3 className="text-2xl md:text-3xl font-serif text-white">{collection.title}</h3>
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Constant Identifier (Minimalist) */}
                  <div className="absolute top-8 left-8 mix-blend-difference z-20">
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.5em] opacity-40">Series. 0{index + 1}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-32 bg-neutral-50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 md:gap-10 overflow-hidden">
            <div className="space-y-8 w-full">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight">Best Sellers</h2>
              
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
            </div>
            
            <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase mb-1 border-b border-transparent hover:border-black dark:hover:border-white transition-all pb-1">
              Shop All <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {filteredBestSellers && filteredBestSellers.length > 0 ? (
            <HorizontalProductScroll title="Best Sellers" products={filteredBestSellers} />
          ) : (
            <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="text-neutral-400 text-sm font-light uppercase tracking-widest">New arrivals coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof Section (Marquee) */}
      <section className="py-20 border-y border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black overflow-hidden relative">
        <div className="flex flex-col items-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase">Globally Recognized By</span>
        </div>
        
        {/* Animated Marquee */}
        <div className="flex overflow-hidden group select-none">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex flex-none gap-20 items-center justify-around min-w-full pr-20 py-2"
          >
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-20 items-center whitespace-nowrap">
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">VOGUE</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">GQ</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">BAZAAR</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">ELLE</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">VANITY FAIR</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">HYPEBEAST</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {promo.backgroundImage && promo.backgroundImage.trim() ? (
            <Image
              src={promo.backgroundImage}
              alt={promo.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </motion.div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-white/60 text-xs font-bold tracking-[0.5em] uppercase mb-6 block">{promo.subtitle}</span>
            <h2 className="text-white text-4xl sm:text-5xl md:text-7xl font-serif italic mb-8 leading-tight">
              {promo.title} <br />
              <span className="not-italic font-sans font-light tracking-tighter">{promo.titleAccent}</span>
            </h2>
            <p className="text-white/70 text-lg md:text-xl font-light mb-12 tracking-wide max-w-xl mx-auto leading-relaxed">
              {promo.description}
            </p>
            <Link
                href={promo.ctaLink && promo.ctaLink.trim() ? promo.ctaLink : "/shop"}
              className="inline-flex items-center justify-center px-10 py-4 text-[11px] font-bold tracking-[0.2em] text-black bg-white hover:bg-neutral-200 transition-all duration-300 uppercase shadow-2xl"
            >
              {promo.ctaText}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Preview / Minimalist CTA */}
      <section className="py-32 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif mb-8">{newsletter.title}</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-12 max-w-md mx-auto leading-relaxed">
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

    </div>
  );
}

