"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function WishlistIcon() {
    const [mounted, setMounted] = useState(false);
    const count = useWishlistStore((state) => state.items.length);

    useEffect(() => {
         
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="p-2 text-gray-500 relative flex items-center group">
            <Heart className="h-5 w-5" />
        </div>
    );

    const displayCount = count;

    return (
        <Link href="/favorites" className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors relative flex items-center group">
            <Heart className="h-5 w-5 group-hover:fill-current transition-all" />
            {displayCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black transition-all animate-in zoom-in duration-300">
                    {displayCount}
                </span>
            )}
        </Link>
    );
}
