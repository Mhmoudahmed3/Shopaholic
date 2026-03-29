"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, X, RotateCcw, SlidersHorizontal, Search, ListFilter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { PREDEFINED_COLORS, SIZE_SCALES } from "@/lib/constants";
import { ShopSortSelect } from "./ShopSortSelect";

interface FilterSidebarProps {
    availableFilters?: {
        sizes: string[];
        colors: string[];
        maxPrice: number;
    };
}

const ACCORDION_CATEGORIES = [
    { title: "All Products", path: "/shop" },
    {
        title: "Women",
        path: "/shop?category=women",
        subcategories: [
            { title: "View All Women", path: "/shop?category=women" },
            { title: "Tops & Shirts", path: "/shop?category=women&type=tops" },
            { title: "Dresses", path: "/shop?category=women&type=dresses" },
            { title: "Sweaters", path: "/shop?category=women&type=sweaters" },
            { title: "Pants & Jeans", path: "/shop?category=women&type=pants" },
            { title: "Skirts", path: "/shop?category=women&type=skirts" },
            { title: "Shoes", path: "/shop?category=women&type=shoes" },
        ]
    },
    {
        title: "Men",
        path: "/shop?category=men",
        subcategories: [
            { title: "View All Men", path: "/shop?category=men" },
            { title: "Shirts", path: "/shop?category=men&type=shirts" },
            { title: "Sweaters", path: "/shop?category=men&type=sweaters" },
            { title: "Pants & Jeans", path: "/shop?category=men&type=pants" },
            { title: "Shoes", path: "/shop?category=men&type=shoes" },
            { title: "Watches", path: "/shop?category=men&type=watches" },
        ]
    },
    { title: "Accessories", path: "/shop?category=accessories" },
    { title: "Children", path: "/shop?category=children" },
];

// Remove static PRICE_RANGES as we are moving to slider
const ALL_SIZES = Array.from(new Set(Object.values(SIZE_SCALES).flat()));

