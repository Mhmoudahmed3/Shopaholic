"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Heart, ShoppingCart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationKey } from "@/lib/translations";


function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function MobileBottomNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    
    // Store values
    const wishlistCount = useWishlistStore((state) => state.items.length);
    const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems: { label: TranslationKey, icon: any, href: string, count?: number }[] = [
        { label: "home", icon: Home, href: "/" },
        { label: "shop", icon: ShoppingBag, href: "/shop" },
        { label: "wishlist", icon: Heart, href: "/favorites", count: wishlistCount },
        { label: "cart", icon: ShoppingCart, href: "/cart", count: cartCount },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-60 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 pb-safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 w-full max-w-md mx-auto px-2 relative">
                {navItems.map((item) => {
                    const isActive = item.href ? pathname === item.href : false;
                    
                    return (
                        <Link 
                            key={item.label} 
                            href={item.href || "#"} 
                            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobileNavActive"
                                    className="absolute inset-x-2 inset-y-2 bg-neutral-100 dark:bg-zinc-900 rounded-2xl -z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            
                            <div className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                                isActive 
                                    ? "text-black dark:text-white" 
                                    : "text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white"
                            )}>
                                <div className="relative flex items-center justify-center">
                                    <item.icon 
                                        className={cn(
                                            "h-5 w-5 transition-transform duration-500",
                                            isActive && "scale-110"
                                        )} 
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {mounted && item.count !== undefined && item.count > 0 && (
                                        <span className={cn(
                                            "absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-all animate-in zoom-in duration-300",
                                            isActive 
                                                ? "bg-black text-white dark:bg-white dark:text-black" 
                                                : "bg-neutral-200 text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400"
                                        )}>
                                            {item.count}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-[0.05em] leading-none mt-1 transition-all duration-300",
                                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 h-0 -mt-2 overflow-hidden"
                                )}>
                                    {t(item.label)}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
