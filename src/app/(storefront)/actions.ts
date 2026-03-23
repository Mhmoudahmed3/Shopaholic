"use server";

import { getProductsDB } from "@/lib/db";
import { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase";

/**
 * Fetches products by their IDs from the database.
 * Used for displaying items in the favorites/wishlist page.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
        if (!ids || ids.length === 0) return [];
        
        const allProducts = await getProductsDB();
        return allProducts.filter(p => ids.includes(p.id));
    } catch (error) {
        console.error("Error fetching products by IDs:", error);
        return [];
    }
}

export async function createOrder(orderData: {
    customer_name: string;
    email: string;
    items_count: number;
    total_amount: number;
    status: string;
}) {
    try {
        const id = `ord-${Date.now()}`;
        const { error } = await supabase.from('orders').insert([{
            id,
            ...orderData,
            created_at: new Date().toISOString()
        }]);
        
        if (error) throw error;
        return { success: true, id };
    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error };
    }
}
