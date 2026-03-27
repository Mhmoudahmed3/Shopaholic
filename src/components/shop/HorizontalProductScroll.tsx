"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import clsx from "clsx";
import { Product } from "@/lib/types";
import { WishlistToggle } from "./WishlistToggle";
import { QuickAddModal } from "./QuickAddModal";
import { COLOR_MAP_HEX } from "@/lib/constants";
import { Price } from "./Price";

interface HorizontalProductScrollProps {
    title?: string;
    products: Product[];
}

export function HorizontalProductScroll({ title, products }: HorizontalProductScrollProps) {
    const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const dragDistanceRef = useRef(0);

    const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        setQuickAddProduct(product);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
        dragDistanceRef.current = 0;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // scroll speed multiplier
        
        // Track displacement to prevent accidental clicks
        dragDistanceRef.current = Math.abs(walk);
        
        e.preventDefault();
        scrollRef.current.scrollLeft = scrollLeftState - walk;
    };

    // Prevent accidental clicks during drag
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
        <div className="relative w-full py-2 md:py-10">
            {title && <h2 className="text-xl font-serif mb-6 md:mb-8 px-4 md:px-0 uppercase tracking-widest">{title}</h2>}
            <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onDragStart={(e) => e.preventDefault()}
                className={clsx(
                    "flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0",
                    isDragging ? "cursor-grabbing select-none" : "cursor-grab scroll-smooth"
                )}
            >
                {products.map((product, index) => (
                    <div 
                        key={`${product.id}-${index}`}
                        className="flex-none w-[260px] md:w-[350px] group/item relative"
                    >
                        {/* The over-arching Link should be at a lower z-index than the interactive buttons */}
                    <Link 
                        href={`/shop/${product.id}`} 
                        className="absolute inset-0 z-10" 
                        aria-label={`View ${product.name}`}
                        prefetch={false}
                    />

                    <div className="aspect-3/4 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative">
                        {product.isNew && (
                            <span className="absolute top-4 left-4 z-20 px-2 py-1 bg-white dark:bg-black text-[9px] font-bold tracking-[0.2em] uppercase shadow-sm">
                                New
                            </span>
                        )}

                        {/* Primary Image */}
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 280px, 350px"
                            draggable={false}
                            className={`object-cover transition-transform duration-1000 group-hover/item:scale-105 ${product.images.length > 1 ? 'opacity-100 group-hover/item:opacity-0' : ''}`}
                        />

                        {/* Secondary Image */}
                        {product.images.length > 1 && (
                            <Image
                                src={product.images[1]}
                                alt={`${product.name} - Alternate View`}
                                fill
                                sizes="(max-width: 768px) 280px, 350px"
                                draggable={false}
                                className="object-cover transition-all duration-1000 opacity-0 group-hover/item:opacity-100 group-hover/item:scale-105 absolute inset-0"
                                loading="lazy"
                            />
                        )}
                    </div>

                    {/* Interactive Buttons (Outside the overflow-hidden container and higher z-index than Link) */}
                    <div className="absolute top-4 right-4 z-20">
                        <WishlistToggle 
                            productId={product.id} 
                            className="w-8 h-8 opacity-0 group-hover/item:opacity-100 scale-90 group-hover/item:scale-100 transition-all duration-300" 
                        />
                    </div>

                    {/* Quick Add overlay button */}
                    <button 
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="absolute top-14 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full shadow-lg bg-white/90 backdrop-blur-sm text-black opacity-0 group-hover/item:opacity-100 hover:bg-black hover:text-white transition-all duration-300 scale-90 group-hover/item:scale-100"
                    >
                        <span className="sr-only">Quick Add</span>
                        <Plus className="w-4 h-4" />
                    </button>

                    {/* Mobile Quick Add */}
                    <div className="md:hidden absolute top-2 right-2 z-20 flex flex-col gap-2">
                        <WishlistToggle 
                            productId={product.id} 
                            className="w-7 h-7 bg-white/80" 
                        />
                        <button 
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="w-7 h-7 bg-white/80 text-black flex items-center justify-center rounded-full shadow-md active:bg-black active:text-white transition-colors relative z-20"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="mt-5 flex flex-col gap-1.5 relative pointer-events-none">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-serif group-hover/item:text-black dark:group-hover/item:text-white transition-all duration-300 group-hover/item:translate-x-1">
                                {product.name}
                            </h3>
                            <span className="text-sm font-medium whitespace-nowrap">
                                <Price amount={product.price} />
                            </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                            {product.category}
                        </p>
                        
                        <div className="flex items-center justify-between w-full mt-1">
                            {/* Star Rating Display */}
                            {product.rating && (
                                <div className="flex items-center gap-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={clsx(
                                                    "w-2.5 h-2.5",
                                                    i < Math.floor(product.rating!) 
                                                        ? "fill-amber-400 text-amber-400" 
                                                        : "text-neutral-200 dark:text-neutral-800"
                                                )} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[9px] text-neutral-400 font-medium tracking-tight">({product.reviewsCount || 0})</span>
                                </div>
                            )}

                            {/* Small color dots if available */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="flex gap-1.5 items-center">
                                    {product.colors.slice(0, 3).map((color, i) => {
                                        const hex = COLOR_MAP_HEX[color] || "#808080";
                                        return (
                                            <div 
                                                key={i} 
                                                title={color}
                                                className="w-2 h-2 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
                                                style={{ backgroundColor: hex }}
                                            />
                                        );
                                    })}
                                    {product.colors.length > 3 && <span className="text-[9px] text-neutral-400 font-medium">+{product.colors.length - 3}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            </div>

            <QuickAddModal 
                product={quickAddProduct} 
                onClose={() => setQuickAddProduct(null)} 
            />
        </div>
    );
}
