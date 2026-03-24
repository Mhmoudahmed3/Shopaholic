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
    ArrowDown,
    CheckCircle, 
    Truck, 
    XCircle,
    Calendar,
    Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/app/admin/components/AdminLayout";
import { deleteProduct, updateOrderStatus } from "@/app/admin/actions";
import { Product, Order, Category, OrderStatus } from "@/lib/types";
import { useState, useMemo } from "react";
import { ConfirmModal } from "@/app/admin/components/ConfirmModal";

// Sort Icon Component
const SortIcon = ({ active, direction }: { active: boolean, direction: 'asc' | 'desc' | null }) => {
    if (!active) return <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return direction === 'asc' ? <ArrowUp className="w-3 h-3 text-black dark:text-white" /> : <ArrowDown className="w-3 h-3 text-black dark:text-white" />;
};

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

/**
 * Fulfillment Card Sub-component for individual order management
 */
function OrderFulfillmentCard({ order }: { order: Order }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [actionType, setActionType] = useState<'cancel' | 'ship' | 'deliver' | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const executeAction = async (status: OrderStatus, type: 'cancel' | 'ship' | 'deliver') => {
        setIsLoading(true);
        setActionType(type);
        try {
            console.log(`[DASHBOARD] Changing order ${order.id} to ${status}`);
            await updateOrderStatus(order.id, status);
            router.refresh();
        } catch (err) {
            console.error("[DASHBOARD ERROR]", err);
        } finally {
            setIsLoading(false);
            setActionType(null);
            setIsConfirmOpen(false);
        }
    };

    const handleAction = async (e: React.MouseEvent, status: OrderStatus, type: 'cancel' | 'ship' | 'deliver') => {
        e.preventDefault();
        e.stopPropagation();
        
        if (type === 'cancel') {
            setIsConfirmOpen(true);
            return;
        }

        await executeAction(status, type);
    };

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group overflow-hidden relative"
        >
            <Link 
                href={`/admin/orders/${order.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View details for order ${order.id}`}
            />
            
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none ${
                order.status === 'Processing' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
            
            <div className="relative z-10 flex justify-between items-start mb-6 pointer-events-none">
                <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border ${
                    order.status === 'Processing' 
                        ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50' 
                        : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50'
                }`}>
                    {order.status}
                </div>
                <span className="text-[10px] text-gray-400 font-mono">#{order.id.slice(-6)}</span>
            </div>

            <div className="relative z-10 space-y-4 pointer-events-none">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customer || 'Guest Customer'}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{order.email}</p>
                </div>
                
                <div className="flex items-end justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Amount</p>
                        <p className="text-lg font-light tracking-tight italic">{(order.total || 0).toLocaleString()} EGP</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </div>

                {/* Action Buttons Container */}
                <div className="relative z-20 grid grid-cols-2 gap-3 pt-4 border-t border-gray-50 dark:border-gray-800 pointer-events-auto">
                    <button 
                        disabled={isLoading}
                        onClick={(e) => handleAction(e, 'Cancelled', 'cancel')}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading && actionType === 'cancel' ? (
                            <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                            <XCircle className="w-3 h-3" />
                        )}
                        {isLoading && actionType === 'cancel' ? 'Wait...' : 'Cancel'}
                    </button>
                    
                    <button 
                        disabled={isLoading}
                        onClick={(e) => {
                            const nextStatus: OrderStatus = order.status === 'Processing' ? 'Shipped' : 'Delivered';
                            handleAction(e, nextStatus, order.status === 'Processing' ? 'ship' : 'deliver');
                        }}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            order.status === 'Processing'
                                ? 'bg-blue-600 text-white hover:bg-black shadow-lg shadow-blue-500/10'
                                : 'bg-emerald-600 text-white hover:bg-black shadow-lg shadow-emerald-500/10'
                        }`}
                    >
                        {isLoading && actionType !== 'cancel' ? (
                            <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            order.status === 'Processing' ? <Truck className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />
                        )}
                        {isLoading && actionType !== 'cancel' ? 'Processing...' : (order.status === 'Processing' ? 'Ship Order' : 'Mark Delivered')}
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Cancel Order"
                message={`Are you sure you want to cancel order #${order.id.slice(-6)}? This action cannot be undone.`}
                type="danger"
                confirmText="Cancel Order"
                isLoading={isLoading && actionType === 'cancel'}
                onConfirm={() => executeAction('Cancelled', 'cancel')}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </motion.div>
    );
}

