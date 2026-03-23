import Link from "next/link";
import { Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { getCategoriesDB, getSettingsDB } from "@/lib/db";

// Computed once at module load — stable across all renders
const CURRENT_YEAR = new Date().getFullYear();

export async function Footer() {
    const rawCategories = await getCategoriesDB();
    const settings = await getSettingsDB();

    // Group categories by type (Main Categories)
    const mainCategories = Array.from(new Set(rawCategories.map(c => c.type).filter((t): t is string => !!t)));

    return (
        <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="text-lg font-bold tracking-[0.2em] uppercase inline-block mb-3">
                            {settings.storeName}
                        </Link>
                        <p className="text-[13px] text-black/60 dark:text-white/60 max-w-xs font-light leading-relaxed">
                            {settings.storeDescription}
                        </p>
                        <div className="flex items-center space-x-4 mt-5">
                            {settings.socialLinks.instagram && (
                                <a href={`https://instagram.com/${settings.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">Instagram</span>
                                    <Instagram className="h-4 w-4" />
                                </a>
                            )}
                            {settings.socialLinks.facebook && (
                                <a href={`https://facebook.com/${settings.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">Facebook</span>
                                    <Facebook className="h-4 w-4" />
                                </a>
                            )}
                            {settings.socialLinks.whatsapp && (
                                <a href={`https://wa.me/${settings.socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">WhatsApp</span>
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            )}
                            {settings.socialLinks.twitter && (
                                <a href={`https://twitter.com/${settings.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <span className="sr-only">Twitter</span>
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">Shop</h3>
                        <ul className="space-y-3">
                            <li><Link href="/shop" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">All Collections</Link></li>
                            {mainCategories.map((type) => (
                                <li key={type}>
                                    <Link href={`/shop?type=${type.toLowerCase()}`} className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">{type}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">Support</h3>
                        <ul className="space-y-3">
                            <li><Link href="/faq" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">FAQ</Link></li>
                            <li><Link href="/shipping" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">Shipping & Returns</Link></li>
                            <li><Link href="/contact" className="text-[13px] opacity-60 hover:opacity-100 transition-opacity font-light">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">Stay Connected</h3>
                        <p className="text-[12px] opacity-50 font-light mb-4 max-w-xs leading-relaxed">
                            Subscribe for exclusive updates and collections.
                        </p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full px-0 py-2 text-[13px] border-b border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-black/20 dark:placeholder:text-white/20"
                                required
                            />
                            <button
                                type="submit"
                                className="w-fit text-[10px] font-bold uppercase tracking-[0.25em] py-2 border-b border-transparent hover:border-black dark:hover:border-white transition-all mt-1 opacity-70 hover:opacity-100"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>

                <div className="mt-12 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
                        &copy; {CURRENT_YEAR} {settings.storeName}. All rights reserved.
                    </p>

                    {/* Trust Signals - Payment Methods */}
                    <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {/* Visa */}
                        <svg className="h-4" viewBox="0 0 50 16" fill="currentColor">
                            <path d="M21.565 0L19.51 15.65h3.297l2.053-15.65h-3.295zM15.467 0l-3.238 10.686L10.74 1.83C10.517.818 9.776.126 8.76.02L.04.01C-.073.01-.13.125.133.29c2.09.845 4.385 2.11 5.923 3.42l3.414 11.96H12.9l5.093-15.67h-2.526zM46.726 4.39c-1.127-.45-2.03-.787-3.136-.787-3.41 0-5.815 1.76-5.834 4.295-.02 1.874 1.745 2.923 3.08 3.563 1.365.65 1.82 1.07 1.815 1.65-.01.89-1.107 1.3-2.13 1.3-1.424 0-2.2-.218-3.38-.724l-.474-.218-.466 2.85c.834.373 2.37.7 3.98.718 3.61 0 5.97-1.727 6-4.403.014-1.48-1-2.613-2.918-3.52-1.22-.614-1.966-1.02-1.96-1.643.01-.56.634-1.144 2.03-1.144 1.15-.015 1.99.23 2.65.513l.32.147.465-2.61v-.002zM36.703 15.65h3.13L37.8 0h-3.033c-.783 0-1.444.453-1.745 1.155l-5.91 14.492h3.453s.562-1.523.687-1.85h4.197c.097.435.65 1.85.65 1.85h.003V15.65zm-2.812-4.108c.24-.633 1.147-3.045 1.147-3.045l.59-1.614.337 1.65s.553 2.636.666 3.003h-2.74zM48.88 5.767h-1.03l-.337-.3v1.07h1.03v.256h-1.03v.44h-.29v-1.03h.3v-.45h-.26l-.37.74-.35-.74h-.27v1.05h-.26v-1.34h1.02l.39.81.39-.81h1.03v.3z" />
                        </svg>
                        {/* Mastercard */}
                        <svg className="h-5" viewBox="0 0 50 30" fill="currentColor">
                            <path d="M19.7 15c0-4.62 2.1-8.73 5.38-11.4C21.73.66 17.5 5.56 17.5 15s4.23 14.34 7.58 11.4C21.8 23.73 19.7 19.62 19.7 15z" />
                            <path d="M11.96 15c0-5.46 3-10.2 7.37-12.5C16.82.9 13.9 0 10.74 0 5.23 0 .76 4.47.76 10s4.47 10 9.98 10c3.16 0 6.08-.9 8.6-2.5-4.38-2.3-7.38-7.04-7.38-12.5z" />
                            <path d="M39.63 15c0-5.46-3-10.2-7.37-12.5C34.78.9 37.7 0 40.85 0c5.5 0 9.98 4.47 9.98 10s-4.47 10-9.98 10c-3.15 0-6.07-.9-8.6-2.5 4.38-2.3 7.38-7.04 7.38-12.5z" />
                        </svg>
                        {/* Apple Pay */}
                        <svg className="h-4" viewBox="0 0 50 20" fill="currentColor">
                            <path d="M12.94 10.02c-.03-2.45 1.95-3.62 2.03-3.68-1.12-1.63-2.88-1.87-3.52-1.9-1.5-.15-2.92.89-3.68.89-.78 0-1.95-.87-3.2-.84-1.61.02-3.1.92-3.92 2.37-1.67 2.89-.43 7.17 1.18 9.5.8 1.15 1.74 2.45 3.01 2.4 1.25-.05 1.72-.82 3.24-.82 1.5 0 1.95.82 3.25.8.1.02 2.12-.05 2.87-1.15l-.05-.05c-.88-1.32-2.1-2.1-2.1-5.1m-2.6-7.85c.67-.81 1.13-1.94 1.01-3.07-.98.05-2.17.65-2.86 1.48-.62.74-1.17 1.88-1.03 2.97 1.09.08 2.2-.55 2.88-1.38" />
                            <path d="M21.17 1.02h4.51c1.86 0 3.23.47 4.1 1.4.88.94 1.32 2.22 1.32 3.86 0 1.5-.42 2.76-1.25 3.75-.85.98-2.2 1.47-4.05 1.47H23.5v7.2H21.17v-17.7zm2.33 8.35h1.9c1.07 0 1.87-.27 2.4-.82.52-.53.78-1.35.78-2.47 0-1.15-.26-1.96-.8-2.45-.52-.5-1.3-.74-2.32-.74h-2.03v6.5h.06zM32.61 11.2V10c0-1.34.42-2.43 1.25-3.23.83-.8 2.04-1.18 3.6-1.18.52 0 1.05.05 1.62.17v1.88c-.53-.17-1.02-.26-1.48-.26-2.18 0-3.3 1.03-3.38 3.1h4.08c1.32 0 2.25.3 2.8.84.53.53.8 1.32.8 2.36s-.35 1.86-1.07 2.46c-.66.56-1.6.84-2.82.84-1.27 0-2.26-.33-2.97-1-.62-.57-.96-1.35-1.02-2.36h1.9c.08.64.35 1.1.84 1.42.5.34 1.12.52 1.88.52 1.62 0 2.43-.6 2.43-1.8 0-.54-.15-.92-.47-1.17-.4-.28-.97-.43-1.72-.43h-4.27v-.95zm4.84 3.7c.6 0 1.05-.18 1.35-.53.3-.35.45-.88.45-1.57h-2.9c.06.63.3 1.13.73 1.48.42.38 1.42.62 1.42.62zM45.02 10.45l-3.35 8.16h-2l3.75-8.73-3.52-8.86h2.2l2.36 6.3 2.24-6.3h2.1l-3.54 8.8-4.24-9.37z" />
                        </svg>
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
