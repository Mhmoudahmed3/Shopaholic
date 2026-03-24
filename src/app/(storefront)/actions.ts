"use server";

import { getProductsDB } from "@/lib/db";
import { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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
    phone: string;
    items_count: number;
    total_amount: number;
    status: string;
    items?: any[];
}) {
    try {
        const id = `ord-${Date.now()}`;
        const normalizedStatus = orderData.status ? (orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1).toLowerCase()) : 'Pending';
        
        // Extract items to avoid inserting them into the 'orders' table
        const { items, ...dbOrderData } = orderData;
        
        const { error: orderError } = await supabase.from('orders').insert([{
            ...dbOrderData,
            id,
            status: normalizedStatus === 'Canceled' ? 'Cancelled' : normalizedStatus,
            created_at: new Date().toISOString()
        }]);
        
        if (orderError) throw orderError;

        // Insert order items if provided
        if (items && items.length > 0) {
            const orderItems = items.map(item => ({
                order_id: id,
                product_id: item.productId || item.id,
                product_name: item.name || 'Unknown Product',
                quantity: item.quantity,
                price: item.price,
                variant_name: `${item.color || ''} ${item.size || ''}`.trim() || null,
                variant_color: item.color || null,
                variant_size: item.size || null
            }));

            // Insert order items
            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) console.error("Error inserting order items:", itemsError);

            // Update product stock counts and variant quantities
            for (const item of items) {
                const productId = item.productId || item.id;
                const { data: product } = (await supabase
                    .from('products')
                    .select('stock, image_variants')
                    .eq('id', productId)
                    .single()) as { data: Product | null };
                
                if (product) {
                    let updatedVariants = (product.imageVariants || []).map(v => {
                        // Check for color/size match
                        const matchColor = (v.color || '').toLowerCase() === (item.color || '').toLowerCase();
                        const matchSize = (v.size || '').toLowerCase() === (item.size || '').toLowerCase();
                        
                        if (matchColor && matchSize) {
                            return { ...v, quantity: Math.max(0, (v.quantity || 0) - item.quantity) };
                        }
                        return v;
                    });

                    // Recalculate total stock from variants to ensure consistency
                    // If no variants exist, just decrement from top-level
                    let newTotalStock: number;
                    if (updatedVariants.length > 0) {
                        newTotalStock = updatedVariants.reduce((sum, v) => sum + (v.quantity || 0), 0);
                    } else {
                        newTotalStock = Math.max(0, (product.stock || 0) - item.quantity);
                    }

                    await supabase
                        .from('products')
                        .update({ 
                            stock: newTotalStock,
                            image_variants: updatedVariants 
                        })
                        .eq('id', productId);
                }
            }
        }
        
        revalidatePath('/admin');
        revalidatePath('/admin/orders');
        revalidatePath('/admin/inventory');
        
        return { success: true, id };
    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error };
    }
}
