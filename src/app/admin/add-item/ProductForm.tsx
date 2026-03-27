"use client";

import { useState, useTransition } from "react";
import { Save, Image as ImageIcon, Plus, Trash2, Loader2, ChevronDown, CheckCircle2, AlertCircle, X, Percent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Category } from "@/lib/types";
import { updateProduct, addProduct } from "../actions";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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

import { PREDEFINED_COLORS as SHARED_COLORS, COLOR_MAP_HEX, SIZE_SCALES as DEFAULT_SIZE_SCALES } from "@/lib/constants";

export default function ProductForm({ 
    categories, 
    initialProduct, 
    sizeScales: customSizeScales 
}: { 
    categories: Category[], 
    initialProduct?: Product,
    sizeScales?: Record<string, string[]>
}) {
    const SIZE_SCALES = customSizeScales || DEFAULT_SIZE_SCALES;
    const isEditing = !!initialProduct;
    
    // Color Management
    const [availableColors, setAvailableColors] = useState(SHARED_COLORS.map(c => c.name));
    const [colorMap, setColorMap] = useState<Record<string, string>>({ ...COLOR_MAP_HEX });
    const [isAddingColor, setIsAddingColor] = useState(false);
    const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });

    const handleAddCustomColor = () => {
        if (!newColor.name.trim()) return;
        const name = newColor.name.charAt(0).toUpperCase() + newColor.name.slice(1);
        if (!availableColors.includes(name)) {
            setAvailableColors([...availableColors, name]);
            setColorMap({ ...colorMap, [name]: newColor.hex });
        }
        setNewColor({ name: "", hex: "#000000" });
        setIsAddingColor(false);
    };
    
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
    // Size Scale Management
    const [sizeScale, setSizeScale] = useState<keyof typeof SIZE_SCALES>("Standard");
    const availableSizes = SIZE_SCALES[sizeScale];

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Discount Management States
    const [price, setPrice] = useState<number>(initialProduct?.price || 0);
    const [isPercentage, setIsPercentage] = useState(false);
    const [discountInput, setDiscountInput] = useState(initialProduct?.discountPrice?.toString() || "");

    const toggleDiscountType = () => {
        if (isPercentage) {
            // Switching to Price
            if (price && discountInput) {
                const calculatedPrice = (price * (1 - parseFloat(discountInput) / 100)).toFixed(2);
                setDiscountInput(calculatedPrice);
            }
            setIsPercentage(false);
        } else {
            // Switching to Percentage
            if (price && discountInput && !isNaN(parseFloat(discountInput))) {
                const discVal = parseFloat(discountInput);
                if (discVal < price) {
                    const calculatedPercent = ((1 - discVal / price) * 100).toFixed(0);
                    setDiscountInput(calculatedPercent);
                }
            }
            setIsPercentage(true);
        }
    };

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1]
            } as any
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.4 }
        }
    };

    return (
        <form action={handleSubmit} className={cn("relative pb-32 max-w-7xl mx-auto", isPending && "opacity-60 pointer-events-none transition-opacity duration-300")}>
            {isEditing && <input type="hidden" name="productId" value={initialProduct.id} />}
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-12"
            >
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-5 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl flex items-start gap-4">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-500 mb-1">Action Required</h3>
                                    <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Section: Basic Info */}
                <motion.section 
                    variants={sectionVariants}
                    className="group relative bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-md transition-all duration-500 ring-1 ring-black/5 dark:ring-white/5"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold tracking-tight">Basic Information</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Essential details about your luxury product</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">General Specs</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        <div className="md:col-span-2 space-y-2">
                            <label htmlFor="name" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Product Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                defaultValue={initialProduct?.name}
                                placeholder="Elevated Silk Blouse"
                                className="w-full px-6 py-4 text-base bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-2xl shadow-sm focus:ring-4 ring-black/5 dark:ring-white/5 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="price" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Price (EGP) <span className="text-red-500">*</span></label>
                            <div className="relative group/input">
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    defaultValue={initialProduct?.price}
                                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="w-full pl-6 pr-12 py-4 text-base bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-2xl shadow-sm focus:ring-4 ring-black/5 dark:ring-white/5 placeholder:text-gray-300 dark:placeholder:text-gray-600 appearance-none m-0"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-30">EGP</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between pr-1">
                                <label htmlFor="discountDisplay" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">
                                    {isPercentage ? "Discount (%)" : "Discount Price (Optional)"}
                                </label>
                                <button
                                    type="button"
                                    onClick={toggleDiscountType}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider transition-all"
                                >
                                    {isPercentage ? (
                                        <>Switch to Fixed</>
                                    ) : (
                                        <><Percent className="w-2.5 h-2.5" /> Percentage</>
                                    )}
                                </button>
                            </div>
                            <div className="relative group/input">
                                <input
                                    type="number"
                                    id="discountDisplay"
                                    value={discountInput}
                                    onChange={(e) => setDiscountInput(e.target.value)}
                                    min="0"
                                    step={isPercentage ? "1" : "0.01"}
                                    placeholder={isPercentage ? "Example: 20" : "Sale price (if any)"}
                                    className="w-full pl-6 pr-12 py-4 text-base bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-2xl shadow-sm focus:ring-4 ring-black/5 dark:ring-white/5 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-30">
                                    {isPercentage ? "%" : "SALE"}
                                </span>
                                <input 
                                    type="hidden" 
                                    name="discountPrice" 
                                    value={
                                        isPercentage 
                                            ? (price && discountInput ? (price * (1 - parseFloat(discountInput) / 100)).toFixed(2) : "") 
                                            : discountInput
                                    } 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="mainCategory" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Main Category <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    id="mainCategory"
                                    name="type"
                                    required
                                    value={selectedMainCategory}
                                    onChange={(e) => setSelectedMainCategory(e.target.value)}
                                    className="w-full pl-6 pr-12 py-4 text-base bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-2xl shadow-sm focus:ring-4 ring-black/5 dark:ring-white/5 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="bg-white dark:bg-black">Select Category</option>
                                    {mainCategories.map((type) => (
                                        <option key={type} value={type} className="bg-white dark:bg-zinc-900">{type}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Sub Category <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    defaultValue={initialProduct?.category || ""}
                                    className="w-full pl-6 pr-12 py-4 text-base bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-2xl shadow-sm focus:ring-4 ring-black/5 dark:ring-white/5 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="bg-white dark:bg-black">Select Sub-category</option>
                                    {subCategories.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900">{c.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40" />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label htmlFor="description" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Detailed Description <span className="text-red-500">*</span></label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={6}
                                defaultValue={initialProduct?.description}
                                placeholder="Immerse your customers in the quality, texture, and inspiration behind this piece..."
                                className="w-full px-6 py-5 text-base bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-black dark:focus:border-white transition-all rounded-4xl shadow-sm focus:ring-4 ring-black/5 dark:ring-white/5 resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </motion.section>

                {/* Section: Variants */}
                <motion.section 
                    variants={sectionVariants}
                    className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
                                Product Variants
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">Manage colors, sizes, and specific inventory for each unique combination.</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                            <div className="px-4 py-2 flex items-center gap-2 border-r border-black/5 dark:border-white/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Scale:</span>
                                <select 
                                    value={sizeScale}
                                    onChange={(e) => setSizeScale(e.target.value as any)}
                                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer hover:text-blue-500 transition-colors"
                                >
                                    {Object.keys(SIZE_SCALES).map(scale => (
                                        <option key={scale} value={scale} className="bg-white dark:bg-zinc-900">{scale}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="px-5 py-2.5 bg-white dark:bg-black rounded-xl shadow-sm">
                                <span className="text-xs font-bold uppercase tracking-widest">Total Units: {totalStock}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <AnimatePresence mode="popLayout">
                            {images.map((img, index) => (
                                <motion.div 
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className={cn(
                                        "group relative flex flex-col xl:flex-row gap-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 p-8 rounded-4xl transition-all duration-300",
                                        openColorDropdownId === img.id ? "z-60 ring-4 ring-black/5 dark:ring-white/10" : "z-0 hover:border-black/20 dark:hover:border-white/20"
                                    )}
                                >
                                    {/* Image Upload Area */}
                                    <div className="relative group/img w-full xl:w-48 h-64 xl:h-auto overflow-hidden rounded-2xl bg-gray-50/50 dark:bg-black/30 border-2 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center shrink-0 transition-colors hover:border-gray-200 dark:hover:border-white/10">
                                        {img.preview ? (
                                            <>
                                                <Image src={img.preview} alt="Preview" fill className="object-cover transition-transform duration-700 group-hover/img:scale-110" unoptimized />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white">Change Image</label>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-gray-400 transition-colors group-hover/img:text-gray-600 dark:group-hover/img:text-gray-200">
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/50 shadow-sm flex items-center justify-center border border-gray-100 dark:border-white/5">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Upload View</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            name={`image_${img.id}`}
                                            accept="image/*"
                                            required={index === 0 && !img.existingUrl}
                                            onChange={(e) => handleFileChange(img.id, e)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {img.existingUrl && <input type="hidden" name={`existing_image_${img.id}`} value={img.existingUrl} />}
                                        
                                        {index === 0 && (
                                            <div className="absolute top-4 left-4 pointer-events-none">
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10 text-[8px] font-bold uppercase tracking-[0.15em] text-white">
                                                    <CheckCircle2 className="w-2.5 h-2.5" /> Main Cover
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            {/* Color Selection with Refined Dropdown */}
                                            <div className="space-y-4">
                                                <label className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Variant Theme</label>
                                                <div className="relative">
                                                    <input type="hidden" name={`color_${img.id}`} value={img.color} />
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenColorDropdownId(openColorDropdownId === img.id ? null : img.id)}
                                                        className="w-full px-6 py-4 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-black/40 transition-all"
                                                    >
                                                        {img.color ? (
                                                            <div className="flex items-center gap-3">
                                                                    <div
                                                                        className="w-5 h-5 rounded-full border border-gray-100 dark:border-white/10 shadow-sm"
                                                                        style={{ backgroundColor: colorMap[img.color] }}
                                                                    />
                                                                <span className="text-sm font-medium tracking-tight">{img.color}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">Select Color Accent</span>
                                                        )}
                                                        <ChevronDown className={cn("w-4 h-4 opacity-40 transition-transform duration-300", openColorDropdownId === img.id && "rotate-180")} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {openColorDropdownId === img.id && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                className="absolute top-full left-0 mt-4 w-full md:w-[280px] p-6 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-100 ring-1 ring-black/5"
                                                            >
                                                                <div className="grid grid-cols-5 gap-3 mb-6">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleColorSelect(img.id, "")}
                                                                        className={cn(
                                                                            "w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110",
                                                                            img.color === "" ? "border-black dark:border-white ring-2 ring-black/5 dark:ring-white/20" : "border-gray-100 dark:border-white/10 opacity-40"
                                                                        )}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                    {availableColors.map(color => (
                                                                        <button
                                                                            key={color}
                                                                            type="button"
                                                                            onClick={() => handleColorSelect(img.id, color)}
                                                                            title={color}
                                                                            className={cn(
                                                                                "w-10 h-10 rounded-full border shadow-inner transition-all hover:scale-110",
                                                                                img.color === color ? "ring-2 ring-offset-2 ring-black dark:ring-white ring-offset-white dark:ring-offset-zinc-800 scale-110 shadow-md" : "border-transparent ring-1 ring-black/5 dark:ring-white/10 opacity-90"
                                                                            )}
                                                                            style={{ backgroundColor: colorMap[color] }}
                                                                        />
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsAddingColor(!isAddingColor)}
                                                                        className="w-10 h-10 rounded-full border border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center transition-all hover:scale-110 hover:border-black dark:hover:border-white"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                
                                                                {isAddingColor && (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: "auto" }}
                                                                        className="mb-6 space-y-3 p-4 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-white/5"
                                                                    >
                                                                        <div className="flex gap-2">
                                                                            <input 
                                                                                type="text" 
                                                                                placeholder="Color Name"
                                                                                value={newColor.name}
                                                                                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                                                                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none"
                                                                            />
                                                                            <input 
                                                                                type="color" 
                                                                                value={newColor.hex}
                                                                                onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                                                                                className="w-10 h-10 p-1 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/10 rounded-xl cursor-pointer"
                                                                            />
                                                                        </div>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={handleAddCustomColor}
                                                                            disabled={!newColor.name.trim()}
                                                                            className="w-full py-2 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                                                        >
                                                                            Define Custom Color
                                                                        </button>
                                                                    </motion.div>
                                                                )}

                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Brand Neutrals</p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Size Management Area */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Inventory Distribution</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addSizeToRow(img.id)}
                                                        className="text-[9px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Size
                                                    </button>
                                                </div>
                                                
                                                <div className="bg-gray-50/30 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-4">
                                                    <AnimatePresence initial={false}>
                                                        {img.sizes.map((s: SizeInventory) => (
                                                            <motion.div 
                                                                key={s.id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                                                                className="flex gap-4 items-center group/size"
                                                            >
                                                                <div className="relative flex-1">
                                                                    <select
                                                                        value={s.size}
                                                                        onChange={(e) => handleSizeUpdate(img.id, s.id, e.target.value)}
                                                                        className="w-full pl-4 pr-10 py-3 text-xs bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/5 rounded-xl appearance-none focus:outline-none focus:ring-2 ring-black/5 transition-all cursor-pointer"
                                                                    >
                                                                        <option value="">Size</option>
                                                                        {availableSizes.map(sz => (
                                                                            <option key={sz} value={sz}>{sz}</option>
                                                                        ))}
                                                                    </select>
                                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30 pointer-events-none" />
                                                                </div>
                                                                <div className="relative w-28 shrink-0">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={isNaN(s.quantity) ? "" : String(s.quantity)}
                                                                        onChange={(e) => handleQuantityUpdate(img.id, s.id, e.target.value === "" ? NaN : parseInt(e.target.value))}
                                                                        placeholder="Stock"
                                                                        className="w-full px-4 py-3 text-xs bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 ring-black/5 transition-all text-right pr-12"
                                                                    />
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-30 pointer-events-none uppercase">Qty</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSizeFromRow(img.id, s.id)}
                                                                    disabled={img.sizes.length === 1}
                                                                    className="p-2 text-gray-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    <input type="hidden" name={`sizes_${img.id}`} value={JSON.stringify(img.sizes)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 shrink-0 self-start">
                                        <button
                                            type="button"
                                            onClick={() => removeImageRow(img.id)}
                                            disabled={images.length === 1}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl disabled:opacity-0 transition-all duration-300"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <input type="hidden" name="activeImageIds" value={img.id} />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            type="button"
                            onClick={addImageRow}
                            className="w-full mt-6 py-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-4xl flex items-center justify-center gap-3 text-sm font-semibold text-gray-400 group hover:border-black/10 dark:hover:border-white/10 hover:text-black dark:hover:text-white transition-all duration-500 hover:bg-black/2 dark:hover:bg-white/2"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-50/50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span>Create New Variant Combination</span>
                        </motion.button>
                    </div>
                </motion.section>
            </motion.div>

            {/* Sticky Refined Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 z-100 px-6 py-8 flex justify-center pointer-events-none">
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5, type: "spring", damping: 25 }}
                    className="w-full max-w-2xl bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto ring-1 ring-black/5"
                >
                    <Link 
                        href="/admin/inventory" 
                        className="flex-1 px-8 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        Discard
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "flex-2 py-4 rounded-3xl bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-black/10 dark:shadow-white/5",
                            isPending ? "px-10" : "px-14"
                        )}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> 
                                <span>{isEditing ? "Update Masterpiece" : "Finalize Listing"}</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </form>
    );
}
