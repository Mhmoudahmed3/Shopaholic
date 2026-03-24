"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { Minus, Plus, X, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Price } from "@/components/shop/Price";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();

    useEffect(() => {
         
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 px-4 text-center">
                <h1 className="text-3xl font-light tracking-tight mb-4">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-8">Discover our latest essentials to complete your look.</p>
                <Link
                    href="/shop"
                    className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black font-medium tracking-widest uppercase hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 250;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-2 mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">Shopping Experience</span>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight">Your Selection</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="space-y-12">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative flex gap-8 pb-12 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                                    >
                                        <div className="relative w-32 h-44 md:w-40 md:h-56 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 768px) 128px, 160px"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col justify-between flex-1 py-1">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-light tracking-tight text-black dark:text-white">
                                                        <Link href={`/shop/${item.productId}`} className="hover:opacity-60 transition-opacity">
                                                            {item.name}
                                                        </Link>
                                                    </h3>
                                                    <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-widest text-zinc-500">
                                                        <span>Color: <span className="text-black dark:text-white">{item.color || 'Standard'}</span></span>
                                                        <span>Size: <span className="text-black dark:text-white">{item.size || 'One Size'}</span></span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-100 dark:border-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                                    aria-label="Remove item"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap justify-between items-end gap-6">
                                                <div className="flex items-center gap-1">
                                                    <div className="flex items-center border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-30"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-10 text-center text-xs font-medium tabular-nums">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Total</p>
                                                    <p className="text-xl font-medium tracking-tight"><Price amount={item.price * item.quantity} /></p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-24 space-y-8">
                            {/* Shipping Progress */}
                            <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Truck className="w-4 h-4 text-zinc-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                        {subtotal >= 5000 ? "Complementary Shipping Unlocked" : `Add ${5000 - subtotal} EGP for free shipping`}
                                    </span>
                                </div>
                                <div className="h-1 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                                        className="h-full bg-black dark:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50 p-8 md:p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <ShoppingBag className="w-32 h-32" />
                                </div>

                                <h2 className="text-xs font-bold tracking-[0.4em] uppercase mb-10 pb-4 border-b border-zinc-100 dark:border-zinc-900">Summary</h2>

                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                                        <span className="font-medium tracking-tight"><Price amount={subtotal} /></span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Shipping</span>
                                        <span className="font-medium tracking-tight">{shipping === 0 ? 'Free' : <Price amount={shipping} />}</span>
                                    </div>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-8" />
                                    <div className="flex justify-between items-center text-black dark:text-white">
                                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Total</span>
                                        <span className="text-3xl font-light tracking-tighter"><Price amount={total} /></span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Link
                                        href="/checkout"
                                        className="group w-full flex items-center justify-center gap-4 py-5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold tracking-[0.5em] uppercase hover:opacity-80 transition-all shadow-xl shadow-black/5 dark:shadow-white/5"
                                    >
                                        Proceed to Checkout 
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <p className="text-[10px] text-center text-zinc-400 tracking-widest uppercase py-4">
                                        Secure encypted transaction
                                    </p>
                                </div>
                            </div>

                            <Link 
                                href="/shop" 
                                className="block text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                ← Continue Selecting
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
