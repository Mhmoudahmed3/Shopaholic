import fs from 'fs';
import path from 'path';
import { Product, Category, Order, Homepage, Collection } from './types';

const dbPath = path.join(process.cwd(), 'products.json');

// Initialize DB if it doesn't exist
export function initDB() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
    }
}

export function getProductsDB(): Product[] {
    if (!fs.existsSync(dbPath)) return [];
    const data = fs.readFileSync(dbPath, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function saveProductsDB(products: Product[]) {
    fs.writeFileSync(dbPath, JSON.stringify(products, null, 2));
}

const homepageDbPath = path.join(process.cwd(), 'homepage.json');

export function initHomepageDB() {
    if (!fs.existsSync(homepageDbPath)) {
        const defaultHomepage = {
            hero: {
                subtitle: "PREMIUM COLLECTION 2024",
                title: "Elegance Redefined",
                titleAccent: "for the Modern Woman",
                description: "Discover our curated collection of high-end fashion pieces designed to empower and inspire.",
                ctaText: "Shop Collection",
                ctaLink: "/shop",
                secondaryLinkText: "View Lookbook",
                secondaryLink: "/lookbook",
                backgroundImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80"
            },
            promo: {
                subtitle: "LIMITED EDITION",
                title: "The Summer Collection",
                titleAccent: "Is Here",
                description: "Handcrafted pieces using the finest silks and sustainable materials. Every detail is a statement of luxury.",
                ctaText: "Explore Now",
                ctaLink: "/shop?collection=summer",
                backgroundImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80"
            },
            newsletter: {
                title: "Join the Inner Circle",
                description: "Be the first to know about new arrivals, private sales, and exclusive events."
            }
        };
        fs.writeFileSync(homepageDbPath, JSON.stringify(defaultHomepage, null, 2));
    }
}

export function getHomepageDB(): Homepage | null {
    if (!fs.existsSync(homepageDbPath)) return null;
    const data = fs.readFileSync(homepageDbPath, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function saveHomepageDB(content: Homepage) {
    fs.writeFileSync(homepageDbPath, JSON.stringify(content, null, 2));
}

const categoriesDbPath = path.join(process.cwd(), 'categories.json');

export function initCategoriesDB() {
    if (!fs.existsSync(categoriesDbPath) || fs.readFileSync(categoriesDbPath, 'utf8').trim() === '') {
        fs.writeFileSync(categoriesDbPath, JSON.stringify([], null, 2));
    }
}

export function getCategoriesDB(): Category[] {
    if (!fs.existsSync(categoriesDbPath)) return [];
    const data = fs.readFileSync(categoriesDbPath, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function saveCategoriesDB(categories: Category[]) {
    fs.writeFileSync(categoriesDbPath, JSON.stringify(categories, null, 2));
}

const ordersDbPath = path.join(process.cwd(), 'orders.json');

export function initOrdersDB() {
    if (!fs.existsSync(ordersDbPath)) {
        fs.writeFileSync(ordersDbPath, JSON.stringify([], null, 2));
    }
}

export function getOrdersDB(): Order[] {
    if (!fs.existsSync(ordersDbPath)) return [];
    const data = fs.readFileSync(ordersDbPath, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function saveOrdersDB(orders: Order[]) {
    fs.writeFileSync(ordersDbPath, JSON.stringify(orders, null, 2));
}

const collectionsDbPath = path.join(process.cwd(), 'collections.json');

export function initCollectionsDB() {
    if (!fs.existsSync(collectionsDbPath)) {
        fs.writeFileSync(collectionsDbPath, JSON.stringify([], null, 2));
    }
}

export function getCollectionsDB(): Collection[] {
    if (!fs.existsSync(collectionsDbPath)) return [];
    const data = fs.readFileSync(collectionsDbPath, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function saveCollectionsDB(collections: Collection[]) {
    fs.writeFileSync(collectionsDbPath, JSON.stringify(collections, null, 2));
}

// These functions were moved from data.ts to ensure they only run on the server
export async function getProducts(options: {
    category?: string;
    type?: string;
    sort?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    isPopular?: boolean;
} = {}) {
    const { category, type, sort, size, color, minPrice, maxPrice, minRating, isPopular } = options;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let result = getProductsDB();

    if (category && category !== 'all') {
        result = result.filter(p => p.category === category);
    }

    if (type) {
        result = result.filter(p => p.type === type);
    }

    if (size) {
        result = result.filter(p => p.sizes.some(s => s.toLowerCase() === size.toLowerCase()));
    }

    if (color) {
        result = result.filter(p => p.colors.some(c => c.toLowerCase() === color.toLowerCase()));
    }

    if (minPrice !== undefined) {
        result = result.filter(p => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
        result = result.filter(p => p.price <= maxPrice);
    }

    if (minRating !== undefined && minRating > 0) {
        result = result.filter(p => (p.rating || 0) >= minRating);
    }

    if (isPopular) {
        result = result.filter(p => (p.popularity || 0) >= 85);
    }

    if (sort === 'price-low') {
        result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        result.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'popularity') {
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return result;
}

export async function getProduct(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getProductsDB().find(p => p.id === id);
}

export async function getRelatedProducts(id: string, category: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getProductsDB().filter(p => p.category === category && p.id !== id).slice(0, 4);
}
export async function getCollection(id: string) {
    const collections = getCollectionsDB();
    return collections.find(c => c.id === id);
}

export async function getCollectionProducts(productIds: string[]) {
    const products = getProductsDB();
    return products.filter(p => productIds.includes(p.id));
}
