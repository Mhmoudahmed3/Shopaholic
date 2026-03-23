"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getCategories, getSiteSettings } from "@/app/admin/actions";
import { SiteSettings } from "@/lib/types";

const CURRENT_YEAR = new Date().getFullYear();

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

    // Group categories by type (Main Categories)
    const mainCategories = Array.from(new Set(categories.map(c => c.type).filter((t): t is string => !!t)));

    if (!mounted || !settings) return <div className="h-[200px] bg-white dark:bg-black" />;

    return (
        <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="text-lg font-bold tracking-[0.2em] uppercase inline-block mb-3">
                            {settings.storeName || "SHOPOHOLIC"}
                        </Link>
                        <p className="text-[13px] text-black/60 dark:text-white/60 max-w-xs font-light leading-relaxed">
                            {settings.storeDescription}
                        </p>
                        <div className="flex items-center space-x-4 mt-5">
                            {settings.socialLinks?.instagram && (
                                <a href={`https://instagram.com/${settings.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">Instagram</span>
                                    <Instagram className="h-4 w-4" />
                                </a>
                            )}
                            {settings.socialLinks?.facebook && (
                                <a href={`https://facebook.com/${settings.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">Facebook</span>
                                    <Facebook className="h-4 w-4" />
                                </a>
                            )}
                            {settings.socialLinks?.whatsapp && (
                                <a href={`https://wa.me/${settings.socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">WhatsApp</span>
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            )}
                            {settings.socialLinks?.twitter && (
                                <a href={`https://twitter.com/${settings.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">Twitter</span>
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">{t('shop')}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/shop" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">{t('allCollections')}</Link></li>
                            {mainCategories.map((type) => (
                                <li key={type as string}>
                                    <Link href={`/shop?type=${(type as string).toLowerCase()}`} className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">{type as string}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">{t('helpSupport')}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/track-order" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">{t('trackOrder')}</Link></li>
                            <li><Link href="/shipping" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">{t('shippingReturns')}</Link></li>
                            <li><Link href="/contact" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">{t('contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">{t('stayConnected')}</h3>
                        <p className="text-[12px] opacity-50 font-light mb-4 max-w-xs leading-relaxed">
                            {t('newsletterDesc')}
                        </p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder={t('searchPlaceholder')}
                                className="w-full px-0 py-2 text-[13px] border-b border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-black/20 dark:placeholder:text-white/20"
                                required
                            />
                            <button
                                type="submit"
                                className="w-fit text-[10px] font-bold uppercase tracking-[0.25em] py-2 border-b border-transparent hover:border-black dark:hover:border-white transition-all mt-1 opacity-70 hover:opacity-100"
                            >
                                {t('subscribe')}
                            </button>
                        </form>
                    </div>

                </div>

                <div className="mt-12 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
                        &copy; {CURRENT_YEAR} {settings.storeName || "SHOPOHOLIC"}. {t('total') !== 'Total' ? 'كل الحقوق محفوظة.' : 'All rights reserved.'}
                    </p>

                    {/* Trust Signals */}
                    <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="text-[10px] uppercase tracking-widest font-black">Instapay</div>
                        <div className="text-[10px] uppercase tracking-widest font-black">Fawry</div>
                        <div className="text-[10px] uppercase tracking-widest font-black">Visa / MC</div>
                    </div>

                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-[10px] font-bold tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">Privacy Policy</Link>
                        <Link href="/terms" className="text-[10px] font-bold tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">Terms of Service</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
