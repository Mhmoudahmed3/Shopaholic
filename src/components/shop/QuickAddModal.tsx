"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { useEffect } from "react";
import clsx from "clsx";
import { COLOR_MAP_HEX } from "@/lib/constants";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Price } from "@/components/shop/Price";

interface QuickAddModalProps {
    product: Product | null;
    onClose: () => void;
}

const MODAL_VARIANTS = {
    backdrop: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit:    { opacity: 0 },
    },
    panel: {
        initial: (isMobile: boolean) => ({ 
            opacity: isMobile ? 1 : 0, 
            y: isMobile ? "100%" : 20,
            scale: isMobile ? 1 : 0.9 
        }),
        animate: { 
            opacity: 1, 
            y: 0, 
            scale: 1 
        },
        exit: (isMobile: boolean) => ({ 
            opacity: isMobile ? 1 : 0, 
            y: isMobile ? "100%" : 20,
            scale: isMobile ? 1 : 0.9 
        }),
    },
} as const;

export function QuickAddModal({ product, onClose }: QuickAddModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [isMobile, setIsMobile] = useState(false);

    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; desc: string }>({ open: false, title: "", desc: "" });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (product) {
            setSelectedSize(product.sizes?.[0] ?? "");
            setSelectedColor(product.colors?.[0] ?? "");
            setQuantity(1);
            setAdded(false);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [product]);

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        if (!selectedSize && product.sizes?.length > 0) {
            setAlertModal({
                open: true,
                title: "Select Size",
                desc: "Please select a size to continue."
            });
            return;
        }
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size: selectedSize,
            color: selectedColor,
            quantity,
        });
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 1500);
    }, [product, selectedSize, selectedColor, quantity, addItem, onClose]);

    const decrement = useCallback(() => setQuantity((q) => Math.max(1, q - 1)), []);
    const increment = useCallback(() => setQuantity((q) => q + 1), []);

    return (
        <AnimatePresence mode="wait">
            {product && (
                <div key={`quick-add-${product.id}`} className="fixed inset-0 z-100 flex items-end md:items-center justify-center md:p-4">
                    {/* Backdrop */}
                    <motion.div
                        {...MODAL_VARIANTS.backdrop}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        custom={isMobile}
                        variants={MODAL_VARIANTS.panel}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden rounded-t-[2.5rem] md:rounded-3xl"
                    >
                        {/* Drag Handle for Mobile */}
                        <div className="md:hidden flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-6 z-10 p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col h-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto overflow-x-hidden">
                            {/* Product Summary Header (Mobile Only) */}
                            <div className="md:hidden p-6 pb-0 flex gap-4 items-center">
                                <div className="relative w-20 aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden shrink-0">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-serif truncate">{product.name}</h2>
                                    <p className="text-lg font-medium">
                                        <Price amount={product.price} />
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row h-full">
                                {/* Large Image (Desktop Only) */}
                                <div className="hidden md:block relative aspect-3/4 md:w-1/2 bg-neutral-100 dark:bg-neutral-800">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        sizes="50vw"
                                        className="object-cover"
                                    />
                                </div>

                                {/* Options */}
                                <div className="p-6 md:p-8 md:w-1/2 flex flex-col">
                                    {/* Name/Price (Desktop Only) */}
                                    <div className="hidden md:block mb-6">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">
                                            Handcrafted Essential
                                        </p>
                                        <h2 className="text-2xl font-serif mb-2">{product.name}</h2>
                                        <p className="text-xl font-medium">
                                            <Price amount={product.price} />
                                        </p>
                                    </div>

                                    {/* Color Selection - Premium Dots */}
                                    {product.colors?.length > 1 && (
                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[11px] uppercase tracking-widest font-bold opacity-40">Color</h3>
                                                <span className="text-[11px] font-bold uppercase tracking-widest">{selectedColor}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 items-center">
                                                {product.colors.map((color, idx) => {
                                                    const hex = COLOR_MAP_HEX[color] ?? "#808080";
                                                    const isActive = selectedColor === color;
                                                    return (
                                                        <button
                                                            key={`${product.id}-color-${color || idx}`}
                                                            onClick={() => setSelectedColor(color)}
                                                            className="group relative flex items-center justify-center p-1"
                                                            title={color}
                                                        >
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeColor"
                                                                    className="absolute inset-0 border border-black dark:border-white rounded-full"
                                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                                />
                                                            )}
                                                            <div
                                                                className={clsx(
                                                                    "w-7 h-7 rounded-full transition-all duration-300 border border-black/5 dark:border-white/10 shadow-sm",
                                                                    isActive ? "scale-90" : "scale-100 group-hover:scale-90"
                                                                )}
                                                                style={{ backgroundColor: hex }}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Size Selection - Premium Grid */}
                                    {product.sizes?.length > 0 && (
                                        <div className="mb-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[11px] uppercase tracking-widest font-bold opacity-40">Size</h3>
                                                <span className="text-[11px] font-bold uppercase tracking-widest">{selectedSize}</span>
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                {product.sizes.map((size, idx) => (
                                                    <button
                                                        key={`${product.id}-size-${size || idx}`}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={clsx(
                                                            "h-12 text-xs font-bold border transition-all duration-300 flex items-center justify-center rounded-xl",
                                                            selectedSize === size
                                                                ? "bg-black text-white border-black dark:bg-white dark:text-black"
                                                                : "border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:border-black dark:hover:border-white"
                                                        )}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Group */}
                                    <div className="mt-auto space-y-4">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-2xl">
                                            <button
                                                onClick={decrement}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-sm font-bold tracking-widest">{quantity}</span>
                                            <button
                                                onClick={increment}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={added}
                                            className={clsx(
                                                "w-full h-16 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-4 relative overflow-hidden group shadow-lg shadow-black/5 dark:shadow-white/5",
                                                added
                                                    ? "bg-black text-white dark:bg-neutral-800"
                                                    : "bg-black text-white dark:bg-white dark:text-black active:scale-[0.98]"
                                            )}
                                        >
                                            <AnimatePresence mode="wait">
                                                {added ? (
                                                    <motion.div
                                                        key="added"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex items-center gap-2 text-green-400"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                        <span>Added to Bag</span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="add"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                        <span>Add to Cart</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            <ConfirmModal
                key="quick-add-alert-modal"
                isOpen={alertModal.open}
                onClose={() => setAlertModal(p => ({ ...p, open: false }))}
                title={alertModal.title}
                description={alertModal.desc}
                confirmText="Got it"
                showCancel={false}
                variant="info"
            />
        </AnimatePresence>
    );
}
