export interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    verified?: boolean;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    category: string;
    type?: string;
    images: string[];
    imageVariants?: { url: string; color?: string; size?: string; quantity?: number }[];
    sizes: string[];
    colors: string[];
    isNew?: boolean;
    popularity?: number;
    rating?: number;
    reviewsCount?: number;
    reviews?: Review[];
    salesLastMonth?: number;
    stock?: number;
    createdAt: string;
}

export interface Category {
    id: string;
    label: string;
    type?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
    id: string;
    date: string;
    created_at?: string;
    customer: string;
    email: string;
    phone?: string;
    items: any[];
    items_count?: number;
    itemsCount?: number;
    total: number;
    status: OrderStatus;
}

export interface Collection {
    id: string;
    name: string;
    subtitle?: string;
    image: string;
    status: 'Active' | 'Draft';
    productIds: string[];
    itemsCount: number;
    link: string;
    createdAt: string;
}

export interface HomepageHero {
    subtitle: string;
    title: string;
    titleAccent: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    secondaryLinkText: string;
    secondaryLink: string;
    backgroundImage: string;
}

export interface HomepagePromo {
    subtitle: string;
    title: string;
    titleAccent: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
}

export interface HomepageNewsletter {
    title: string;
    description: string;
    ctaText: string;
}

export interface Homepage {
    hero: HomepageHero;
    promo: HomepagePromo;
    newsletter: HomepageNewsletter;
}

export interface SiteSettings {
    storeName: string;
    storeDescription: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
    currency: string;
    currencySymbol: string;
    maintenanceMode: boolean;
    socialLinks: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        tiktok?: string;
        whatsapp?: string;
    };
    footerText: string;
    taxRate: number;
    shippingFee: number;
    freeShippingThreshold: number;
    sizeScales?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type ApiProduct = Product;

export interface CreateOrderPayload {
    items: { product_id: string; quantity: number }[];
    shipping_address?: Record<string, string>;
}

export interface CreateOrderResponse {
    message: string;
    order: Order;
}

export type ApiOrder = Order;
