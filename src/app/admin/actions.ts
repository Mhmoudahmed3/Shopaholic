"use server";

import { revalidatePath } from "next/cache";
import { getSettingsDB, saveSettingsDB, getProductsDB, saveProductsDB, getCollectionsDB, saveCollectionsDB, getHomepageDB, saveHomepageDB } from "@/lib/db";
import { SiteSettings, Category, Review, Product, Collection, Homepage } from "@/lib/types";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Site Settings
export async function getSiteSettings() {
    return getSettingsDB();
}

export async function updateSiteSettings(settings: SiteSettings) {
    console.log("[ACTION] Updating site settings...");
    try {
        saveSettingsDB(settings);
        revalidatePath('/', 'layout');
        revalidatePath('/admin/settings');
        console.log("[ACTION] Site settings updated successfully.");
        return { success: true };
    } catch (error) {
        console.error("Error updating site settings:", error);
        throw new Error("Failed to update site settings");
    }
}

// Categories
export async function getCategories() {
    console.log("[ACTION] Fetching categories...");
    const { getCategoriesDB } = await import("@/lib/db");
    return getCategoriesDB();
}

export async function getCategoryProductCounts() {
    const { getProductsDB } = await import("@/lib/db");
    const products = getProductsDB();
    const counts: Record<string, number> = {};
    
    products.forEach(p => {
        counts[p.category] = (counts[p.category] || 0) + 1;
    });
    
    return counts;
}

export async function addCategory(category: { label: string, type?: string }) {
    console.log(`[ACTION] Adding category: ${category.label} (${category.type || 'no type'})`);
    try {
        const { getCategoriesDB, saveCategoriesDB } = await import("@/lib/db");
        const categories = getCategoriesDB();
        const id = category.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        
        if (categories.some(c => c.id === id)) {
            throw new Error("Category already exists");
        }

        categories.push({ id, label: category.label, type: category.type });
        saveCategoriesDB(categories);
        revalidatePath('/', 'layout');
        revalidatePath('/shop');
        revalidatePath('/admin/settings');
        console.log(`[ACTION] Category ${id} added.`);
        return { success: true };
    } catch (error) {
        console.error("Error adding category:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to add category");
    }
}

export async function updateCategoryServer(categoryId: string, data: { label: string, type?: string }) {
    console.log(`[ACTION] Updating category: ${categoryId}`);
    try {
        const { getCategoriesDB, saveCategoriesDB } = await import("@/lib/db");
        const categories = getCategoriesDB();
        const index = categories.findIndex(c => c.id === categoryId);
        if (index === -1) throw new Error("Category not found");

        categories[index] = { ...categories[index], ...data };
        saveCategoriesDB(categories);
        revalidatePath('/', 'layout');
        revalidatePath('/shop');
        revalidatePath('/admin/settings');
        console.log(`[ACTION] Category ${categoryId} updated.`);
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update category");
    }
}

