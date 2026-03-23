"use client";

import { useState, useCallback } from "react";
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
    Check,
    Layers
} from "lucide-react";
import { clsx } from "clsx";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface SettingsFormProps {
    initialSettings: SiteSettings;
    initialCategories: Category[];
    categoryCounts?: Record<string, number>;
}

export default function SettingsForm({ initialSettings, initialCategories, categoryCounts = {} }: SettingsFormProps) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Category Management State
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editCategoryData, setEditCategoryData] = useState({ label: '', type: '' });
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isAddingMainCategory, setIsAddingMainCategory] = useState(false);
    const [newMainCategoryName, setNewMainCategoryName] = useState('');

    // Grouped Categories Logic
    const groupedCategories = categories.reduce((acc, cat) => {
        const type = cat.type || 'General';
        if (!acc[type]) acc[type] = [];
        acc[type].push(cat);
        return acc;
    }, {} as Record<string, Category[]>);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting settings:", settings);
        setIsLoading(true);
        setMessage(null);

        try {
            const result = await updateSiteSettings(settings);
            console.log("Update result:", result);
            setMessage({ type: 'success', text: "Settings updated successfully." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Submit error:", error);
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
                    ...((prev as any)[parent]),
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
    const handleAddSubCategory = async (typeName: string) => {
        const label = "New Sub-category";
        setIsLoading(true);
        try {
            const result = await addCategory({ label, type: typeName });
            if (result?.success && result.category) {
                setCategories(prev => [...prev, result.category]);
                setEditingCategoryId(result.category.id);
                setEditCategoryData({ label: result.category.label, type: result.category.type || '' });
                setMessage({ type: 'success', text: `Added sub-category to ${typeName}. Click to rename.` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to add sub-category" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editCategoryData.label) {
            setEditingCategoryId(null);
            return;
        }
        setIsLoading(true);
        try {
            await updateCategoryServer(id, editCategoryData);
            setCategories(prev => prev.map(c => c.id === id ? { ...c, ...editCategoryData } : c));
            setEditingCategoryId(null);
            setMessage({ type: 'success', text: "Category updated." });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTypeName = async (oldType: string, newType: string) => {
        if (!newType || oldType === newType) return;
        setIsLoading(true);
        try {
            const group = groupedCategories[oldType];
            if (group) {
                await Promise.all(group.map(cat => updateCategoryServer(cat.id, { label: cat.label, type: newType })));
                setCategories(prev => prev.map(c => (c.type === oldType || (oldType === 'General' && !c.type)) ? { ...c, type: newType } : c));
                setMessage({ type: 'success', text: "Group renamed successfully." });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to rename group" });
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
            setMessage({ type: 'success', text: `Category "${categoryToDelete.label}" and ${categoryCounts[categoryToDelete.id] || 0} items removed.` });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to delete category" });
        } finally {
            setIsLoading(false);
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="w-full space-y-12 pb-32">
            {/* Header / Notifications */}
            <div className="sticky top-4 z-[60] space-y-4">
                {message && (
                    <div className={clsx(
                        "p-4 rounded-3xl flex items-center gap-4 text-sm font-medium backdrop-blur-xl border shadow-2xl animate-in slide-in-from-top-4 duration-500",
                        message?.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        <div className="p-2 bg-white/10 rounded-full">
                            {message?.type === 'success' ? <Shield className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <span className="flex-1 font-semibold">{message?.text}</span>
                        <button onClick={() => setMessage(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Hierarchical Categories Management */}
            <section className="bg-white dark:bg-zinc-950 p-6 md:p-12 rounded-[4rem] border border-gray-100 dark:border-zinc-800/50 shadow-2xl shadow-black/5 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-black dark:bg-white rounded-[2rem] shadow-2xl shadow-black/20 dark:shadow-white/10">
                            <Layers className="w-8 h-8 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-light tracking-tight">Inventory Hierarchy</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Live Architecture Management
                            </p>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => setIsAddingMainCategory(true)}
                        className="group relative flex items-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl overflow-hidden"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Main Category</span>
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                    </button>
                </div>

                <div className="space-y-12">
                    {/* Add Main Category Input */}
                    {isAddingMainCategory && (
                        <div className="flex items-center gap-5 p-8 bg-gray-50 dark:bg-zinc-900/40 rounded-[3rem] border border-dashed border-gray-200 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2">Category Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Women, Accessories, Shoes..."
                                    value={newMainCategoryName}
                                    onChange={(e) => setNewMainCategoryName(e.target.value)}
                                    className="w-full px-6 py-4 bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 ring-black/5 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <button 
                                    type="button"
                                    onClick={async () => {
                                        if (!newMainCategoryName) return;
                                        await handleAddSubCategory(newMainCategoryName);
                                        setNewMainCategoryName('');
                                        setIsAddingMainCategory(false);
                                    }}
                                    className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                                >
                                    <Check className="w-6 h-6" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setIsAddingMainCategory(false)} 
                                    className="p-4 bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-300 transition-all active:scale-95"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-12">
                        {Object.entries(groupedCategories).map(([typeName, cats]) => (
                            <div key={typeName} className="group relative flex flex-col lg:flex-row gap-10 p-8 md:p-12 bg-gray-50/30 dark:bg-zinc-950/40 border border-gray-100/50 dark:border-zinc-900/50 rounded-[4rem] transition-all hover:bg-white dark:hover:bg-zinc-900 shadow-sm hover:shadow-2xl">
                                {/* Left: Main Category Header */}
                                <div className="w-full lg:w-1/4">
                                    <div className="sticky top-24">
                                        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 px-1">Main Category</span>
                                        <div className="space-y-4">
                                            <div className="relative group/input">
                                                <input
                                                    type="text"
                                                    defaultValue={typeName}
                                                    onBlur={(e) => handleUpdateTypeName(typeName, e.target.value)}
                                                    className="w-full px-0 py-2 bg-transparent border-b-2 border-transparent focus:border-black dark:focus:border-white text-2xl font-light outline-none transition-all placeholder:text-gray-200"
                                                />
                                                <Edit3 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 opacity-0 group-hover/input:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[9px] font-bold uppercase tracking-widest">
                                                    {cats.length} Sub-categories
                                                </span>
                                                <span className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-400 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                                    ID: {typeName.toLowerCase().replace(/\s+/g, '-')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Sub-categories Nodes */}
                                <div className="flex-1 bg-white dark:bg-black/20 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-zinc-800/40 shadow-inner">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-sm font-semibold tracking-tight text-gray-500 uppercase tracking-[0.2em]">Sub-categories (Product Types)</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleAddSubCategory(typeName)}
                                            className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                        {cats.map((cat) => (
                                            <div key={cat.id} className="flex items-center gap-4 group/row p-2 pl-6 bg-gray-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-gray-100 dark:hover:border-zinc-700 rounded-2xl transition-all shadow-sm hover:shadow-md">
                                                <div className="flex-1 relative py-3">
                                                    <input
                                                        type="text"
                                                        value={editingCategoryId === cat.id ? editCategoryData.label : cat.label}
                                                        onChange={(e) => {
                                                            if (editingCategoryId === cat.id) {
                                                                setEditCategoryData({ ...editCategoryData, label: e.target.value });
                                                            } else {
                                                                setEditingCategoryId(cat.id);
                                                                setEditCategoryData({ label: e.target.value, type: cat.type || '' });
                                                            }
                                                        }}
                                                        onBlur={() => editingCategoryId === cat.id && handleUpdateCategory(cat.id)}
                                                        className="w-full bg-transparent text-sm font-medium outline-none focus:text-emerald-500 transition-colors"
                                                    />
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2">
                                                        <span className={clsx(
                                                            "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                                                            (categoryCounts[cat.id] || 0) > 0 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-100 text-gray-400 dark:bg-zinc-800"
                                                        )}>
                                                            {categoryCounts[cat.id] || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    type="button"
                                                    onClick={() => setCategoryToDelete(cat)}
                                                    className="p-3 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover/row:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Floating Delete Tooltip */}
                                <div className="absolute right-8 top-8 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="relative group/hint">
                                        <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl cursor-help">
                                            <AlertCircle className="w-5 h-5 text-gray-300 group-hover/hint:text-black dark:group-hover/hint:text-white transition-colors" />
                                        </div>
                                        <div className="absolute top-0 right-14 w-60 p-5 bg-black text-white text-[10px] font-bold uppercase tracking-widest leading-loose rounded-[2rem] shadow-2xl scale-0 group-hover/hint:scale-100 transition-all origin-right z-[100] border border-white/10">
                                            Architecture Notice: <br/>
                                            <span className="font-light normal-case opacity-60">To remove this entire main branch, you must first eliminate all its sub-collections.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Contact Information */}
                <section className="bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[4rem] border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <Mail className="w-64 h-64" />
                    </div>
                    
                    <div className="flex items-center gap-6 mb-12">
                        <div className="p-4 bg-black dark:bg-white rounded-[1.5rem] shadow-2xl shadow-black/20 dark:shadow-white/10">
                            <Mail className="w-6 h-6 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-light tracking-tight">Support Node</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Contact endpoints & geography</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-2">Official Email</label>
                            <div className="relative group/field">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-black/0 via-black/5 to-black/0 dark:from-white/0 dark:via-white/5 dark:to-white/0 rounded-[1.5rem] opacity-0 group-focus-within/field:opacity-100 transition-opacity" />
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-6 w-4 h-4 text-gray-300 group-focus-within/field:text-black dark:group-focus-within/field:text-white transition-colors" />
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                        className="w-full pl-16 pr-6 py-5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] text-sm focus:bg-white dark:focus:bg-black outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-2">Direct Phone</label>
                            <div className="relative group/field">
                                <div className="relative flex items-center">
                                    <Phone className="absolute left-6 w-4 h-4 text-gray-300 group-focus-within/field:text-black dark:group-focus-within/field:text-white transition-colors" />
                                    <input
                                        type="text"
                                        name="contactPhone"
                                        value={settings.contactPhone}
                                        onChange={handleChange}
                                        className="w-full pl-16 pr-6 py-5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] text-sm focus:bg-white dark:focus:bg-black outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-2">Headquarters Address</label>
                            <div className="relative group/field">
                                <div className="relative flex items-center">
                                    <MapPin className="absolute left-6 w-4 h-4 text-gray-300 group-focus-within/field:text-black dark:group-focus-within/field:text-white transition-colors" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={settings.address}
                                        onChange={handleChange}
                                        className="w-full pl-16 pr-6 py-5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] text-sm focus:bg-white dark:focus:bg-black outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Financial Config */}
                <section className="bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[4rem] border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="p-4 bg-black dark:bg-white rounded-[1.5rem] shadow-2xl shadow-black/20 dark:shadow-white/10">
                            <DollarSign className="w-6 h-6 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-light tracking-tight">Commerce Logic</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Global taxation & logistics fees</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-2">GST / Tax Rate (%)</label>
                            <div className="relative flex items-center">
                                <Percent className="absolute left-6 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="taxRate"
                                    value={settings.taxRate}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] text-sm focus:bg-white dark:focus:bg-black outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-2">Flat Shipping</label>
                            <div className="relative flex items-center">
                                <Truck className="absolute left-6 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="shippingFee"
                                    value={settings.shippingFee}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] text-sm focus:bg-white dark:focus:bg-black outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-2">Free Delivery limit</label>
                            <div className="relative flex items-center">
                                <DollarSign className="absolute left-6 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="freeShippingThreshold"
                                    value={settings.freeShippingThreshold}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] text-sm focus:bg-white dark:focus:bg-black outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Identity */}
                <section className="bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[4rem] border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="p-4 bg-black dark:bg-white rounded-[1.5rem] shadow-2xl shadow-black/20 dark:shadow-white/10">
                            <Instagram className="w-6 h-6 text-white dark:text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-light tracking-tight">Social Identity</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Brand presence across platforms</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <div className="space-y-3 px-4 py-8 bg-gray-50/50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <Instagram className="w-5 h-5" />
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Instagram</label>
                            </div>
                            <input
                                type="text"
                                name="socialLinks.instagram"
                                value={settings.socialLinks.instagram}
                                onChange={handleChange}
                                placeholder="@handle"
                                className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-2xl text-xs outline-none focus:ring-2 ring-emerald-500/20"
                            />
                        </div>
                        <div className="space-y-3 px-4 py-8 bg-gray-50/50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <Facebook className="w-5 h-5" />
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Facebook</label>
                            </div>
                            <input
                                type="text"
                                name="socialLinks.facebook"
                                value={settings.socialLinks.facebook}
                                onChange={handleChange}
                                placeholder="facebook.com/..."
                                className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-2xl text-xs outline-none focus:ring-2 ring-emerald-500/20"
                            />
                        </div>
                        <div className="space-y-3 px-4 py-8 bg-gray-50/50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <MessageCircle className="w-5 h-5" />
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">WhatsApp</label>
                            </div>
                            <input
                                type="text"
                                name="socialLinks.whatsapp"
                                value={settings.socialLinks.whatsapp}
                                onChange={handleChange}
                                placeholder="+20..."
                                className="w-full px-5 py-4 bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-2xl text-xs outline-none focus:ring-2 ring-emerald-500/20"
                            />
                        </div>
                    </div>
                </section>

                {/* Maintenance Node */}
                <section className="bg-red-500/5 dark:bg-red-500/10 p-8 md:p-12 rounded-[4rem] border border-red-100/50 dark:border-red-900/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className="p-5 bg-red-500 rounded-[2rem] text-white shadow-2xl shadow-red-500/30">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-medium tracking-tight text-red-900 dark:text-red-100">Vault Lockdown</h2>
                                <p className="text-[10px] text-red-600/60 dark:text-red-400/60 font-bold uppercase tracking-[0.3em] mt-2">Temporary Storefront Suspension</p>
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
                            <div className="w-20 h-10 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                        </label>
                    </div>
                    <p className="text-xs text-red-700/60 dark:text-red-400/60 mt-8 max-w-2xl leading-relaxed">
                        Activating Lockdown will immediately suspend all customer-facing operations. Purchases, browsing, and account access will be disabled until manually reactivated. Admin functions remain operational.
                    </p>
                </section>

                {/* Master Apply Button */}
                <div className="pt-12 flex justify-end sticky bottom-8 z-50">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative overflow-hidden bg-black dark:bg-white text-white dark:text-black hover:pr-24 px-16 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center min-w-[300px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_35px_60px_-15px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-4">
                                <Save className="w-5 h-5 transition-transform group-hover:scale-125" />
                                <span>Commit Configurations</span>
                            </div>
                        )}
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-emerald-500 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out">
                            <Check className="w-6 h-6 text-white" />
                        </div>
                    </button>
                </div>
            </form>

            {/* Deletion Confirmation Modal */}
            {categoryToDelete && (
                <ConfirmModal
                    isOpen={!!categoryToDelete}
                    onClose={() => setCategoryToDelete(null)}
                    onConfirm={handleDeleteCategory}
                    title="Liquidate Category?"
                    description={`You are about to permanently remove "${categoryToDelete?.label}". This action will cross-reference and DELETE all ${categoryCounts[categoryToDelete?.id || ''] || 0} associated products from the system. This cannot be undone.`}
                    variant="danger"
                    confirmText="Proceed with Deletion"
                />
            )}
        </div>
    );
}
