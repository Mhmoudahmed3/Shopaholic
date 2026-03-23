import { supabase } from './supabase';
import { SiteSettings, Category, Product, Collection, Homepage } from './types';

// Site Settings
export async function getSettingsDB(): Promise<SiteSettings> {
  let { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  
  // Auto-sync store name if it's the old one
  if (data && data.store_name === "REHAM") {
    const { data: updated } = await supabase.from('site_settings').upsert({
      id: 1,
      store_name: "SHOPOHOLIC"
    }).select().single();
    if (updated) data = updated;
  }

  if (error || !data) return { storeName: "SHOPOHOLIC" } as SiteSettings;
  
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
    socialLinks: data.social_links,
    footerText: data.footer_text,
    taxRate: data.tax_rate,
    shippingFee: data.shipping_fee,
    freeShippingThreshold: data.free_shipping_threshold
  } as any;
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
  const { data, error } = await supabase.from('categories').select('*');
  return data || [];
}

export async function saveCategoriesDB(categories: Category[]) {
  // Not used
}

export async function deleteCategoryDB(id: string) {
  await supabase.from('categories').delete().eq('id', id);
}

// Orders
export async function getOrdersDB(): Promise<any[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  return data || [];
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
  if (error) return [];
  
  return (data || []).map(p => ({
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
