import { getOrderById } from "@/lib/db";
import Link from "next/link";
import OrderDetailsClient from "./OrderDetailsClient";
import { AdminHeader } from "@/app/admin/components/AdminLayout";

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderData = await getOrderById(id);

    if (!orderData) {
        return (
            <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
                <AdminHeader title="Order Not Found" />
                <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
                    <h1 className="text-xl font-bold">Order not found</h1>
                    <Link href="/admin/orders" className="text-blue-500 hover:underline mt-4 inline-block uppercase text-xs font-bold tracking-widest">Back to Orders</Link>
                </div>
            </div>
        );
    }

    // Map DB fields to UI expected format if needed
    const order = {
        id: orderData.id,
        date: new Date(orderData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: orderData.status,
        paymentMethod: orderData.payment_method || "Visa ending in 4242",
        customer: {
            name: orderData.customer,
            email: orderData.email,
            phone: orderData.phone || "+20 100 123 4567",
            address: orderData.address || "Cairo, Egypt"
        },
        items: orderData.items || [],
        subtotal: orderData.subtotal || orderData.total || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total || 0,
        timeline: orderData.timeline || [
            { status: "Order Placed", date: new Date(orderData.created_at).toLocaleString(), completed: true },
            { status: "Processing", date: orderData.status === 'Processing' ? 'Just now' : 'Pending', completed: orderData.status !== 'Pending' },
            { status: "Shipped", date: orderData.status === 'Shipped' ? 'Just now' : 'Pending', completed: orderData.status === 'Shipped' || orderData.status === 'Delivered' },
            { status: "Delivered", date: orderData.status === 'Delivered' ? 'Just now' : 'Pending', completed: orderData.status === 'Delivered' }
        ]
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title={`Order ${order.id}`} />
            <OrderDetailsClient order={order} />
        </div>
    );
}