export function FilterSidebar({ availableFilters }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Current filter states from URL
    const currentSort = searchParams.get("sort") || "newest";
    const currentCategory = searchParams.get("category");
    const currentType = searchParams.get("type");
    const currentSize = searchParams.get("size");
    const currentColor = searchParams.get("color");
    const currentMinPrice = searchParams.get("minPrice");
    const currentMaxPrice = searchParams.get("maxPrice");
    const currentMinRating = searchParams.get("rating");
    const isPopularOnly = searchParams.get("popular") === "true";
    const currentQ = searchParams.get("q") || "";

    const updateParams = useCallback((updates: Record<string, string | null | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`/shop?${params.toString()}`);
    }, [searchParams, router]);

    // Local state for search
    const [searchQ, setSearchQ] = useState(currentQ);
    useEffect(() => { setSearchQ(currentQ); }, [currentQ]);

    // Debounced search execution
    useEffect(() => {
        if (searchQ === currentQ) return;
        
        const handler = setTimeout(() => {
            updateParams({ q: searchQ || null });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQ, currentQ, updateParams]);

    // Scroll-aware visibility (for mobile sticky bar)
    const [isBarVisible, setIsBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (window.innerWidth < 1024) {
                // Hide when scrolling down, show when scrolling up
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsBarVisible(false);
                } else {
                    setIsBarVisible(true);
                }
            } else {
                setIsBarVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Local state for smooth slider experience
    const [localMin, setLocalMin] = useState(parseInt(currentMinPrice || "0"));
    const [localMax, setLocalMax] = useState(parseInt(currentMaxPrice || (availableFilters?.maxPrice || 10000).toString()));

    // Synchronize local state when URL params change externally
    useEffect(() => {
        setLocalMin(parseInt(currentMinPrice || "0"));
        setLocalMax(parseInt(currentMaxPrice || (availableFilters?.maxPrice || 10000).toString()));
    }, [currentMinPrice, currentMaxPrice, availableFilters?.maxPrice]);

    const [activeCategory, setActiveCategory] = useState<string | null>(
        currentCategory === "women" ? "Women" : currentCategory === "men" ? "Men" : null
    );
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    // Sync active category when URL category changes
    useEffect(() => {
        if (currentCategory === "women") {
            setActiveCategory("Women");
        } else if (currentCategory === "men") {
            setActiveCategory("Men");
        } else {
            setActiveCategory(null);
        }
    }, [currentCategory]);



    const toggleSize = (size: string) => {
        const sizes = currentSize ? currentSize.split(',') : [];
        const sizeLow = size.toLowerCase();
        let newSizes;
        if (sizes.includes(sizeLow)) {
            newSizes = sizes.filter(s => s !== sizeLow);
        } else {
            newSizes = [...sizes, sizeLow];
        }
        updateParams({ size: newSizes.length > 0 ? newSizes.join(',') : null });
    };

    const toggleColor = (color: string) => {
        const colors = currentColor ? currentColor.split(',') : [];
        const colorLow = color.toLowerCase();
        let newColors;
        if (colors.includes(colorLow)) {
            newColors = colors.filter(c => c !== colorLow);
        } else {
            newColors = [...colors, colorLow];
        }
        updateParams({ color: newColors.length > 0 ? newColors.join(',') : null });
    };

    const togglePrice = (min: number, max: number) => {
        const isCurrent = currentMinPrice === min.toString() && currentMaxPrice === max.toString();
        updateParams({
            minPrice: isCurrent ? null : min.toString(),
            maxPrice: isCurrent ? null : max.toString()
        });
    };

    const toggleRating = (rating: number) => {
        updateParams({ rating: currentMinRating === rating.toString() ? null : rating.toString() });
    };

    const togglePopular = () => {
        updateParams({ popular: isPopularOnly ? null : "true" });
    };

    const clearAllFilters = () => {
        router.push('/shop');
    };

    const isLinkActive = (path: string) => {
        if (!currentCategory && (path === "/shop" || path === "/shop/")) return true;
        
        const queryString = path.includes("?") ? path.split("?")[1] : "";
        const params = new URLSearchParams(queryString);
        const pathCat = params.get("category");
        const pathType = params.get("type");

        if (currentCategory && !pathCat && !pathType) return false;
        if (currentCategory === pathCat && currentType === pathType) return true;

        return false;
    };

    const hasAnyFilter = !!(currentSize || currentColor || currentMinPrice || currentMaxPrice || currentMinRating || isPopularOnly);

    const renderFilterContent = () => (
        <>
            {/* Mobile Header */}
            <div className="flex md:hidden items-center justify-between mb-8 pb-4 border-b border-neutral-100 dark:border-neutral-900">
                <h2 className="text-lg font-serif">Filters & Sort</h2>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 -mr-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Header / Clear All */}
            <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-neutral-100 dark:border-neutral-900">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-black dark:text-white">Filters</h2>
                <AnimatePresence>
                    {hasAnyFilter && (
                        <motion.button 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={clearAllFilters}
                            className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors group"
                        >
                            <RotateCcw className="w-2.5 h-2.5 transition-transform group-hover:-rotate-45" /> Clear All
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Sorting */}
            <div className="md:hidden mb-10 pb-8 border-b border-gray-100 dark:border-neutral-800">
                <ShopSortSelect initialSort={currentSort} />
            </div>

            {/* Shop By Category */}
            <div className="mb-10 pb-8 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6 text-neutral-400">Shop By Category</h3>
                <ul className="flex flex-col space-y-2">
                    {ACCORDION_CATEGORIES.map((cat) => {
                        const hasSubcategories = !!cat.subcategories && cat.subcategories.length > 0;
                        const isOpen = activeCategory === cat.title;
                        const isActiveTopLevel = isLinkActive(cat.path) ||
                            (hasSubcategories && cat.subcategories!.some(sub => isLinkActive(sub.path)));

                        return (
                            <li key={cat.title} className="flex flex-col">
                                <button
                                    onClick={() => {
                                        if (hasSubcategories) {
                                            setActiveCategory(isOpen ? null : cat.title);
                                            // Navigation on parent click if not already active
                                            if (!isActiveTopLevel) {
                                                router.push(cat.path);
                                            }
                                        } else {
                                            const isActive = isLinkActive(cat.path);
                                            router.push(isActive ? '/shop' : cat.path);
                                        }
                                    }}
                                    className={clsx(
                                        "flex items-center justify-between py-1.5 text-sm transition-all duration-300 w-full text-left",
                                        isActiveTopLevel || isOpen ? "text-black dark:text-white translate-x-1" : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:translate-x-1"
                                    )}
                                >
                                    <span className={clsx(isActiveTopLevel || isOpen ? "font-medium" : "font-normal")}>{cat.title}</span>
                                    {hasSubcategories && (
                                        <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-500", isOpen ? "rotate-180" : "rotate-0")} />
                                    )}
                                </button>

                                {hasSubcategories && (
                                    <div className={clsx("overflow-hidden transition-all duration-500 ease-in-out", isOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0")}>
                                        <ul className="flex flex-col pl-4 space-y-2 border-l border-neutral-100 dark:border-neutral-800 ml-1">
                                            {cat.subcategories!.map((sub) => (
                                                <li key={sub.title}>
                                                    <button
                                                        onClick={() => {
                                                            const isActive = isLinkActive(sub.path);
                                                            if (isActive) {
                                                                // If it's a subcategory like "Tops", and it's active, 
                                                                // clicking it should probably go back to the parent category.
                                                                router.push(cat.path);
                                                            } else {
                                                                router.push(sub.path);
                                                            }
                                                        }}
                                                        className={clsx(
                                                            "text-xs transition-colors duration-200 block w-full text-left",
                                                            isLinkActive(sub.path) ? "text-black dark:text-white font-medium" : "text-neutral-400 hover:text-black dark:hover:text-white"
                                                        )}
                                                    >
                                                        {sub.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Size Filter Grouped by System - Only show systems with available products */}
            <div className="mb-10 lg:mb-12 pb-12 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-neutral-400">Select Size</h3>
                
                <div className="space-y-12">
                    {Object.entries(SIZE_SCALES).map(([scale, sizes]) => {
                        // Filter sizes to only show those currently available
                        const availableInScale = sizes.filter(size => 
                            !availableFilters?.sizes || availableFilters.sizes.includes(size.toLowerCase())
                        );

                        if (availableInScale.length === 0) return null;

                        return (
                            <div key={scale} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 whitespace-nowrap">{scale}</span>
                                    <div className="h-px w-full bg-neutral-100 dark:bg-neutral-900" />
                                </div>
                                <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                                    {availableInScale.map((size) => {
                                        const sizeLow = size.toLowerCase();
                                        const isActive = currentSize?.split(',').includes(sizeLow);

                                        return (
                                            <button
                                                key={`${scale}-${size}`}
                                                onClick={() => toggleSize(size)}
                                                className={clsx(
                                                    "h-10 md:h-11 flex items-center justify-center text-[10px] font-bold transition-all duration-300 border",
                                                    isActive 
                                                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white z-10 scale-105 shadow-sm" 
                                                        : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Color Filter */}
            <div className="mb-10 pb-8 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6 text-neutral-400">Filter By Color</h3>
                <div className="flex flex-wrap gap-3">
                    {PREDEFINED_COLORS.map((color) => {
                        const colorLow = color.name.toLowerCase();
                        const isAvailable = !availableFilters?.colors || availableFilters.colors.includes(colorLow);
                        if (!isAvailable) return null;

                        const isActive = currentColor?.split(',').includes(colorLow);
                        return (
                            <button
                                key={color.name}
                                onClick={() => toggleColor(color.name)}
                                title={color.name}
                                className={clsx(
                                    "group relative w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300",
                                    isActive ? "ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-black" : "hover:scale-110"
                                )}
                            >
                                <span 
                                    className={clsx(
                                        "w-full h-full rounded-full",
                                        color.border && "border border-neutral-200 dark:border-neutral-800"
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                />
                                {isActive && (
                                    <span className={clsx(
                                        "absolute inset-0 flex items-center justify-center",
                                        color.name === 'White' ? "text-black" : "text-white"
                                    )}>
                                        <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Price Filter Slider */}
            <div className="mb-10 lg:mb-12 pb-8 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">Price Range</h3>
                    <span className="text-[10px] font-bold tracking-widest text-black dark:text-white uppercase">EGP</span>
                </div>
                
                <div className="space-y-8 px-2">
                    <div className="relative h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full mt-4">
                        {/* Interactive Track (visual only) */}
                        <motion.div 
                            className="absolute h-full bg-black dark:bg-white rounded-full"
                            style={{ 
                                left: `${(localMin / (availableFilters?.maxPrice || 10000)) * 100}%`,
                                right: `${100 - (localMax / (availableFilters?.maxPrice || 10000)) * 100}%`
                            }}
                        />
                        
                        {/* Hidden Native Sliders */}
                        <input 
                            type="range"
                            min="0"
                            max={availableFilters?.maxPrice || 10000}
                            value={localMin}
                            onChange={(e) => {
                                const val = Math.min(parseInt(e.target.value), localMax - 100);
                                setLocalMin(val);
                            }}
                            onMouseUp={() => updateParams({ minPrice: localMin === 0 ? null : localMin.toString() })}
                            onTouchEnd={() => updateParams({ minPrice: localMin === 0 ? null : localMin.toString() })}
                            className="absolute inset-0 w-full h-1 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:dark:border-black [&::-webkit-slider-thumb]:shadow-lg"
                        />
                        <input 
                            type="range"
                            min="0"
                            max={availableFilters?.maxPrice || 10000}
                            value={localMax}
                            onChange={(e) => {
                                const val = Math.max(parseInt(e.target.value), localMin + 100);
                                setLocalMax(val);
                            }}
                            onMouseUp={() => updateParams({ maxPrice: localMax === (availableFilters?.maxPrice || 10000) ? null : localMax.toString() })}
                            onTouchEnd={() => updateParams({ maxPrice: localMax === (availableFilters?.maxPrice || 10000) ? null : localMax.toString() })}
                            className="absolute inset-0 w-full h-1 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:dark:border-black [&::-webkit-slider-thumb]:shadow-lg"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-12">
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Min Price</span>
                            <div className="flex items-center gap-1 border-b border-neutral-100 dark:border-neutral-800 focus-within:border-black dark:focus-within:border-white transition-colors pb-0.5">
                                <input 
                                    type="number"
                                    value={localMin}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setLocalMin(Math.min(val, localMax - 1));
                                    }}
                                    onBlur={() => updateParams({ minPrice: localMin === 0 ? null : localMin.toString() })}
                                    onKeyDown={(e) => e.key === 'Enter' && updateParams({ minPrice: localMin === 0 ? null : localMin.toString() })}
                                    className="w-full bg-transparent text-[13px] font-serif tracking-tight outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] opacity-30 font-serif">EGP</span>
                            </div>
                        </div>

                        <div className="w-4 h-px bg-neutral-100 dark:bg-neutral-800 mt-4" />

                        <div className="flex flex-col gap-1 flex-1 text-right">
                            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Max Price</span>
                            <div className="flex items-center gap-1 border-b border-neutral-100 dark:border-neutral-800 justify-end focus-within:border-black dark:focus-within:border-white transition-colors pb-0.5">
                                <input 
                                    type="number"
                                    value={localMax}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setLocalMax(Math.max(val, localMin + 1));
                                    }}
                                    onBlur={() => updateParams({ maxPrice: localMax === (availableFilters?.maxPrice || 10000) ? null : localMax.toString() })}
                                    onKeyDown={(e) => e.key === 'Enter' && updateParams({ maxPrice: localMax === (availableFilters?.maxPrice || 10000) ? null : localMax.toString() })}
                                    className="w-full bg-transparent text-[13px] font-serif tracking-tight outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] opacity-30 font-serif">EGP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular & Rating Filters */}
            <div className="mb-10 lg:mb-12 pb-8 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6 text-neutral-400">Status & Rating</h3>
                <div className="space-y-5">
                    {/* Popular Toggle */}
                    <label className="flex items-center justify-between group cursor-pointer">
                        <span className={clsx(
                            "text-xs transition-colors",
                            isPopularOnly ? "text-black dark:text-white font-medium" : "text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white"
                        )}>
                            Best Sellers (Popular)
                        </span>
                        <div 
                            onClick={togglePopular}
                            className={clsx(
                                "relative w-8 h-4 rounded-full transition-colors duration-300",
                                isPopularOnly ? "bg-black dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
                            )}
                        >
                            <motion.div 
                                animate={{ x: isPopularOnly ? 18 : 2 }}
                                className={clsx(
                                    "absolute top-0.5 w-3 h-3 rounded-full shadow-sm",
                                    isPopularOnly ? "bg-white dark:bg-black" : "bg-white dark:bg-neutral-400"
                                )}
                            />
                        </div>
                    </label>

                    {/* Rating Filter */}
                    <div className="space-y-3 pt-2">
                        {[4, 3, 2].map((rating) => {
                            const isActive = currentMinRating === rating.toString();
                            return (
                                <button
                                    key={rating}
                                    onClick={() => toggleRating(rating)}
                                    className="flex items-center gap-3 group w-full text-left"
                                >
                                    <div className="relative flex items-center">
                                        <div className={clsx(
                                            "w-3.5 h-3.5 border transition-all",
                                            isActive 
                                                ? "bg-black border-black dark:bg-white dark:border-white" 
                                                : "border-neutral-300 dark:border-neutral-700 group-hover:border-black dark:group-hover:border-white"
                                        )}>
                                            {isActive && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-white dark:bg-black" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <svg 
                                                    key={i} 
                                                    className={clsx(
                                                        "w-2.5 h-2.5",
                                                        i < rating ? "fill-black dark:fill-white" : "fill-neutral-200 dark:fill-neutral-800"
                                                    )}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className={clsx(
                                            "text-[10px] font-bold uppercase tracking-widest transition-colors",
                                            isActive ? "text-black dark:text-white" : "text-neutral-400 group-hover:text-black dark:group-hover:text-white"
                                        )}>
                                            {rating}+ Stars
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Reset Button */}
            <div className="pt-2 pb-8 md:pb-0">
                <button 
                    onClick={clearAllFilters}
                    className={clsx(
                        "w-full py-4 px-6 border text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all duration-500",
                        hasAnyFilter 
                            ? "border-black bg-black text-white hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-100" 
                            : "border-neutral-200 text-neutral-300 pointer-events-none"
                    )}
                >
                    <RotateCcw className={clsx("w-3 h-3", hasAnyFilter && "animate-spin-slow")} />
                    {hasAnyFilter ? "Reset All Filters" : "No Filters Active"}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Search & Action Bar */}
            <motion.div 
                animate={{ 
                    y: isBarVisible ? 0 : -100,
                    opacity: isBarVisible ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="md:hidden sticky top-16 sm:top-20 z-30 mb-8 -mx-4 px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-900 flex items-center gap-3 transition-opacity"
            >
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search arrivals..."
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                updateParams({ q: searchQ || null });
                            }
                        }}
                        className="w-full bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-full py-3 pl-12 pr-10 text-xs font-medium placeholder:text-neutral-400 outline-none focus:bg-white dark:focus:bg-black focus:ring-1 ring-black/5 dark:ring-white/5 transition-all"
                    />
                    {searchQ && (
                        <button 
                            onClick={() => {
                                setSearchQ("");
                                updateParams({ q: null });
                            }}
                            className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsMobileOpen(true)}
                        className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center"
                        title="Filter & Sort"
                    >
                        <ListFilter className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start max-h-[85vh] overflow-y-auto pr-6 custom-scrollbar">
                {renderFilterContent()}
            </aside>

            {/* Mobile Bottom Sheet (Framer Motion) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 max-h-[85vh] h-full bg-white dark:bg-neutral-950 z-50 rounded-t-3xl overflow-y-auto px-6 pt-6 pb-20 md:hidden shadow-2xl"
                        >
                            {renderFilterContent()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
