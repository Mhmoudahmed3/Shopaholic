"use server";

import { revalidatePath } from "next/cache";
import { SiteSettings, Category, Review, Product, Collection, Homepage } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error("Error fetching site settings:", error);
        return {} as SiteSettings;
    }
    
    return {
        ...data,
        socialLinks: data.social_links // Map DB snake_case to camelCase
    } as any;
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
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('label');
    
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data;
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

// Reviews
export async function addProductReview(productId: string, input: any) {
    try {
        const newReview = {
            id: `rev-${Date.now()}`,
            product_id: productId,
            user_name: input.userName,
            rating: input.rating,
            comment: input.comment,
            verified: true
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
export async function getCuratedCollections() {
    const { data } = await supabase.from('collections').select('*');
    return data || [];
}

export async function getAvailableProducts() {
    const { data } = await supabase.from('products').select('*');
    return data || [];
}

export async function createCuratedCollection(data: any) {
    try {
        const id = data.id || `col-${Date.now()}`;
        const { error } = await supabase.from('collections').upsert([{
            id,
            name: data.name,
            subtitle: data.subtitle,
            image: data.image,
            status: data.status || 'Active',
            link: data.link || `/shop?collection=${id}`
        }]);

        if (error) throw error;
        revalidatePath("/admin/collections");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error creating collection:", error);
        return { success: false, error };
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
    const { data: home } = await supabase.from('homepage_content').select('*').eq('id', 1).single();
    const { data: collections } = await supabase.from('collections').select('*').eq('status', 'Active').limit(4);
    const { data: products } = await supabase.from('products').select('*').order('popularity', { ascending: false }).limit(8);
    
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

export async function updateHero(data: any) {
    await supabase.from('homepage_content').update({ hero: data }).eq('id', 1);
    revalidatePath("/");
    return { success: true };
}

export async function updatePromo(data: any) {
    await supabase.from('homepage_content').update({ promo: data }).eq('id', 1);
    revalidatePath("/");
    return { success: true };
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
