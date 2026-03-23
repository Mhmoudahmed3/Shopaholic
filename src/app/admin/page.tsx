import { getProductsDB, getOrdersDB, getCategoriesDB } from "@/lib/db";
import AdminDashboard from "./components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const products = getProductsDB();
    const orders = getOrdersDB();
    const categories = getCategoriesDB();

    return (
        <AdminDashboard products={products} orders={orders} categories={categories} />
    );
}
