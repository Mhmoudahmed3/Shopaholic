"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    Search, 
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Edit3,
    Trash2,
    X,
    Check,
    UserCircle
} from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "../components/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

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

interface CustomerTableClientProps {
    initialCustomers: Customer[];
}

export function CustomerTableClient({ initialCustomers }: CustomerTableClientProps) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<string>("joined");
    const [order, setOrder] = useState<'asc' | 'desc'>("desc");
    
    // Modals state
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customerId: string | null }>({
        isOpen: false,
        customerId: null
    });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; customer: Customer | null }>({
        isOpen: false,
        customer: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredCustomers = useMemo(() => {
        const result = customers.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return result.sort((a, b) => {
            const aValue = a[sortBy as keyof Customer] ?? '';
            const bValue = b[sortBy as keyof Customer] ?? '';
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (sortBy === 'joined') {
                 return order === 'asc' 
                    ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
                    : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
            }
            
            const strA = String(aValue).toLowerCase();
            const strB = String(bValue).toLowerCase();

            if (strA < strB) return order === 'asc' ? -1 : 1;
            if (strA > strB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [customers, searchQuery, sortBy, order]);

    const handleSort = (key: string) => {
        if (sortBy === key) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setOrder('asc');
        }
    };

    const renderSortIcon = (colKey: string) => {
        if (sortBy !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
        return order === 'asc' ? <ArrowUp className="w-3 h-3 text-black dark:text-white" /> : <ArrowDown className="w-3 h-3 text-black dark:text-white" />;
    };

    const handleDelete = async () => {
        if (!deleteModal.customerId) return;
        setIsDeleting(true);
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setCustomers(prev => prev.filter(c => c.id !== deleteModal.customerId));
        setDeleteModal({ isOpen: false, customerId: null });
        setIsDeleting(false);
    };

    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        setEditModal({ isOpen: false, customer: null });
    };

    return (
        <>
            {/* Search and Filters */}
            <div className="flex items-center gap-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl shadow-sm focus-within:ring-2 ring-gray-100 transition-all mb-6">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by name, email, or phone number..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm flex-1" 
                />
            </div>

            {/* Customer Table */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/30 dark:bg-zinc-800/20 uppercase tracking-wider text-[10px] text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-5 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">
                                        Customer Information {renderSortIcon('name')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => handleSort('phone')}>
                                    <div className="flex items-center gap-1">
                                        Phone Number {renderSortIcon('phone')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => handleSort('address')}>
                                    <div className="flex items-center gap-1">
                                        Address {renderSortIcon('address')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => handleSort('orders')}>
                                    <div className="flex items-center gap-1">
                                        Orders {renderSortIcon('orders')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => handleSort('spent')}>
                                    <div className="flex items-center gap-1">
                                        Total Lifetime Value {renderSortIcon('spent')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => handleSort('joined')}>
                                    <div className="flex items-center gap-1">
                                        Member Since {renderSortIcon('joined')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredCustomers.map((customer) => (
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
                                     <td className="px-6 py-5 font-bold italic whitespace-nowrap">{(customer.spent || 0).toLocaleString()} EGP</td>
                                    <td className="px-6 py-5 text-gray-500 whitespace-nowrap">{customer.joined}</td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setEditModal({ isOpen: true, customer })}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit Customer"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModal({ isOpen: true, customerId: customer.id })}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete Customer"
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
            </div>

            {/* Modals */}
            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title="Remove Customer"
                message="Are you sure you want to remove this customer? This action cannot be undone and will delete their entire history."
                type="danger"
                confirmText="Delete Account"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, customerId: null })}
                isLoading={isDeleting}
            />

            <EditCustomerModal 
                isOpen={editModal.isOpen}
                customer={editModal.customer}
                onClose={() => setEditModal({ isOpen: false, customer: null })}
                onSave={handleUpdateCustomer}
            />
        </>
    );
}

function EditCustomerModal({ isOpen, customer, onClose, onSave }: { isOpen: boolean; customer: Customer | null; onClose: () => void; onSave: (c: Customer) => void }) {
    const [name, setName] = useState(customer?.name || "");
    const [email, setEmail] = useState(customer?.email || "");
    const [phone, setPhone] = useState(customer?.phone || "");
    const [address, setAddress] = useState(customer?.address || "");

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setEmail(customer.email);
            setPhone(customer.phone);
            setAddress(customer.address);
        }
    }, [customer]);

    if (!isOpen || !customer) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-light">Edit Profile</h3>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">Ref. {customer.id}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            onSave({ ...customer, name, email, phone, address });
                        }} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Contact Number</label>
                                <input 
                                    type="tel" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Default Address</label>
                                <textarea 
                                    rows={2}
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-transparent border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl hover:opacity-80 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Check className="w-4 h-4 group-hover:scale-110 transition-transform" /> Save Changes
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
