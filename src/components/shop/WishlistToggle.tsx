"use client";

import { useState, useEffect } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Heart } from "lucide-react";
import clsx from "clsx";

interface WishlistToggleProps {
    productId: string;
    className?: string;
    variant?: 'default' | 'productPage';
}

export function WishlistToggle({ productId, className, variant = 'default' }: WishlistToggleProps) {
    const { toggleItem, items } = useWishlistStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const isFavorite = mounted && items.includes(productId);

    if (!mounted) {
        return (
            <button className={clsx(
                "flex items-center justify-center cursor-wait opacity-50",
                variant === 'default' ? "rounded-full bg-white/90 text-black" : "w-16 flex-none border border-neutral-200 dark:border-neutral-800",
                className
            )}>
                <Heart className={variant === 'default' ? "w-4 h-4" : "w-5 h-5"} />
            </button>
        );
    }

    const defaultStyles = isFavorite 
        ? "bg-black text-white dark:bg-white dark:text-black shadow-lg rounded-full" 
        : "bg-white/90 backdrop-blur-sm text-black hover:bg-black hover:text-white rounded-full";

    const productPageStyles = isFavorite
        ? "w-16 flex-none border border-black bg-black text-white dark:bg-white dark:border-white dark:text-black"
        : "w-16 flex-none border border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white hover:border-black dark:hover:border-white";

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(productId);
            }}
            className={clsx(
                "z-30 flex items-center justify-center transition-all duration-300",
                variant === 'default' ? defaultStyles : productPageStyles,
                className
            )}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart 
                className={clsx(
                    "transition-all duration-300", 
                    isFavorite ? "fill-current scale-110" : "scale-100 opacity-80",
                    // Inherit icon size or default to w-4 h-4
                    className?.includes('text-lg') || className?.includes('p-4') ? "w-5 h-5" : "w-4 h-4"
                )} 
            />
        </button>
    );
}
