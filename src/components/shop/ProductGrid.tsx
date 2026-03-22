
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/data";
import { WishlistToggle } from "./WishlistToggle";

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
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
                    <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10" prefetch={false}>
                        <span className="sr-only">View {product.name}</span>
                    </Link>

                    <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative z-0">
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${product.images.length > 1 ? 'opacity-100 group-hover:opacity-0' : ''}`}
                        />

                        {/* Secondary Image (Image Swap Interaction) */}
                        {product.images.length > 1 && (
                            <Image
                                src={product.images[1]}
                                alt={`${product.name} - Alternate View`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-all duration-1000 opacity-0 group-hover:opacity-100 group-hover:scale-105 absolute inset-0"
                            />
                        )}

                        {/* Wishlist Toggle (Top Right) */}
                        <div className="absolute top-4 right-4 z-20">
                            <WishlistToggle 
                                productId={product.id} 
                                className="w-8 h-8 opacity-0 md:group-hover:opacity-100 scale-90 group-hover:scale-100" 
                            />
                        </div>

                        {/* Quick Add Overlay Button (Below Wishlist) */}
                        <button className="absolute top-14 right-4 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm text-black flex items-center justify-center rounded-full shadow-lg opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white scale-90 group-hover:scale-100">
                            <span className="sr-only">Quick Add</span>
                            <Plus className="w-4 h-4" />
                        </button>

                        {/* Minimalist Mobile Buttons */}
                        <div className="md:hidden absolute top-2 right-2 z-20 flex flex-col gap-2">
                            <WishlistToggle 
                                productId={product.id} 
                                className="w-7 h-7 bg-white/80" 
                            />
                            <button className="w-7 h-7 bg-white/80 text-black flex items-center justify-center rounded-full shadow-md active:bg-black active:text-white transition-colors relative z-20">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-5 flex flex-col gap-1.5 relative pointer-events-none">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-serif group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-sm font-medium tracking-tight whitespace-nowrap">{product.price.toLocaleString()} EGP</p>
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
                                <div className="flex gap-1">
                                    {product.colors.slice(0, 3).map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                    ))}
                                    {product.colors.length > 3 && <span className="text-[8px] text-neutral-400">+{product.colors.length - 3}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
