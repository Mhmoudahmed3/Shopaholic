"use server";

import { revalidatePath } from "next/cache";
import { getProductsDB, saveProductsDB, getHomepageDB, saveHomepageDB, getSettingsDB, saveSettingsDB } from "@/lib/db";
import { Product } from "@/lib/data";
import { Homepage, SiteSettings } from "@/lib/types";
import fs from "fs";
import path from "path";

export async function deleteProduct(id: string) {
    const products = getProductsDB();
    const updated = products.filter(p => p.id !== id);
    saveProductsDB(updated);
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/admin/inventory');
}

export async function addProduct(formData: FormData) {
    try {
        const products = getProductsDB();
        const newProduct = await processFormData(formData, Date.now().toString());
        products.push(newProduct);
        saveProductsDB(products);
        revalidatePaths();
        return { success: true };
    } catch (error) {
        console.error("Error adding product:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to add product");
    }
}

export async function updateProduct(formData: FormData) {
    try {
        const productId = formData.get("productId") as string;
        if (!productId) throw new Error("Product ID is missing for update");

        const products = getProductsDB();
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error(`Product with ID ${productId} not found`);

        const existingProduct = products[index];
        const updatedProduct = await processFormData(formData, productId, existingProduct);
        
        products[index] = updatedProduct;
        saveProductsDB(products);
        revalidatePaths();
        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update product");
    }
}

function revalidatePaths() {
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/admin/inventory');
}

async function processFormData(formData: FormData, productId: string, existingProduct?: Product): Promise<Product> {
    const categoryVal = formData.get("category") as Product['category'];
    const typeRaw = formData.get("type") as string;
    const type = typeRaw && typeRaw.trim() !== "" ? typeRaw.trim() : undefined;

    const discountPriceRaw = formData.get("discountPrice");
    const discountPrice = discountPriceRaw ? Number(discountPriceRaw) : undefined;

    const activeImageIds = formData.getAll("activeImageIds") as string[];
    const imageVariants: { url: string; color?: string; size?: string; quantity?: number }[] = [];
    let images: string[] = [];

    // Keep existing images if no new ones are uploaded for those slots
    // This is a bit simplified. In a real app we'd handle file uploads specifically.
    // For now, if no file is provided, we might want to keep the old URL if this is an edit.
    // This is a bit simplified. In a real app we'd handle file uploads specifically.
    // For now, if no file is provided, we might want to keep the old URL if this is an edit.
    
    const isVercel = !!process.env.VERCEL;
    const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const id of activeImageIds) {
        const file = formData.get(`image_${id}`) as File | null;
        const colorRaw = formData.get(`color_${id}`) as string;
        const color = colorRaw && colorRaw.trim() !== "" ? colorRaw.trim() : undefined;

        const sizesJson = formData.get(`sizes_${id}`) as string;
        let nestedSizes: { size: string, quantity: number }[] = [];
        try {
            nestedSizes = sizesJson ? JSON.parse(sizesJson) : [];
        } catch (e) {
            console.error(`Failed to parse sizes for variant ${id}:`, e);
        }

        const existingImageUrl = formData.get(`existing_image_${id}`) as string;

        let url = existingImageUrl || "";

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, buffer);
            url = `/uploads/${filename}`;
        }

        if (url) {
            images.push(url);
            if (nestedSizes.length > 0) {
                nestedSizes.forEach(s => {
                    imageVariants.push({ 
                        url, 
                        color, 
                        size: s.size, 
                        quantity: s.quantity 
                    });
                });
            } else {
                imageVariants.push({ url, color });
            }
        }
    }

    if (images.length === 0 && (!existingProduct || existingProduct.images.length === 0)) {
        images = ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800"];
    }

    const extractedSizes = Array.from(new Set(imageVariants.map(v => v.size).filter(Boolean))) as string[];
    const extractedColors = Array.from(new Set(imageVariants.map(v => v.color).filter(Boolean))) as string[];

    return {
        ...existingProduct,
        id: productId,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: Number(formData.get("price")),
        ...(discountPrice !== undefined && { discountPrice }),
        category: categoryVal,
        ...(type && { type }),
        images: images,
        ...(imageVariants.length > 0 && { imageVariants }),
        sizes: extractedSizes.length > 0 ? extractedSizes : ["One Size"],
        colors: extractedColors.length > 0 ? extractedColors : ["Default"],
        createdAt: existingProduct?.createdAt || new Date().toISOString(),
        isNew: existingProduct?.isNew ?? true,
        stock: Number(formData.get("stock") || 0)
    };
}

