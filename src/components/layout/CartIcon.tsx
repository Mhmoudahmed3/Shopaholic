"use client";

import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartIcon() {
    const [mounted, setMounted] = useState(false);
    const count = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="p-2 text-gray-500 relative flex items-center">
            <ShoppingBag className="h-5 w-5" />
        </div>
    );

    const displayCount = count;

    return (
        <Link href="/cart" className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors relative flex items-center">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black transition-colors">
                {displayCount}
            </span>
        </Link>
    );
}
