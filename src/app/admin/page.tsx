import { getProductsDB, getOrdersDB, getCategoriesDB, getProductSales } from "@/lib/db";
import AdminDashboard from "./components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const [products, orders, categories, salesMap] = await Promise.all([
        getProductsDB(),
        getOrdersDB(),
        getCategoriesDB(),
        getProductSales()
    ]);

    return (
        <AdminDashboard products={products} orders={orders} categories={categories} salesMap={salesMap} />
    );
}
