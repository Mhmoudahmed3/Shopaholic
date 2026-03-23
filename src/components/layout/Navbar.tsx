"use client";

import Link from "next/link";
import { User, Search } from "lucide-react";
import { CartIcon } from "./CartIcon";
import { WishlistIcon } from "./WishlistIcon";
import { SearchModal } from "./SearchModal";
import { useSearchStore } from "@/lib/useSearchStore";

export function Navbar() {
    const { open: openSearch } = useSearchStore();

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 transition-all duration-300">
                <div className="mx-auto flex lg:grid lg:grid-cols-3 h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">

                    {/* Left: Logo (Now primary position) */}
                    <div className="flex flex-1 items-center justify-start h-full">
                        <Link href="/" className="text-xl sm:text-2xl font-bold tracking-widest uppercase whitespace-nowrap">
                            SHOPAHOLIC
                        </Link>
                    </div>

                    {/* Center: Spacer (Reserved for potential centered elements) */}
                    <div className="hidden lg:flex flex-1 justify-center items-center" />

                    {/* Right: Actions */}
                    <div className="flex flex-1 lg:flex-none items-center justify-end gap-1 sm:gap-2">

                        <button 
                            onClick={openSearch}
                            className="block p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <Link href="/admin" className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                            <User className="h-5 w-5" />
                        </Link>
                        <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                            <WishlistIcon />
                            <CartIcon />
                        </div>
                    </div>

                </div>
            </header>
            <SearchModal />
        </>
    );
}

