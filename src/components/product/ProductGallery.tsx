"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ColorVariant {
    colorName: string;
    colorHex: string;
    imageSrc: string;
}

interface ProductGalleryProps {
    images: string[];
    colorVariants?: ColorVariant[];
    /** Optional controlled index (used when parent drives the active image) */
    activeIndex?: number;
    /** Called when the user changes image via arrows / thumbnails */
    onIndexChange?: (index: number) => void;
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

interface ThumbnailProps {
    src: string;
    index: number;
    isActive: boolean;
    onClick: (index: number) => void;
}

function Thumbnail({ src, index, isActive, onClick }: ThumbnailProps) {
    return (
        <button
            onClick={() => onClick(index)}
            className={`relative aspect-[3/4] w-full overflow-hidden transition-all duration-500 rounded-[2px] ${
                isActive
                    ? "ring-1 ring-black dark:ring-white ring-offset-2 dark:ring-offset-black opacity-100"
                    : "opacity-40 hover:opacity-100"
            }`}
        >
            <Image src={src} alt={`Thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" loading="lazy" />
        </button>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductGallery({
    images,
    colorVariants,
    activeIndex,
    onIndexChange,
}: ProductGalleryProps) {
    const [internalIndex, setInternalIndex] = useState(0);
    const currentIndex = activeIndex !== undefined ? activeIndex : internalIndex;

    const [displayedSrc, setDisplayedSrc] = useState(images[0]);

    // Color-wash burst state
    const [burstColor, setBurstColor] = useState<string | null>(null);
    const [burstVisible, setBurstVisible] = useState(false);

    const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (fadeTimer.current) clearTimeout(fadeTimer.current);
            if (burstTimer.current) clearTimeout(burstTimer.current);
        };
    }, []);

    const handleImageInteraction = useCallback(
        (newSrc: string, hex: string | null) => {
            if (hex) {
                setBurstColor(hex);
                setBurstVisible(true);
                if (burstTimer.current) clearTimeout(burstTimer.current);
                burstTimer.current = setTimeout(() => setBurstVisible(false), 800);
            }
            if (newSrc !== displayedSrc) {
                if (fadeTimer.current) clearTimeout(fadeTimer.current);
                fadeTimer.current = setTimeout(() => setDisplayedSrc(newSrc), 350);
            }
        },
        [displayedSrc]
    );

    // Sync displayed image when the controlled index changes (e.g., color swatch click)
    useEffect(() => {
        const variant = colorVariants?.[currentIndex];
        const src = variant?.imageSrc ?? images[currentIndex];
        const hex = variant?.colorHex ?? null;
        if (src) handleImageInteraction(src, hex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, colorVariants]);

    const setIndex = useCallback(
        (next: number) => {
            setInternalIndex(next);
            onIndexChange?.(next);
            const src = colorVariants ? (colorVariants[next]?.imageSrc ?? images[next]) : images[next];
            if (src) handleImageInteraction(src, null);
        },
        [colorVariants, images, handleImageInteraction, onIndexChange]
    );

    const nextImage = useCallback(
        () => setIndex((currentIndex + 1) % images.length),
        [currentIndex, images.length, setIndex]
    );
    const prevImage = useCallback(
        () => setIndex((currentIndex - 1 + images.length) % images.length),
        [currentIndex, images.length, setIndex]
    );

    const hasMultiple = images.length > 1;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* ── Thumbnails (Desktop: Vertical Sidebar) ── */}
                {hasMultiple && (
                    <div className="hidden lg:flex flex-col gap-4 w-20 flex-shrink-0">
                        {images.map((img, idx) => (
                            <Thumbnail
                                key={img}
                                src={img}
                                index={idx}
                                isActive={currentIndex === idx}
                                onClick={setIndex}
                            />
                        ))}
                    </div>
                )}

                {/* ── Main Image Frame ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 relative aspect-[3/4] bg-neutral-50 dark:bg-neutral-900 overflow-hidden group"
                >
                    {/* Cross-fade layer */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={displayedSrc}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 touch-pan-y"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x > 100) prevImage();
                                else if (info.offset.x < -100) nextImage();
                            }}
                        >
                            <Image
                                src={displayedSrc}
                                alt="Product Image"
                                fill
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 select-none pointer-events-none"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Color-wash radial burst overlay */}
                    <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{
                            background: burstColor
                                ? `radial-gradient(circle at 50% 100%, ${burstColor}33 0%, transparent 70%)`
                                : "transparent",
                            opacity: burstVisible ? 1 : 0,
                            transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    />

                    {/* Navigation Arrows (Desktop Only) */}
                    {hasMultiple && (
                        <div className="hidden lg:block">
                            <button
                                onClick={prevImage}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 dark:bg-black/10 hover:bg-white/90 dark:hover:bg-black/90 text-black dark:text-white backdrop-blur-md rounded-full z-20 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-500"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 dark:bg-black/10 hover:bg-white/90 dark:hover:bg-black/90 text-black dark:text-white backdrop-blur-md rounded-full z-20 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-500"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Mobile Pagination Dots */}
                    {hasMultiple && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 lg:hidden">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        currentIndex === idx
                                            ? "bg-black dark:bg-white w-4"
                                            : "bg-black/20 dark:bg-white/20 w-1.5"
                                    }`}
                                    aria-label={`Image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Expand Button */}
                    <button className="absolute bottom-6 right-6 p-4 bg-white/10 dark:bg-black/10 hover:bg-white dark:hover:bg-black text-black dark:text-white backdrop-blur-sm rounded-full z-20 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-500">
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* ── Thumbnails (Mobile: Horizontal Scroll) ── */}
                {hasMultiple && (
                    <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={img}
                                onClick={() => setIndex(idx)}
                                className={`relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden rounded-[2px] transition-all duration-300 ${
                                    currentIndex === idx
                                        ? "ring-1 ring-black dark:ring-white ring-offset-2 dark:ring-offset-black"
                                        : "opacity-60"
                                }`}
                            >
                                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" loading="lazy" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
