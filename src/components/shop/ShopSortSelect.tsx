"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CustomSelect } from "@/components/ui/CustomSelect";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popularity", label: "Popularity" },
    { value: "rating", label: "Customer Rating" },
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
