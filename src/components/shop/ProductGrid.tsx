
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { WishlistToggle } from "./WishlistToggle";
import { useState } from "react";
import { QuickAddModal } from "./QuickAddModal";
import { COLOR_MAP_HEX } from "@/lib/constants";
import { Price } from "./Price";

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

    const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        setQuickAddProduct(product);
    };

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h3 className="text-xl font-light mb-2">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-y-8 gap-x-3 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group relative"
                >
                    {/* The over-arching Link should be at a lower z-index than the interactive buttons */}
                    <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10" prefetch={false}>
                        <span className="sr-only">View {product.name}</span>
                    </Link>

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
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${product.images.length > 1 ? 'opacity-100 group-hover:opacity-0' : ''}`}
                            priority={index < 4}
                            loading={index < 4 ? 'eager' : 'lazy'}
                        />

                        {/* Secondary Image (Image Swap Interaction) */}
                        {product.images.length > 1 && (
                            <Image
                                src={product.images[1]}
                                alt={`${product.name} - Alternate View`}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover transition-all duration-1000 opacity-0 group-hover:opacity-100 group-hover:scale-105 absolute inset-0"
                                loading="lazy"
                            />
                        )}
                    </div>

                    {/* Interactive Buttons (Outside the overflow-hidden container and higher z-index than Link) */}
                    <div className="absolute top-4 right-4 z-20">
                        <WishlistToggle 
                            productId={product.id} 
                            className="w-8 h-8 opacity-0 md:group-hover:opacity-100 scale-90 group-hover:scale-100" 
                        />
                    </div>

                    <button 
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="absolute top-14 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full shadow-lg bg-white/90 backdrop-blur-sm text-black opacity-0 md:group-hover:opacity-100 hover:bg-black hover:text-white transition-all duration-300 scale-90 group-hover:scale-100"
                    >
                        <span className="sr-only">Quick Add</span>
                        <Plus className="w-4 h-4" />
                    </button>

                    {/* Minimalist Mobile Buttons */}
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
                            <h3 className="text-sm font-serif group-hover:text-black dark:group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                                {product.name}
                            </h3>
                            <p className="text-sm font-medium tracking-tight whitespace-nowrap"><Price amount={product.price} /></p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <p className="text-[11px] text-neutral-400 uppercase tracking-widest">{product.category}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={clsx(
                                                    "w-2.5 h-2.5",
                                                    i < Math.floor(product.rating || 0) 
                                                        ? "text-amber-400 fill-amber-400" 
                                                        : "text-neutral-200 dark:text-neutral-800"
                                                )} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[9px] text-neutral-400 font-medium">({product.reviewsCount || 0})</span>
                                </div>
                            </div>
                            {/* Small color dots if available */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="flex gap-1.5 items-center mt-2 lg:mt-0">
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
                </motion.div>
            ))}
            <QuickAddModal 
                product={quickAddProduct} 
                onClose={() => setQuickAddProduct(null)} 
            />
        </div>
    );
}
