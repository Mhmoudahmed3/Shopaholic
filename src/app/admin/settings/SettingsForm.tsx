"use client";

import { useState } from "react";
import { SiteSettings } from "@/lib/types";
import { updateSiteSettings } from "../actions";
import { 
    Save, 
    Globe, 
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
    Shield
} from "lucide-react";
import { clsx } from "clsx";

interface SettingsFormProps {
    initialSettings: SiteSettings;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {message && (
                <div className={clsx(
                    "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium",
                    message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                    {message.type === 'success' ? <Shield className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* General Settings */}
            <section className="bg-white dark:bg-zinc-900/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-black dark:bg-white rounded-2xl">
                        <Globe className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div>
                        <h2 className="text-lg font-light tracking-tight">General Store</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Basic identity and public information</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Store Name</label>
                        <input
                            type="text"
                            name="storeName"
                            value={settings.storeName}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Footer Text</label>
                        <input
                            type="text"
                            name="footerText"
                            value={settings.footerText}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Store Description</label>
                        <textarea
                            name="storeDescription"
                            value={settings.storeDescription}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all resize-none"
                        />
                    </div>
                </div>
            </section>

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
    );
}
