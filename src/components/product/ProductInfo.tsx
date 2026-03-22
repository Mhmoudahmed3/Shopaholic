"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/lib/data";
import { useCartStore } from "@/store/useCartStore";
import { Check, ChevronDown, ShieldCheck, Truck, Star, Minus, Plus, ShoppingBag } from "lucide-react";
import { ColorVariant } from "./ProductGallery";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { WishlistToggle } from "@/components/shop/WishlistToggle";

interface ProductInfoProps {
    product: Product;
    // We allow passing variant data to override default swatches if needed
    colorVariants?: ColorVariant[];
    activeColor?: string;
    onColorChange?: (color: string) => void;
}

export default function ProductInfo({
    product,
    colorVariants,
    activeColor,
    onColorChange,
}: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>(activeColor || "");
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    // If activeColor prop is provided, we use it as source of truth
    const effectiveColor = activeColor || selectedColor || (colorVariants?.[0]?.colorName) || "";

    const [prevColor, setPrevColor] = useState(effectiveColor);
    
    // Reset selected size if it's not available for the new color
    if (effectiveColor !== prevColor) {
        setPrevColor(effectiveColor);
        if (selectedSize) {
            const variant = product.imageVariants?.find(
                (v) => v.color?.toLowerCase() === effectiveColor.toLowerCase() && 
                       v.size?.toLowerCase() === selectedSize.toLowerCase()
            );
            if (!variant || (variant.quantity || 0) <= 0) {
                setSelectedSize("");
            }
        }
    }

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Please select a size");
            return;
        }

        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size: selectedSize,
            color: effectiveColor,
            quantity: quantity,
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    useEffect(() => {
        const handleScroll = () => {
            const addToCartBtn = document.getElementById('main-add-to-cart');
            if (addToCartBtn) {
                const rect = addToCartBtn.getBoundingClientRect();
                // Show sticky bar when the main button is scrolled past
                setShowStickyBar(rect.bottom < 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [openAccordion, setOpenAccordion] = useState<string | null>("details");

    return (
        <div className="flex flex-col">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Essential</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">In Stock</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-6 mb-6">
                    <p className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">{product.price.toLocaleString()} EGP</p>
                    {product.rating && (
                        <div className="flex items-center gap-2 pl-6 border-l border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={clsx(
                                            "w-3 h-3",
                                            i < Math.floor(product.rating || 0) 
                                                ? "text-amber-400 fill-amber-400" 
                                                : "text-neutral-200 dark:text-neutral-800"
                                        )} 
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">{product.rating} ({product.reviewsCount} Reviews)</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {colorVariants && colorVariants.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Select Colour</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-900 dark:text-white">{effectiveColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {colorVariants.map((variant) => {
                            const isActive = effectiveColor.toLowerCase() === variant.colorName.toLowerCase();
                            return (
                                <button
                                    key={variant.colorName}
                                    onClick={() => {
                                        setSelectedColor(variant.colorName);
                                        onColorChange?.(variant.colorName);
                                    }}
                                    className="relative flex flex-col items-center group"
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 p-1",
                                        isActive ? "ring-1 ring-black dark:ring-white ring-offset-4 dark:ring-offset-black" : "ring-1 ring-transparent hover:ring-neutral-200"
                                    )}>
                                        <div 
                                            className={clsx(
                                                "w-full h-full rounded-full shadow-inner",
                                                (variant.colorHex.toLowerCase() === '#000000' || variant.colorHex.toLowerCase() === '#000') && "border border-neutral-800 dark:border-neutral-700"
                                            )}
                                            style={{ backgroundColor: variant.colorHex }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Select Size</h3>
                        <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors border-b border-neutral-200 dark:border-neutral-800">
                            Size Guide
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {product.sizes.map((size) => {
                            // Check stock availability for this specific color-size combo
                            const variant = product.imageVariants?.find(
                                (v) => v.color?.toLowerCase() === effectiveColor.toLowerCase() && 
                                       v.size?.toLowerCase() === size.toLowerCase()
                            );
                            const inStock = variant ? (variant.quantity || 0) > 0 : false;
                            const isSelected = selectedSize === size;

                            return (
                                <button
                                    key={size}
                                    disabled={!inStock}
                                    onClick={() => setSelectedSize(size)}
                                    className={clsx(
                                        "py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300",
                                        isSelected
                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                            : inStock 
                                                ? "bg-neutral-50 dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                                : "bg-neutral-100 dark:bg-neutral-950 text-neutral-300 cursor-not-allowed line-through"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-5">Quantity</h3>
                <div className="flex items-center w-32 border border-neutral-200 dark:border-neutral-800">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex-1 py-3 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                        <Minus className="w-3 h-3 text-neutral-500" />
                    </button>
                    <span className="flex-1 py-3 text-center text-xs font-medium">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex-1 py-3 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                        <Plus className="w-3 h-3 text-neutral-500" />
                    </button>
                </div>
            </div>

            <div className="flex gap-3 mb-12">
                <button
                    id="main-add-to-cart"
                    onClick={handleAddToCart}
                    className="flex-[4] py-5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <span className="relative z-10">{added ? "Successfully Added" : "Add to Cart"}</span>
                    {added ? <Check className="w-4 h-4 relative z-10" /> : (
                        <div className="w-4 h-4 relative z-10 flex items-center justify-center transition-transform group-hover:rotate-90">
                            <div className="w-4 h-0.5 bg-current absolute" />
                            <div className="w-0.5 h-4 bg-current absolute" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                </button>
                
                <WishlistToggle 
                    productId={product.id} 
                    variant="productPage"
                />
            </div>

            {/* Premium Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-sm">
                    <Truck className="w-5 h-5 text-neutral-400" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider">Free Delivery</p>
                        <p className="text-[9px] text-neutral-500">Orders over $300</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-sm">
                    <ShieldCheck className="w-5 h-5 text-neutral-400" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider">2 Year Warranty</p>
                        <p className="text-[9px] text-neutral-500">Premium guarantee</p>
                    </div>
                </div>
            </div>

            {/* Accordions / Extra Info */}
            <div className="border-t border-neutral-100 dark:border-neutral-800">
                {[
                    { id: 'details', title: 'Details & Story', content: product.description },
                    { id: 'shipping', title: 'Shipping & Returns', content: 'Complementary standard shipping on all orders. Returns are accepted within 30 days of delivery.' },
                    { id: 'care', title: 'Materials & Care', content: 'Do not wash. Do not bleach. Do not tumble dry. Cool iron if needed. Professional dry clean only.' }
                ].map((section) => (
                    <div key={section.id} className="border-b border-neutral-100 dark:border-neutral-800">
                        <button 
                            onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                            className="w-full py-6 flex justify-between items-center text-left group"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">{section.title}</span>
                            <ChevronDown className={clsx(
                                "w-4 h-4 text-neutral-300 transition-all duration-500",
                                openAccordion === section.id ? "rotate-180 text-black dark:text-white" : ""
                            )} />
                        </button>
                        <AnimatePresence>
                            {openAccordion === section.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="pb-8 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                                        {section.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Mobile Sticky Add to Cart Bar */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:hidden fixed bottom-[64px] left-0 right-0 z-[50] bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-900 p-4 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.1)] transition-colors"
                    >
                        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-12 h-14 bg-neutral-100 dark:bg-neutral-900 rounded-sm overflow-hidden flex-shrink-0">
                                    <Image 
                                        src={product.images[0]} 
                                        alt={product.name} 
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest truncate">{product.name}</h4>
                                    <p className="text-xs font-light mt-0.5">{product.price.toLocaleString()} EGP</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 max-w-[160px] py-4 bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold tracking-[0.2em] uppercase active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                                {added ? "Added" : "Add to Cart"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
