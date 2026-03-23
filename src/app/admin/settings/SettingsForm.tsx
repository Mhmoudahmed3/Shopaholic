"use client";

import { useState } from "react";
import { SiteSettings, Category } from "@/lib/types";
import { updateSiteSettings, addCategory, updateCategoryServer, deleteCategory } from "../actions";
import { 
    Save, 
    Mail, 
    Phone, 
    MapPin, 
    Instagram, 
    Facebook, 
    Twitter, 
    AlertCircle, 
    Loader2,
    DollarSign,
    Percent,
    Truck,
    Shield,
    Plus,
    Trash2,
    Edit3,
    Tag,
    X,
    MessageCircle,
    Check
} from "lucide-react";
import { clsx } from "clsx";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface SettingsFormProps {
    initialSettings: SiteSettings;
    initialCategories: Category[];
}

export default function SettingsForm({ initialSettings, initialCategories }: SettingsFormProps) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Category Management State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState({ label: '', type: '' });
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editCategoryData, setEditCategoryData] = useState({ label: '', type: '' });
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await updateSiteSettings(settings);
            setMessage({ type: 'success', text: "Settings updated successfully." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update settings. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof SiteSettings] as any),
                    [child]: value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                       type === 'number' ? Number(value) : value
            }));
        }
    };

    // Category Actions
    const handleAddCategory = async () => {
        if (!newCategory.label) return;
        setIsLoading(true);
        try {
            await addCategory(newCategory);
            // Refresh categories list (simplified logic for demo)
            const id = newCategory.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
            setCategories(prev => [...prev, { id, ...newCategory }]);
            setNewCategory({ label: '', type: '' });
            setIsAddingCategory(false);
            setMessage({ type: 'success', text: "Category added successfully." });
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : "Failed to add category" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (id: string) => {
        setIsLoading(true);
        try {
            await updateCategoryServer(id, editCategoryData);
            setCategories(prev => prev.map(c => c.id === id ? { ...c, ...editCategoryData } : c));
            setEditingCategoryId(null);
            setMessage({ type: 'success', text: "Category updated successfully." });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update category" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        setIsLoading(true);
        try {
            await deleteCategory(categoryToDelete.id);
            setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
            setMessage({ type: 'success', text: `Category "${categoryToDelete.label}" and all its items have been removed.` });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to delete category" });
        } finally {
            setIsLoading(false);
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="max-w-4xl space-y-12 pb-20">
            {message && (
                <div className={clsx(
                    "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2",
                    message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                    {message.type === 'success' ? <Shield className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Categories Management Section */}
            <section className="bg-white dark:bg-zinc-900/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-black dark:bg-white rounded-2xl">
                            <Tag className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-lg font-light tracking-tight">Product Categories</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Manage store inventory structure</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setIsAddingCategory(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all w-fit"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Category
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Add Category Row */}
                    {isAddingCategory && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 animate-in zoom-in-95 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                <input
                                    type="text"
                                    placeholder="Category Label (e.g. Dresses)"
                                    value={newCategory.label}
                                    onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                                    className="px-4 py-2 bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-1 ring-black dark:ring-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Type (Optional e.g. Clothing)"
                                    value={newCategory.type}
                                    onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                                    className="px-4 py-2 bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-1 ring-black dark:ring-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleAddCategory} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsAddingCategory(false)} className="p-2 bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-300 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {categories.map((category) => (
                        <div key={category.id} className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-white transition-all">
                            {editingCategoryId === category.id ? (
                                <div className="flex items-center gap-3 flex-1 mr-4">
                                    <input
                                        type="text"
                                        value={editCategoryData.label}
                                        onChange={(e) => setEditCategoryData({ ...editCategoryData, label: e.target.value })}
                                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-1 ring-black dark:ring-white"
                                    />
                                    <input
                                        type="text"
                                        value={editCategoryData.type}
                                        placeholder="Type"
                                        onChange={(e) => setEditCategoryData({ ...editCategoryData, type: e.target.value })}
                                        className="w-32 px-4 py-2 bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-1 ring-black dark:ring-white"
                                    />
                                    <button onClick={() => handleUpdateCategory(category.id)} className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg">
                                        <Check className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => setEditingCategoryId(null)} className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-500 rounded-lg">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                            {category.id.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{category.label}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{category.type || 'No Type'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                setEditingCategoryId(category.id);
                                                setEditCategoryData({ label: category.label, type: category.type || '' });
                                            }}
                                            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setCategoryToDelete(category)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Contact Information */}
                <section className="bg-white dark:bg-zinc-900/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-black dark:bg-white rounded-2xl">
                            <Mail className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-lg font-light tracking-tight">Contact & Location</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Support channels and physical address</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={settings.contactEmail}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Contact Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="contactPhone"
                                    value={settings.contactPhone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Physical Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="address"
                                    value={settings.address}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Financial & Shipping */}
                <section className="bg-white dark:bg-zinc-900/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-black dark:bg-white rounded-2xl">
                            <DollarSign className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-lg font-light tracking-tight">Commerce Settings</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Rates, fees and thresholds</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Tax Rate (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="number"
                                    name="taxRate"
                                    value={settings.taxRate}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Shipping Fee</label>
                            <div className="relative">
                                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="number"
                                    name="shippingFee"
                                    value={settings.shippingFee}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Free Delivery Min</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="number"
                                    name="freeShippingThreshold"
                                    value={settings.freeShippingThreshold}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Links */}
                <section className="bg-white dark:bg-zinc-900/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-black dark:bg-white rounded-2xl">
                            <Instagram className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-lg font-light tracking-tight">Social Presence</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Public social media handles</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Instagram (@)</label>
                            <div className="relative">
                                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="socialLinks.instagram"
                                    value={settings.socialLinks.instagram}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Facebook</label>
                            <div className="relative">
                                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="socialLinks.facebook"
                                    value={settings.socialLinks.facebook}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">WhatsApp (Number)</label>
                            <div className="relative">
                                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="socialLinks.whatsapp"
                                    value={settings.socialLinks.whatsapp}
                                    onChange={handleChange}
                                    placeholder="+201234567890"
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Maintenance Mode */}
                <section className="bg-red-500/5 dark:bg-red-500/10 p-6 md:p-8 rounded-[2.5rem] border border-red-100 dark:border-red-900/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-500/20">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-medium tracking-tight text-red-900 dark:text-red-100">Maintenance Mode</h2>
                                <p className="text-[10px] text-red-600/60 dark:text-red-400/60 font-bold uppercase tracking-widest mt-0.5">Taking your vault offline for updates</p>
                            </div>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                                className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                        </label>
                    </div>
                    <p className="text-xs text-red-700/60 dark:text-red-400/60 mt-4 max-w-xl">
                        Enabling maintenance mode will prevent customers from browsing or purchasing. Admin portal access will remain active.
                    </p>
                </section>

                {/* Submit Button */}
                <div className="pt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="relative group overflow-hidden bg-black dark:bg-white text-white dark:text-black px-12 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] transition-all flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Apply Changes</span>
                            </>
                        )}
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                    </button>
                </div>
            </form>

            {/* Deletion Confirmation Modal */}
            {categoryToDelete && (
                <ConfirmModal
                    isOpen={!!categoryToDelete}
                    onClose={() => setCategoryToDelete(null)}
                    onConfirm={handleDeleteCategory}
                    title="Delete Category?"
                    description={`Are you sure you want to delete "${categoryToDelete.label}"? All items currently assigned to this category will be PERMANENTLY removed from the store.`}
                    variant="danger"
                    confirmText="Delete All"
                />
            )}
        </div>
    );
}
