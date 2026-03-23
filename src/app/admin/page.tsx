import { getProductsDB, getOrdersDB, getCategoriesDB } from "@/lib/db";
import AdminDashboard from "./components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const products = await getProductsDB();
    const orders = await getOrdersDB();
    const categories = await getCategoriesDB();

    return (
        <AdminDashboard products={products} orders={orders} categories={categories} />
    );
}
