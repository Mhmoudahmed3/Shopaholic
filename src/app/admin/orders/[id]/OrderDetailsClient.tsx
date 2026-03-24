"use client";

import { useState, useMemo } from "react";
import { 
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    Mail,
    User,
    X,
    XCircle,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../../actions";
import { supabase } from "@/lib/supabase";
import { ConfirmModal } from "@/app/admin/components/ConfirmModal";

export default function OrderDetailsClient({ order: initialOrder }: { order: any }) {
    const router = useRouter();
    const order = initialOrder;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Order Placed': return <Package className="w-3 h-3" />;
            case 'Processing': return <Clock className="w-3 h-3" />;
            case 'Shipped': return <Truck className="w-3 h-3" />;
            case 'Delivered': return <CheckCircle2 className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [confirmState, setConfirmState] = useState<{isOpen: boolean, type: 'cancel_order' | 'cancel_item', payload: number | null}>({isOpen: false, type: 'cancel_order', payload: null});

    const executeCancelOrder = async () => {
        setIsLoading(true);
        try {
            await updateOrderStatus(order.id, 'Cancelled');
            router.refresh();
        } catch (error) {
            console.error("[DETAILS ERROR]", error);
        } finally {
            setIsLoading(false);
            setConfirmState({ isOpen: false, type: 'cancel_order', payload: null });
        }
    };

    const handleCancelOrder = () => setConfirmState({ isOpen: true, type: 'cancel_order', payload: null });

    const executeCancelItem = async () => {
        if (confirmState.payload === null) return;
        const idx = confirmState.payload;
        setIsLoading(true);
        try {
            if (!Array.isArray(order.items)) {
                return;
            }

            const newItems = [...order.items];
            const cancelledItem = newItems[idx];
            newItems.splice(idx, 1);
            
            // Recalculate totals
            const itemTotal = (cancelledItem.price || 0) * (cancelledItem.quantity || 1);
            const newSubtotal = Math.max(0, (order.subtotal || 0) - itemTotal);
            const newTotal = Math.max(0, (order.total || 0) - itemTotal);

            const { error } = await supabase
                .from('orders')
                .update({ 
                    items: newItems,
                    subtotal: newSubtotal,
                    total: newTotal
                })
                .eq('id', order.id);

            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setConfirmState({ isOpen: false, type: 'cancel_order', payload: null });
        }
    };

    const handleCancelItem = (idx: number) => setConfirmState({ isOpen: true, type: 'cancel_item', payload: idx });

    return (
        <div className="flex-1">
            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
                <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-light tracking-tight">Order {order.id}</h1>
                        <p className="text-xs text-gray-500 mt-1">Placed on {order.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {order.status !== 'Cancelled' && (
                            <button 
                                disabled={isLoading}
                                onClick={handleCancelOrder}
                                className="px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-wider border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Working...' : 'Cancel Order'}
                            </button>
                        )}
                        <span className={`px-3 py-1.5 rounded-full text-xs uppercase font-bold tracking-wider border text-center ${getStatusStyles(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="text-sm font-bold uppercase tracking-wider">Order Items</h2>
                                <span className="text-xs text-gray-400">{Array.isArray(order.items) ? order.items.length : 0} Items</span>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {Array.isArray(order.items) ? (
                                    order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="p-6 flex items-center gap-4 group">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                {item.image ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </>
                                                ) : (
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-sm">{item.name || 'Product'}</h3>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter truncate max-w-[150px]">
                                                    {item.sku ? `SKU: ${item.sku}` : (item.variant || 'No details')}
                                                </p>
                                            </div>
                                            <div className="text-right flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="font-bold text-sm">{(item.price || 0).toLocaleString()} EGP</p>
                                                    <p className="text-[10px] text-gray-400 tracking-widest uppercase">Qty: {item.quantity || 1}</p>
                                                </div>
                                                {order.status !== 'Cancelled' && (
                                                    <button 
                                                        onClick={() => handleCancelItem(idx)}
                                                        className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Cancel Item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="text-xs uppercase tracking-[0.2em] font-medium italic">Item details unavailable</p>
                                        <p className="text-[10px] text-gray-500 mt-2">
                                            Current Count: {order.items_count || (Array.isArray(order.items) ? order.items.length : 0)} items
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-gray-50/30 dark:bg-zinc-800/20 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 uppercase tracking-widest text-[10px]">Subtotal</span>
                                    <span className="font-medium">{(order.subtotal || 0).toLocaleString()} EGP</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 uppercase tracking-widest text-[10px]">Shipping</span>
                                    <span className="font-medium">{order.shipping === 0 ? 'Free' : `${(order.shipping || 0).toLocaleString()} EGP`}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <span className="uppercase tracking-widest">Total</span>
                                    <span className="text-xl">{(order.total || 0).toLocaleString()} <span className="text-xs font-normal">EGP</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 italic">
                                    <User className="w-4 h-4" /> Customer Details
                                </h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Name</p>
                                        <p className="font-medium">{typeof order.customer === 'string' ? order.customer : order.customer?.name || 'Guest Customer'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="font-medium">{typeof order.customer === 'string' ? order.email : order.customer?.email || order.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                        <p className="font-medium">{order.customer?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pt-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Shipping Address</p>
                                        <p className="text-sm leading-relaxed">{order.customer?.address || 'Shipping address not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 italic">
                                    Order Timeline
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-zinc-800">
                                    {Array.isArray(order.timeline) ? order.timeline.map((event: any, idx: number) => (
                                        <div key={idx} className="relative flex items-center gap-4 pl-10">
                                            <div className={`absolute left-0 w-[34px] h-[34px] rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 z-10 ${
                                                event.completed ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-400 dark:bg-zinc-800'
                                            }`}>
                                                {getStatusIcon(event.status)}
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold uppercase tracking-widest ${event.completed ? 'text-zinc-900 dark:text-zinc-100' : 'text-gray-400'}`}>
                                                    {event.status}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                                                    {event.date}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="relative flex items-center gap-4 pl-10">
                                            <div className="absolute left-0 w-[34px] h-[34px] rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 z-10 bg-black text-white">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest">Order Placed</p>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{order.date || order.created_at}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <ConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.type === 'cancel_order' ? "Cancel Order" : "Cancel Item"}
                message={confirmState.type === 'cancel_order' 
                    ? `Are you sure you want to cancel order #${order.id.slice(-6)}? This action cannot be undone.`
                    : "Are you sure you want to remove this item from the order? This will recalculate the order totals."}
                type="danger"
                confirmText={confirmState.type === 'cancel_order' ? "Cancel Order" : "Cancel Item"}
                isLoading={isLoading}
                onConfirm={confirmState.type === 'cancel_order' ? executeCancelOrder : executeCancelItem}
                onCancel={() => setConfirmState({ isOpen: false, type: 'cancel_order', payload: null })}
            />
        </div>
    );
}
