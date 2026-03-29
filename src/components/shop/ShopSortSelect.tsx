"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Clock, ArrowDownWideNarrow, ArrowUpWideNarrow, Zap, Star } from "lucide-react";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest Arrivals", icon: <Clock className="w-3.5 h-3.5" /> },
    { value: "price_asc", label: "Price: Low to High", icon: <ArrowUpWideNarrow className="w-3.5 h-3.5" /> },
    { value: "price_desc", label: "Price: High to Low", icon: <ArrowDownWideNarrow className="w-3.5 h-3.5" /> },
    { value: "popularity", label: "Popularity", icon: <Zap className="w-3.5 h-3.5" /> },
    { value: "rating", label: "Customer Rating", icon: <Star className="w-3.5 h-3.5" /> },
];

export function ShopSortSelect({ initialSort }: { initialSort: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`/shop?${params.toString()}`);
    };

    return (
        <CustomSelect
            label="Sort By"
            value={initialSort}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            className="w-full"
        />
    );
}
