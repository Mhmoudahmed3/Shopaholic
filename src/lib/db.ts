import fs from 'fs';
import path from 'path';
import { Product, Category, Order, Homepage, Collection, SiteSettings } from './types';
import { mockProducts } from './mock-data';

const isVercel = !!process.env.VERCEL;
// Force it to use the project root in local dev to ensure persistence consistency
const getDbPath = (filename: string) => isVercel ? path.join('/tmp', filename) : path.join(process.cwd(), filename);

const settingsDbPath = getDbPath('settings.json');
const productsDbPath = getDbPath('products.json');
const homepageDbPath = getDbPath('homepage.json');
const categoriesDbPath = getDbPath('categories.json');
const ordersDbPath = getDbPath('orders.json');
const collectionsDbPath = getDbPath('collections.json');

const DEFAULT_SETTINGS: SiteSettings = {
    storeName: "Reham Website",
    storeDescription: "Luxury fashion for the modern woman.",
    contactEmail: "support@reham.com",
    contactPhone: "+20 123 456 7890",
    address: "Cairo, Egypt",
    currency: "EGP",
    currencySymbol: "EGP",
    maintenanceMode: false,
    socialLinks: {
        instagram: "reham_fashion",
        facebook: "rehamfashion",
        twitter: "reham_fashion",
        tiktok: "reham_fashion",
        whatsapp: ""
    },
    footerText: "© 2024 Reham Website. All rights reserved.",
    taxRate: 14,
    shippingFee: 250,
    freeShippingThreshold: 5000
};

const DEFAULT_CATEGORIES: Category[] = [
    { id: "women", label: "Women" },
    { id: "men", label: "Men" },
    { id: "children", label: "Children" },
    { id: "accessories", label: "Accessories" }
];

// Utility to safely write JSON
const writeJson = (filePath: string, data: any) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        throw error;
    }
};

// Settings
export function initSettingsDB() {
    if (!fs.existsSync(settingsDbPath)) {
        writeJson(settingsDbPath, DEFAULT_SETTINGS);
    }
}

export function getSettingsDB(): SiteSettings {
    if (!fs.existsSync(settingsDbPath)) return DEFAULT_SETTINGS;
    try {
        const data = fs.readFileSync(settingsDbPath, 'utf8');
        return JSON.parse(data) || DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettingsDB(settings: SiteSettings) {
    writeJson(settingsDbPath, settings);
}

// Products
export function initDB() {
    if (!fs.existsSync(productsDbPath) || fs.readFileSync(productsDbPath, 'utf8').trim() === '[]') {
        writeJson(productsDbPath, mockProducts);
    }
}

export function getProductsDB(): Product[] {
    if (!fs.existsSync(productsDbPath)) return mockProducts;
    try {
        const data = fs.readFileSync(productsDbPath, 'utf8');
        const parsed = JSON.parse(data);
        // FIX: Only return mock if file is totally invalid, not if it's empty
        return Array.isArray(parsed) ? parsed : mockProducts;
    } catch {
        return mockProducts;
    }
}

export function saveProductsDB(products: Product[]) {
    writeJson(productsDbPath, products);
}

// Categories
export function initCategoriesDB() {
    if (!fs.existsSync(categoriesDbPath) || fs.readFileSync(categoriesDbPath, 'utf8').trim() === '') {
        writeJson(categoriesDbPath, DEFAULT_CATEGORIES);
    }
}

export function getCategoriesDB(): Category[] {
    if (!fs.existsSync(categoriesDbPath)) return DEFAULT_CATEGORIES;
    try {
        const data = fs.readFileSync(categoriesDbPath, 'utf8');
        const parsed = JSON.parse(data);
        // FIX: Allow empty array, don't fallback to defaults if users deleted everything
        return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
    } catch {
        return DEFAULT_CATEGORIES;
    }
}

export function saveCategoriesDB(categories: Category[]) {
    writeJson(categoriesDbPath, categories);
}

export function deleteCategoryDB(categoryId: string) {
    console.log(`[DB] Deleting category: ${categoryId}`);
    const categories = getCategoriesDB();
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    saveCategoriesDB(updatedCategories);

    // Cascade delete products
    const products = getProductsDB();
    const updatedProducts = products.filter(p => p.category !== categoryId);
    saveProductsDB(updatedProducts);
    console.log(`[DB] Category deleted and ${products.length - updatedProducts.length} related products removed.`);
}

// Homepage
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
                image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80"
            }
        };
        writeJson(homepageDbPath, defaultHomepage);
    }
}

export function getHomepageDB(): Homepage {
    if (!fs.existsSync(homepageDbPath)) return {} as Homepage;
    try {
        const data = fs.readFileSync(homepageDbPath, 'utf8');
        return JSON.parse(data);
    } catch {
        return {} as Homepage;
    }
}

export function saveHomepageDB(content: Homepage) {
    writeJson(homepageDbPath, content);
}

// Orders
export function initOrdersDB() {
    if (!fs.existsSync(ordersDbPath)) {
        writeJson(ordersDbPath, []);
    }
}

export function getOrdersDB(): Order[] {
    if (!fs.existsSync(ordersDbPath)) return [];
    try {
        const data = fs.readFileSync(ordersDbPath, 'utf8');
        return JSON.parse(data) || [];
    } catch {
        return [];
    }
}

export function saveOrdersDB(orders: Order[]) {
    writeJson(ordersDbPath, orders);
}

// Collections
export function getCollectionsDB(): Collection[] {
    if (!fs.existsSync(collectionsDbPath)) return [];
    try {
        const data = fs.readFileSync(collectionsDbPath, 'utf8');
        return JSON.parse(data) || [];
    } catch {
        return [];
    }
}

export function saveCollectionsDB(collections: Collection[]) {
    writeJson(collectionsDbPath, collections);
}

export function getCollection(id: string) {
    const collections = getCollectionsDB();
    return collections.find(c => c.id === id);
}

export function getCollectionProducts(productIds: string[]) {
    const products = getProductsDB();
    return products.filter(p => productIds.includes(p.id));
}

export function getAvailableFilters(options: { category?: string, type?: string } = {}) {
    const { category, type } = options;
    const products = getProductsDB();
    let filtered = products;

    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    if (type) {
        filtered = filtered.filter(p => p.type?.toLowerCase() === type.toLowerCase());
    }

    const sizes = Array.from(new Set(filtered.flatMap(p => p.sizes || []).map(s => s.toLowerCase())));
    const colors = Array.from(new Set(filtered.flatMap(p => p.colors || []).map(c => c.toLowerCase())));

    return { sizes, colors };
}
