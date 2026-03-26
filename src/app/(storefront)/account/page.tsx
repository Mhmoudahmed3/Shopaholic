"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Package, User, LogOut, Settings, Plus, List, Edit2, Camera, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AccountPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { user, isAuthenticated, login, signup, logout, updateProfile, signInWithGoogle, signInWithFacebook } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [regStep, setRegStep] = useState(1);

    // Auto-redirect Admin to Admin Portal (if they land here authenticated)
    useEffect(() => {
        if (mounted && isAuthenticated && user?.role === 'admin') {
            router.push('/admin');
        }
    }, [mounted, isAuthenticated, user, router]);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    
    // Step 2 Fields
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [age, setAge] = useState("");
    const [city, setCity] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
    const [isEditing, setIsEditing] = useState(false);
    
    const [orders, setOrders] = useState([
        {
            id: "SHO-2024-88A2",
            date: "October 24, 2024",
            amount: "18,500 EGP",
            status: "In Transit",
            images: [
                "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop"
            ],
            type: 'primary'
        },
        {
            id: "SHO-2024-55B1",
            date: "September 12, 2024",
            amount: "4,200 EGP",
            status: "Delivered",
            images: [
                "https://images.unsplash.com/photo-1591047139829-d91aec36adea?q=80&w=800&auto=format&fit=crop"
            ],
            type: 'secondary'
        }
    ]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load user data into form when tab changes to profile or user updates
    useEffect(() => {
        if (isAuthenticated && user && activeTab === 'profile') {
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setAddress(user.address || "");
            setAge(user.age || "");
            setCity(user.city || "");
        }
    }, [user, isAuthenticated, activeTab]);

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
        
        if (!isLogin && regStep === 1) {
            setRegStep(2);
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(email);
            } else {
                await signup(name, email, phone, address, age, city);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile({
                name,
                email,
                phone,
                address,
                age,
                city
            });
            setIsEditing(false); // Success, exit edit mode
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ profileImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleCancelOrder = (id: string) => {
        console.log("Cancelling order:", id);
        // Using alert for immediate visual feedback
        if (confirm(`Cancel order ${id}?`)) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "Cancelled" } : o));
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-8">
                        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50 p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-light mb-4 ring-2 ring-zinc-100 dark:ring-zinc-800 ring-offset-4 ring-offset-white dark:ring-offset-black overflow-hidden relative">
                                        {user.profileImage ? (
                                            <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
                                        ) : (
                                            <span className="text-zinc-400">{user.name.charAt(0)}</span>
                                        )}
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="w-5 h-5 text-white" />
                                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                    {user.profileImage && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-black rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center pointer-events-none">
                                            <Check className="w-3 h-3 text-zinc-400" />
                                        </div>
                                    )}
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

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-xs tracking-widest uppercase transition-all border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
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
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
                                <div className="flex items-center justify-between mb-12">
                                    <h2 className="text-2xl font-light tracking-tight">Recent Orders</h2>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Showing 2 results</p>
                                </div>

                                <div className="space-y-8">
                                    {orders.map((order) => (
                                        <motion.div 
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            className={`group border border-zinc-100 dark:border-zinc-800/50 hover:border-black dark:hover:border-white transition-all duration-500 p-8 md:p-10 ${order.type === 'primary' ? 'bg-white dark:bg-zinc-900/10' : 'bg-zinc-50/50 dark:bg-zinc-900/5'}`}
                                        >
                                            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-10">
                                                <div className={`grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 transition-all duration-700 ${order.type === 'secondary' ? 'opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0' : ''}`}>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Reference</p>
                                                        <p className="text-sm font-bold tracking-wider">#{order.id}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Date</p>
                                                        <p className="text-sm font-light text-zinc-600 dark:text-zinc-400">{order.date}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Amount</p>
                                                        <p className="text-lg font-medium tracking-tight">{order.amount}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-start lg:items-end gap-6 w-full lg:w-auto">
                                                    <div className="flex flex-col items-start lg:items-end gap-2">
                                                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-1">Status</p>
                                                        <div className={`flex items-center gap-2 px-3 py-1 ${order.status === 'Cancelled' ? 'bg-red-50 text-red-500 border border-red-100' : order.status === 'Delivered' ? 'border border-zinc-200 dark:border-zinc-800 text-zinc-400' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
                                                            {order.status === 'In Transit' && <div className="w-1 h-1 rounded-full bg-white dark:bg-black animate-pulse" />}
                                                            <span className="text-[8px] font-bold tracking-[0.2em] uppercase">{order.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
                                                        <Link 
                                                            href={order.status === 'Cancelled' ? '#' : `/account/orders/${order.id}`}
                                                            className={`flex-1 lg:flex-none px-8 py-3 border text-[10px] font-bold uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 ${order.status === 'Cancelled' ? 'border-zinc-100 text-zinc-300 cursor-not-allowed' : 'border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
                                                        >
                                                            {order.status === 'Delivered' ? 'Archived View' : 'Explore Details'}
                                                        </Link>
                                                        {order.status !== 'Cancelled' && (
                                                            <button 
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="p-3 border border-red-100 hover:border-red-500 text-red-400 hover:text-red-500 transition-all flex items-center justify-center group/del"
                                                                title="Cancel Order"
                                                            >
                                                                <X className="w-4 h-4 transition-transform group-hover/del:rotate-90" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-10 border-t border-zinc-100 dark:border-zinc-900">
                                                <div className={`flex -space-x-6 transition-opacity ${order.type === 'secondary' ? 'opacity-40 group-hover:opacity-100' : ''}`}>
                                                    {order.images.map((img, idx) => (
                                                        <div key={idx} className={`w-20 h-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative p-1 transition-transform duration-500 ${idx === 0 ? 'z-20 group-hover:-translate-y-2' : 'z-10 group-hover:-translate-x-4 delay-75'}`}>
                                                            <Image src={img} alt="Product" fill className="object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <Link href="#" className={`text-[10px] font-bold uppercase tracking-[0.3em] border-b pb-1 transition-all ${order.type === 'secondary' ? 'border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white' : 'border-black dark:border-white hover:opacity-50'}`}>
                                                    {order.status === 'Delivered' ? 'Review History' : 'Order Details'}
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                                <div className="flex items-center justify-between mb-12 border-b border-zinc-100 dark:border-zinc-900 pb-6">
                                    <h2 className="text-2xl font-light tracking-tight">Personal Information</h2>
                                    <button 
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-all group"
                                    >
                                        {isEditing ? (
                                            <>
                                                <X className="w-3 h-3" /> Cancel
                                            </>
                                        ) : (
                                            <>
                                                <Edit2 className="w-3 h-3" /> Edit Profile
                                            </>
                                        )}
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Full Identity</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    disabled={!isEditing}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className={`w-full bg-transparent border-b border-zinc-100 dark:border-zinc-900 py-3 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide ${!isEditing ? 'opacity-50 cursor-default' : 'opacity-100'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    disabled
                                                    className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-900 py-3 font-light text-zinc-500 text-sm cursor-not-allowed tracking-wide opacity-50"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        disabled={!isEditing}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        placeholder="+20"
                                                        className={`w-full bg-transparent border-b border-zinc-100 dark:border-zinc-900 py-3 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide ${!isEditing ? 'opacity-50 cursor-default' : 'opacity-100'}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Age</label>
                                                    <input
                                                        type="number"
                                                        value={age}
                                                        disabled={!isEditing}
                                                        onChange={(e) => setAge(e.target.value)}
                                                        placeholder="25"
                                                        className={`w-full bg-transparent border-b border-zinc-100 dark:border-zinc-900 py-3 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide ${!isEditing ? 'opacity-50 cursor-default' : 'opacity-100'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Current City</label>
                                                <input
                                                    type="text"
                                                    value={city}
                                                    disabled={!isEditing}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="City"
                                                    className={`w-full bg-transparent border-b border-zinc-100 dark:border-zinc-900 py-3 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide ${!isEditing ? 'opacity-50 cursor-default' : 'opacity-100'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Primary Residency</label>
                                                <textarea
                                                    rows={4}
                                                    value={address}
                                                    disabled={!isEditing}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Shipping Address"
                                                    className={`w-full bg-transparent border border-zinc-100 dark:border-zinc-800 p-4 font-light focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm tracking-wide resize-none ${!isEditing ? 'opacity-50 cursor-default' : 'opacity-100'}`}
                                                />
                                            </div>

                                            {isEditing && (
                                                <button 
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full py-4 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold tracking-[0.5em] uppercase hover:opacity-80 transition-all shadow-xl shadow-black/5 dark:shadow-white/5 disabled:opacity-30 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                                >
                                                    {isLoading ? "Saving..." : (
                                                        <>
                                                            Confirm Changes
                                                            <Check className="w-3 h-3" />
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
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
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-12">
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
                            <h2 className="text-sm font-medium tracking-widest uppercase text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-3">
                                {isLogin ? "Sign In" : "Register"}
                                {!isLogin && <span className="text-[10px] text-zinc-400 font-normal">({regStep === 1 ? "01" : "02"} / 02)</span>}
                            </h2>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                                {isLogin ? "Access your curated wardrobe" : regStep === 1 ? "Join the global fashion elite" : "Complete your luxury profile"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {isLogin || regStep === 1 ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                    {!isLogin && (
                                        <div className="space-y-1">
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
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="+20"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Age</label>
                                            <input
                                                type="number"
                                                placeholder="25"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                                className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Living City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Detailed Address</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full py-3 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-light"
                                        />
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setRegStep(1)}
                                        className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-all"
                                    >
                                        ← Return to Credentials
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-8 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold tracking-[0.3em] uppercase hover:opacity-80 transition-all disabled:opacity-30"
                            >
                                {isLoading ? "Processing..." : isLogin ? "Authenticate" : regStep === 1 ? "Next Step" : "Join Shopaholic"}
                            </button>
                        </form>

                        <div className="relative flex items-center gap-4">
                            <div className="h-px grow bg-zinc-100 dark:bg-zinc-900"></div>
                            <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400">Social Entry</span>
                            <div className="h-px grow bg-zinc-100 dark:bg-zinc-900"></div>
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
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setRegStep(1);
                                }}
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
