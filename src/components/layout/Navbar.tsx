"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { User, Search, Heart } from "lucide-react";
import { CartIcon } from "./CartIcon";
import { WishlistIcon } from "./WishlistIcon";
import { SearchModal } from "./SearchModal";
import { useSearchStore } from "@/lib/useSearchStore";
import { SettingsDropdown } from "./SettingsDropdown";
import { useAuthStore } from "@/store/useAuthStore";

export function Navbar({ storeName = "SHOPOHOLIC" }: { storeName?: string }) {
    const { open: openSearch } = useSearchStore();
    const { user, isAuthenticated } = useAuthStore();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Only apply hide logic on mobile (screens < 1024px)
            if (window.innerWidth < 1024) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
            } else {
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const profileHref = isAuthenticated 
        ? (user?.role === "admin" ? "/admin" : "/account")
        : "/account";

    return (
        <>
            <motion.header 
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 transition-colors duration-300"
            >
                <div className="mx-auto flex lg:grid lg:grid-cols-3 h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">

                    {/* Left: Logo */}
                    <div className="flex flex-1 items-center justify-start h-full">
                        <Link href="/" className="text-xl sm:text-2xl font-bold tracking-widest uppercase whitespace-nowrap">
                            {storeName}
                        </Link>
                    </div>

                    {/* Center: Spacer */}
                    <div className="hidden lg:flex flex-1 justify-center items-center" />

                    {/* Right: Actions */}
                    <div className="flex flex-1 lg:flex-none items-center justify-end gap-1 sm:gap-2">

                        <button 
                            onClick={openSearch}
                            className="block p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            <SettingsDropdown />
                            <Link href={profileHref} className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                                <User className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                            {isAuthenticated ? (
                                <WishlistIcon />
                            ) : (
                                <div className="p-2 text-gray-300 dark:text-zinc-700 cursor-not-allowed opacity-40 hover:opacity-100 transition-opacity" title="Login to view wishlist">
                                    <Heart className="h-5 w-5" />
                                </div>
                            )}
                            <CartIcon />
                        </div>
                    </div>

                </div>
            </motion.header>
            {/* Add a spacer to prevent layout shift since we changed sticky to fixed */}
            <div className="h-16 sm:h-20 w-full" />
            <SearchModal />
        </>
    );
}

