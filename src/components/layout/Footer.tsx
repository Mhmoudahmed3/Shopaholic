"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, MessageCircle, Plus, Minus, MoveUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { getCategories, getSiteSettings } from "@/app/admin/actions";
import { SiteSettings } from "@/lib/types";

const CURRENT_YEAR = new Date().getFullYear();

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <div className="border-b border-neutral-100 dark:border-neutral-900">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left group"
            >
                <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase transition-colors group-hover:text-black dark:group-hover:text-white">
                    {title}
                </span>
                <div className="relative w-4 h-4 flex items-center justify-center">
                    <Plus className={`w-4 h-4 absolute transition-all duration-500 ease-in-out ${isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`} />
                    <Minus className={`w-4 h-4 absolute transition-all duration-500 ease-in-out ${isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8 space-y-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function Footer() {
    const { t, mounted } = useTranslation();
    const [categories, setCategories] = useState<any[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        Promise.all([
            getCategories(),
            getSiteSettings()
        ]).then(([cats, sets]) => {
            setCategories(cats);
            setSettings(sets);
        });
    }, []);

    const mainCategories = Array.from(new Set(categories.map(c => c.type).filter((t): t is string => !!t)));

    if (!mounted || !settings) return <div className="h-[200px] bg-white dark:bg-black" />;

    return (
        <footer className="bg-white dark:bg-black pt-16 pb-12 border-t border-neutral-100 dark:border-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Desktop Grid Layout */}
                <div className="hidden md:grid grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <Link href="/" className="text-lg font-bold tracking-[0.2em] uppercase">
                            {settings.storeName || "SHOPOHOLIC"}
                        </Link>
                        <p className="text-[13px] text-neutral-500 font-light leading-relaxed max-w-xs">
                            {settings.storeDescription}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-neutral-400">Shop</h3>
                        <ul className="space-y-3">
                            <li><Link href="/shop" className="text-[13px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('allCollections')}</Link></li>
                            {mainCategories.map((type) => (
                                <li key={type as string}>
                                    <Link href={`/shop?type=${(type as string).toLowerCase()}`} className="text-[13px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors capitalize">{type as string}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-neutral-400">Support</h3>
                        <ul className="space-y-3">
                            <li><Link href="/track-order" className="text-[13px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('trackOrder')}</Link></li>
                            <li><Link href="/shipping" className="text-[13px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('shippingReturns')}</Link></li>
                            <li><Link href="/contact" className="text-[13px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('contact')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-neutral-400">Newsletter</h3>
                        <form className="flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-transparent border-b border-neutral-100 dark:border-neutral-800 py-2 text-[13px] outline-none focus:border-black dark:focus:border-white transition-colors"
                                required
                            />
                            <button
                                type="submit"
                                className="w-fit text-[10px] font-bold uppercase tracking-[0.2em] py-2 border-b border-black dark:border-white"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Mobile Accordion Layout */}
                <div className="md:hidden flex flex-col border-t border-neutral-100 dark:border-neutral-900">
                    <AccordionSection title="Main Categories">
                        <ul className="space-y-3 px-1">
                            <li><Link href="/shop" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('allCollections')}</Link></li>
                            {mainCategories.map((type) => (
                                <li key={type as string}>
                                    <Link href={`/shop?type=${(type as string).toLowerCase()}`} className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors capitalize">{type as string}</Link>
                                </li>
                            ))}
                        </ul>
                    </AccordionSection>

                    <AccordionSection title="Customer Care">
                        <ul className="space-y-3 px-1">
                            <li><Link href="/track-order" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('trackOrder')}</Link></li>
                            <li><Link href="/shipping" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('shippingReturns')}</Link></li>
                            <li><Link href="/contact" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">{t('contact')}</Link></li>
                            <li><Link href="/privacy" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </AccordionSection>

                    <AccordionSection title={`${settings.storeName || "SHOPOHOLIC"} About`}>
                        <div className="space-y-4 px-1">
                            <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl font-light">
                                {settings.storeDescription}
                            </p>
                        </div>
                    </AccordionSection>
                </div>

                {/* Shared Social & Bottom Section */}
                <div className="mt-16 flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-4 mb-12">
                        {settings.socialLinks?.facebook && (
                            <a 
                                href={`https://facebook.com/${settings.socialLinks.facebook}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full border border-neutral-100 dark:border-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                        )}
                        {settings.socialLinks?.instagram && (
                            <a 
                                href={`https://instagram.com/${settings.socialLinks.instagram}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full border border-neutral-100 dark:border-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        )}
                        <a 
                            href="#" 
                            className="w-12 h-12 rounded-full border border-neutral-100 dark:border-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 448 512">
                                <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h.06a121.11 121.11 0 0 0 120.85 187.74z"/>
                            </svg>
                        </a>
                    </div>

                    <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 border-t border-neutral-100 dark:border-neutral-900 pt-12">
                        <div className="space-y-1">
                            <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                                &copy; {CURRENT_YEAR} {settings.storeName || "SHOPOHOLIC"}. Made By KMPN
                            </p>
                            <p className="text-[13px] font-medium text-neutral-400">
                                Shopaholic
                            </p>
                        </div>

                        {/* Back to top Button */}
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="hidden md:flex w-10 h-10 items-center justify-center border border-neutral-100 dark:border-neutral-900 rounded-full text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <MoveUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </footer>
    );
}
