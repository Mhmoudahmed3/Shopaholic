"use client";

import { useState } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function InventoryFilters({ categories, initialQ, initialCategory, initialType, initialRating, initialPopular }: { 
    categories: {id: string, label: string}[],
    initialQ: string,
    initialCategory: string,
    initialType: string,
    initialRating: string,
    initialPopular: boolean
}) {
    const types = [
        { id: "all", label: "All Types" },
        { id: "Dress", label: "Dresses" },
        { id: "Coat", label: "Coats" },
        { id: "Abaya", label: "Abayas" },
        { id: "Skirt", label: "Skirts" },
        { id: "Shirt", label: "Shirts" },
        { id: "Bag", label: "Bags" },
        { id: "Scarf", label: "Scarves" },
        { id: "Heels", label: "Heels" }
    ];
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [q, setQ] = useState(initialQ);

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });
        router.push(`/admin/inventory?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams({ q: q || null });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-lg w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name, category or ID..." 
                        className="bg-transparent border-none outline-none text-sm flex-1" 
                    />
                </div>
            </form>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border rounded-lg transition-all ${
                            isMenuOpen 
                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                : 'text-gray-500 border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white'
                        }`}
                    >
                        <Filter className="w-4 h-4" /> 
                        <span className="hidden sm:inline">Filters</span>
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95"
                            >
                                <div className="p-5 space-y-6">
                                    {/* Category */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Category</h4>
                                            <select 
                                                value={initialCategory}
                                                onChange={(e) => updateParams({ category: e.target.value === 'all' ? null : e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                                            >
                                                <option value="all">All Categories</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Type</h4>
                                            <select 
                                                value={initialType}
                                                onChange={(e) => updateParams({ type: e.target.value === 'all' ? null : e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                                            >
                                                {types.map(t => (
                                                    <option key={t.id} value={t.id}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Minimum Rating</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[0, 3, 4, 4.5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    onClick={() => updateParams({ rating: rating === 0 ? null : rating.toString() })}
                                                    className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${
                                                        (parseFloat(initialRating) || 0) === rating 
                                                            ? 'bg-black text-white border-black dark:bg-white dark:text-black' 
                                                            : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-300'
                                                    }`}
                                                >
                                                    {rating === 0 ? 'Any' : `${rating}+ Stars`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Popular */}
                                    <label className="flex items-center justify-between cursor-pointer group pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="flex flex-col">
                                            <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${initialPopular ? 'text-black dark:text-white' : 'text-neutral-400'}`}>Popular Items</span>
                                            <span className="text-[9px] text-neutral-400 font-normal">Score 85+</span>
                                        </div>
                                        <div 
                                            onClick={() => updateParams({ popular: initialPopular ? null : 'true' })}
                                            className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${initialPopular ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: initialPopular ? 18 : 2 }}
                                                className={`absolute top-0.5 w-3 h-3 rounded-full shadow-sm ${initialPopular ? 'bg-white dark:bg-black' : 'bg-white dark:bg-neutral-400'}`}
                                            />
                                        </div>
                                    </label>

                                    {/* Reset */}
                                    <div className="pt-2 flex gap-2">
                                        <Link 
                                            href="/admin/inventory"
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Reset
                                        </Link>
                                        <button 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <Link 
                    href="/admin/inventory"
                    className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    title="Clear All"
                >
                    <RotateCcw className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
