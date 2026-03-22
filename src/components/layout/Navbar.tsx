"use client";

import Link from "next/link";
import { User, Search } from "lucide-react";
import { CartIcon } from "./CartIcon";
import { WishlistIcon } from "./WishlistIcon";
import { MegaMenu } from "./MegaMenu";
import { SearchModal } from "./SearchModal";
import { useSearchStore } from "@/lib/useSearchStore";

export function Navbar() {
    const { open: openSearch } = useSearchStore();

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="mx-auto flex lg:grid lg:grid-cols-3 h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">

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
                            className="hidden lg:block p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <Link href="/admin" className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                            <User className="h-5 w-5" />
                        </Link>
                        <WishlistIcon />
                        <CartIcon />
                    </div>

                </div>
            </header>
            <SearchModal />
        </>
    );
}

