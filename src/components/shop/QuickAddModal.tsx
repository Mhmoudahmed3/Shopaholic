"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/data";
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
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit:    { opacity: 0, scale: 0.9, y: 20 },
    },
} as const;

export function QuickAddModal({ product, onClose }: QuickAddModalProps) {
    const addItem = useCartStore((state) => state.addItem);

    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; desc: string }>({ open: false, title: "", desc: "" });

    // Sync selections and body-overflow lock whenever the product changes
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
                <div key={`quick-add-${product.id}`} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        {...MODAL_VARIANTS.backdrop}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        {...MODAL_VARIANTS.panel}
                        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
                            {/* Image */}
                            <div className="relative aspect-[3/4] md:w-1/2 bg-neutral-100 dark:bg-neutral-800">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>

                            {/* Options */}
                            <div className="p-6 md:w-1/2 flex flex-col justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">
                                    Essential
                                </p>
                                <h2 className="text-xl font-serif mb-2">{product.name}</h2>
                                <p className="text-lg font-medium mb-4">
                                    <Price amount={product.price} />
                                </p>

                                {/* Size */}
                                {product.sizes?.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-[10px] uppercase tracking-widest font-bold">Size</h3>
                                            <span className="text-[10px] text-neutral-400">{selectedSize}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sizes.map((size, idx) => (
                                                <button
                                                    key={`${product.id}-size-${size || idx}`}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={clsx(
                                                        "px-3 py-2 text-[10px] font-bold border transition-all duration-300 min-w-10 h-10 flex items-center justify-center",
                                                        selectedSize === size
                                                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                                            : "border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white"
                                                    )}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color */}
                                {product.colors?.length > 1 && (
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-[10px] uppercase tracking-widest font-bold">Color</h3>
                                            <span className="text-[10px] text-neutral-400 capitalize">{selectedColor}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            {product.colors.map((color, idx) => {
                                                const hex = COLOR_MAP_HEX[color] ?? "#808080";
                                                const isActive = selectedColor === color;
                                                return (
                                                    <button
                                                        key={`${product.id}-color-${color || idx}`}
                                                        onClick={() => setSelectedColor(color)}
                                                        className="group relative flex items-center justify-center"
                                                        title={color}
                                                    >
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="activeColor"
                                                                className="absolute -inset-1.5 border border-black dark:border-white rounded-full"
                                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                            />
                                                        )}
                                                        <div
                                                            className={clsx(
                                                                "w-6 h-6 rounded-full transition-transform duration-300 border border-black/5 dark:border-white/10",
                                                                isActive ? "scale-100" : "scale-90 group-hover:scale-100"
                                                            )}
                                                            style={{ backgroundColor: hex }}
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity */}
                                <div className="mb-8">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold mb-2">Quantity</h3>
                                    <div className="flex items-center w-32 border border-neutral-200 dark:border-neutral-800">
                                        <button
                                            onClick={decrement}
                                            className="flex-1 py-2 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-r border-neutral-200 dark:border-neutral-800"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="flex-[1.5] text-center text-xs font-bold">{quantity}</span>
                                        <button
                                            onClick={increment}
                                            className="flex-1 py-2 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-l border-neutral-200 dark:border-neutral-800"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={added}
                                    className={clsx(
                                        "w-full h-14 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-between group overflow-hidden pl-8 pr-4",
                                        added
                                            ? "bg-green-600 text-white"
                                            : "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100"
                                    )}
                                >
                                    <span className="flex-1 text-center">
                                        {added ? "Successfully Added" : "Add to Cart"}
                                    </span>
                                    <div
                                        className={clsx(
                                            "w-10 h-10 border flex items-center justify-center transition-colors",
                                            added ? "border-white/20" : "border-white/20 dark:border-black/20"
                                        )}
                                    >
                                        {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                    </div>
                                </button>
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
