import { supabase } from './supabase';
import { SiteSettings, Category, Product, Collection, Homepage } from './types';
import path from 'path';
import fs from 'fs';

// Site Settings
export async function getSettingsDB(): Promise<SiteSettings> {
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
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (error || !data) return defaultSettings;
    
    return {
      ...data,
      storeName: data.store_name,
      storeDescription: data.store_description,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      address: data.address,
      currency: data.currency,
      currencySymbol: data.currency_symbol,
      maintenanceMode: data.maintenance_mode,
      socialLinks: data.social_links || defaultSettings.socialLinks,
      footerText: data.footer_text,
      taxRate: data.tax_rate,
      shippingFee: data.shipping_fee,
      freeShippingThreshold: data.free_shipping_threshold
    } as any;
  } catch (e) {
    return defaultSettings;
  }
}

export async function saveSettingsDB(settings: SiteSettings) {
  const { error } = await supabase.from('site_settings').upsert({
    id: 1,
    store_name: settings.storeName,
    social_links: settings.socialLinks,
    // ...other fields as needed
  });
  if (error) throw error;
}

// Products
export async function getProductsDB(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return [];
  return data.map(p => ({
    ...p,
    discountPrice: p.discount_price,
    imageVariants: p.image_variants,
    reviewsCount: p.reviews_count,
    createdAt: p.created_at
  })) as any;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase.from('products').select('*, reviews(*)').eq('id', id).single();
  if (error || !data) return undefined;
  return {
    ...data,
    discountPrice: data.discount_price,
    imageVariants: data.image_variants,
    reviewsCount: data.reviews_count,
    createdAt: data.created_at,
    reviews: data.reviews?.map((r: any) => ({
      ...r,
      userName: r.user_name,
      date: r.created_at
    }))
  } as any;
}

export async function saveProductsDB(products: Product[]) {
  // Not used anymore in the new Supabase actions, but kept for compatibility
}

// Categories
export async function getCategoriesDB(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error && data && data.length > 0) return data;
  } catch (e) {}

  try {
    const jsonPath = path.join(process.cwd(), 'categories.json');
    if (fs.existsSync(jsonPath)) {
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
  } catch (e) {}
  return [];
}

export async function saveCategoriesDB(categories: Category[]) {
  // Not used
}

export async function deleteCategoryDB(id: string) {
  await supabase.from('categories').delete().eq('id', id);
}

// Orders
export async function getOrdersDB(): Promise<any[]> {
  // First, try with order_items join
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  
  // If the join fails (e.g. table doesn't exist or RLS), fall back to orders only
  if (error) {
    console.error('[getOrdersDB] Join query failed, falling back:', error.message);
    const { data: ordersOnly, error: fallbackError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fallbackError || !ordersOnly) return [];
    
    return ordersOnly.map(o => ({
      ...o,
      customer: o.customer_name,
      total: o.total_amount,
      items: [],
      itemsCount: o.items_count,
      date: new Date(o.created_at).toLocaleDateString()
    }));
  }
  
  return data.map(o => ({
    ...o,
    customer: o.customer_name,
    phone: o.phone,
    total: o.total_amount,
    items: o.order_items || [],
    itemsCount: o.items_count,
    date: new Date(o.created_at).toLocaleDateString()
  }));
}

// Get dynamic sales count per product from order_items (excluding cancelled orders)
export async function getProductSales(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, quantity, orders!inner(status)')
      .neq('orders.status', 'Cancelled');

    if (!error && data) {
      const salesMap: Record<string, number> = {};
      for (const item of data) {
        const pid = item.product_id;
        if (pid) {
          salesMap[pid] = (salesMap[pid] || 0) + (item.quantity || 0);
        }
      }
      return salesMap;
    }
  } catch (e) {}

  return {}; // Default to empty sales map for offline
}

