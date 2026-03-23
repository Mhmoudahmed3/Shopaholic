"use client";

import { AdminHeader } from "../components/AdminLayout";
import { 
    Home as HomeIcon, 
    Layout, 
    Eye, 
    Pencil,
    Check,
    X,
    Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { useHomeStore } from "@/store/useHomeStore";
import { updateHero, updatePromo, updateHomepageSection } from "@/app/admin/actions";

export default function AdminHomePage() {
    const { content, setHero, setCollection, setPromo, setNewsletter, editingSection, setEditingSection, fetchContent } = useHomeStore();
    const [localChanges, setLocalChanges] = useState<Record<string, Record<string, string>>>({});

    const [, startTransition] = useTransition();

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleSave = async (section: string) => {
        if (!localChanges[section] && section !== 'hero' && section !== 'promo') {
            setEditingSection(null);
            return;
        }

        startTransition(async () => {
            try {
                if (section === 'hero' || section === 'promo') {
                    const formData = new FormData();
                    const sectionData = section === 'hero' 
                        ? { ...content.hero, ...localChanges.hero }
                        : { ...content.promo, ...localChanges.promo };
                    
                    // Add all fields to formData
                    Object.entries(sectionData).forEach(([key, value]) => {
                        if (key !== 'heroImage' && key !== 'promoImage') {
                            formData.append(key, value as string);
                        }
                    });

                    // Add current image as fallback
                    const currentImage = section === 'hero' 
                        ? content.hero.backgroundImage 
                        : content.promo.backgroundImage;
                    formData.append("currentImage", currentImage);

                    // Add new file if selected
                    const inputId = section === 'hero' ? 'hero-image-input' : 'promo-image-input';
                    const fileInput = document.getElementById(inputId) as HTMLInputElement;
                    if (fileInput?.files?.[0]) {
                        formData.append("image", fileInput.files[0]);
                    }

                    const result = section === 'hero' 
                        ? await updateHero(formData)
                        : await updatePromo(formData);

                    if (result.success && result.data) {
                        if (section === 'hero') setHero(result.data);
                        else setPromo(result.data);
                    }
                } else {
                    // Normalize Links
                    const dataToSave = { ...localChanges[section] };
                    if (dataToSave.ctaLink === "") dataToSave.ctaLink = "/shop";
                    if (dataToSave.secondaryLink === "") dataToSave.secondaryLink = "/shop";

                    if (section === 'hero') setHero(dataToSave);
                    if (section === 'promo') setPromo(dataToSave);
                    if (section === 'newsletter') setNewsletter(dataToSave);
                    if (section.startsWith('collection-')) {
                        const id = section.replace('collection-', '');
                        setCollection(id, dataToSave);
                    }

                    await updateHomepageSection(section, dataToSave);
                }
                
                setEditingSection(null);
                setLocalChanges({});
            } catch (error) {
                console.error("Save failed:", error);
            }
        });
    };

    const handleCancel = () => {
        setEditingSection(null);
        setLocalChanges({});
    };

    const updateLocalChange = (section: string, field: string, value: string) => {
        setLocalChanges(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const getFieldValue = (section: string, field: string, defaultValue: string) => {
        if (localChanges[section]?.[field] !== undefined) {
            return localChanges[section][field];
        }
        switch (section) {
            case 'hero': return content.hero[field as keyof typeof content.hero] || defaultValue;
            case 'promo': return content.promo[field as keyof typeof content.promo] || defaultValue;
            case 'newsletter': return content.newsletter[field as keyof typeof content.newsletter] || defaultValue;
            default:
                if (section.startsWith('collection-')) {
                    const id = section.replace('collection-', '');
                    const col = content.collections.find(c => c.id === id);
                    return col?.[field as keyof typeof col] || defaultValue;
                }
                return defaultValue;
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50">
            <AdminHeader title="Homepage Management" />

            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-light tracking-tight">Storefront Interface</h1>
                        <p className="text-xs text-gray-500 mt-1">Configure your main landing page and featured content</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link 
                            href="/"
                            target="_blank"
                            className="w-full md:w-auto flex justify-center items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded hover:opacity-80 transition-all shadow-lg"
                        >
                            <Eye className="w-4 h-4" /> View Live Site
                        </Link>
                    </div>
                </div>

                {/* Hero Section Editor */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                                <Layout className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider">Hero Section</h3>
                                <p className="text-xs text-gray-400">Main banner content</p>
                            </div>
                        </div>
                        {editingSection !== 'hero' ? (
                            <button 
                                onClick={() => setEditingSection('hero')}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:border-black transition-colors"
                            >
                                <Pencil className="w-3 h-3" /> Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCancel}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                                <button 
                                    onClick={() => handleSave('hero')}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-colors"
                                >
                                    <Check className="w-3 h-3" /> Save
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {editingSection === 'hero' ? (
                        <div className="p-6 space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Subtitle</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('hero', 'subtitle', '')}
                                        onChange={(e) => updateLocalChange('hero', 'subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Title</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('hero', 'title', '')}
                                        onChange={(e) => updateLocalChange('hero', 'title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Title Accent</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('hero', 'titleAccent', '')}
                                        onChange={(e) => updateLocalChange('hero', 'titleAccent', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">CTA Text</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('hero', 'ctaText', '')}
                                        onChange={(e) => updateLocalChange('hero', 'ctaText', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">CTA Link</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('hero', 'ctaLink', '')}
                                        onChange={(e) => updateLocalChange('hero', 'ctaLink', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Secondary Link Text</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('hero', 'secondaryLinkText', '')}
                                        onChange={(e) => updateLocalChange('hero', 'secondaryLinkText', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Secondary Link</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('hero', 'secondaryLink', '')}
                                        onChange={(e) => updateLocalChange('hero', 'secondaryLink', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Background Image</label>
                                    <div className="flex items-center gap-4">
                                        {content.hero.backgroundImage && content.hero.backgroundImage.trim() ? (
                                            <div className="w-16 h-10 rounded border overflow-hidden flex-shrink-0 relative">
                                                <Image src={content.hero.backgroundImage} alt="Current" fill className="object-cover" unoptimized />
                                            </div>
                                        ) : null}
                                        <input 
                                            id="hero-image-input"
                                            type="file" 
                                            accept="image/*"
                                            className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:opacity-80 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Description</label>
                                    <textarea 
                                        value={getFieldValue('hero', 'description', '')}
                                        onChange={(e) => updateLocalChange('hero', 'description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                                {content.hero.backgroundImage && content.hero.backgroundImage.trim() ? (
                                    <>
                                        <Image src={content.hero.backgroundImage} alt="Hero" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="text-white text-2xl font-serif italic">{content.hero.title} <span className="not-italic">{content.hero.titleAccent}</span></span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">No Background Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div><span className="text-gray-400">Subtitle:</span> {content.hero.subtitle}</div>
                                <div><span className="text-gray-400">CTA:</span> {content.hero.ctaText}</div>
                                <div><span className="text-gray-400">Link:</span> {content.hero.ctaLink}</div>
                                <div><span className="text-gray-400">Secondary:</span> {content.hero.secondaryLinkText}</div>
                            </div>
                        </div>
                    )}
                </div>


                {/* Promo Section Editor */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider">Promotional Banner</h3>
                                <p className="text-xs text-gray-400">Secondary banner section</p>
                            </div>
                        </div>
                        {editingSection !== 'promo' ? (
                            <button 
                                onClick={() => setEditingSection('promo')}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:border-black transition-colors"
                            >
                                <Pencil className="w-3 h-3" /> Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCancel}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                                <button 
                                    onClick={() => handleSave('promo')}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-colors"
                                >
                                    <Check className="w-3 h-3" /> Save
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {editingSection === 'promo' ? (
                        <div className="p-6 space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Subtitle</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('promo', 'subtitle', '')}
                                        onChange={(e) => updateLocalChange('promo', 'subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Title</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('promo', 'title', '')}
                                        onChange={(e) => updateLocalChange('promo', 'title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Title Accent</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('promo', 'titleAccent', '')}
                                        onChange={(e) => updateLocalChange('promo', 'titleAccent', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">CTA Text</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('promo', 'ctaText', '')}
                                        onChange={(e) => updateLocalChange('promo', 'ctaText', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">CTA Link</label>
                                    <input 
                                        type="text" 
                                        value={getFieldValue('promo', 'ctaLink', '')}
                                        onChange={(e) => updateLocalChange('promo', 'ctaLink', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Background Image</label>
                                    <div className="flex items-center gap-4">
                                        {content.promo.backgroundImage && content.promo.backgroundImage.trim() ? (
                                            <div className="w-16 h-10 rounded border overflow-hidden flex-shrink-0 relative">
                                                <Image src={content.promo.backgroundImage} alt="Current" fill className="object-cover" unoptimized />
                                            </div>
                                        ) : null}
                                        <input 
                                            id="promo-image-input"
                                            type="file" 
                                            accept="image/*"
                                            className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:opacity-80 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Description</label>
                                    <textarea 
                                        value={getFieldValue('promo', 'description', '')}
                                        onChange={(e) => updateLocalChange('promo', 'description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                                {content.promo.backgroundImage && content.promo.backgroundImage.trim() ? (
                                    <>
                                        <Image src={content.promo.backgroundImage} alt="Promo" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-2xl font-serif italic">{content.promo.title} <span className="not-italic">{content.promo.titleAccent}</span></span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">No Background Image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Newsletter Section Editor */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                                <HomeIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider">Newsletter Section</h3>
                                <p className="text-xs text-gray-400">Email signup CTA</p>
                            </div>
                        </div>
                        {editingSection !== 'newsletter' ? (
                            <button 
                                onClick={() => setEditingSection('newsletter')}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:border-black transition-colors"
                            >
                                <Pencil className="w-3 h-3" /> Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCancel}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                                <button 
                                    onClick={() => handleSave('newsletter')}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-colors"
                                >
                                    <Check className="w-3 h-3" /> Save
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {editingSection === 'newsletter' ? (
                        <div className="p-6 space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Title</label>
                                <input 
                                    type="text" 
                                    value={getFieldValue('newsletter', 'title', '')}
                                    onChange={(e) => updateLocalChange('newsletter', 'title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Description</label>
                                <textarea 
                                    value={getFieldValue('newsletter', 'description', '')}
                                    onChange={(e) => updateLocalChange('newsletter', 'description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">CTA Text</label>
                                <input 
                                    type="text" 
                                    value={getFieldValue('newsletter', 'ctaText', '')}
                                    onChange={(e) => updateLocalChange('newsletter', 'ctaText', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="text-center p-8 bg-gray-50 dark:bg-zinc-800/30 rounded-xl">
                                <h4 className="text-xl font-serif mb-2">{content.newsletter.title}</h4>
                                <p className="text-sm text-gray-400 mb-2">{content.newsletter.description}</p>
                                <p className="text-xs font-bold uppercase tracking-wider">{content.newsletter.ctaText}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
