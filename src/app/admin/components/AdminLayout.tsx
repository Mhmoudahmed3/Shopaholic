"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { 
    LayoutDashboard, 
    Package, 
    ShoppingBag, 
    Users, 
    PlusCircle, 
    Settings, 
    LogOut,
    Search,
    Bell,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    Home,
    Library,
    Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function AdminSideNav() {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin", active: pathname === "/admin" },
        { label: "Inventory", icon: Package, href: "/admin/inventory", active: pathname === "/admin/inventory" },
        { label: "Add Product", icon: PlusCircle, href: "/admin/add-item", active: pathname === "/admin/add-item" },
        { label: "Orders", icon: ShoppingBag, href: "/admin/orders", active: pathname === "/admin/orders" },
        { label: "Customers", icon: Users, href: "/admin/customers", active: pathname === "/admin/customers" },
        { label: "Home", icon: Home, href: "/admin/home", active: pathname === "/admin/home" },
        { label: "Collections", icon: Library, href: "/admin/collections", active: pathname === "/admin/collections" },
        { label: "Settings", icon: Settings, href: "/admin/settings", active: pathname === "/admin/settings" },
    ];

    return (
        <>
            {/* Hamburger Button for Mobile */}
            <button 
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-6 left-6 z-[60] p-1.5 bg-zinc-900 border border-zinc-800 text-white rounded-md shadow-md hover:bg-zinc-800 transition-colors"
                aria-label="Open Menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlays */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                    />
                )}
            </AnimatePresence>

            <aside className={`w-64 h-screen bg-black border-r border-gray-800 flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
            {/* Logo */}
            <div className="p-8 border-b border-gray-900">
                <Link href="/" className="group block">
                    <h1 className="text-xl font-light tracking-[0.3em] uppercase text-white group-hover:text-gray-400 transition-colors">
                        Shopaholic
                    </h1>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 block">
                        Admin Portal
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2">
                {menuItems.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all rounded-lg group relative ${
                            item.active 
                                ? "text-white bg-zinc-900" 
                                : "text-gray-500 hover:text-white hover:bg-zinc-900/50"
                        }`}
                    >
                        {item.active && (
                            <motion.div 
                                layoutId="activeNav"
                                className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                            />
                        )}
                        <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${item.active ? "text-white" : "text-gray-500"}`} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 mt-auto border-t border-gray-900 space-y-4">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold uppercase text-white ring-1 ring-gray-700">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email || "admin@shopaholic.com"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <Link 
                        href="/" 
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" /> View Storefront
                    </Link>
                    <button 
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </div>
            </div>
        </aside>
        </>
    );
}

export function AdminHeader({ title }: { title: string }) {
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, title: 'New Order', message: 'Order #10043 received from Sarah J.', time: '2 mins ago', type: 'order', icon: ShoppingBag, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
        { id: 2, title: 'Low Stock', message: 'Essential White Tee (M) is below 5 units.', time: '1 hour ago', type: 'alert', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
        { id: 3, title: 'Payment Received', message: 'Payment of 18,500 EGP for Order #10041.', time: '3 hours ago', type: 'success', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
        { id: 4, title: 'System', message: 'Maintenance scheduled for 02:00 AM UTC.', time: '5 hours ago', type: 'system', icon: Info, color: 'text-gray-500 bg-gray-50 dark:bg-zinc-800/50' }
    ];

    return (
        <header className="h-20 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="pl-12 lg:pl-0">
                <h2 className="text-xl font-light tracking-tight">{title}</h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center bg-gray-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 transition-all focus-within:ring-1 ring-gray-400">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search dashboard..." 
                        className="bg-transparent border-none outline-none text-xs ml-3 w-48 placeholder:text-gray-500"
                    />
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2.5 transition-all rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 group ${showNotifications ? 'text-black dark:text-white bg-gray-100 dark:bg-zinc-800' : 'text-gray-400'}`}
                    >
                        <Bell className={`w-5 h-5 transition-transform ${showNotifications ? '' : 'group-hover:rotate-12'}`} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black" />
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowNotifications(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                    className="absolute right-0 mt-4 w-[360px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Notifications</h3>
                                            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-tighter font-medium">You have {notifications.length} unread updates</p>
                                        </div>
                                        <button 
                                            onClick={() => setShowNotifications(false)}
                                            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                                        {notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className="px-6 py-5 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-zinc-800/80 transition-all cursor-pointer group flex gap-4"
                                            >
                                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${notif.color}`}>
                                                    <notif.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 transition-colors">{notif.title}</p>
                                                        <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-normal line-clamp-2">{notif.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-gray-50/50 dark:bg-zinc-800/30 text-center border-t border-gray-100 dark:border-gray-800">
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center gap-2 w-full py-2">
                                            Mark all as read
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
