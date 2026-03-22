"use client";

import { 
    Search, 
    ShoppingBag, 
    ChevronRight,
    Download,
    Eye,
    X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Order } from "@/lib/types";

export default function OrdersList({ orders }: { orders: Order[] }) {
    const router = useRouter();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState("All Orders");
    const [dateFilter, setDateFilter] = useState("");
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = searchQuery === "" || 
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = activeStatus === "All Orders" || order.status === activeStatus;
            
            const matchesDate = dateFilter === "" || order.date.includes(dateFilter);
            
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [orders, searchQuery, activeStatus, dateFilter]);

    const statusTabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-light tracking-tight">Orders Overview</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage and track your customer orders</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-800 pb-px overflow-x-auto">
                {statusTabs.map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveStatus(tab)}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest relative whitespace-nowrap ${
                            activeStatus === tab ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab}
                        {activeStatus === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white" />}
                    </button>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50/30 dark:bg-zinc-800/20">
                    <div className="flex items-center gap-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-lg w-full md:w-80">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search order ID or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs flex-1 w-full" 
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-row flex-wrap gap-2 w-full md:w-auto">
                        <input 
                            type="date" 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="flex-1 min-w-[120px] md:flex-none flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-black transition-colors bg-white dark:bg-black cursor-pointer"
                        />
                        {(dateFilter || searchQuery || activeStatus !== 'All Orders') && (
                            <button 
                                onClick={() => {
                                    setSearchQuery("");
                                    setDateFilter("");
                                    setActiveStatus("All Orders");
                                }}
                                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                                <X className="w-4 h-4" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 dark:bg-zinc-900/50 uppercase tracking-wider text-[10px] text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-5">Order ID</th>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Items</th>
                                <th className="px-6 py-5">Total Amount</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingBag className="w-8 h-8" />
                                            <p className="text-sm">No orders found</p>
                                            <p className="text-xs">Try adjusting your search or filter criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                        className="hover:bg-gray-50/30 dark:hover:bg-zinc-800/10 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-5 font-bold text-zinc-900 dark:text-zinc-100">{order.id}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{order.customer}</span>
                                                <span className="text-[10px] text-gray-400">{order.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-600 dark:text-gray-400">{order.items} items</td>
                                        <td className="px-6 py-5 font-bold italic">{order.total.toLocaleString()} EGP</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 whitespace-nowrap">{order.date}</td>
                                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/admin/orders/${order.id}`} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors bg-gray-50 dark:bg-zinc-800 rounded-lg inline-flex">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-zinc-900/50 flex items-center justify-center">
                    <Link href="/admin/orders" className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 hover:text-black transition-colors flex items-center gap-2">
                        Load 50 More Orders <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
