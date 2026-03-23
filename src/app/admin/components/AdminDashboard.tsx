"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    TrendingUp, 
    ShoppingBag, 
    Users, 
    ArrowUpRight, 
    ArrowDownRight, 
    Edit,
    Trash2,
    Plus,
    Filter,
    ChevronRight,
    Search,
    Star,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdminHeader } from "@/app/admin/components/AdminLayout";
import { deleteProduct } from "@/app/admin/actions";
import { Product, Order, Category } from "@/lib/types";

// Sort Icon Component
const SortIcon = ({ active, direction }: { active: boolean, direction: 'asc' | 'desc' | null }) => {
    if (!active) return <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return direction === 'asc' ? <ArrowUp className="w-3 h-3 text-black dark:text-white" /> : <ArrowDown className="w-3 h-3 text-black dark:text-white" />;
};

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

import { useState, useMemo } from "react";

export default function AdminDashboard({ products, orders, categories }: { products: Product[], orders: Order[], categories: Category[] }) {
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [popularOnly, setPopularOnly] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: 'createdAt', direction: 'desc' });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProducts = useMemo(() => {
        const sortableProducts = [...products];
        if (sortConfig.key && sortConfig.direction) {
            sortableProducts.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Product] ?? '';
                const bValue = b[sortConfig.key as keyof Product] ?? '';
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableProducts;
    }, [products, sortConfig]);

    const filteredProducts = useMemo(() => {
        return sortedProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesPopular = !popularOnly || (p.popularity || 0) >= 85;
            const matchesRating = (p.rating || 0) >= minRating;

            return matchesSearch && matchesPopular && matchesRating;
        });
    }, [sortedProducts, searchQuery, popularOnly, minRating]);

    const toggleFilterMenu = () => setIsFilterMenuOpen(!isFilterMenuOpen);
    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Dashboard Overview" />

            <main className="flex-1 p-8 space-y-12">
                
                {/* 1. Stats Grid */}
                {(() => {
                    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
                    const totalOrders = orders.length;
                    const activeCustomers = new Set(orders.map(o => o.email)).size;
                    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

                    return (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
                        >
                            <StatCard 
                                label="Total Revenue" 
                                value={`${totalRevenue.toLocaleString()} EGP`} 
                                trend="Live" 
                                trendUp={true} 
                                icon={TrendingUp} 
                                description="Real-time total"
                            />
                            <StatCard 
                                label="Total Orders" 
                                value={totalOrders.toString()} 
                                trend="Live" 
                                trendUp={true} 
                                icon={ShoppingBag}
                                description="Order count"
                            />
                            <StatCard 
                                label="Active Customers" 
                                value={activeCustomers.toString()} 
                                trend="Live" 
                                trendUp={true} 
                                icon={Users}
                                description="Unique buyers"
                            />
                            <StatCard 
                                label="Total Inventory" 
                                value={totalStock.toString()} 
                                trend="Live" 
                                trendUp={true} 
                                icon={TrendingUp}
                                description="Items in stock"
                            />
                        </motion.div>
                    );
                })()}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    {/* 2. Inventory Table */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-light tracking-tight">Recent Products</h3>
                                <p className="text-xs text-gray-500 mt-1">Manage your storefront inventory</p>
                            </div>
                            <div className="flex gap-3">
                                <Link 
                                    href="/admin/add-item"
                                    className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded hover:opacity-80 transition-all shadow-lg shadow-black/10"
                                >
                                    <Plus className="w-4 h-4" /> Add Product
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-zinc-800/30 relative">
                                <div className="flex items-center gap-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-lg flex-1 sm:w-64 sm:flex-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Filter products..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-none outline-none text-xs flex-1" 
                                    />
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={toggleFilterMenu}
                                        className={`p-2 transition-colors rounded-lg ${isFilterMenuOpen ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                                    >
                                        <Filter className="w-4 h-4" />
                                    </button>

                                    <AnimatePresence>
                                        {isFilterMenuOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90"
                                            >
                                                <div className="p-4 space-y-4">
                                                    <div>
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Status</h4>
                                                        <label className="flex items-center justify-between cursor-pointer group">
                                                            <div className="flex flex-col">
                                                                <span className={`text-[11px] font-medium transition-colors ${popularOnly ? 'text-black dark:text-white' : 'text-neutral-500'}`}>Best Sellers</span>
                                                                <span className="text-[9px] text-neutral-400 font-normal">Popularity score 85+</span>
                                                            </div>
                                                            <div 
                                                                onClick={() => setPopularOnly(!popularOnly)}
                                                                className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${popularOnly ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                                                            >
                                                                <motion.div 
                                                                    animate={{ x: popularOnly ? 18 : 2 }}
                                                                    className={`absolute top-0.5 w-3 h-3 rounded-full shadow-sm ${popularOnly ? 'bg-white dark:bg-black' : 'bg-white dark:bg-neutral-400'}`}
                                                                />
                                                            </div>
                                                        </label>
                                                    </div>

                                                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Minimum Rating</h4>
                                                        <div className="space-y-2">
                                                            {[4.5, 4, 3, 0].map((rating) => (
                                                                <button
                                                                    key={rating}
                                                                    onClick={() => setMinRating(rating)}
                                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                                                                        minRating === rating 
                                                                            ? 'bg-neutral-100 dark:bg-zinc-800 text-black dark:text-white' 
                                                                            : 'text-neutral-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="flex">
                                                                            {[...Array(Math.floor(rating || 5))].map((_, i) => (
                                                                                <svg key={i} className={`w-2.5 h-2.5 ${rating === 0 ? 'fill-neutral-200' : 'fill-yellow-400'}`} viewBox="0 0 20 20">
                                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                                </svg>
                                                                            ))}
                                                                        </div>
                                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{rating === 0 ? 'Any Rating' : `${rating}+ Stars`}</span>
                                                                    </div>
                                                                    {minRating === rating && <div className="w-1 h-1 rounded-full bg-black dark:bg-white" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => {
                                                            setPopularOnly(false);
                                                            setMinRating(0);
                                                            setSearchQuery("");
                                                        }}
                                                        className="w-full pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-rose-500 transition-colors"
                                                    >
                                                        Reset All
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50/30 dark:bg-zinc-900/50 uppercase tracking-wider text-[10px] text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors group" onClick={() => handleSort('name')}>
                                                <div className="flex items-center gap-1">
                                                    Product
                                                    <SortIcon active={sortConfig.key === 'name'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                             <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort('category')}>
                                                 <div className="flex items-center gap-1">
                                                     Category
                                                     <SortIcon active={sortConfig.key === 'category'} direction={sortConfig.direction} />
                                                 </div>
                                             </th>
                                             <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                                                 <div className="flex items-center gap-1">
                                                     Type
                                                 </div>
                                             </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort('rating')}>
                                                <div className="flex items-center gap-1">
                                                    Rating
                                                    <SortIcon active={sortConfig.key === 'rating'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort('stock')}>
                                                <div className="flex items-center gap-1">
                                                    Stock
                                                    <SortIcon active={sortConfig.key === 'stock'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort('salesLastMonth')}>
                                                <div className="flex items-center gap-1">
                                                    Sales (Last Month)
                                                    <SortIcon active={sortConfig.key === 'salesLastMonth'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort('price')}>
                                                <div className="flex items-center gap-1">
                                                    Price
                                                    <SortIcon active={sortConfig.key === 'price'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                        {filteredProducts.slice(0, 5).map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-14 bg-gray-100 dark:bg-zinc-800 relative rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                                                            <Image
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                fill
                                                                sizes="48px"
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">ID: {product.id.slice(-6)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                 {(() => {
                                                    const categoryObj = categories?.find(c => c.id === product.category);
                                                    return (
                                                        <>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded text-[10px] uppercase font-bold tracking-tighter">
                                                                    {categoryObj?.type || "N/A"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2.5 py-1 bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-500 rounded text-[10px] uppercase font-medium tracking-tight border border-gray-100 dark:border-gray-800">
                                                                    {categoryObj?.label || "N/A"}
                                                                </span>
                                                            </td>
                                                        </>
                                                    );
                                                 })()}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        <span className="text-[11px] font-bold">{product.rating || 0}</span>
                                                        <span className="text-[9px] text-gray-400 font-normal">({product.reviewsCount || 0})</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="h-1 w-16 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div className={`h-full bg-black dark:bg-white transition-all duration-1000`} style={{ width: `${Math.min(100, ((product.stock || 0) / 50) * 100)}%` }} />
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{product.stock || 0} in Stock</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100">{product.salesLastMonth || 0}</span>
                                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest leading-none">Units</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{product.price.toLocaleString()} EGP</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link 
                                                            href={`/admin/add-item?productId=${product.id}`}
                                                            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button 
                                                            onClick={() => deleteProduct(product.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-800/30">
                                <Link href="/admin" className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center gap-1 transition-colors">
                                    View Full Inventory <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 3. Recent Orders Activity */}
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-xl font-light tracking-tight">Activity</h3>
                            <p className="text-xs text-gray-500 mt-1">Real-time store events</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                            <div className="space-y-6">
                                {orders.slice(0, 5).map((order, idx) => (
                                    <div key={order.id} className="flex gap-4 relative">
                                        {idx !== Math.min(orders.length, 5) - 1 && (
                                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-[1px] bg-gray-100 dark:bg-zinc-800" />
                                        )}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-gray-50 dark:border-zinc-800 shadow-sm ${
                                            order.status === 'Processing' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' :
                                            order.status === 'Shipped' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' :
                                            'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                                        }`}>
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-bold uppercase tracking-tight text-gray-900 dark:text-gray-100">
                                                    Order {order.id}
                                                </p>
                                                <span className="text-[10px] text-gray-400">{order.date}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                <span className="text-gray-900 dark:text-gray-200 font-medium">{order.customer}</span> placed an order for <span className="text-gray-900 dark:text-gray-200 font-medium">{order.total.toLocaleString()} EGP</span>
                                            </p>
                                            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest inline-block px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800 text-gray-400">
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-8 py-3 border border-gray-100 dark:border-gray-800 rounded text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
                                Load More Activity
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Quick Actions / Categories */}
                <div className="bg-black text-white rounded-2xl p-8 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all duration-700" />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-light tracking-tight mb-4 italic">Expand your horizon.</h3>
                            <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-8">
                                Manage your collections and navigation menu to reflect your latest seasons. Changes here will immediately propagate to the storefront.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8 md:mb-0">
                                <button className="px-6 py-3 w-full sm:w-auto bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity text-center">
                                    Manage Collections
                                </button>
                                <button className="px-6 py-3 w-full sm:w-auto border border-gray-700 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors text-center">
                                    View Analytics
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <CategoryBox 
                                label="Women" 
                                count={products.filter(p => p.category?.toLowerCase() === 'women').length} 
                            />
                            <CategoryBox 
                                label="Men" 
                                count={products.filter(p => p.category?.toLowerCase() === 'men').length} 
                            />
                            <CategoryBox 
                                label="Accessories" 
                                count={products.filter(p => p.category?.toLowerCase() === 'accessories').length} 
                            />
                            <CategoryBox 
                                label="New Items" 
                                count={products.filter(p => p.isNew || (p as unknown as Record<string, boolean>).isNewCollection).length} 
                                highlighted={true} 
                            />
                        </div>
                    </div>
                </div>
                
            </main>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ElementType;
    description: string;
}

function StatCard({ label, value, trend, trendUp, icon: Icon, description }: StatCardProps) {
    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-gray-100" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trendUp ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                    <span className="hidden sm:inline">{trend}</span>
                </div>
            </div>
            <div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-gray-400 font-bold mb-1 truncate">{label}</p>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                    <h4 className="text-lg sm:text-2xl font-light tracking-tight text-gray-900 dark:text-gray-100 truncate">{value}</h4>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium truncate">{description}</span>
                </div>
            </div>
        </motion.div>
    );
}

interface CategoryBoxProps {
    label: string;
    count: number;
    highlighted?: boolean;
}

function CategoryBox({ label, count, highlighted = false }: CategoryBoxProps) {
    return (
        <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
            highlighted 
                ? 'bg-white text-black border-white' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-gray-300'
        }`}>
            <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-60">{count} Items</p>
            <p className="text-sm font-medium tracking-tight">{label}</p>
        </div>
    );
}
