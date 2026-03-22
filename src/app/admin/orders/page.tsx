import { getOrdersDB } from "@/lib/db";
import { AdminHeader } from "../components/AdminLayout";
import OrdersList from "./OrdersList";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const orders = getOrdersDB();

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Order Management" />
            <OrdersList orders={orders} />
        </div>
    );
}
