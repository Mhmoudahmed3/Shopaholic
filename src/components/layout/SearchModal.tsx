"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/useSearchStore";

export function SearchModal() {
    const { isOpen, close } = useSearchStore();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") close();
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "";
        }
    }, [isOpen, close]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            close();
            router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex flex-col supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={close}
            />

            {/* Modal Content */}
            <div className="relative w-full bg-white dark:bg-[#050505] shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-20 border-b border-gray-100 dark:border-gray-800">
                        <Search className="h-6 w-6 text-gray-400 hidden sm:block" />
                        <form onSubmit={handleSearch} className="flex-1 mx-2 sm:mx-6 flex items-center h-full">
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for products, brands, or categories..."
                                className="w-full h-full bg-transparent border-none outline-none text-lg sm:text-2xl font-light placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white focus:ring-0"
                            />
                        </form>
                        <button 
                            onClick={close}
                            className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors ml-auto group flex items-center gap-2"
                        >
                            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest group-hover:text-black dark:group-hover:text-white">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Popular Searches */}
                    {query.length === 0 && (
                        <div className="py-12">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Popular Searches</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Dresses', 'Summer Collection', 'Jackets', 'Accessories'].map(term => (
                                    <button 
                                        key={term}
                                        onClick={() => {
                                            setQuery(term);
                                            // Trigger search after state update
                                            const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                                            setTimeout(() => handleSearch(fakeEvent), 0);
                                        }}
                                        className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-full hover:border-black dark:hover:border-white text-black dark:text-white transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