export async function getOrderById(id: string): Promise<any | undefined> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !data) return undefined;
  
  return {
    ...data,
    customer: data.customer_name,
    total: data.total_amount,
    items: data.items_count,
    date: new Date(data.created_at).toLocaleDateString()
  };
}

// Collections
export async function getCollectionsDB(): Promise<Collection[]> {
  const { data, error } = await supabase.from('collections').select('*');
  if (error) return [];
  return data.map(c => ({
    ...c,
    productIds: c.product_ids,
    itemsCount: c.items_count,
    createdAt: c.created_at
  })) as any;
}

export async function saveCollectionsDB(collections: Collection[]) {
  // Not used
}

export async function getCollection(id: string): Promise<Collection | undefined> {
  const { data, error } = await supabase.from('collections').select('*').eq('id', id).single();
  if (error || !data) return undefined;
  return {
    ...data,
    productIds: data.product_ids,
    itemsCount: data.items_count,
    createdAt: data.created_at
  } as any;
}

export async function getCollectionProducts(productIds: string[]): Promise<Product[]> {
  if (!productIds || productIds.length === 0) return [];
  
  const { data, error } = await supabase.from('products').select('*').in('id', productIds);
  if (error) return [];
  
  return (data || []).map(p => ({
    ...p,
    discountPrice: p.discount_price,
    imageVariants: p.image_variants,
    createdAt: p.created_at
  })) as any;
}

export async function getRelatedProducts(productId: string, category?: string): Promise<Product[]> {
  let targetCategory = category;
  
  if (!targetCategory) {
    const { data: current } = await supabase.from('products').select('category').eq('id', productId).single();
    if (!current) return [];
    targetCategory = current.category;
  }

  const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', targetCategory)
      .neq('id', productId)
      .limit(4);

  if (error) return [];
  return (data || []).map(p => ({
    ...p,
    discountPrice: p.discount_price,
    imageVariants: p.image_variants,
    createdAt: p.created_at
  })) as any;
}

// Homepage
export async function getHomepageDB(): Promise<Homepage> {
  const { data, error } = await supabase.from('homepage_content').select('*').eq('id', 1).single();
  if (error) return {} as Homepage;
  return data as any;
}

export async function saveHomepageDB(content: Homepage) {
  await supabase.from('homepage_content').update(content).eq('id', 1);
}

// Advanced Shop Queries
export async function getProducts(params: any): Promise<Product[]> {
  let products: any[] = [];
  try {
    let query = supabase.from('products').select('*');

    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params.type) query = query.eq('type', params.type);
    if (params.minPrice) query = query.gte('price', params.minPrice);
    if (params.maxPrice) query = query.lte('price', params.maxPrice);
    if (params.minRating) query = query.gte('rating', params.minRating);

    if (params.sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (params.sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (params.sort === 'popular') query = query.order('popularity', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (!error && data && data.length > 0) products = data;
    else throw new Error("No products");
  } catch (e) {
    console.warn("[OFFLINE] Using products.json for inventory/shop.");
    try {
        const jsonPath = path.join(process.cwd(), 'products.json');
        if (fs.existsSync(jsonPath)) {
            products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        }
    } catch (err) {}
  }
  
  return (products || []).map(p => ({
    ...p,
    discountPrice: p.discount_price,
    imageVariants: p.image_variants,
    createdAt: p.created_at
  })) as any;
}

export async function getAvailableFilters(params: any) {
  // Simplify: Return all available colors and sizes from all products (can be optimized)
  const { data } = await supabase.from('products').select('colors, sizes, price');
  
  const allColors = new Set<string>();
  const allSizes = new Set<string>();
  let maxPrice = 0;

  data?.forEach(p => {
    p.colors?.forEach((c: string) => allColors.add(c));
    p.sizes?.forEach((s: string) => allSizes.add(s));
    if (p.price > maxPrice) maxPrice = p.price;
  });

  return {
    colors: Array.from(allColors),
    sizes: Array.from(allSizes),
    maxPrice
  };
}
