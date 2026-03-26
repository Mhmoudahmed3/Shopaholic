"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { ProductGallery, ColorVariant } from "./ProductGallery";
import ProductInfo from "./ProductInfo";

const COLOR_HEX_MAP: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    grey: "#9ca3af",
    gray: "#9ca3af",
    charcoal: "#374151",
    navy: "#1e3a8a",
    blue: "#3b82f6",
    "light blue": "#add8e6",
    cream: "#fef3c7",
    camel: "#d97706",
    khaki: "#eab308",
    olive: "#4d7c0f",
    green: "#22c55e",
    emerald: "#10b981",
    burgundy: "#9f1239",
    red: "#ef4444",
    crimson: "#dc143c",
    tan: "#d2b48c",
    brown: "#92400e",
    beige: "#f5f5dc",
    mustard: "#eab308",
    orange: "#f97316",
    pink: "#ec4899",
    purple: "#a855f7",
    multi: "#d1d5db",
    monochrome: "#6b7280",
    default: "#e5e7eb",
};

function resolveHex(colorName: string): string {
    return COLOR_HEX_MAP[colorName.toLowerCase()] ?? "#888888";
}

interface ProductPageClientProps {
    product: Product;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [galleryColor, setGalleryColor] = useState<string>(product.colors[0] ?? "");

    const colorVariants: ColorVariant[] | undefined = (() => {
        if (product.imageVariants && product.imageVariants.length > 0) {
            const withColor = product.imageVariants.filter((v) => v.color);
            if (withColor.length > 0) {
                // Group by color to avoid duplicates
                const uniqueColors = new Map<string, { url: string; color: string }>();
                withColor.forEach(v => {
                    if (!uniqueColors.has(v.color!.toLowerCase())) {
                        uniqueColors.set(v.color!.toLowerCase(), { url: v.url, color: v.color! });
                    }
                });

                return Array.from(uniqueColors.values()).map((v) => ({
                    colorName: v.color,
                    colorHex: resolveHex(v.color),
                    imageSrc: v.url,
                }));
            }
        }
        if (product.colors.length > 1) {
            return product.colors.map((c, i) => ({
                colorName: c,
                colorHex: resolveHex(c),
                imageSrc: product.images[i] || product.images[0],
            }));
        }
        return undefined;
    })();

    const handleIndexChange = (idx: number) => {
        setActiveImageIndex(idx);
        if (colorVariants && colorVariants[idx]) {
            setGalleryColor(colorVariants[idx].colorName);
        }
    };

    const handleInfoColorChange = (color: string) => {
        if (colorVariants) {
            const idx = colorVariants.findIndex(
                (v) => v.colorName.toLowerCase() === color.toLowerCase()
            );
            if (idx !== -1) setActiveImageIndex(idx);
        } else {
            const idx = product.colors.findIndex(
                (c) => c.toLowerCase() === color.toLowerCase()
            );
            if (idx !== -1 && idx < product.images.length) setActiveImageIndex(idx);
        }
        setGalleryColor(color);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Gallery Column */}
            <div className="lg:col-span-7">
                <ProductGallery
                    images={product.images}
                    colorVariants={colorVariants}
                    activeIndex={activeImageIndex}
                    onIndexChange={handleIndexChange}
                />
            </div>

            {/* Info Column (Sticky) */}
            <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-32">
                    <ProductInfo
                        product={product}
                        colorVariants={colorVariants}
                        activeColor={galleryColor}
                        onColorChange={handleInfoColorChange}
                    />
                </div>
            </div>
        </div>
    );
}
