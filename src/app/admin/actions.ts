"use server";

import fs from 'fs';
import path from 'path';
import { revalidatePath } from "next/cache";
import { SiteSettings, Category, Review, Product, Collection, Homepage, HomepageHero, HomepagePromo, OrderStatus } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
    const defaultSettings: SiteSettings = {
        storeName: "SHOPOHOLIC",
        storeDescription: "Premium Fashion Store",
        contactEmail: "support@shopaholic.com",
        contactPhone: "+20 123 456 789",
        address: "Alexandria, Egypt",
        currency: "EGP",
        currencySymbol: "£",
        maintenanceMode: false,
        socialLinks: {
            instagram: "shopaholic_official",
            facebook: "shopaholic",
            whatsapp: "+20123456789"
        },
        footerText: "© 2026 Shopaholic. All rights reserved.",
        taxRate: 14,
        shippingFee: 50,
        freeShippingThreshold: 1000
    };

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();
        
        if (error || !data) return defaultSettings;

        return {
            storeName: data.store_name,
            storeDescription: data.store_description,
            contactEmail: data.contact_email,
            contactPhone: data.contact_phone,
            address: data.address,
            currency: data.currency,
            currencySymbol: data.currency_symbol,
            maintenanceMode: data.maintenance_mode,
            footerText: data.footer_text,
            taxRate: parseFloat(data.tax_rate || 0),
            shippingFee: parseFloat(data.shipping_fee || 0),
            freeShippingThreshold: parseFloat(data.free_shipping_threshold || 0),
            socialLinks: data.social_links || defaultSettings.socialLinks
        } as SiteSettings;
    } catch (e) {
        console.warn("[OFFLINE] Using default site settings.");
        return defaultSettings;
    }
}

export async function updateSiteSettings(settings: SiteSettings) {
    console.log("[ACTION] Updating site settings...");
    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert({
                id: 1,
                store_name: settings.storeName,
                store_description: settings.storeDescription,
                contact_email: settings.contactEmail,
                contact_phone: settings.contactPhone,
                address: settings.address,
                currency: settings.currency,
                currency_symbol: settings.currencySymbol,
                maintenance_mode: settings.maintenanceMode,
                social_links: settings.socialLinks,
                footer_text: settings.footerText,
                tax_rate: settings.taxRate,
                shipping_fee: settings.shippingFee,
                free_shipping_threshold: settings.freeShippingThreshold,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        
        revalidatePath('/', 'layout');
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error("Error updating site settings:", error);
        throw new Error("Failed to update site settings");
    }
}

// Categories
export async function getCategories() {
    console.log("[ACTION] Fetching categories...");
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('label');
        
        if (!error && data) return data;
    } catch (e) {
        console.warn("[OFFLINE] Using categories.json fallback.");
    }

    try {
        const jsonPath = path.join(process.cwd(), 'categories.json');
        if (fs.existsSync(jsonPath)) {
            return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        }
    } catch (e) {
        console.error("Failed to read categories.json:", e);
    }
    return [];
}

export async function getCategoryProductCounts() {
    const { data, error } = await supabase
        .from('products')
        .select('category');
    
    if (error) return {};
    
    const counts: Record<string, number> = {};
    data.forEach(p => {
        counts[p.category] = (counts[p.category] || 0) + 1;
    });
    
    return counts;
}

export async function addCategory(category: { label: string, type?: string }) {
    console.log(`[ACTION] Adding category: ${category.label}`);
    try {
        const slug = category.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        const uniqueId = `${slug}-${Math.random().toString(36).substr(2, 5)}`;
        
        const { data, error } = await supabase
            .from('categories')
            .insert([{ id: uniqueId, label: category.label, type: category.type }])
            .select()
            .single();

        if (error) throw error;
        
        revalidatePath('/', 'layout');
        revalidatePath('/shop');
        
        return { success: true, category: data };
    } catch (error) {
        console.error("Error adding category:", error);
        throw new Error("Failed to add category");
    }
}

export async function deleteCategory(categoryId: string) {
    console.log(`[ACTION] Deleting category: ${categoryId}`);
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) throw error;
        
        revalidatePath('/', 'layout');
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("Failed to delete category");
    }
}

