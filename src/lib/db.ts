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
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data && data.length > 0) {
      return data.map(p => ({
        ...p,
        discountPrice: p.discount_price,
        imageVariants: p.image_variants,
        reviewsCount: p.reviews_count,
        createdAt: p.created_at
      })) as any;
    }
    throw new Error(error?.message || "No products in Supabase");
  } catch (e) {
    console.warn("[OFFLINE] Supabase failed, using products.json for inventory.");
    try {
      const jsonPath = path.join(process.cwd(), 'products.json');
      if (fs.existsSync(jsonPath)) {
          const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          return products;
      }
    } catch (err) {}
  }
  return [];
}

export async function getProduct(id: string): Promise<Product | undefined> {
  try {
    const { data, error } = await supabase.from('products').select('*, reviews(*)').eq('id', id).single();
    if (error || !data) throw new Error("Product not found");
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
  } catch (e) {
    console.warn(`[OFFLINE] Checking products.json for product ID: ${id}`);
    try {
      const jsonPath = path.join(process.cwd(), 'products.json');
      if (fs.existsSync(jsonPath)) {
          const products: Product[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          return products.find(p => p.id === id);
      }
    } catch (err) {}
    return undefined;
  }
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
  try {
    // First, try with order_items join
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    
    // If the join works, return it
    if (!error && data) {
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

    // If the join fails specifically (e.g. table doesn't exist or RLS), but connection is alive
    if (error && !error.message.includes('fetch failed')) {
      console.warn('[getOrdersDB] Join query failed, falling back to orders-only query:', error.message);
      const { data: ordersOnly, error: fallbackError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!fallbackError && ordersOnly) {
        return ordersOnly.map(o => ({
          ...o,
          customer: o.customer_name,
          total: o.total_amount,
          items: [],
          itemsCount: o.items_count,
          date: new Date(o.created_at).toLocaleDateString()
        }));
      }
    }
    
    throw new Error(error?.message || "Join query failed");
  } catch (e: any) {
    const isNetworkError = e.message?.includes('fetch failed');
    if (isNetworkError) {
        console.warn("[OFFLINE] Supabase connection failed. Using orders.json fallback.");
    } else {
        console.error("[getOrdersDB] Database error:", e.message);
    }
    
    try {
      const jsonPath = path.join(process.cwd(), 'orders.json');
      if (fs.existsSync(jsonPath)) {
          const orders = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          return (orders || []).map((o: any) => ({
            ...o,
            customer: o.customer || o.customer_name,
            total: o.total || o.total_amount,
            items: o.items || [],
            itemsCount: o.itemsCount || o.items_count || 0,
            date: o.date || new Date(o.created_at).toLocaleDateString()
          }));
      }
    } catch (err) {
      console.error("Failed to read orders.json fallback:", err);
    }
  }
  
  return [];
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
  try {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
    if (!error && data) {
      return {
        ...data,
        customer: data.customer_name,
        total: data.total_amount,
        items: data.order_items || [],
        itemsCount: data.items_count,
        date: new Date(data.created_at).toLocaleDateString()
      };
    }
  } catch (e) {}

  // Offline Fallback
  try {
    const jsonPath = path.join(process.cwd(), 'orders.json');
    if (fs.existsSync(jsonPath)) {
        const orders = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const order = orders.find((o: any) => o.id === id);
        if (order) {
            return {
              ...order,
              customer: order.customer || order.customer_name,
              total: order.total || order.total_amount,
              items: order.items || [],
              itemsCount: order.itemsCount || order.items_count || 0,
              date: order.date || new Date(order.created_at).toLocaleDateString()
            };
        }
    }
  } catch (err) {}
  
  return undefined;
}

// Collections
export async function getCollectionsDB(): Promise<Collection[]> {
  try {
    const { data, error } = await supabase.from('collections').select('*');
    if (!error && data && data.length > 0) {
      return data.map(c => ({
        ...c,
        productIds: c.product_ids || [],
        itemsCount: c.items_count || (c.product_ids || []).length,
        createdAt: c.created_at
      })) as any;
    }
    throw new Error("No collections from Supabase");
  } catch (e) {
    console.warn("[OFFLINE] Using collections.json for collections index.");
    try {
      const jsonPath = path.join(process.cwd(), 'collections.json');
      if (fs.existsSync(jsonPath)) {
        const collections = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return collections.filter((c: any) => c.status === 'Active');
      }
    } catch (err) {
      console.error("Failed to read collections.json:", err);
    }
  }
  return [];
}

export async function saveCollectionsDB(collections: Collection[]) {
  // Not used
}

export async function getCollection(id: string): Promise<Collection | undefined> {
  try {
    const { data, error } = await supabase.from('collections').select('*').eq('id', id).single();
    if (!error && data) {
      return {
        ...data,
        productIds: data.product_ids || [],
        itemsCount: (data.product_ids || []).length,
        createdAt: data.created_at
      } as any;
    }
    throw new Error("No collection found in Supabase");
  } catch (e) {
    console.warn(`[OFFLINE] Fetching collection ${id} from local fallback.`);
    try {
      const jsonPath = path.join(process.cwd(), 'collections.json');
      if (fs.existsSync(jsonPath)) {
        const collections: Collection[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const collection = collections.find((c: any) => c.id === id);
        if (collection) {
          return {
            ...collection,
            productIds: (collection as any).productIds || [],
            itemsCount: (collection as any).itemsCount || ((collection as any).productIds || []).length
          };
        }
      }
    } catch (err) {
      console.error("Failed to read collections.json fallback:", err);
    }
  }
  return undefined;
}

export async function getCollectionProducts(productIds: string[]): Promise<Product[]> {
  if (!productIds || productIds.length === 0) return [];
  
  try {
    const { data, error } = await supabase.from('products').select('*').in('id', productIds);
    if (error || !data) throw new Error("No products");
    
    return (data || []).map(p => ({
      ...p,
      discountPrice: p.discount_price,
      imageVariants: p.image_variants,
      createdAt: p.created_at
    })) as any;
  } catch (e) {
    console.warn(`[OFFLINE] Checking products.json for collection items`);
    try {
      const jsonPath = path.join(process.cwd(), 'products.json');
      if (fs.existsSync(jsonPath)) {
          const products: Product[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          return products.filter(p => productIds.includes(p.id));
      }
    } catch (err) {}
    return [];
  }
}

export async function getRelatedProducts(productId: string, category?: string): Promise<Product[]> {
  try {
    let targetCategory = category;
    
    if (!targetCategory) {
      const { data: current, error } = await supabase.from('products').select('category').eq('id', productId).single();
      if (error || !current) throw new Error("Category not found");
      targetCategory = current.category;
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', targetCategory)
        .neq('id', productId)
        .limit(4);

    if (error || !data) throw new Error("No related products");
    return (data || []).map(p => ({
      ...p,
      discountPrice: p.discount_price,
      imageVariants: p.image_variants,
      createdAt: p.created_at
    })) as any;
  } catch (e) {
    console.warn(`[OFFLINE] Checking products.json for related products`);
    try {
      const jsonPath = path.join(process.cwd(), 'products.json');
      if (fs.existsSync(jsonPath)) {
          const products: Product[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          const currentProduct = products.find(p => p.id === productId);
          const targetCategory = category || currentProduct?.category;
          return products
            .filter(p => p.category === targetCategory && p.id !== productId)
            .slice(0, 4);
      }
    } catch (err) {}
    return [];
  }
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

    if (params.q) {
      const q = `%${params.q}%`;
      query = query.or(`name.ilike.${q},description.ilike.${q},category.ilike.${q},type.ilike.${q}`);
    }

    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params.type) query = query.eq('type', params.type);
    if (params.minPrice) query = query.gte('price', params.minPrice);
    if (params.maxPrice) query = query.lte('price', params.maxPrice);
    if (params.minRating) query = query.gte('rating', params.minRating);

    if (params.sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (params.sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (params.sort === 'popularity') query = query.order('popularity', { ascending: false });
    else if (params.sort === 'rating') query = query.order('rating', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (!error && data && data.length > 0) products = data;
    else throw new Error("No products");
  } catch (e) {
    console.warn("[OFFLINE] Using products.json for inventory/shop.");
    try {
        const jsonPath = path.join(process.cwd(), 'products.json');
        if (fs.existsSync(jsonPath)) {
            let localProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            
            // Manual Filtering for Offline Mode
            if (params.q) {
                const qLower = params.q.toLowerCase().trim();
                // Map common terms for better search matching
                const searchTerms = [qLower];
                if (qLower === 'man' || qLower === 'men') searchTerms.push('man', 'men');
                if (qLower === 'woman' || qLower === 'women') searchTerms.push('woman', 'women');
                if (qLower === 'kid' || qLower === 'kids' || qLower === 'children') searchTerms.push('kid', 'kids', 'children');

                localProducts = localProducts.filter((p: any) => {
                    const searchableText = `${p.name} ${p.description} ${p.category} ${p.type}`.toLowerCase();
                    return searchTerms.some(term => searchableText.includes(term));
                });
            }
            
            if (params.category && params.category !== 'all') {
                const catLower = params.category.toLowerCase();
                localProducts = localProducts.filter((p: any) => {
                    // Check if it's a broad category match in the 'type' field
                    const typeMatch = p.type?.toLowerCase() === catLower;
                    // Or an exact category match
                    const catMatch = p.category?.toLowerCase() === catLower;
                    return typeMatch || catMatch;
                });
            }
            if (params.type) {
                const typeLower = params.type.toLowerCase();
                // Map common synonyms for offline robustness
                const searchTerms = [typeLower];
                if (typeLower === 'tops') searchTerms.push('shirts', 'tshirts', 'tops');
                if (typeLower === 'shoes') searchTerms.push('sneakers', 'sandals', 'shoes');
                if (typeLower === 'pants') searchTerms.push('jeans', 'trousers', 'pants');

                localProducts = localProducts.filter((p: any) => {
                    const pCat = p.category?.toLowerCase() || "";
                    const pType = p.type?.toLowerCase() || "";
                    // Match against any of the terms
                    return searchTerms.some(term => pCat.includes(term) || pType.includes(term));
                });
            }
            if (params.size) {
                const selectedSizes = params.size.split(',').map((s: string) => s.toLowerCase());
                localProducts = localProducts.filter((p: any) => 
                    p.sizes?.some((s: string) => selectedSizes.includes(s.toLowerCase()))
                );
            }
            if (params.color) {
                const selectedColors = params.color.split(',').map((c: string) => c.toLowerCase());
                localProducts = localProducts.filter((p: any) => 
                    p.colors?.some((c: string) => selectedColors.includes(c.toLowerCase()))
                );
            }
            if (params.minPrice) {
                localProducts = localProducts.filter((p: any) => p.price >= params.minPrice);
            }
            if (params.maxPrice) {
                localProducts = localProducts.filter((p: any) => p.price <= params.maxPrice);
            }
            if (params.minRating) {
                localProducts = localProducts.filter((p: any) => p.rating >= params.minRating);
            }
            if (params.isPopular) {
                localProducts = localProducts.filter((p: any) => p.popularity >= 80);
            }

            // Manual Sorting
            if (params.sort === 'price_asc') {
                localProducts.sort((a: any, b: any) => a.price - b.price);
            } else if (params.sort === 'price_desc') {
                localProducts.sort((a: any, b: any) => b.price - a.price);
            } else if (params.sort === 'popularity') {
                localProducts.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
            } else if (params.sort === 'rating') {
                localProducts.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
            } else {
                localProducts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            }

            products = localProducts;
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
  let productsData: any[] = [];
  try {
    const { data, error } = await supabase.from('products').select('colors, sizes, price');
    if (!error && data && data.length > 0) {
      productsData = data;
    } else {
      throw new Error("No products in DB");
    }
  } catch (e) {
    console.warn("[OFFLINE] Using products.json for available filters.");
    try {
      const jsonPath = path.join(process.cwd(), 'products.json');
      if (fs.existsSync(jsonPath)) {
          productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      }
    } catch (err) {}
  }
  
  const allColors = new Set<string>();
  const allSizes = new Set<string>();
  let maxPrice = 0;

  productsData?.forEach(p => {
    p.colors?.forEach((c: string) => allColors.add(c.toLowerCase()));
    p.sizes?.forEach((s: string) => allSizes.add(s.toLowerCase()));
    if (p.price > maxPrice) maxPrice = p.price;
  });

  return {
    colors: Array.from(allColors),
    sizes: Array.from(allSizes),
    maxPrice
  };
}
