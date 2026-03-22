"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, User, Heart, ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { navigationData } from "@/lib/navigationData";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchStore } from "@/lib/useSearchStore";

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { open: openSearch } = useSearchStore();

    // Close on path change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(false);
    }, [pathname]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 text-gray-500 hover:text-black dark:hover:text-white transition-all duration-300 active:scale-90"
                aria-label="Open mobile menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed top-0 left-0 bottom-0 z-[110] w-[85vw] max-w-[400px] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-2xl lg:hidden flex flex-col shadow-2xl border-r border-white/10 dark:border-black/10"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-900">
                                <span className="text-xl font-bold tracking-[0.2em] uppercase">SHOPAHOLIC</span>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-all duration-300 active:rotate-90"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-24">
                                {/* Search, Wishlist, Cart - Simplified Grid */}
                                <div className="grid grid-cols-3 gap-3 mb-10">
                                    <button 
                                        onClick={() => { setIsOpen(false); openSearch(); }}
                                        className="flex flex-col items-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl active:scale-95 transition-all"
                                    >
                                        <Search className="h-5 w-5 text-black dark:text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Search</span>
                                    </button>
                                    <Link 
                                        href="/favorites"
                                        className="flex flex-col items-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl active:scale-95 transition-all"
                                    >
                                        <Heart className="h-5 w-5 text-black dark:text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Wishlist</span>
                                    </Link>
                                    <Link 
                                        href="/cart"
                                        className="flex flex-col items-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl active:scale-95 transition-all"
                                    >
                                        <ShoppingBag className="h-5 w-5 text-black dark:text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Cart</span>
                                    </Link>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-[11px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.25em] mb-4 pl-1">Collections</h3>
                                    
                                    <nav className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
                                        {/* Main Categories */}
                                        {["WOMEN", "MEN", "ACCESSORIES", "CHILDREN"].map((label) => {
                                            const category = navigationData?.find(c => c.label === label);
                                            const href = category?.href || `/shop?category=${label.toLowerCase()}`;
                                            
                                            return (
                                                <div key={label} className="py-1">
                                                    <Link 
                                                        href={href}
                                                        className="flex items-center justify-between w-full py-4 text-base font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200 active:translate-x-2 transition-transform"
                                                    >
                                                        <span>{label}</span>
                                                        <ChevronRight className="h-5 w-5 text-neutral-300 dark:text-neutral-700" />
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Shop All Fallback if navigationData is missing for some reason */}
                                        {!navigationData?.length && (
                                            <div className="py-1">
                                                <Link 
                                                    href="/shop"
                                                    className="flex items-center justify-between w-full py-4 text-base font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200 active:translate-x-2 transition-transform"
                                                >
                                                    <span>SHOP ALL</span>
                                                    <ChevronRight className="h-5 w-5 text-neutral-300 dark:text-neutral-700" />
                                                </Link>
                                            </div>
                                        )}
                                    </nav>

                                    <div className="pt-4 space-y-4">
                                        <Link href="/shop?sort=newest" className="block text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors">New Arrivals</Link>
                                        <Link href="/shop?collection=featured" className="block text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors">Featured</Link>
                                        <Link href="/contact" className="block text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors">Support</Link>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/20 backdrop-blur-md">
                                <Link href="/admin" className="flex items-center justify-between w-full p-4 bg-black dark:bg-white rounded-2xl group active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/10 dark:shadow-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 dark:bg-black/10 rounded-lg">
                                            <User className="h-5 w-5 text-white dark:text-black" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest text-white dark:text-black">Member Account</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-white/50 dark:text-black/50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

