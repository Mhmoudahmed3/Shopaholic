import { getProductsDB, getOrdersDB } from "@/lib/db";
import AdminDashboard from "./components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const products = getProductsDB();
    const orders = getOrdersDB();

    return (
        <AdminDashboard products={products} orders={orders} />
    );
}
