"use server";

import { getProductsDB } from "@/lib/db";
import { Product } from "@/lib/data";

/**
 * Fetches products by their IDs from the database.
 * Used for displaying items in the favorites/wishlist page.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
        if (!ids || ids.length === 0) return [];
        
        const allProducts = getProductsDB();
        return allProducts.filter(p => ids.includes(p.id));
    } catch (error) {
        console.error("Error fetching products by IDs:", error);
        return [];
    }
}
