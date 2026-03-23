"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Package, User, LogOut, Settings, Plus, List } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AccountPage() {
    const [mounted, setMounted] = useState(false);
    const { user, isAuthenticated, login, signup, logout } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                await login(email);
            } else {
                await signup(name, email);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated && user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="flex justify-between items-end mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h1 className="text-3xl font-light tracking-tight mb-2">My Account</h1>
                        <p className="text-gray-500 dark:text-gray-400 capitalize">Welcome back, {user.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Profile Card */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 md:p-8 col-span-1 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xl font-bold uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-medium">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button className="flex items-center gap-3 w-full p-3 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors rounded-md">
                                <User className="w-4 h-4" /> Personal Information
                            </button>
                            <button className="flex items-center gap-3 w-full p-3 text-left text-sm font-medium bg-white dark:bg-black shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 rounded-md">
                                <Package className="w-4 h-4" /> Order History
                            </button>
                            {user.role === 'admin' && (
                                <>
                                    <Link href="/admin/add-item" className="flex items-center gap-3 w-full p-3 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors rounded-md text-emerald-600 dark:text-emerald-500">
                                        <Plus className="w-4 h-4" /> Add Items
                                    </Link>
                                    <Link href="/admin" className="flex items-center gap-3 w-full p-3 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors rounded-md text-blue-600 dark:text-blue-500">
                                        <List className="w-4 h-4" /> Inventory
                                    </Link>
                                    <Link href="/admin" className="flex items-center gap-3 w-full p-3 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors rounded-md text-amber-600 dark:text-amber-500">
                                        <Settings className="w-4 h-4" /> Admin Dashboard
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Orders Section */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-xl font-light tracking-wide mb-6">Recent Orders</h2>

                        {/* Mock Order */}
                        <div className="border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order #AUR-10042</p>
                                    <p className="text-xs text-gray-400">Placed on October 24, 2024</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-lg font-medium">18,500 EGP</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-2">
                                        Delivered
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 relative">
                                    <Image
                                        src="https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop"
                                        alt="Product"
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 relative">
                                    <Image
                                        src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop"
                                        alt="Product"
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>
                                <button className="text-sm font-medium underline underline-offset-4 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white ml-4">
                                    View Order Details
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        );
    }

    // Auth Forms
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-light tracking-[0.3em] uppercase mb-2">SHOPOHOLIC</h1>
                    <h2 className="text-xl tracking-tight text-gray-900 dark:text-white mb-4">
                        {isLogin ? "Sign in to your account" : "Create an account"}
                    </h2>
                    {isLogin && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md text-sm text-amber-800 dark:text-amber-200 text-left max-w-sm mx-auto">
                            <strong>Admin Access:</strong> Use <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">admin@admin.com</code> to access the admin portal.
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-black p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                {isLogin && (
                                    <a href="#" className="text-xs text-gray-500 hover:text-black dark:hover:text-white cursor-not-allowed">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-black text-white dark:bg-white dark:text-black text-sm font-medium tracking-widest uppercase hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70 flex justify-center"
                        >
                            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Register"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-black dark:text-white hover:underline underline-offset-4 transition-all"
                        >
                            {isLogin ? "Create one" : "Sign in"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
