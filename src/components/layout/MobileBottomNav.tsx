"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function MobileBottomNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    
    // Store values
    const wishlistCount = useWishlistStore((state) => state.items.length);
    const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { label: "Home", icon: Home, href: "/" },
        { label: "Shop", icon: ShoppingBag, href: "/shop" },
        { label: "Wishlist", icon: Heart, href: "/favorites", count: wishlistCount },
        { label: "Cart", icon: ShoppingBag, href: "/cart", count: cartCount },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-900 pb-safe-area-inset-bottom shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = item.href ? pathname === item.href : false;
                    
                    const Content = (
                        <div className={cn(
                            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300",
                            isActive 
                                ? "text-black dark:text-white" 
                                : "text-neutral-400 dark:text-neutral-600 hover:text-black dark:hover:text-white"
                        )}>
                            <div className="relative">
                                <item.icon 
                                    className={cn(
                                        "h-5 w-5 transition-transform duration-300",
                                        isActive && "scale-110"
                                    )} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {mounted && item.count !== undefined && item.count > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black transition-all animate-in zoom-in duration-300">
                                        {item.count}
                                    </span>
                                )}
                                {isActive && (
                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full animate-in fade-in zoom-in duration-300" />
                                )}
                            </div>
                            <span className="text-[10px] font-medium uppercase tracking-[0.05em] leading-none mt-0.5">
                                {item.label}
                            </span>
                        </div>
                    );



                    return (
                        <Link key={item.label} href={item.href || "#"}>
                            {Content}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