export async function addCollection(formData: FormData) {
    const { getCategoriesDB, saveCategoriesDB } = await import("@/lib/db");
    const categories = getCategoriesDB();

    const label = formData.get("name") as string;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if category already exists
    if (!categories.find(c => c.id === id)) {
        categories.push({ id, label });
        saveCategoriesDB(categories);
        revalidatePath('/shop');
        revalidatePath('/admin');
        revalidatePath('/');
    }
}

export async function createCuratedCollection(formData: FormData) {
    const { getCollectionsDB, saveCollectionsDB } = await import("@/lib/db");
    const collections = getCollectionsDB();

    const name = formData.get("name") as string;
    const subtitle = formData.get("subtitle") as string;
    const status = formData.get("status") as 'Active' | 'Draft';
    const productIdsValue = formData.get("productIds") as string;
    const productIds = productIdsValue ? JSON.parse(productIdsValue) : [];
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const file = formData.get("image") as File | null;
    let imageUrl = "";

    if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `collection-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
        const isVercel = !!process.env.VERCEL;
        const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
    }

    const newCollection = {
        id,
        name,
        subtitle,
        image: imageUrl,
        status,
        productIds,
        itemsCount: productIds.length,
        link: `/collections/${id}`,
        createdAt: new Date().toISOString()
    };

    collections.push(newCollection);
    saveCollectionsDB(collections);
    
    revalidatePath('/admin/collections');
    revalidatePath('/');
    return { success: true };
}

export async function updateCuratedCollection(formData: FormData) {
    const { getCollectionsDB, saveCollectionsDB } = await import("@/lib/db");
    const collections = getCollectionsDB();

    const collectionId = formData.get("collectionId") as string;
    const index = collections.findIndex(c => c.id === collectionId);
    if (index === -1) throw new Error("Collection not found");

    const name = formData.get("name") as string;
    const subtitle = formData.get("subtitle") as string;
    const status = formData.get("status") as 'Active' | 'Draft';
    const productIdsValue = formData.get("productIds") as string;
    const productIds = productIdsValue ? JSON.parse(productIdsValue) : [];
    
    const file = formData.get("image") as File | null;
    let imageUrl = formData.get("currentImage") as string || "";

    if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `collection-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
        const isVercel = !!process.env.VERCEL;
        const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
    }

    const updatedCollection = {
        ...collections[index],
        name,
        subtitle,
        image: imageUrl,
        status,
        productIds,
        itemsCount: productIds.length,
        updatedAt: new Date().toISOString()
    };

    collections[index] = updatedCollection;
    saveCollectionsDB(collections);
    
    revalidatePath('/admin/collections');
    revalidatePath('/');
    return { success: true };
}

export async function deleteCollection(id: string) {
    const { getCollectionsDB, saveCollectionsDB } = await import("@/lib/db");
    const collections = getCollectionsDB();
    const updated = collections.filter(c => c.id !== id);
    saveCollectionsDB(updated);
    revalidatePath('/admin/collections');
    revalidatePath('/');
    return { success: true };
}

export async function getCuratedCollections() {
    const { getCollectionsDB } = await import("@/lib/db");
    return getCollectionsDB();
}

export async function getAvailableProducts() {
    const { getProductsDB } = await import("@/lib/db");
    return getProductsDB();
}

