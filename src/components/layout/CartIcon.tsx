"use client";

import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Selector defined outside the component so it's referentially stable
const selectItemCount = (state: ReturnType<typeof useCartStore.getState>) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0);

export function CartIcon() {
    const [mounted, setMounted] = useState(false);
    // Only re-renders when the *count* changes, not on every cart mutation
    const count = useCartStore(selectItemCount);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-2 text-gray-500 relative flex items-center">
                <ShoppingBag className="h-5 w-5" />
            </div>
        );
    }

    return (
        <Link
            href="/cart"
            className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors relative flex items-center"
        >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black transition-colors">
                    {count}
                </span>
            )}
        </Link>
    );
}
