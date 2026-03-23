import { supabase } from './supabase';
import { ApiProduct, PaginatedResponse, ApiOrder, CreateOrderPayload, CreateOrderResponse } from './types';

// ── Products ──────────────────────────────────────────────────────────────────

export interface GetProductsParams {
    page?: number;
    limit?: number;
    category?: string;
    type?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
    search?: string;
}

export async function getApiProducts(
    params: GetProductsParams = {}
): Promise<PaginatedResponse<any>> {
    let query = supabase.from('products').select('*', { count: 'exact' });

    if (params.category) query = query.eq('category', params.category);
    if (params.type) query = query.eq('type', params.type);
    if (params.search) query = query.ilike('name', `%${params.search}%`);

    const page = params.page || 1;
    const limit = params.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    if (params.sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (params.sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (params.sort === 'popular') query = query.order('popularity', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

export async function getApiProduct(id: string): Promise<{ data: any }> {
    const { data, error } = await supabase
        .from('products')
        .select('*, reviews(*)')
        .eq('id', id)
        .single();
    
    if (error) throw error;
    return { data };
}

export async function getApiRelatedProducts(id: string): Promise<{ data: any[] }> {
    // Basic implementation: fetch products in the same category
    const { data: current } = await supabase.from('products').select('category').eq('id', id).single();
    if (!current) return { data: [] };

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', current.category)
        .neq('id', id)
        .limit(4);

    if (error) throw error;
    return { data: data || [] };
}

// ── Auth & Orders (Bypass/Placeholder for now as Supabase handles auth naturally)
export async function login(email: string, pass: string) {
    return supabase.auth.signInWithPassword({ email, password: pass });
}

export async function getMyOrders() {
    const { data } = await supabase.from('orders').select('*');
    return { data: data || [] };
}
