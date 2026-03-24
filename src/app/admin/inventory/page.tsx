import { getProducts } from "@/lib/db";
import { getCategoriesDB, getProductSales } from "@/lib/db";
import { AdminHeader } from "../components/AdminLayout";
import { Edit, Plus, Star, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import { deleteProduct } from "../actions";
import { InventoryFilters } from "./InventoryFilters";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = 'force-dynamic';

export default async function InventoryPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
    const resolvedParams = await searchParams;
    const category = resolvedParams.category || "all";
    const type = resolvedParams.type || "all";
    const minRating = resolvedParams.rating ? parseInt(resolvedParams.rating) : undefined;
    const isPopular = resolvedParams.popular === "true";
    const q = resolvedParams.q || "";
    const sortBy = resolvedParams.sortBy || "createdAt";
    const order = (resolvedParams.order as 'asc' | 'desc') || "desc";

    // Fetch products and sales data in parallel
    const [rawProducts, salesMap] = await Promise.all([
        getProducts({ 
            category,
            type: type === 'all' ? undefined : type,
            minRating,
            isPopular
        }),
        getProductSales()
    ]);

    // Enrich products with dynamic sales data
    let products = rawProducts.map(p => ({
        ...p,
        salesLastMonth: salesMap[p.id] || 0
    }));

    if (q) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(q.toLowerCase()) || 
            p.id.toLowerCase().includes(q.toLowerCase()) ||
            p.category.toLowerCase().includes(q.toLowerCase())
        );
    }

    // Server-side sorting
    products = [...products].sort((a: any, b: any) => {
        const aValue = a[sortBy as string] ?? '';
        const bValue = b[sortBy as string] ?? '';
        
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
    });

    const categories = await getCategoriesDB();

    const getSortLink = (key: string) => {
        const params = new URLSearchParams();
        if (resolvedParams.category) params.set('category', resolvedParams.category);
        if (resolvedParams.type) params.set('type', resolvedParams.type);
        if (resolvedParams.rating) params.set('rating', resolvedParams.rating);
        if (resolvedParams.popular) params.set('popular', resolvedParams.popular);
        if (resolvedParams.q) params.set('q', resolvedParams.q);
        
        params.set('sortBy', key);
        params.set('order', sortBy === key && order === 'asc' ? 'desc' : 'asc');
        
        return `/admin/inventory?${params.toString()}`;
    };

    const renderSortIcon = (colKey: string) => {
        if (sortBy !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
        return order === 'asc' ? <ArrowUp className="w-3 h-3 text-black dark:text-white" /> : <ArrowDown className="w-3 h-3 text-black dark:text-white" />;
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Product Inventory" />

            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-light tracking-tight">Manage Catalog</h1>
                        <p className="text-xs text-gray-500 mt-1">Total {products.length} products found in the store</p>
                    </div>
                    <Link 
                        href="/admin/add-item"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 border border-transparent dark:border-neutral-200 text-xs font-bold uppercase tracking-widest rounded hover:opacity-80 transition-all shadow-lg w-full md:w-auto"
                    >
                        <Plus className="w-4 h-4" /> Add New Item
                    </Link>
                </div>

                <InventoryFilters 
                    categories={categories}
                    initialQ={q}
                    initialCategory={category}
                    initialType={type}
                    initialRating={resolvedParams.rating || ""}
                    initialPopular={isPopular}
                />

                {/* Inventory Table */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 dark:bg-zinc-800/20 uppercase tracking-wider text-[10px] text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('name')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Product Details {renderSortIcon('name')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('category')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Category {renderSortIcon('category')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('type')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Type {renderSortIcon('type')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('stock')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Stock {renderSortIcon('stock')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('rating')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Avg Rating {renderSortIcon('rating')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('salesLastMonth')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Sales (Last Month) {renderSortIcon('salesLastMonth')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('price')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Retail Price {renderSortIcon('price')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5">
                                        <Link href={getSortLink('createdAt')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Created {renderSortIcon('createdAt')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-800/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-16 bg-gray-100 dark:bg-zinc-800 relative rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 shrink-0">
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        sizes="56px"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">ID: {product.id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {(() => {
                                            const categoryObj = categories.find(c => c.id === product.category);
                                            return (
                                                <>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded text-[10px] uppercase font-bold tracking-tighter">
                                                                    {categoryObj?.type || "N/A"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2.5 py-1 bg-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-500 rounded text-[10px] uppercase font-medium tracking-tight border border-gray-100 dark:border-gray-800">
                                                                    {categoryObj?.label || "N/A"}
                                                                </span>
                                                            </td>
                                                </>
                                            );
                                        })()}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-black dark:bg-white transition-all duration-1000" style={{ width: `${Math.min(100, ((product.stock || 0) / 50) * 100)}%` }} />
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{product.stock || 0} in Stock</span>
                                                </div>
                                                {(product.popularity || 0) >= 85 && (
                                                    <span className="text-[9px] text-green-600 dark:text-green-400 font-bold uppercase tracking-tighter">
                                                        Popular Item
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <svg className="w-3 h-3 fill-yellow-400" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-xs font-medium">{product.rating || "N/A"}</span>
                                                <span className="text-[10px] text-gray-400">({product.reviewsCount || 0})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{product.salesLastMonth || 0}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Units sold</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                             <p className="font-medium text-gray-900 dark:text-gray-100">{(product.price || 0).toLocaleString()} EGP</p>
                                            {product.discountPrice && (
                                                 <p className="text-[10px] text-red-500 line-through">{((product.price || 0) * 1.2).toLocaleString()} EGP</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500">
                                                {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link 
                                                    href={`/admin/add-item?productId=${product.id}`}
                                                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4.5 h-4.5" />
                                                </Link>
                                                <Link 
                                                    href={`/admin/inventory/ratings/${product.id}`}
                                                    className="p-2.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all" 
                                                    title="Manage Ratings"
                                                >
                                                    <Star className="w-4.5 h-4.5" />
                                                </Link>
                                                <DeleteProductButton 
                                                    productId={product.id} 
                                                    productName={product.name} 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-zinc-900/50 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Showing 1 to {products.length} of {products.length} products</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-[10px] font-bold uppercase tracking-widest text-gray-400 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-4 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-[10px] font-bold uppercase tracking-widest text-gray-400 disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