export async function updateCategoryServer(id: string, data: Partial<Category>) {
    try {
        const { error } = await supabase
            .from('categories')
            .update({ label: data.label, type: data.type })
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
        throw new Error("Failed to update category");
    }
}

export async function renameCategoryGroup(oldName: string, newName: string) {
    try {
        const { error } = await supabase
            .from('categories')
            .update({ type: newName })
            .eq('type', oldName);

        if (error) throw error;
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error renaming category group:", error);
        throw new Error("Failed to rename category group");
    }
}

// Reviews
export async function addProductReview(productId: string, input: any) {
    try {
        const data = input instanceof FormData ? {
            userName: input.get("userName") as string,
            rating: Number(input.get("rating")),
            comment: input.get("comment") as string,
            date: (input.get("date") as string) || new Date().toISOString()
        } : input;

        const newReview = {
            id: `rev-${Date.now()}`,
            product_id: productId,
            user_name: data.userName,
            rating: data.rating,
            comment: data.comment,
            verified: true,
            created_at: data.date || new Date().toISOString()
        };

        const { error } = await supabase
            .from('reviews')
            .insert([newReview]);

        if (error) throw error;

        // Update product aggregate rating
        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', productId);

        if (reviews && reviews.length > 0) {
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            await supabase
                .from('products')
                .update({ 
                    rating: Number(avg.toFixed(1)), 
                    reviews_count: reviews.length 
                })
                .eq('id', productId);
        }

        revalidatePath(`/shop/${productId}`);
        revalidatePath('/admin/inventory');
        
        return { success: true };
    } catch (error) {
        console.error("Error adding review:", error);
        throw new Error("Failed to add review");
    }
}

export async function deleteProductReview(productId: string, reviewId: string) {
    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) throw error;

        // Recalculate rating
        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', productId);

        let avg = 0;
        let count = 0;
        if (reviews && reviews.length > 0) {
            avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            count = reviews.length;
        }

        await supabase
            .from('products')
            .update({ 
                rating: Number(avg.toFixed(1)), 
                reviews_count: count 
            })
            .eq('id', productId);

        revalidatePath(`/shop/${productId}`);
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error) {
        console.error("Error deleting review:", error);
        throw new Error("Failed to delete review");
    }
}