export default function AdminDashboard({ products, orders, categories, salesMap = {} }: { products: Product[], orders: Order[], categories: Category[], salesMap?: Record<string, number> }) {
    const router = useRouter();
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [popularOnly, setPopularOnly] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: 'createdAt', direction: 'desc' });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Enrich products with dynamic sales data from the server-provided salesMap
    const enrichedProducts = useMemo(() => {
        return products.map(product => ({
            ...product,
            salesLastMonth: salesMap[product.id] || 0
        }));
    }, [products, salesMap]);

    const sortedProducts = useMemo(() => {
        const sortableProducts = [...enrichedProducts];
        if (sortConfig.key && sortConfig.direction) {
            sortableProducts.sort((a, b) => {
                const aValue = (a as any)[sortConfig.key] ?? '';
                const bValue = (b as any)[sortConfig.key] ?? '';
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableProducts;
    }, [enrichedProducts, sortConfig]);

    const filteredProducts = useMemo(() => {
        return sortedProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 p.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesPopular = !popularOnly || (p.popularity || 0) >= 85 || (p.salesLastMonth || 0) >= 10;
            const matchesRating = (p.rating || 0) >= minRating;
            const matchesCategory = !selectedCategory || p.category.toLowerCase() === selectedCategory.toLowerCase();

            return matchesSearch && matchesPopular && matchesRating && matchesCategory;
        });
    }, [sortedProducts, searchQuery, popularOnly, minRating, selectedCategory]);

    const toggleFilterMenu = () => setIsFilterMenuOpen(!isFilterMenuOpen);

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Dashboard Overview" />

            <main className="flex-1 p-8 space-y-12">
                
                {/* Stats Grid */}
                {(() => {
                    const totalRevenue = orders
                        .filter(order => order.status === 'Delivered')
                        .reduce((sum, order) => sum + (order.total || 0), 0);
                    const totalOrders = orders.length;
                    const activeCustomers = new Set(orders.map(o => o.email)).size;
                    const totalStock = enrichedProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

                    return (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <StatCard label="Total Revenue" value={`${(totalRevenue || 0).toLocaleString()} EGP`} trend="+12.5%" trendUp={true} icon={TrendingUp} description="vs last month" color="emerald" />
                            <StatCard label="Total Orders" value={totalOrders.toString()} trend="+8.2%" trendUp={true} icon={ShoppingBag} description="New orders today" color="blue" />
                            <StatCard label="Active Customers" value={activeCustomers.toString()} trend="+5.4%" trendUp={true} icon={Users} description="Growth this week" color="purple" />
                            <StatCard label="Total Inventory" value={totalStock.toString()} trend="Stable" trendUp={true} icon={TrendingUp} description="Active SKU count" color="orange" />
                        </motion.div>
                    );
                })()}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    {/* Inventory Table */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-light tracking-tight">Recent Products</h3>
                                <p className="text-xs text-gray-500 mt-1">Manage your storefront inventory</p>
                            </div>
                            <Link href="/admin/add-item" className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded hover:opacity-80 transition-all shadow-lg shadow-black/10">
                                <Plus className="w-4 h-4" /> Add Product
                            </Link>
                        </div>

                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/5 relative group/table">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between gap-4 bg-white/50 dark:bg-zinc-800/20 relative z-10">
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
                                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
                                                <div className="p-4 space-y-4">
                                                    <div>
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Filter Options</h4>
                                                        <label className="flex items-center justify-between cursor-pointer group">
                                                            <span className={`text-[11px] font-medium transition-colors ${popularOnly ? 'text-black dark:text-white' : 'text-neutral-500'}`}>Best Sellers Only</span>
                                                            <div onClick={() => setPopularOnly(!popularOnly)} className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${popularOnly ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:border-neutral-800'}`}>
                                                                <motion.div animate={{ x: popularOnly ? 18 : 2 }} className={`absolute top-0.5 w-3 h-3 rounded-full shadow-sm ${popularOnly ? 'bg-white dark:bg-black' : 'bg-white dark:bg-neutral-400'}`} />
                                                            </div>
                                                        </label>
                                                    </div>
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
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white group/sort" onClick={() => handleSort('name')}>
                                                <div className="flex items-center gap-1.5">
                                                    Product
                                                    <SortIcon active={sortConfig.key === 'name'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white group/sort" onClick={() => handleSort('category')}>
                                                <div className="flex items-center gap-1.5">
                                                    Category
                                                    <SortIcon active={sortConfig.key === 'category'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white group/sort" onClick={() => handleSort('stock')}>
                                                <div className="flex items-center gap-1.5">
                                                    Stock
                                                    <SortIcon active={sortConfig.key === 'stock'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white group/sort" onClick={() => handleSort('salesLastMonth')}>
                                                <div className="flex items-center gap-1.5">
                                                    Sales
                                                    <SortIcon active={sortConfig.key === 'salesLastMonth'} direction={sortConfig.direction} />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-black dark:hover:text-white group/sort" onClick={() => handleSort('price')}>
                                                <div className="flex items-center gap-1.5">
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
                                                        <div className="w-10 h-12 relative rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                                                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">#{product.id.slice(-6)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded text-[9px] uppercase font-bold tracking-widest">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-medium">{product.stock || 0} left</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-emerald-600">{product.salesLastMonth || 0}</span>
                                                        <span className="text-[8px] text-gray-400 uppercase tracking-tighter">Units Sold</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium italic">{(product.price || 0).toLocaleString()} EGP</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 transition-opacity">
                                                        <Link href={`/admin/add-item?productId=${product.id}`} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><Edit className="w-4 h-4" /></Link>
                                                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-xl font-light tracking-tight">Activity</h3>
                            <p className="text-xs text-gray-500 mt-1">Recent events</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                            <div className="space-y-6">
                                {orders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gray-50 dark:border-zinc-800 ${
                                            order.status === 'Processing' ? 'bg-amber-50 text-amber-600' :
                                            order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-gray-100">Order #{order.id.slice(-6)} <span className="text-gray-400 font-normal">({order.status})</span></p>
                                            <p className="text-[10px] text-gray-500 line-clamp-1">{order.customer || 'Guest'} · {(order.total || 0).toLocaleString()} EGP</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Fulfillment Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-light tracking-tight italic">Active Fulfillment</h3>
                            <p className="text-xs text-gray-500 mt-1">Pending shipping & delivery</p>
                        </div>
                        <Link href="/admin/orders" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">View All</Link>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory scroll-smooth px-4 md:px-8">
                        {orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').slice(0, 10).map((order) => (
                            <div key={order.id} className="flex-shrink-0 w-[300px] md:w-[380px] snap-start">
                                <OrderFulfillmentCard order={order} />
                            </div>
                        ))}
                        {orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length === 0 && (
                            <div className="w-full py-12 text-center bg-gray-50/50 dark:bg-zinc-900/50 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-400 italic">No pending fulfillment tasks</p>
                            </div>
                        )}
                    </div>
                </div>
                
            </main>
        </div>
    );
}

function StatCard({ label, value, trend, trendUp, icon: Icon, description, color = "neutral" }: any) {
    const colorMap: any = {
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
        neutral: "text-gray-500 bg-gray-500/10 border-gray-500/20"
    };
    const colorClasses = colorMap[color] || colorMap.neutral;
    return (
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="relative overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl shadow-sm ${colorClasses}`}><Icon className="w-5 h-5" /></div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500/70">{label}</p>
                <h4 className="text-2xl font-light tracking-tight">{value}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{description}</p>
            </div>
        </motion.div>
    );
}
