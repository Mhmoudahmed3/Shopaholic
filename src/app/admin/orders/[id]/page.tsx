import { AdminHeader } from "../../components/AdminLayout";
import { 
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    Mail,
    User
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const order = {
        id: id,
        date: "Mar 12, 2026",
        status: "Processing",
        paymentMethod: "Visa ending in 4242",
        customer: {
            name: "Amira Youssef",
            email: "amira@example.com",
            phone: "+20 100 123 4567",
            address: "123 Nile Street, Cairo, Egypt"
        },
        items: [
            { name: "Silk Evening Gown", sku: "SILK-001", price: 8500, quantity: 1, image: "/placeholder.jpg" },
            { name: "Cashmere Scarf", sku: "CASH-002", price: 3200, quantity: 1, image: "/placeholder.jpg" },
            { name: "Leather Handbag", sku: "LTHR-003", price: 6750, quantity: 1, image: "/placeholder.jpg" }
        ],
        subtotal: 18450,
        shipping: 0,
        total: 18450,
        timeline: [
            { status: "Order Placed", date: "Mar 12, 2026 - 10:30 AM", completed: true },
            { status: "Processing", date: "Mar 12, 2026 - 11:00 AM", completed: true },
            { status: "Shipped", date: "Pending", completed: false },
            { status: "Delivered", date: "Pending", completed: false }
        ]
    };

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

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Order Details" />

            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
                <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-light tracking-tight">Order {order.id}</h1>
                        <p className="text-xs text-gray-500 mt-1">Placed on {order.date}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs uppercase font-bold tracking-wider border text-center ${getStatusStyles(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-sm font-bold uppercase tracking-wider">Order Items</h2>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="p-6 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.name}</h3>
                                            <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{item.price.toLocaleString()} EGP</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-gray-50/30 dark:bg-zinc-800/20 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">{order.subtotal.toLocaleString()} EGP</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium">{order.shipping === 0 ? 'Free' : `${order.shipping.toLocaleString()} EGP`}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <span>Total</span>
                                    <span>{order.total.toLocaleString()} EGP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-4 h-4" /> Customer Details
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium">{order.customer.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm">{order.customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm">{order.customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm">{order.customer.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-sm font-bold uppercase tracking-wider">Order Timeline</h2>
                            </div>
                            <div className="p-6">
                                <div className="relative">
                                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                    <div className="space-y-6">
                                        {order.timeline.map((event, idx) => (
                                            <div key={idx} className="flex items-start gap-3 relative">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center z-10 shrink-0 ${
                                                    event.completed 
                                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' 
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
                                                }`}>
                                                    {getStatusIcon(event.status)}
                                                </div>
                                                <div className="pt-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-sm font-medium ${event.completed ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                                                            {event.status}
                                                        </p>
                                                        {event.status === "Order Placed" && (
                                                            <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500 font-bold uppercase tracking-tighter">
                                                                {order.paymentMethod}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">{event.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