// Utility for image saving to Supabase Storage
async function saveFile(file: File, prefix: string = "") {
    if (!file || file.size === 0) return null;
    
    try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${prefix}${timestamp}-${safeName}`;
        
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filename, file);
            
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filename);
            
        return publicUrl;
    } catch (error) {
        console.error("Error saving file to Supabase:", error);
        return null;
    }
}

// Product Management
export async function addProduct(formData: FormData) {
    console.log("[ACTION] Adding new product...");
    try {
        const id = `prod-${Date.now()}`;
        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string);
        const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null;
        const description = formData.get("description") as string || "";
        const category = formData.get("category") as string;
        const type = formData.get("type") as string || "";
        
        const activeImageIds = formData.getAll("activeImageIds") as string[];
        const imageVariants: any[] = [];
        const imageUrls: string[] = [];

        for (const imageId of activeImageIds) {
            const file = formData.get(`image_${imageId}`) as File | null;
            const existingUrl = formData.get(`existing_image_${imageId}`) as string | null;
            const color = formData.get(`color_${imageId}`) as string;
            const sizesRaw = formData.get(`sizes_${imageId}`) as string;
            const sizesArr = JSON.parse(sizesRaw);

            let url = existingUrl;
            if (file && file.size > 0) {
                const savedUrl = await saveFile(file);
                if (savedUrl) url = savedUrl;
            }

            if (url) {
                imageUrls.push(url);
                sizesArr.forEach((s: any) => {
                    imageVariants.push({
                        url,
                        color,
                        size: s.size,
                        quantity: s.quantity || 0
                    });
                });
            }
        }

        const { error } = await supabase
            .from('products')
            .insert([{
                id,
                name,
                description,
                price,
                discount_price: discountPrice,
                category,
                type,
                images: [...new Set(imageUrls)],
                image_variants: imageVariants,
                sizes: [...new Set(imageVariants.map(v => v.size))],
                colors: [...new Set(imageVariants.map(v => v.color).filter(Boolean))],
                stock: imageVariants.reduce((sum, v) => sum + (v.quantity || 0), 0)
            }]);

        if (error) throw error;

        revalidatePath("/admin/inventory");
        revalidatePath("/shop");
        revalidatePath("/");
        
        return { success: true, id };
    } catch (error) {
        console.error("Error adding product:", error);
        throw new Error("Failed to add product");
    }
}

export async function updateProduct(formData: FormData) {
    const productId = formData.get("productId") as string;
    console.log(`[ACTION] Updating product ${productId}...`);
    try {
        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string);
        const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null;
        const description = formData.get("description") as string || "";
        const category = formData.get("category") as string;
        const type = formData.get("type") as string || "";
        
        const activeImageIds = formData.getAll("activeImageIds") as string[];
        const imageVariants: any[] = [];
        const imageUrls: string[] = [];

        for (const imageId of activeImageIds) {
            const file = formData.get(`image_${imageId}`) as File | null;
            const existingUrl = formData.get(`existing_image_${imageId}`) as string | null;
            const color = formData.get(`color_${imageId}`) as string;
            const sizesRaw = formData.get(`sizes_${imageId}`) as string;
            const sizesArr = JSON.parse(sizesRaw);

            let url = existingUrl;
            if (file && file.size > 0) {
                const savedUrl = await saveFile(file);
                if (savedUrl) url = savedUrl;
            }

            if (url) {
                imageUrls.push(url);
                sizesArr.forEach((s: any) => {
                    imageVariants.push({
                        url,
                        color,
                        size: s.size,
                        quantity: s.quantity || 0
                    });
                });
            }
        }

        const { error } = await supabase
            .from('products')
            .update({
                name,
                description,
                price,
                discount_price: discountPrice,
                category,
                type,
                images: [...new Set(imageUrls)],
                image_variants: imageVariants,
                sizes: [...new Set(imageVariants.map(v => v.size))],
                colors: [...new Set(imageVariants.map(v => v.color).filter(Boolean))],
                stock: imageVariants.reduce((sum, v) => sum + (v.quantity || 0), 0)
            })
            .eq('id', productId);

        if (error) throw error;

        revalidatePath("/admin/inventory");
        revalidatePath(`/shop/${productId}`);
        revalidatePath("/shop");
        revalidatePath("/");
        
        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Failed to update product");
    }
}

export async function deleteProduct(productId: string) {
    console.log(`[ACTION] Deleting product ${productId}...`);
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        revalidatePath("/admin/inventory");
        revalidatePath("/shop");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product");
    }
}

// Collection Management
export async function getCuratedCollections(): Promise<Collection[]> {
    const { data } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
    
    if (!data) return [];
    
    return data.map(item => ({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle,
        image: item.image,
        status: item.status,
        productIds: item.product_ids || [],
        itemsCount: (item.product_ids || []).length,
        link: item.link,
        createdAt: item.created_at
    })) as Collection[];
}

export async function getAvailableProducts(): Promise<Product[]> {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    
    if (!data) return [];
    
    return data.map(item => ({
        ...item,
        reviewsCount: item.reviews_count // Map DB snake_case to camelCase
    })) as any;
}

export async function createCuratedCollection(formData: FormData) {
    console.log("[ACTION] Creating curated collection...");
    try {
        const id = `col-${Date.now()}`;
        const name = formData.get("name") as string;
        const subtitle = formData.get("subtitle") as string || "";
        const imageFile = formData.get("image") as File | null;
        const status = formData.get("status") as string || 'Active';
        const productIds = JSON.parse(formData.get("productIds") as string || "[]");
        
        let imageUrl = "";
        if (imageFile && imageFile.size > 0) {
            const savedUrl = await saveFile(imageFile, "collections/");
            if (savedUrl) imageUrl = savedUrl;
        }

        const { error } = await supabase.from('collections').insert([{
            id,
            name,
            subtitle,
            image: imageUrl,
            status,
            product_ids: productIds,
            items_count: productIds.length,
            link: `/collections/${id}`
        }]);

        if (error) throw error;
        
        revalidatePath("/admin/collections");
        revalidatePath("/");
        
        return { success: true, id };
    } catch (error) {
        console.error("Error creating collection:", error);
        throw new Error("Failed to create collection");
    }
}

export async function updateCuratedCollection(formData: FormData) {
    const id = formData.get("collectionId") as string;
    console.log(`[ACTION] Updating collection ${id}...`);
    try {
        const name = formData.get("name") as string;
        const subtitle = formData.get("subtitle") as string || "";
        const imageFile = formData.get("image") as File | null;
        const currentImageUrl = formData.get("currentImage") as string || "";
        const status = formData.get("status") as string || 'Active';
        const productIds = JSON.parse(formData.get("productIds") as string || "[]");
        
        let imageUrl = currentImageUrl;
        if (imageFile && imageFile.size > 0) {
            const savedUrl = await saveFile(imageFile, "collections/");
            if (savedUrl) imageUrl = savedUrl;
        }

        const { error } = await supabase.from('collections').update({
            name,
            subtitle,
            image: imageUrl,
            status,
            product_ids: productIds,
            items_count: productIds.length,
            link: `/collections/${id}`
        }).eq('id', id);

        if (error) throw error;
        
        revalidatePath("/admin/collections");
        revalidatePath("/");
        
        return { success: true };
    } catch (error) {
        console.error("Error updating collection:", error);
        throw new Error("Failed to update collection");
    }
}

export async function deleteCollection(id: string) {
    try {
        const { error } = await supabase.from('collections').delete().eq('id', id);
        if (error) throw error;
        revalidatePath("/admin/collections");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting collection:", error);
        return { success: false, error };
    }
}

// Homepage Management
export async function getHomepageContent() {
    console.log("[ACTION] Fetching homepage content...");
    let home: any = null;
    let collections: any[] = [];
    let products: any[] = [];

    // 1. Homepage Section Fallback
    try {
        const { data, error } = await supabase.from('homepage_content').select('*').eq('id', 1).single();
        if (!error && data) home = data;
    } catch (e) {
        console.warn("[OFFLINE] Homepage fetch failed.");
    }

    if (!home || !home.hero || home.hero.subtitle === "kbkbb") {
        try {
            const jsonPath = path.join(process.cwd(), 'homepage.json');
            if (fs.existsSync(jsonPath)) {
                home = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            }
        } catch (e) {
            console.error("Failed to read homepage.json:", e);
        }
    }

    // 2. Collections Fallback
    try {
        const { data, error } = await supabase.from('collections').select('*').eq('status', 'Active').limit(4);
        if (!error && data && data.length > 0) collections = data;
        else throw new Error("No collections");
    } catch (e) {
        console.warn("[OFFLINE] Using collections.json fallback.");
        try {
            const jsonPath = path.join(process.cwd(), 'collections.json');
            if (fs.existsSync(jsonPath)) {
                collections = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).filter((c: any) => c.status === 'Active');
            }
        } catch (err) {
            console.error("Failed to read collections.json:", err);
        }
    }

    // 3. Best Sellers Fallback
    try {
        const { data, error } = await supabase.from('products').select('*').order('popularity', { ascending: false }).limit(8);
        if (!error && data && data.length > 0) products = data;
        else throw new Error("No products");
    } catch (e) {
        console.warn("[OFFLINE] Using products.json fallback.");
        try {
            const jsonPath = path.join(process.cwd(), 'products.json');
            if (fs.existsSync(jsonPath)) {
                products = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).slice(0, 8);
            }
        } catch (err) {
            console.error("Failed to read products.json:", err);
        }
    }
    
    return {
        ...home,
        collections: collections?.map(c => ({
            id: c.id,
            title: c.name,
            subtitle: c.subtitle || "Curated Series",
            image: c.image,
            link: c.link
        })),
        bestSellers: products
    };
}

export async function updateHero(formData: FormData) {
    try {
        const imageFile = formData.get("image") as File | null;
        const currentImage = formData.get("currentImage") as string || "";
        
        let imageUrl = currentImage;
        if (imageFile && imageFile.size > 0) {
            const savedUrl = await saveFile(imageFile, "homepage/");
            if (savedUrl) imageUrl = savedUrl;
        }

        const data = {
            subtitle: formData.get("subtitle") as string || "",
            title: formData.get("title") as string || "",
            titleAccent: formData.get("titleAccent") as string || "",
            description: formData.get("description") as string || "",
            ctaText: formData.get("ctaText") as string || "",
            ctaLink: formData.get("ctaLink") as string || "/shop",
            secondaryLinkText: formData.get("secondaryLinkText") as string || "",
            secondaryLink: formData.get("secondaryLink") as string || "/shop",
            backgroundImage: imageUrl
        };

        const { error } = await supabase.from('homepage_content').update({ hero: data }).eq('id', 1);
        if (error) throw error;
        revalidatePath("/");
        return { success: true, data: data as HomepageHero };
    } catch (error) {
        console.error("Error updating hero:", error);
        return { success: false };
    }
}

export async function updatePromo(formData: FormData) {
    try {
        const imageFile = formData.get("image") as File | null;
        const currentImage = formData.get("currentImage") as string || "";
        
        let imageUrl = currentImage;
        if (imageFile && imageFile.size > 0) {
            const savedUrl = await saveFile(imageFile, "homepage-promo/");
            if (savedUrl) imageUrl = savedUrl;
        }

        const data = {
            subtitle: formData.get("subtitle") as string || "",
            title: formData.get("title") as string || "",
            titleAccent: formData.get("titleAccent") as string || "",
            description: formData.get("description") as string || "",
            ctaText: formData.get("ctaText") as string || "",
            ctaLink: formData.get("ctaLink") as string || "/shop",
            backgroundImage: imageUrl
        };

        const { error } = await supabase.from('homepage_content').update({ promo: data }).eq('id', 1);
        if (error) throw error;
        revalidatePath("/");
        return { success: true, data: data as HomepagePromo };
    } catch (error) {
        console.error("Error updating promo:", error);
        return { success: false };
    }
}

export async function updateHomepageSection(section: string, data: any) {
    try {
        if (section === 'newsletter') {
            await supabase.from('homepage_content').update({ newsletter: data }).eq('id', 1);
        } else if (section.startsWith('collection-')) {
            // Update individual collection in database if needed, 
            // but usually curated collections are managed in 'collections' table.
            // For now, satisfy the shop store requirement.
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating homepage section:", error);
        return { success: false };
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    console.log(`[ACTION] Updating order ${orderId} to status: ${status}`);
    let normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (normalizedStatus === 'Canceled') normalizedStatus = 'Cancelled';
    try {
        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update({ status: normalizedStatus })
            .eq('id', orderId)
            .select()
            .single();
        
        if (error) throw error;

        // If cancelled, increment stock back
        if (normalizedStatus === 'Cancelled') {
            const { data: items } = await supabase
                .from('order_items')
                .select('product_id, quantity, variant_color, variant_size')
                .eq('order_id', orderId);
            
            if (items) {
                for (const item of items) {
                    const { data: product } = (await supabase
                        .from('products')
                        .select('stock, image_variants')
                        .eq('id', item.product_id)
                        .single()) as { data: Product | null };
                    
                    if (product) {
                        const updatedVariants = (product.imageVariants || []).map(v => {
                            const matchColor = (v.color || '').toLowerCase() === (item.variant_color || '').toLowerCase();
                            const matchSize = (v.size || '').toLowerCase() === (item.variant_size || '').toLowerCase();
                            
                            if (matchColor && matchSize) {
                                return { ...v, quantity: (v.quantity || 0) + item.quantity };
                            }
                            return v;
                        });

                        // Recalculate total stock from variants
                        let newTotalStock: number;
                        if (updatedVariants.length > 0) {
                            newTotalStock = updatedVariants.reduce((sum, v) => sum + (v.quantity || 0), 0);
                        } else {
                            newTotalStock = (product.stock || 0) + item.quantity;
                        }

                        await supabase
                            .from('products')
                            .update({ 
                                stock: newTotalStock,
                                image_variants: updatedVariants 
                            })
                            .eq('id', item.product_id);
                    }
                }
            }
        }

        console.log(`[ACTION] Order ${orderId} successfully updated to ${status}.`);
        
        revalidatePath('/admin');
        revalidatePath('/admin/orders');
        revalidatePath('/admin/inventory');
        revalidatePath(`/admin/orders/${orderId}`);
        
        return { success: true, newStatus: status };
    } catch (error: any) {
        console.error("[ACTION ERROR] updateOrderStatus:", error);
        throw new Error(error.message || "Failed to update order status");
    }
}

export async function deleteOrder(orderId: string) {
    console.log(`[ACTION] Deleting order ${orderId}...`);
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) throw error;
        
        revalidatePath('/admin/orders');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error deleting order:", error);
        throw new Error("Failed to delete order");
    }
}
