"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Check, Loader2, Search, Package } from "lucide-react";
import { createCuratedCollection, getAvailableProducts } from "../actions";
import { Product, Collection } from "@/lib/types";

interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialCollection?: Collection | null;
}

export function CollectionModal({ isOpen, onClose, initialCollection }: CollectionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFetchingProducts, setIsFetchingProducts] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            if (initialCollection) {
                setImagePreview(initialCollection.image || null);
                setSelectedIds(initialCollection.productIds || []);
            } else {
                setImagePreview(null);
                setImageFile(null);
                setSelectedIds([]);
            }
        }
    }, [isOpen, initialCollection]);

    const fetchProducts = async () => {
        setIsFetchingProducts(true);
        try {
            const products = await getAvailableProducts();
            setAvailableProducts(products);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsFetchingProducts(false);
        }
    };

    if (!isOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const toggleProduct = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id) 
                : [...prev, id]
        );
    };

    const filteredProducts = availableProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        if (imageFile) formData.append("image", imageFile);
        formData.append("productIds", JSON.stringify(selectedIds));
        
        if (initialCollection) {
            formData.append("collectionId", initialCollection.id);
            formData.append("currentImage", initialCollection.image || "");
        }

        try {
            if (initialCollection) {
                const { updateCuratedCollection } = await import("../actions");
                await updateCuratedCollection(formData);
            } else {
                await createCuratedCollection(formData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save collection:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 my-4 md:my-8 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-light tracking-tight">{initialCollection ? 'Edit Collection' : 'Create New Collection'}</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configure your curated series and select items</p>
                    </div>
                    <button onClick={onClose} className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors group shrink-0">
                        <X className="w-5 h-5 text-gray-500 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-zinc-800 overflow-y-auto custom-scrollbar">
                    {/* Left Side: Details & Image */}
                    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
                        <div className="space-y-4">
                            <div 
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${dragActive ? 'border-black dark:border-white bg-gray-50 dark:bg-zinc-800/50' : 'border-gray-100 dark:border-zinc-800/50 hover:border-gray-300 dark:hover:border-zinc-600 bg-gray-50/50 dark:bg-zinc-900/50'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <Image src={imagePreview} fill className="object-cover" alt="Preview" unoptimized />
                                ) : (
                                    <div className="text-center">
                                        <div className="p-5 bg-white dark:bg-zinc-800 rounded-full mb-3 shadow-sm inline-block">
                                            <Upload className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Upload Banner</p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter opacity-70">Recommended: high-res 16:9</p>
                                    </div>
                                )}
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Collection Name</label>
                                    <input 
                                        name="name"
                                        required
                                        defaultValue={initialCollection?.name}
                                        placeholder="e.g., THE EDIT: MINIMALISM"
                                        className="w-full mt-2 px-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Editorial Subtitle</label>
                                    <input 
                                        name="subtitle"
                                        defaultValue={initialCollection?.subtitle}
                                        placeholder="e.g., A vision of contemporary luxury"
                                        className="w-full mt-2 px-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Publication Status</label>
                                    <select 
                                        name="status"
                                        defaultValue={initialCollection?.status}
                                        className="w-full mt-2 px-5 py-4 bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Draft">Save as Draft</option>
                                        <option value="Active">Publish Immediately</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Product Selection */}
                    <div className="w-full md:w-[400px] p-4 sm:p-6 md:p-8 bg-gray-50/30 dark:bg-zinc-950/20 flex flex-col h-[500px] md:h-[600px] shrink-0">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Select Inventory</h3>
                            <span className="text-[10px] bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full font-bold">{selectedIds.length} Selected</span>
                        </div>

                        <div className="relative mb-4 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[1.2rem] text-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {isFetchingProducts ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Vault...</p>
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div 
                                        key={product.id}
                                        onClick={() => toggleProduct(product.id)}
                                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border ${selectedIds.includes(product.id) ? 'bg-black dark:bg-white border-black dark:border-white' : 'bg-white dark:bg-zinc-900 border-gray-50 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700'}`}
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                            <Image src={product.images[0]} alt="" fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[11px] font-bold uppercase tracking-tight truncate ${selectedIds.includes(product.id) ? 'text-white dark:text-black' : 'text-gray-800 dark:text-gray-200'}`}>{product.name}</p>
                                            <p className={`text-[9px] uppercase tracking-widest font-medium opacity-60 ${selectedIds.includes(product.id) ? 'text-white/80 dark:text-black/80' : 'text-gray-400'}`}>{product.category}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedIds.includes(product.id) ? 'bg-white dark:bg-black border-white dark:border-black' : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700'}`}>
                                            {selectedIds.includes(product.id) && <Check className="w-3 h-3 text-black dark:text-white" />}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-[10px] text-center px-8">
                                    <Package className="w-8 h-8 mb-3 opacity-20" />
                                    No items found matching your search criteria
                                </div>
                            )}
                        </div>

                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-4 shrink-0">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-zinc-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:opacity-80 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <><Check className="w-4 h-4" /> {initialCollection ? 'Update' : 'Finalize'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
