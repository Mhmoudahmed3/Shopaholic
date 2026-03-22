/**
 * @module src/lib/api.ts
 * @description Typed API client for communicating with the Express backend.
 * Import and use these helpers in Server Components (using `await`)
 * or Client Components (with useEffect / React Query / SWR).
 *
 * The BASE_URL defaults to the backend running on port 4000 in dev.
 * Set NEXT_PUBLIC_API_URL in your Next.js .env.local for production.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    discount_price: number | null;
    stock: number;
    type: string | null;
    images: string[];
    is_new: boolean;
    popularity: number;
    category_id: string;
    category_name: string;
    category_slug: string;
    created_at: string;
}

export interface ApiOrder {
    id: string;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
    items: ApiOrderItem[];
    created_at: string;
}

export interface ApiOrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
}

export interface ApiUser {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin';
    created_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ── Internal helper ───────────────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    const json = await res.json();

    if (!res.ok) {
        const message = json?.error?.message || `API error: ${res.status}`;
        throw new Error(message);
    }

    return json as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
    message: string;
    token: string;
    user: ApiUser;
}

export async function register(
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> {
    return apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export async function login(
    email: string,
    password: string
): Promise<AuthResponse> {
    return apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function getMe(token: string): Promise<{ user: ApiUser }> {
    return apiFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

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
): Promise<PaginatedResponse<ApiProduct>> {
    const qs = new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function getApiProduct(id: string): Promise<{ data: ApiProduct }> {
    return apiFetch(`/api/products/${id}`);
}

export async function getApiRelatedProducts(
    id: string
): Promise<{ data: ApiProduct[] }> {
    return apiFetch(`/api/products/${id}/related`);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
    items: { product_id: string; quantity: number }[];
    shipping_address?: Record<string, string>;
}

export interface CreateOrderResponse {
    message: string;
    order: ApiOrder;
    stripe_client_secret?: string;
}

export async function createOrder(
    token: string,
    payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
    return apiFetch('/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
}

export async function getMyOrders(
    token: string
): Promise<{ data: ApiOrder[] }> {
    return apiFetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
    });
}
