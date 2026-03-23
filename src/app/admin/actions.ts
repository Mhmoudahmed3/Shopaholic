"use server";

import { revalidatePath } from "next/cache";
import { getSettingsDB, saveSettingsDB, getProductsDB, saveProductsDB } from "@/lib/db";
import { SiteSettings, Category, Review } from "@/lib/types";

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
export async function addProductReview(productId: string, review: Omit<Review, 'id' | 'date'>) {
    try {
        const products = getProductsDB();
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error("Product not found");

        const product = products[index];
        const reviews = product.reviews || [];
        
        const newReview: Review = {
            ...review,
            id: `rev-${Date.now()}`,
            date: new Date().toISOString(),
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
