"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Price } from "@/components/shop/Price";

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-12">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-1">
                    <div className="border-t border-gray-200 dark:border-gray-800">
                        {items.map((item) => (
                            <div key={item.id} className="flex py-6 border-b border-gray-200 dark:border-gray-800">
                                <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 bg-gray-100 dark:bg-gray-900">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 96px, 128px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="ml-4 md:ml-6 flex flex-col justify-between flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                                                <Link href={`/shop/${item.productId}`}>{item.name}</Link>
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Color: {item.color || 'Standard'}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Size: {item.size || 'One Size'}</p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"
                                            aria-label="Remove item"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <div className="flex items-center border border-gray-200 dark:border-gray-800">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-3 py-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-3 py-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="font-medium"><Price amount={item.price * item.quantity} /></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 md:p-8">
                        <h2 className="text-lg font-medium tracking-wide uppercase mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-medium"><Price amount={subtotal} /></span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="font-medium">{shipping === 0 ? 'Free' : <Price amount={shipping} />}</span>
                            </div>
                            {shipping > 0 && (
                                <p className="text-xs text-gray-500">Free shipping on orders over 5,000 EGP</p>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-base font-medium uppercase tracking-wider">Total</span>
                            <span className="text-xl font-medium"><Price amount={total} /></span>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white dark:bg-white dark:text-black text-sm font-medium tracking-widest uppercase hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        >
                            Proceed to Checkout <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
