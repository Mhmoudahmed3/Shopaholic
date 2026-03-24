"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, CreditCard, Apple, Banknote, QrCode, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Price } from "@/components/shop/Price";
import { createOrder } from "../actions";

export default function CheckoutPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { items, getCartTotal, clearCart } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("credit-card");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (items.length === 0) {
            router.push("/cart");
        }
    }, [items.length, router]);

    if (!mounted || items.length === 0) return null;

    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 250;
    const total = subtotal + shipping;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;

        const orderData = {
            customer_name: `${firstName} ${lastName}`,
            email,
            phone,
            items_count: items.reduce((sum, item) => sum + item.quantity, 0),
            total_amount: total,
            status: 'Processing',
            items: items // Pass the full items array
        };

        const result = await createOrder(orderData);
        
        if (result.success) {
            clearCart();
            setIsProcessing(false);
            setShowSuccessModal(true);
        } else {
            setIsProcessing(false);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        router.push("/");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

            <div className="flex flex-col mb-12">
                <h1 className="text-3xl font-light tracking-tight mb-2">Checkout</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium tracking-wide">
                    <Lock className="w-4 h-4" /> Secure Payment
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

                {/* Checkout Form */}
                <div className="flex-1 order-2 lg:order-1">
                    <form id="checkout-form" onSubmit={handleCheckout} className="space-y-12">

                        {/* Contact */}
                        <section>
                            <h2 className="text-lg font-medium tracking-wide uppercase mb-6">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="sr-only">Email address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Email address"
                                            required
                                            className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="sr-only">Phone number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="Phone number"
                                            required
                                            className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Shipping */}
                        <section>
                            <h2 className="text-lg font-medium tracking-wide uppercase mb-6">Shipping Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First name"
                                    required
                                    className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last name"
                                    required
                                    className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Address"
                                    required
                                    className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors md:col-span-2"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    required
                                    className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Postal code"
                                    required
                                    className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                />
                            </div>
                        </section>

                        {/* Payment */}
                        <section>
                            <h2 className="text-lg font-medium tracking-wide uppercase mb-6">Payment Method</h2>

                            <div className="space-y-4">
                                {/* Payment Options */}
                                <div className="border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">

                                    {/* Custom Radio Option Component used in multiple places below */}
                                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                        
                                        {/* Credit Card */}
                                        <div 
                                            className="cursor-pointer"
                                            onClick={() => setPaymentMethod("credit-card")}
                                        >
                                            <div className={`flex items-center p-5 transition-colors ${paymentMethod === "credit-card" ? "bg-gray-50/50 dark:bg-zinc-900/40" : "hover:bg-gray-50 dark:hover:bg-zinc-900/20"}`}>
                                                <div className="mr-5 relative flex items-center justify-center">
                                                    <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${paymentMethod === "credit-card" ? "border-black dark:border-white bg-black dark:bg-white" : "border-gray-300 dark:border-gray-700"}`}>
                                                        {paymentMethod === "credit-card" && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-2 h-2 rounded-full bg-white dark:bg-black"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <CreditCard className={`w-5 h-5 mr-3 ${paymentMethod === "credit-card" ? "text-black dark:text-white" : "text-gray-400"}`} />
                                                <span className={`font-medium text-sm tracking-wide ${paymentMethod === "credit-card" ? "text-black dark:text-white" : "text-gray-500"}`}>Credit Card</span>
                                            </div>
                                            
                                            {/* Fake Card Form (Expanded when selected) */}
                                            <AnimatePresence>
                                                {paymentMethod === "credit-card" && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-gray-50 dark:bg-zinc-950/30"
                                                    >
                                                        <div className="p-6 pt-0 space-y-4 ml-10">
                                                            <div className="space-y-4 max-w-md">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Card number"
                                                                    required
                                                                    className="w-full p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm"
                                                                />
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="MM / YY"
                                                                        required
                                                                        className="w-full p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="CVC"
                                                                        required
                                                                        className="w-full p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Instapay */}
                                        <div 
                                            className="cursor-pointer"
                                            onClick={() => setPaymentMethod("instapay")}
                                        >
                                            <div className={`flex items-center p-5 transition-colors ${paymentMethod === "instapay" ? "bg-gray-50/50 dark:bg-zinc-900/40" : "hover:bg-gray-50 dark:hover:bg-zinc-900/20"}`}>
                                                <div className="mr-5 relative flex items-center justify-center">
                                                    <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${paymentMethod === "instapay" ? "border-black dark:border-white bg-black dark:bg-white" : "border-gray-300 dark:border-gray-700"}`}>
                                                        {paymentMethod === "instapay" && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-2 h-2 rounded-full bg-white dark:bg-black"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <QrCode className={`w-5 h-5 mr-3 ${paymentMethod === "instapay" ? "text-pink-500" : "text-gray-400"}`} />
                                                <div className="flex flex-col">
                                                    <span className={`font-medium text-sm tracking-wide ${paymentMethod === "instapay" ? "text-black dark:text-white" : "text-gray-500"}`}>Instapay</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Fast Bank Transfer</span>
                                                </div>
                                            </div>
                                            
                                            <AnimatePresence>
                                                {paymentMethod === "instapay" && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-gray-50 dark:bg-zinc-950/30"
                                                    >
                                                        <div className="p-6 pt-0 ml-10">
                                                            <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-black max-w-sm">
                                                                <p className="text-xs text-zinc-500 mb-2 font-medium">Transfer to Address (IPA):</p>
                                                                <div className="flex items-center justify-between p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                                                                    <span className="text-sm font-bold tracking-tight">shopaholic@instapay</span>
                                                                    <div className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</div>
                                                                </div>
                                                                <p className="text-[10px] text-zinc-400 mt-3 leading-relaxed">
                                                                    Please complete the transfer via Instapay app, then click &quot;Pay&quot; to finish your order.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Fawry */}
                                        <div 
                                            className="cursor-pointer"
                                            onClick={() => setPaymentMethod("fawry")}
                                        >
                                            <div className={`flex items-center p-5 transition-colors ${paymentMethod === "fawry" ? "bg-gray-50/50 dark:bg-zinc-900/40" : "hover:bg-gray-50 dark:hover:bg-zinc-900/20"}`}>
                                                <div className="mr-5 relative flex items-center justify-center">
                                                    <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${paymentMethod === "fawry" ? "border-black dark:border-white bg-black dark:bg-white" : "border-gray-300 dark:border-gray-700"}`}>
                                                        {paymentMethod === "fawry" && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-2 h-2 rounded-full bg-white dark:bg-black"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <Zap className={`w-5 h-5 mr-3 ${paymentMethod === "fawry" ? "text-yellow-500" : "text-gray-400"}`} />
                                                <div className="flex flex-col">
                                                    <span className={`font-medium text-sm tracking-wide ${paymentMethod === "fawry" ? "text-black dark:text-white" : "text-gray-500"}`}>Fawry</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Pay at any Fawry branch</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Apple Pay */}
                                        <div 
                                            className="cursor-pointer"
                                            onClick={() => setPaymentMethod("apple-pay")}
                                        >
                                            <div className={`flex items-center p-5 transition-colors ${paymentMethod === "apple-pay" ? "bg-gray-50/50 dark:bg-zinc-900/40" : "hover:bg-gray-50 dark:hover:bg-zinc-900/20"}`}>
                                                <div className="mr-5 relative flex items-center justify-center">
                                                    <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${paymentMethod === "apple-pay" ? "border-black dark:border-white bg-black dark:bg-white" : "border-gray-300 dark:border-gray-700"}`}>
                                                        {paymentMethod === "apple-pay" && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-2 h-2 rounded-full bg-white dark:bg-black"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <Apple className={`w-5 h-5 mr-3 ${paymentMethod === "apple-pay" ? "text-black dark:text-white" : "text-gray-400"}`} />
                                                <span className={`font-medium text-sm tracking-wide ${paymentMethod === "apple-pay" ? "text-black dark:text-white" : "text-gray-500"}`}>Apple Pay</span>
                                            </div>
                                        </div>

                                        {/* Cash on Delivery */}
                                        <div 
                                            className="cursor-pointer"
                                            onClick={() => setPaymentMethod("cod")}
                                        >
                                            <div className={`flex items-center p-5 transition-colors ${paymentMethod === "cod" ? "bg-gray-50/50 dark:bg-zinc-900/40" : "hover:bg-gray-50 dark:hover:bg-zinc-900/20"}`}>
                                                <div className="mr-5 relative flex items-center justify-center">
                                                    <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${paymentMethod === "cod" ? "border-black dark:border-white bg-black dark:bg-white" : "border-gray-300 dark:border-gray-700"}`}>
                                                        {paymentMethod === "cod" && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-2 h-2 rounded-full bg-white dark:bg-black"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <Banknote className={`w-5 h-5 mr-3 ${paymentMethod === "cod" ? "text-emerald-500" : "text-gray-400"}`} />
                                                <div className="flex flex-col">
                                                    <span className={`font-medium text-sm tracking-wide ${paymentMethod === "cod" ? "text-black dark:text-white" : "text-gray-500"}`}>Cash on Delivery</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Pay when you receive your order</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </form>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-[400px] flex-shrink-0 order-1 lg:order-2">
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 md:p-8 sticky top-24">
                        <h2 className="text-lg font-medium tracking-wide uppercase mb-6">In Your Bag</h2>

                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-16 h-20 flex-shrink-0 bg-gray-200">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center text-[10px] font-bold">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                                        <p className="text-xs text-gray-500 mb-1">{item.color} / {item.size}</p>
                                        <p className="text-sm font-medium"><Price amount={item.price * item.quantity} /></p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-medium"><Price amount={subtotal} /></span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="font-medium">{shipping === 0 ? 'Free' : <Price amount={shipping} />}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-base font-medium uppercase tracking-wider">Total</span>
                            <span className="text-2xl font-medium"><Price amount={total} /></span>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={isProcessing}
                            className="w-full py-4 bg-black text-white dark:bg-white dark:text-black text-sm font-medium tracking-widest uppercase hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                "Processing..."
                            ) : (
                                <>
                                    {paymentMethod === "cod" ? "Complete Purchase" : <span className="flex items-center gap-1">Pay <Price amount={total} /></span>} <Lock className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
            <ConfirmModal
                isOpen={showSuccessModal}
                onClose={handleSuccessClose}
                onConfirm={handleSuccessClose}
                title="Order Received"
                description="Your order has been placed successfully. You will receive a confirmation email shortly with your order details."
                confirmText="Continue Shopping"
                showCancel={false}
                variant="success"
            />
        </div>
    );
}
