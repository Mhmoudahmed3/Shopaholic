"use client";

import { 
    Search, 
    ShoppingBag, 
    ChevronRight,
    Download,
    Eye,
    X,
    XCircle,
    RotateCcw,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Order } from "@/lib/types";
import { deleteOrder, updateOrderStatus } from "../actions";
import { ConfirmModal } from "@/app/admin/components/ConfirmModal";

export default function OrdersList({ orders }: { orders: Order[] }) {
    const router = useRouter();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState("All Orders");
    const [dateFilter, setDateFilter] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [confirmState, setConfirmState] = useState<{isOpen: boolean, type: 'cancel' | 'delete', orderId: string | null}>({ isOpen: false, type: 'cancel', orderId: null });
    
    const executeCancel = async () => {
        if (!confirmState.orderId) return;
        setLoadingId(confirmState.orderId);
        try {
            await updateOrderStatus(confirmState.orderId, 'Cancelled');
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
            setConfirmState({ isOpen: false, type: 'cancel', orderId: null });
        }
    };

    const executeDelete = async () => {
        if (!confirmState.orderId) return;
        setLoadingId(confirmState.orderId);
        try {
            await deleteOrder(confirmState.orderId);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
            setConfirmState({ isOpen: false, type: 'cancel', orderId: null });
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = searchQuery === "" || 
                (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (order.customer && order.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = activeStatus === "All Orders" || order.status === activeStatus;
            
            const matchesDate = dateFilter === "" || (order.date && order.date.includes(dateFilter));
            
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
                    <h1 className="text-2xl font-light tracking-tight">Orders Overview ({filteredOrders.length})</h1>
                    <p className="text-xs text-gray-500 mt-1">Status management and tracking</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-800 pb-px overflow-x-auto scroller-hidden">
                {statusTabs.map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveStatus(tab)}
                        className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] relative whitespace-nowrap transition-colors ${
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
                            placeholder="Order ID / Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs flex-1 w-full" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto scroller-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 dark:bg-zinc-900/50 uppercase tracking-wider text-[10px] text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800 text-center">
                            <tr>
                                <th className="px-6 py-5 text-left">Order Details</th>
                                <th className="px-6 py-5">Items</th>
                                <th className="px-6 py-5">Value</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredOrders.map((order) => (
                                <tr 
                                    key={order.id} 
                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                    className="hover:bg-gray-50/30 dark:hover:bg-zinc-800/10 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-mono text-gray-400">#{order.id.slice(-6)}</span>
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{order.customer || 'Guest Customer'}</span>
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest">{order.email}</span>
                                            {order.phone && <span className="text-[9px] text-gray-400 uppercase tracking-widest">{order.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center text-gray-600 dark:text-gray-400">
                                        {order.itemsCount || (Array.isArray(order.items) ? order.items.length : 0)} Items
                                    </td>
                                    <td className="px-6 py-5 text-center font-bold italic">{(order.total || 0).toLocaleString()} EGP</td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-widest border ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center text-gray-500 text-xs">{order.date}</td>
                                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Link href={`/admin/orders/${order.id}`} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors bg-gray-50 dark:bg-zinc-800 rounded-lg" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            
                                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                                <button 
                                                    disabled={loadingId === order.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmState({ isOpen: true, type: 'cancel', orderId: order.id });
                                                    }}
                                                    className="p-2 text-amber-500 hover:text-white hover:bg-amber-500 transition-all bg-amber-50 dark:bg-amber-900/10 rounded-lg disabled:opacity-50"
                                                    title="Cancel Order"
                                                >
                                                    <XCircle className="w-4 h-4 cursor-pointer" />
                                                </button>
                                            )}

                                                <button 
                                                disabled={loadingId === order.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmState({ isOpen: true, type: 'delete', orderId: order.id });
                                                }}
                                                className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 transition-all bg-rose-50 dark:bg-rose-900/10 rounded-lg disabled:opacity-50"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="w-4 h-4 cursor-pointer" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.type === 'cancel' ? "Cancel Order" : "Delete Record"}
                message={confirmState.type === 'cancel' 
                    ? `Are you sure you want to cancel order #${confirmState.orderId?.slice(-6)}? This action cannot be undone.`
                    : `Permanently delete order #${confirmState.orderId?.slice(-6)} from the database? This action is irreversible.`
                }
                type="danger"
                confirmText={confirmState.type === 'cancel' ? "Cancel Order" : "Delete Permanently"}
                isLoading={!!loadingId}
                onConfirm={confirmState.type === 'cancel' ? executeCancel : executeDelete}
                onCancel={() => setConfirmState({ isOpen: false, type: 'cancel', orderId: null })}
            />
        </main>
    );
}
