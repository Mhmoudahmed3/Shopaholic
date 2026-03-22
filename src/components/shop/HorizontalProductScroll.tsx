"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { WishlistToggle } from "./WishlistToggle";

interface HorizontalProductScrollProps {
    products: Product[];
}

export function HorizontalProductScroll({ products }: HorizontalProductScrollProps) {
    return (
        <div className="relative w-full py-10">
            <div className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-8 touch-pan-x">
                {products.map((product, index) => (
                    <div 
                        key={`${product.id}-${index}`}
                        className="flex-none w-[280px] md:w-[350px] group/item relative"
                    >
                        <Link 
                            href={`/shop/${product.id}`} 
                            className="absolute inset-0 z-10" 
                            aria-label={`View ${product.name}`}
                            prefetch={false}
                        />

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
                                sizes="(max-width: 768px) 280px, 350px"
                                className={`object-cover transition-transform duration-1000 group-hover/item:scale-105 ${product.images.length > 1 ? 'opacity-100 group-hover/item:opacity-0' : ''}`}
                            />

                            {/* Secondary Image */}
                            {product.images.length > 1 && (
                                <Image
                                    src={product.images[1]}
                                    alt={`${product.name} - Alternate View`}
                                    fill
                                    sizes="(max-width: 768px) 280px, 350px"
                                    className="object-cover transition-all duration-1000 opacity-0 group-hover/item:opacity-100 group-hover/item:scale-105 absolute inset-0"
                                />
                            )}

                            {/* Wishlist Toggle */}
                            <div className="absolute top-4 right-4 z-20">
                                <WishlistToggle 
                                    productId={product.id} 
                                    className="w-8 h-8 opacity-0 group-hover/item:opacity-100 scale-90 group-hover/item:scale-100 transition-all duration-300" 
                                />
                            </div>

                            {/* Mobile Quick Add */}
                            <div className="md:hidden absolute top-2 right-2 z-20 flex flex-col gap-2">
                                <WishlistToggle 
                                    productId={product.id} 
                                    className="w-7 h-7 bg-white/80" 
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-1.5 relative pointer-events-none">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-serif group-hover/item:text-neutral-600 dark:group-hover/item:text-neutral-400 transition-colors">
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
