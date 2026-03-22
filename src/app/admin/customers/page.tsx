import { AdminHeader } from "../components/AdminLayout";
import { 
    Search, 
    MoreHorizontal, 
    UserPlus, 
    Mail, 
    MessageSquare,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CustomersPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
    const resolvedParams = await searchParams;
    const sortBy = resolvedParams.sortBy || "joined";
    const order = (resolvedParams.order as 'asc' | 'desc') || "desc";

    interface Customer {
        id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        spent: number;
        orders: number;
        joined: string;
    }

    // Mock customers data
    const customers: Customer[] = [
        { id: "C-101", name: "Amira Youssef", email: "amira@example.com", phone: "+20 102 345 6789", address: "123 Nile St, Cairo", spent: 45800, orders: 12, joined: "Jan 15, 2024" },
        { id: "C-102", name: "Karim Hassan", email: "karim@example.com", phone: "+20 111 222 3333", address: "45 Giza Rd, Giza", spent: 12400, orders: 3, joined: "Feb 02, 2024" },
        { id: "C-103", name: "Laila Ibrahim", email: "laila@example.com", phone: "+20 120 555 1212", address: "78 Maadi Ave, Cairo", spent: 8900, orders: 2, joined: "Feb 28, 2024" },
        { id: "C-104", name: "Omar Farouk", email: "omar@example.com", phone: "+20 155 888 9999", address: "12 Heliopolis, Cairo", spent: 21500, orders: 7, joined: "Dec 30, 2023" },
        { id: "C-105", name: "Noura Ali", email: "noura@example.com", phone: "+20 100 000 1111", address: "90 Zamalek, Cairo", spent: 3400, orders: 1, joined: "Mar 10, 2024" },
        { id: "C-106", name: "Zaid Mansour", email: "zaid@example.com", phone: "+20 114 777 8888", address: "34 Dokki St, Cairo", spent: 56200, orders: 18, joined: "Nov 12, 2023" },
    ];

    // Sorting logic
    const sortedCustomers = [...customers].sort((a: Customer, b: Customer) => {
        const aValue = a[sortBy as keyof Customer] ?? '';
        const bValue = b[sortBy as keyof Customer] ?? '';
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return order === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (sortBy === 'joined') {
             return order === 'asc' 
                ? new Date(aValue).getTime() - new Date(bValue).getTime()
                : new Date(bValue).getTime() - new Date(aValue).getTime();
        }
        
        const strA = String(aValue).toLowerCase();
        const strB = String(bValue).toLowerCase();

        if (strA < strB) return order === 'asc' ? -1 : 1;
        if (strA > strB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortLink = (key: string) => {
        const params = new URLSearchParams();
        params.set('sortBy', key);
        params.set('order', sortBy === key && order === 'asc' ? 'desc' : 'asc');
        return `/admin/customers?${params.toString()}`;
    };

    const renderSortIcon = (colKey: string) => {
        if (sortBy !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
        return order === 'asc' ? <ArrowUp className="w-3 h-3 text-black dark:text-white" /> : <ArrowDown className="w-3 h-3 text-black dark:text-white" />;
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Customer Directory" />

            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-light tracking-tight">Active Shoppers</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage {customers.length} registered customers</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 border border-transparent dark:border-neutral-200 text-xs font-bold uppercase tracking-widest rounded hover:opacity-80 transition-all shadow-lg">
                        <UserPlus className="w-4 h-4" /> Register New Customer
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl shadow-sm focus-within:ring-2 ring-gray-100 transition-all">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search by name, email, or phone number..." className="bg-transparent border-none outline-none text-sm flex-1" />
                </div>

                {/* Customer Table */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/30 dark:bg-zinc-800/20 uppercase tracking-wider text-[10px] text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">
                                        <Link href={getSortLink('name')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Customer Information {renderSortIcon('name')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5 whitespace-nowrap">
                                        <Link href={getSortLink('phone')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Phone Number {renderSortIcon('phone')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5 whitespace-nowrap">
                                        <Link href={getSortLink('address')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Address {renderSortIcon('address')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5 whitespace-nowrap">
                                        <Link href={getSortLink('orders')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Orders {renderSortIcon('orders')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5 whitespace-nowrap">
                                        <Link href={getSortLink('spent')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Total Lifetime Value {renderSortIcon('spent')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5 whitespace-nowrap">
                                        <Link href={getSortLink('joined')} className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                            Member Since {renderSortIcon('joined')}
                                        </Link>
                                    </th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {sortedCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-800/10 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4 whitespace-nowrap">
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</span>
                                                    <span className="text-[10px] text-gray-400 tracking-tight">{customer.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 whitespace-nowrap">{customer.phone}</td>
                                        <td className="px-6 py-5">
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[150px] line-clamp-1" title={customer.address}>
                                                {customer.address}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[10px] font-bold">
                                                {customer.orders} Orders
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 font-bold italic whitespace-nowrap">{customer.spent.toLocaleString()} EGP</td>
                                        <td className="px-6 py-5 text-gray-500 whitespace-nowrap">{customer.joined}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors" title="Message">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors" title="Email">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Help Card */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="font-medium text-emerald-900 dark:text-emerald-400">Marketing Outreach</h3>
                            <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-600 mt-1">Send personalized offers to your most loyal customers based on their purchase history.</p>
                        </div>
                    </div>
                    <button className="w-full md:w-auto px-6 py-3 md:py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-colors text-center">
                        Launch Campaign
                    </button>
                </div>
            </main>
        </div>
    );
}