export async function deleteCategory(categoryId: string) {
    console.log(`[ACTION] Deleting category: ${categoryId}`);
    try {
        const { deleteCategoryDB } = await import("@/lib/db");
        deleteCategoryDB(categoryId);
        revalidatePath('/', 'layout');
        revalidatePath('/shop');
        revalidatePath('/admin/inventory');
        revalidatePath('/admin/settings');
        console.log(`[ACTION] Category ${categoryId} deleted successfully.`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to delete category");
    }
}

// Reviews
export async function addProductReview(productId: string, input: FormData | any) {
    try {
        const products = getProductsDB();
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error("Product not found");

        const product = products[index];
        const reviews = product.reviews || [];
        
        let reviewData: any;
        if (input instanceof FormData) {
            reviewData = {
                userName: input.get("userName") as string,
                rating: parseInt(input.get("rating") as string || "5"),
                comment: input.get("comment") as string,
                date: input.get("date") as string || new Date().toISOString()
            };
        } else {
            reviewData = input;
        }

        const newReview: Review = {
            ...reviewData,
            id: `rev-${Date.now()}`,
            date: reviewData.date || new Date().toISOString(),
            verified: true
        };

        const updatedReviews = [newReview, ...reviews];
        
        // Update aggregate rating
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = Number((totalRating / updatedReviews.length).toFixed(1));
        product.reviewsCount = updatedReviews.length;
        product.reviews = updatedReviews;

        products[index] = product;
        saveProductsDB(products);

        revalidatePath(`/shop/${productId}`);
        revalidatePath(`/admin/inventory/ratings/${productId}`);
        revalidatePath('/admin/inventory');
        
        return { success: true };
    } catch (error) {
        console.error("Error adding review:", error);
        throw new Error("Failed to add review");
    }
}

export async function deleteProductReview(productId: string, reviewId: string) {
    try {
        const products = getProductsDB();
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error("Product not found");

        const product = products[index];
        const reviews = product.reviews || [];
        
        const updatedReviews = reviews.filter(r => r.id !== reviewId);
        
        // Update aggregate rating
        if (updatedReviews.length > 0) {
            const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
            product.rating = Number((totalRating / updatedReviews.length).toFixed(1));
        } else {
            product.rating = 0;
        }
        
        product.reviewsCount = updatedReviews.length;
        product.reviews = updatedReviews;

        products[index] = product;
        saveProductsDB(products);

        revalidatePath(`/shop/${productId}`);
        revalidatePath('/admin/inventory');
        revalidatePath(`/admin/inventory/ratings/${productId}`);
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting review:", error);
        throw new Error("Failed to delete review");
    }
}

// Utility for image saving
async function saveFile(file: File, prefix: string = "") {
    if (!file || file.size === 0) return null;
    
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadsDir = join(process.cwd(), "public", "uploads");
        // Ensure directory exists
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch {}
        
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${prefix}${timestamp}-${safeName}`;
        const path = join(uploadsDir, filename);
        
        await writeFile(path, buffer);
        return `/uploads/${filename}`;
    } catch (error) {
        console.error("Error saving file:", error);
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
        const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : undefined;
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

        const products = getProductsDB();
        const newProduct: Product = {
            id,
            name,
            description,
            price,
            discountPrice,
            category,
            type,
            images: [...new Set(imageUrls)],
            imageVariants,
            sizes: [...new Set(imageVariants.map(v => v.size))],
            colors: [...new Set(imageVariants.map(v => v.color).filter(Boolean))],
            createdAt: new Date().toISOString(),
            stock: imageVariants.reduce((sum, v) => sum + (v.quantity || 0), 0)
        };

        products.push(newProduct);
        saveProductsDB(products);

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
        const products = getProductsDB();
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error("Product not found");

        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string);
        const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : undefined;
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

        products[index] = {
            ...products[index],
            name,
            description,
            price,
            discountPrice,
            category,
            type,
            images: [...new Set(imageUrls)],
            imageVariants,
            sizes: [...new Set(imageVariants.map(v => v.size))],
            colors: [...new Set(imageVariants.map(v => v.color).filter(Boolean))],
            stock: imageVariants.reduce((sum, v) => sum + (v.quantity || 0), 0)
        };

        saveProductsDB(products);

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
        const products = getProductsDB();
        const filtered = products.filter(p => p.id !== productId);
        saveProductsDB(filtered);

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
    return getCollectionsDB();
}

export async function getAvailableProducts() {
    return getProductsDB();
}

export async function createCuratedCollection(data: any) {
    console.log("[ACTION] Creating/Updating collection...");
    try {
        const collections = getCollectionsDB();
        const id = data.id || `coll-${Date.now()}`;
        
        let imageUrl = data.image;
        if (data.imageFile && data.imageFile.size > 0) {
            const saved = await saveFile(data.imageFile, "collection-");
            if (saved) imageUrl = saved;
        }

        const newCollection: Collection = {
            id,
            name: data.name,
            subtitle: data.subtitle,
            image: imageUrl,
            status: data.status || 'Active',
            productIds: data.productIds || [],
            itemsCount: (data.productIds || []).length,
            link: data.link || `/shop?collection=${id}`,
            createdAt: data.createdAt || new Date().toISOString()
        };

        const index = collections.findIndex(c => c.id === id);
        if (index > -1) {
            collections[index] = newCollection;
        } else {
            collections.push(newCollection);
        }

        saveCollectionsDB(collections);
        revalidatePath("/admin/collections");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error saving collection:", error);
        throw new Error("Failed to save collection");
    }
}

export const updateCuratedCollection = createCuratedCollection;

export async function deleteCollection(id: string) {
    try {
        const collections = getCollectionsDB();
        const filtered = collections.filter(c => c.id !== id);
        saveCollectionsDB(filtered);
        revalidatePath("/admin/collections");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        throw new Error("Failed to delete collection");
    }
}

// Homepage Management
export async function getHomepageContent() {
    return getHomepageDB();
}

export async function updateHero(data: any) {
    console.log("[ACTION] Updating Hero section...");
    try {
        const content = getHomepageDB();
        
        let backgroundImage = data.backgroundImage;
        if (data.backgroundFile && data.backgroundFile.size > 0) {
            const saved = await saveFile(data.backgroundFile, "hero-");
            if (saved) backgroundImage = saved;
        }

        content.hero = {
            ...content.hero,
            ...data,
            backgroundImage
        };

        saveHomepageDB(content);
        revalidatePath("/");
        revalidatePath("/admin/home");
        return { success: true, data: content.hero };
    } catch (error) {
        console.error("Error updating hero:", error);
        throw new Error("Failed to update hero section");
    }
}

export async function updatePromo(data: any) {
    console.log("[ACTION] Updating Promo section...");
    try {
        const content = getHomepageDB();
        
        let backgroundImage = data.backgroundImage;
        if (data.imageFile && data.imageFile.size > 0) {
            const saved = await saveFile(data.imageFile, "promo-");
            if (saved) backgroundImage = saved;
        }

        content.promo = {
            ...content.promo,
            ...data,
            backgroundImage
        };

        saveHomepageDB(content);
        revalidatePath("/");
        revalidatePath("/admin/home");
        return { success: true, data: content.promo };
    } catch (error) {
        console.error("Error updating promo:", error);
        throw new Error("Failed to update promo section");
    }
}

export async function updateHomepageSection(section: string, data: any) {
    console.log(`[ACTION] Updating homepage section: ${section}`);
    try {
        const content = getHomepageDB();
        (content as any)[section] = {
            ...(content as any)[section],
            ...data
        };
        saveHomepageDB(content);
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating homepage section:", error);
        throw new Error("Failed to update section");
    }
}
