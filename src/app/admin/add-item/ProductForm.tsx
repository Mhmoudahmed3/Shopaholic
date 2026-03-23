"use client";

import { useState, useTransition } from "react";
import { Save, Image as ImageIcon, Plus, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/lib/types";
import { updateProduct, addProduct } from "../actions";

interface SizeInventory {
    id: string;
    size: string;
    quantity: number;
}

interface ImageVariantRow {
    id: number;
    file: File | null;
    preview: string;
    color: string;
    sizes: SizeInventory[];
    existingUrl: string;
}

import { PREDEFINED_COLORS as SHARED_COLORS, PREDEFINED_SIZES, COLOR_MAP_HEX } from "@/lib/constants";

const PREDEFINED_COLORS = SHARED_COLORS.map(c => c.name).concat('Default');
const COLOR_MAP: Record<string, string> = { ...COLOR_MAP_HEX, 'Default': 'transparent' };

export default function ProductForm({ categories, initialProduct }: { categories: Category[], initialProduct?: Product }) {
    const isEditing = !!initialProduct;
    
    // Process initial variants into grouped rows (one row per color/image)
    const processInitialRows = () => {
        if (initialProduct?.imageVariants && initialProduct.imageVariants.length > 0) {
            const rowMap = new Map<string, ImageVariantRow>();
            initialProduct.imageVariants.forEach(v => {
                const key = `${v.url}-${v.color || ""}`;
                if (!rowMap.has(key)) {
                    rowMap.set(key, {
                        id: rowMap.size,
                        file: null,
                        preview: v.url,
                        color: v.color || "",
                        sizes: [],
                        existingUrl: v.url
                    });
                }
                const row = rowMap.get(key);
                // Only add if this size doesn't exist for this image/color yet (deduplication)
                if (row && !row.sizes.find((s: SizeInventory) => s.size === v.size)) {
                    row.sizes.push({
                        id: Math.random().toString(36).substr(2, 9),
                        size: v.size || "",
                        quantity: v.quantity || 0
                    });
                }
            });
            return Array.from(rowMap.values());
        }
        
        if (initialProduct?.images && initialProduct.images.length > 0) {
            return initialProduct.images.map((url, i) => ({
                id: i,
                file: null,
                preview: url,
                color: "",
                sizes: [{ id: `init-${i}-0`, size: "", quantity: 0 }],
                existingUrl: url
            }));
        }

        return [{ 
            id: 0, 
            file: null, 
            preview: "", 
            color: "", 
            sizes: [{ id: 'init-0-0', size: "", quantity: 0 }], 
            existingUrl: "" 
        }];
    };

    const [images, setImages] = useState(processInitialRows());
    const [nextId, setNextId] = useState(processInitialRows().length);
    const [openColorDropdownId, setOpenColorDropdownId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Independent Category Selection State
    const initialMainCategory = categories.find(c => c.id === initialProduct?.category)?.type || "";
    const [selectedMainCategory, setSelectedMainCategory] = useState<string>(initialMainCategory);

    // Get unique main categories (types) from categories list
    const mainCategories = Array.from(new Set(categories.map(c => c.type || 'General'))).sort();
    const subCategories = categories.filter(c => (c.type || 'General') === (selectedMainCategory || 'General'));

    const totalStock = images.reduce((sum, img) => 
        sum + (img.sizes || []).reduce((sSum: number, s: SizeInventory) => sSum + (isNaN(s.quantity) ? 0 : (s.quantity || 0)), 0), 0
    );

    const addImageRow = () => {
        setImages([...images, { 
            id: nextId, 
            file: null, 
            preview: "", 
            color: "", 
            sizes: [{ id: `${nextId}-${Date.now()}`, size: "", quantity: 0 }], 
            existingUrl: "" 
        }]);
        setNextId(nextId + 1);
    };

    const handleColorSelect = (id: number, color: string) => {
        setImages(images.map(img => img.id === id ? { ...img, color } : img));
        setOpenColorDropdownId(null);
    };

    const addSizeToRow = (rowId: number) => {
        setImages(images.map(img => img.id === rowId ? {
            ...img,
            sizes: [...img.sizes, { id: Math.random().toString(36).substr(2, 9), size: "", quantity: 0 }]
        } : img));
    };

    const removeSizeFromRow = (rowId: number, sizeId: string) => {
        setImages(images.map(img => img.id === rowId ? {
            ...img,
            sizes: img.sizes.length > 1 ? img.sizes.filter((s: SizeInventory) => s.id !== sizeId) : img.sizes
        } : img));
    };

    const handleSizeUpdate = (rowId: number, sizeId: string, value: string) => {
        setImages(images.map(img => img.id === rowId ? {
            ...img,
            sizes: img.sizes.map((s: SizeInventory) => s.id === sizeId ? { ...s, size: value } : s)
        } : img));
    };

    const handleQuantityUpdate = (rowId: number, sizeId: string, quantity: number) => {
        setImages(images.map(img => img.id === rowId ? {
            ...img,
            sizes: img.sizes.map((s: SizeInventory) => s.id === sizeId ? { ...s, quantity } : s)
        } : img));
    };

    const removeImageRow = (id: number) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImages(images.map(img => img.id === id ? { ...img, file, preview, existingUrl: "" } : img));
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            try {
                const action = isEditing ? updateProduct : addProduct;
                const result = await action(formData);
                if (result?.success) {
                    router.push("/admin/inventory");
                    router.refresh();
                }
            } catch (err) {
                console.error("Submission failed:", err);
                setError(err instanceof Error ? err.message : "Failed to save product. Please try again.");
            }
        });
    };

    return (
        <form action={handleSubmit} className={`space-y-12 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
            {isEditing && <input type="hidden" name="productId" value={initialProduct.id} />}
            
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                    <div className="mt-0.5">⚠️</div>
                    <div>
                        <p className="font-semibold mb-1">Submission Failed</p>
                        <p className="opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* Section: Basic Info */}
            <section className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-lg font-medium tracking-wide uppercase mb-6 flex items-center gap-2">
                    Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider mb-2">Product Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            defaultValue={initialProduct?.name}
                            placeholder="e.g. Essential Cotton T-Shirt"
                            className="w-full p-3 text-sm bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-xs font-medium uppercase tracking-wider mb-2">Base Price (EGP) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            defaultValue={initialProduct?.price}
                            placeholder="0.00"
                            className="w-full p-3 text-sm bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="discountPrice" className="block text-xs font-medium uppercase tracking-wider mb-2">Discount Price (EGP)</label>
                        <input
                            type="number"
                            id="discountPrice"
                            name="discountPrice"
                            min="0"
                            step="0.01"
                            defaultValue={initialProduct?.discountPrice}
                            placeholder="Optional sale price"
                            className="w-full p-3 text-sm bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                        />
                    </div>

                    <input type="hidden" name="stock" value={totalStock} />

                    <div className="md:col-span-1">
                        <label htmlFor="mainCategory" className="block text-xs font-medium uppercase tracking-wider mb-2 text-gray-400">PRODUCT TYPE (Main Category) <span className="text-red-500">*</span></label>
                        <select
                            id="mainCategory"
                            required
                            value={selectedMainCategory}
                            onChange={(e) => setSelectedMainCategory(e.target.value)}
                            className="w-full p-4 text-sm bg-transparent border border-gray-100 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-xl focus:ring-4 ring-black/5"
                        >
                            <option value="" disabled className="bg-white dark:bg-black">Select Main Category...</option>
                            {mainCategories.map((type) => (
                                <option key={type} value={type} className="bg-white dark:bg-black font-medium">{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label htmlFor="category" className="block text-xs font-medium uppercase tracking-wider mb-2 text-gray-400">PRODUCT TYPE (Sub-category) <span className="text-red-500">*</span></label>
                        <select
                            id="category"
                            name="category"
                            required
                            defaultValue={initialProduct?.category || ""}
                            className="w-full p-4 text-sm bg-transparent border border-gray-100 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-xl focus:ring-4 ring-black/5"
                        >
                            <option value="" disabled className="bg-white dark:bg-black">None (Generic Product)</option>
                            {subCategories.map((c) => (
                                <option key={c.id} value={c.id} className="bg-white dark:bg-black font-medium">{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-xs font-medium uppercase tracking-wider mb-2">Detailed Description <span className="text-red-500">*</span></label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={5}
                            defaultValue={initialProduct?.description}
                            placeholder="Describe the material, fit, and style..."
                            className="w-full p-3 text-sm bg-transparent border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                        />
                    </div>
                </div>
            </section>

            {/* Section: Variants */}
            <section className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-lg font-medium tracking-wide uppercase mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-400" /> Variants
                </h2>

                <div className="space-y-4">
                    <p className="text-xs text-gray-500 mb-4">Upload your photos and optionally associate a color with each. The first photo will be your main cover image.</p>

                    {images.map((img, index) => (
                        <div 
                            key={img.id} 
                            className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border border-gray-100 dark:border-gray-800 rounded-lg transition-all relative ${openColorDropdownId === img.id ? 'z-[60] ring-1 ring-black/5 dark:ring-white/5 shadow-md bg-white/50 dark:bg-black/50' : 'z-0'}`}
                        >
                            <div className="w-16 h-16 relative bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden shrink-0">
                                {img.preview ? (
                                    <Image src={img.preview} alt="Preview" fill className="object-cover" unoptimized />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                )}
                            </div>                            <div className="flex-1 w-full flex flex-col xl:flex-row gap-6 xl:items-center">
                                <div className="flex-1 flex flex-col md:flex-row gap-4 md:items-center">
                                    <div className="flex-1 w-full">
                                        <label className="block text-[10px] font-medium uppercase tracking-wider mb-1 text-gray-500">Image File</label>
                                        <input
                                            type="file"
                                            name={`image_${img.id}`}
                                            accept="image/*"
                                            required={index === 0 && !img.existingUrl}
                                            onChange={(e) => handleFileChange(img.id, e)}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 dark:file:bg-zinc-800 dark:file:text-gray-300 dark:hover:file:bg-zinc-700 transition-colors"
                                        />
                                        {img.existingUrl && <input type="hidden" name={`existing_image_${img.id}`} value={img.existingUrl} />}
                                    </div>

                                    {/* Color Selection */}
                                    <div className="w-full md:w-32 relative">
                                        <label className="block text-[10px] font-medium uppercase tracking-wider mb-2 text-gray-500">Color</label>
                                        <input type="hidden" name={`color_${img.id}`} value={img.color} />
                                        <div
                                            className="w-full p-2.5 text-sm bg-transparent border border-gray-200 dark:border-gray-800 flex items-center justify-between cursor-pointer transition-colors"
                                            onClick={() => setOpenColorDropdownId(openColorDropdownId === img.id ? null : img.id)}
                                        >
                                            {img.color ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-4 h-4 rounded-full shadow-sm ring-1 ring-offset-1 ring-offset-white dark:ring-offset-black ring-transparent ${img.color === 'White' || img.color === 'Default' ? 'border border-gray-200 dark:border-gray-800' : ''}`}
                                                        style={{ backgroundColor: COLOR_MAP[img.color] }}
                                                    />
                                                    <span className="text-xs">{img.color}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-xs">None</span>
                                            )}
                                            <svg className={`w-4 h-4 transition-transform ${openColorDropdownId === img.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {openColorDropdownId === img.id && (
                                            <div className="absolute z-[100] top-full left-0 mt-2 w-[220px] p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                                                <div className="grid grid-cols-4 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleColorSelect(img.id, "")}
                                                        className={`flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 mx-auto transition-all ${img.color === "" ? 'ring-2 ring-offset-2 ring-black dark:ring-white ring-offset-white dark:ring-offset-black' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                                                    >
                                                        <span className="text-xs text-gray-400">None</span>
                                                    </button>
                                                    {PREDEFINED_COLORS.map(color => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            title={color}
                                                            onClick={() => handleColorSelect(img.id, color)}
                                                            className={`w-9 h-9 rounded-full shadow-sm ring-1 ring-offset-2 ring-offset-white dark:ring-offset-black transition-all mx-auto ${img.color === color ? 'ring-black dark:ring-white scale-110' : 'ring-transparent hover:scale-110 opacity-90 hover:opacity-100'} ${color === 'White' || color === 'Default' ? 'border border-gray-200 dark:border-gray-800' : ''}`}
                                                            style={{ backgroundColor: COLOR_MAP[color] }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Select Color</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setOpenColorDropdownId(null)}
                                                        className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sizes & Quantities Sub-form */}
                                <div className="flex-1 bg-gray-50/50 dark:bg-zinc-900/30 p-4 border border-gray-100 dark:border-gray-800/50 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Inventory by Size</label>
                                        <button
                                            type="button"
                                            onClick={() => addSizeToRow(img.id)}
                                            className="text-[10px] bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-2 py-1 rounded-sm hover:opacity-80 transition-opacity flex items-center gap-1 uppercase tracking-tighter"
                                        >
                                            <Plus className="w-3 h-3" /> Add Size
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {img.sizes.map((s: SizeInventory) => (
                                            <div key={s.id} className="flex gap-3 items-end group/size">
                                                <div className="w-32">
                                                    <select
                                                        value={s.size}
                                                        onChange={(e) => handleSizeUpdate(img.id, s.id, e.target.value)}
                                                        className="w-full p-2 text-xs bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                                                    >
                                                        <option value="">Size</option>
                                                        {PREDEFINED_SIZES.map(sz => (
                                                            <option key={sz} value={sz}>{sz}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-28 relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={isNaN(s.quantity) ? "" : String(s.quantity)}
                                                        onChange={(e) => handleQuantityUpdate(img.id, s.id, e.target.value === "" ? NaN : parseInt(e.target.value))}
                                                        className="w-full p-2 pl-8 text-xs bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                                    />
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-bold uppercase pointer-events-none">Qty</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSizeFromRow(img.id, s.id)}
                                                    disabled={img.sizes.length === 1}
                                                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-0 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input type="hidden" name={`sizes_${img.id}`} value={JSON.stringify(img.sizes)} />
                                </div>
                            </div>

                            <div className="pt-5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => removeImageRow(img.id)}
                                    disabled={images.length === 1}
                                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <input type="hidden" name="activeImageIds" value={img.id} />
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addImageRow}
                        className="mt-4 flex items-center gap-2 text-sm font-medium hover:text-gray-500 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Another Variant
                    </button>
                </div>
            </section>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                <Link href="/admin" className="w-full sm:w-auto px-8 py-4 text-center text-sm font-medium tracking-widest uppercase border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto px-8 py-4 bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> 
                            {isEditing ? "Update Product" : "Save Product"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
