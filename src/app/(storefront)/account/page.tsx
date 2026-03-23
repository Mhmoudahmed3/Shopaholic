"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Package, User, LogOut, Settings, Plus, List } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AccountPage() {
    const [mounted, setMounted] = useState(false);
    const { user, isAuthenticated, login, signup, logout, signInWithGoogle, signInWithFacebook } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setIsLoading(true);
        try {
            if (provider === 'google') await signInWithGoogle();
            else await signInWithFacebook();
        } finally {
            setIsLoading(false);
        }
    };

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black dark:text-white">My Account</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-light tracking-widest uppercase text-xs">
                            Personalized Experience / {user.role}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="group flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-zinc-400 hover:text-black dark:hover:text-white transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-8">
                        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50 p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-2xl font-light mb-4 ring-4 ring-zinc-100 dark:ring-zinc-800/50 ring-offset-4 ring-offset-white dark:ring-offset-black">
                                    {user.name.charAt(0)}
                                </div>
                                <h2 className="text-lg font-medium text-black dark:text-white">{user.name}</h2>
                                <p className="text-sm text-zinc-500 mb-8">{user.email}</p>

                                <div className="w-full space-y-1">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex items-center gap-3 w-full px-4 py-3 text-xs tracking-widest uppercase transition-all border ${activeTab === 'profile' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400'}`}
                                    >
                                        <User className="w-4 h-4" /> Personal Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`flex items-center gap-3 w-full px-4 py-3 text-xs tracking-widest uppercase transition-all border ${activeTab === 'orders' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400'}`}
                                    >
                                        <Package className="w-4 h-4" /> Order History
                                    </button>

                                    {user.role === 'admin' && (
                                        <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800/50 space-y-1">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-3 px-4">Management</p>
                                            <Link href="/admin" className="flex items-center gap-3 w-full px-4 py-3 text-xs tracking-widest uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all border border-transparent">
                                                <Settings className="w-4 h-4" /> Admin Portal
                                            </Link>
                                            <Link href="/admin/add-item" className="flex items-center gap-3 w-full px-4 py-3 text-xs tracking-widest uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all border border-transparent">
                                                <Plus className="w-4 h-4" /> New Product
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 xl:col-span-9">

                        {activeTab === 'orders' ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-light tracking-tight mb-8">Recent Orders</h2>

                                {/* Order Entry */}
                                <div className="group border border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all p-8 bg-white dark:bg-transparent">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 pb-8 border-b border-zinc-50 dark:border-zinc-900">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Reference</p>
                                            <p className="text-sm font-medium">#SHO-2024-88A2</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Date</p>
                                            <p className="text-sm">October 24, 2024</p>
                                        </div>
                                        <div className="space-y-1 md:text-right">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Amount</p>
                                            <p className="text-lg font-medium">18,500 EGP</p>
                                        </div>
                                        <div className="flex flex-col items-start md:items-end gap-2">
                                            <span className="px-3 py-1 text-[9px] uppercase tracking-widest font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                                In Transit
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex -space-x-4">
                                            <div className="w-16 h-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative z-10 p-1">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop"
                                                    alt="Product"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="w-16 h-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative z-0 p-1 grayscale group-hover:grayscale-0 transition-all">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop"
                                                    alt="Product"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                        <Link href="#" className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-8 hover:opacity-60 transition-opacity">
                                            Order Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-light tracking-tight mb-8">Personal Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 bg-zinc-50/50 dark:bg-zinc-900/10 p-8 md:p-12 border border-zinc-100 dark:border-zinc-800/50">
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">Full Identity</label>
                                            <input
                                                type="text"
                                                defaultValue={user.name}
                                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">Email Address</label>
                                            <input
                                                type="email"
                                                defaultValue={user.email}
                                                className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-4 font-light text-zinc-500 text-sm cursor-not-allowed tracking-wide"
                                                disabled
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">Phone</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+20 --- --- ----"
                                                    className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">Age</label>
                                                <input
                                                    type="number"
                                                    placeholder="25"
                                                    className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">Current City</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Cairo, Paris, New York"
                                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">Primary Residency</label>
                                            <textarea
                                                placeholder="Enter your full shipping address"
                                                rows={5}
                                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm resize-none tracking-wide"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-12 flex justify-end">
                                        <button className="group relative bg-black text-white dark:bg-white dark:text-black px-16 py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:opacity-80 transition-all shadow-2xl shadow-black/10 dark:shadow-white/5">
                                            Save Changes
                                            <span className="absolute -bottom-2 -right-2 w-12 h-12 bg-zinc-100 dark:bg-zinc-800 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        );
    }

    // Auth Forms
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Visual Side */}
            <div className="hidden lg:block relative bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                <Image
                    src="/images/login-hero.png"
                    alt="Editorial Fashion"
                    fill
                    priority
                    className="object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">Exclusive Collection</p>
                        <h3 className="text-2xl font-light text-white tracking-widest uppercase">The Noir Series</h3>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white dark:bg-black">
                <div className="w-full max-w-sm space-y-12">
                    <div className="text-center space-y-4">
                        <Link href="/" className="inline-block">
                            <h1 className="text-4xl font-light tracking-[0.4em] uppercase text-black dark:text-white">SHOPOHOLIC</h1>
                        </Link>
                        <div className="space-y-1">
                            <h2 className="text-sm font-medium tracking-widest uppercase text-zinc-900 dark:text-zinc-100">
                                {isLogin ? "Sign In" : "Register"}
                            </h2>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                                {isLogin ? "Access your curated wardrobe" : "Join the global fashion elite"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Password</label>
                                    {isLogin && <button type="button" className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-all underline underline-offset-4 opacity-0 group-hover:opacity-100">Reset</button>}
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-8 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold tracking-[0.3em] uppercase hover:opacity-80 transition-all disabled:opacity-30"
                            >
                                {isLoading ? "Processing..." : isLogin ? "Authenticate" : "Create Account"}
                            </button>
                        </form>

                        <div className="relative flex items-center gap-4">
                            <div className="h-[1px] flex-grow bg-zinc-100 dark:bg-zinc-900"></div>
                            <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400">Social Entry</span>
                            <div className="h-[1px] flex-grow bg-zinc-100 dark:bg-zinc-900"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center gap-3 py-3 px-4 border border-zinc-100 dark:border-zinc-900 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                                Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin('facebook')}
                                className="flex items-center justify-center gap-3 py-3 px-4 border border-zinc-100 dark:border-zinc-900 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Facebook
                            </button>
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white transition-all underline underline-offset-8 decoration-zinc-200 dark:decoration-zinc-800 hover:decoration-black dark:hover:decoration-white"
                            >
                                {isLogin ? "Become a Member" : "Return to Login"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
