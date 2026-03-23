"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Product } from "@/lib/data";
import { getProductsByIds } from "../actions";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FavoritesPageClient() {
    const { items, removeItem } = useWishlistStore();
    const [mounted, setMounted] = useState(false);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const fetchFavorites = async () => {
            if (items.length > 0) {
                setLoading(true);
                const products = await getProductsByIds(items);
                
                // Sync: remove any stale IDs from the wishlist store that
                // no longer exist in the database, so the badge count stays correct
                const foundIds = new Set(products.map(p => p.id));
                items.forEach(id => {
                    if (!foundIds.has(id)) {
                        removeItem(id);
                    }
                });

                setFavoriteProducts(products);
                setLoading(false);
            } else {
                setFavoriteProducts([]);
                setLoading(false);
            }
        };

        if (mounted) {
            fetchFavorites();
        }
    }, [items, mounted, removeItem]);

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-300 mb-4" />
                <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em]">Curating your collection...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-8"
                >
                    <Heart className="w-10 h-10 text-neutral-300" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-serif mb-4">Your Wishlist is Empty</h1>
                <p className="text-neutral-500 max-w-md mb-10 leading-relaxed">
                    Save your favorite items here to keep track of what you love. 
                    They&apos;ll be waiting for you when you&apos;re ready to make them yours.
                </p>
                <Link 
                    href="/shop" 
                    className="group flex items-center gap-3 py-4 px-8 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all"
                >
                    Explore Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-8 border-b border-neutral-100 dark:border-neutral-900 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif capitalize mb-3 tracking-tight">
                        My Favorites
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-neutral-300 dark:bg-neutral-700"></span>
                        <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                            {items.length} {items.length === 1 ? 'Item' : 'Items'} Saved
                        </p>
                    </div>
                </div>
                
                <Link 
                    href="/cart"
                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors"
                >
                    <ShoppingBag className="w-4 h-4" /> Go to Cart
                </Link>
            </div>

            {/* Content */}
            <ProductGrid products={favoriteProducts} />

            {/* Recommendations or Footer Note */}
            <div className="mt-24 pt-16 border-t border-neutral-100 dark:border-neutral-900 text-center">
                <p className="text-neutral-400 text-xs italic font-serif">
                    &quot;Style is a way to say who you are without having to speak.&quot;
                </p>
            </div>
        </div>
    );
}
