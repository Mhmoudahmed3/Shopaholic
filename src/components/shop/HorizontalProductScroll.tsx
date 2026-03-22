"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/data";
import { WishlistToggle } from "./WishlistToggle";

import { QuickAddModal } from "./QuickAddModal";

interface HorizontalProductScrollProps {
    title: string;
    products: Product[];
}

export function HorizontalProductScroll({ title, products }: HorizontalProductScrollProps) {
    const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

    const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        setQuickAddProduct(product);
    };

    return (
        <div className="relative w-full py-10">
            <h2 className="text-xl font-serif mb-8 px-4 md:px-0 uppercase tracking-widest">{title}</h2>
            <div className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-8 touch-pan-x">
                {products.map((product, index) => (
                    <div 
                        key={`${product.id}-${index}`}
                        className="flex-none w-[280px] md:w-[350px] group/item relative"
                    >
                        {/* The over-arching Link should be at a lower z-index than the interactive buttons */}
                    <Link 
                        href={`/shop/${product.id}`} 
                        className="absolute inset-0 z-10" 
                        aria-label={`View ${product.name}`}
                        prefetch={false}
                    />

                    <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative">
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
                            <h3 className="text-sm font-serif group-hover/item:text-neutral-600 dark:group-hover/item:text-neutral-400 transition-colors">
                                {product.name}
                            </h3>
                            <span className="text-sm font-medium whitespace-nowrap">
                                {product.price.toLocaleString()} EGP
                            </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                            {product.category}
                        </p>
                        
                        {/* Star Rating Display */}
                        {product.rating && (
                            <div className="flex items-center gap-1 mt-1">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={clsx(
                                                "w-2.5 h-2.5",
                                                i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-neutral-300 dark:text-neutral-700"
                                            )} 
                                        />
                                    ))}
                                </div>
                                <span className="text-[9px] text-neutral-400">({product.reviewsCount || 0})</span>
                            </div>
                        )}
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