export async function updateHero(formData: FormData) {
    try {
        const homepage = getHomepageDB() || ({} as Record<string, unknown>);
        
        const file = formData.get("image") as File | null;
        let imageUrl = formData.get("currentImage") as string || "";

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `hero-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const isVercel = !!process.env.VERCEL;
            const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
        }

        const updatedHero = {
            subtitle: formData.get("subtitle") as string,
            title: formData.get("title") as string,
            titleAccent: formData.get("titleAccent") as string,
            description: formData.get("description") as string,
            ctaText: formData.get("ctaText") as string,
            ctaLink: formData.get("ctaLink") as string,
            secondaryLinkText: formData.get("secondaryLinkText") as string,
            secondaryLink: formData.get("secondaryLink") as string,
            backgroundImage: imageUrl
        };

        homepage.hero = updatedHero;
        saveHomepageDB(homepage as unknown as Homepage);
        revalidatePath('/');
        return { success: true, data: updatedHero };
    } catch (error) {
        console.error("Error updating hero:", error);
        throw new Error("Failed to update hero section");
    }
}

export async function updatePromo(formData: FormData) {
    try {
        const homepage = getHomepageDB() || ({} as Record<string, unknown>);
        
        const file = formData.get("image") as File | null;
        let imageUrl = formData.get("currentImage") as string || "";

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `promo-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const isVercel = !!process.env.VERCEL;
            const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
        }

        const updatedPromo = {
            subtitle: formData.get("subtitle") as string,
            title: formData.get("title") as string,
            titleAccent: formData.get("titleAccent") as string,
            description: formData.get("description") as string,
            ctaText: formData.get("ctaText") as string,
            ctaLink: formData.get("ctaLink") as string,
            backgroundImage: imageUrl
        };

        homepage.promo = updatedPromo;
        saveHomepageDB(homepage as unknown as Homepage);
        revalidatePath('/');
        return { success: true, data: updatedPromo };
    } catch (error) {
        console.error("Error updating promo:", error);
        throw new Error("Failed to update promo section");
    }
}

export async function updateHomepageSection(section: string, data: unknown) {
    try {
        const homepage = getHomepageDB() || ({} as Record<string, unknown>);
        (homepage as Record<string, unknown>)[section] = data;
        saveHomepageDB(homepage as unknown as Homepage);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(`Error updating ${section}:`, error);
        throw new Error(`Failed to update ${section}`);
    }
}

export async function getHomepageContent() {
    try {
        const { getCollectionsDB, getHomepageDB, getProductsDB } = await import("@/lib/db");
        const homepage = getHomepageDB() || {};
        const collections = getCollectionsDB();
        const allProducts = getProductsDB();
        
        // Map database collections to homepage format
        const mappedCollections = collections
            .filter(c => c.status === 'Active')
            .map(c => ({
                id: c.id,
                title: c.name,
                subtitle: c.subtitle || "",
                image: c.image,
                link: c.link
            }));

        // Get top 8 best sellers by popularity
        const bestSellers = [...allProducts]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 8);

        return {
            ...homepage,
            collections: mappedCollections,
            bestSellers
        };
    } catch (error) {
        console.error("Error fetching homepage content:", error);
        return null;
    }
}

export async function addProductReview(productId: string, formData: FormData) {
    try {
        const products = getProductsDB();
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error("Product not found");

        const product = products[index];
        const userName = formData.get("userName") as string;
        const rating = Number(formData.get("rating"));
        const comment = formData.get("comment") as string;
        const date = formData.get("date") as string || new Date().toISOString();

        const newReview = {
            id: Date.now().toString(),
            userName,
            rating,
            comment,
            date,
            verified: true
        };

        const reviews = product.reviews || [];
        reviews.push(newReview);

        // Update aggregate rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = Number((totalRating / reviews.length).toFixed(1));
        product.reviewsCount = reviews.length;
        product.reviews = reviews;

        products[index] = product;
        saveProductsDB(products);

        revalidatePath(`/shop/${productId}`);
        revalidatePath('/admin/inventory');
        revalidatePath(`/admin/inventory/ratings/${productId}`);
        
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

export async function getSiteSettings() {
    return getSettingsDB();
}

export async function updateSiteSettings(settings: SiteSettings) {
    try {
        saveSettingsDB(settings);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error updating site settings:", error);
        throw new Error("Failed to update site settings");
    }
}
