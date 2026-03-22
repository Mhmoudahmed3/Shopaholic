"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AdminHeader } from "../components/AdminLayout";
import { Library, Plus, Pencil, Trash2, Layers, Loader2 } from "lucide-react";
import { CollectionModal } from "../components/CollectionModal";
import { getCuratedCollections, deleteCollection } from "../actions";
import { Collection } from "@/lib/types";

export default function AdminCollectionsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    const fetchCollections = async () => {
        setIsLoading(true);
        try {
            const data = await getCuratedCollections();
            setCollections(data);
        } catch (error) {
            console.error("Failed to fetch collections:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the collection "${name}"?`)) {
            try {
                await deleteCollection(id);
                fetchCollections();
            } catch (error) {
                console.error("Failed to delete collection:", error);
            }
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingCollection(null);
        fetchCollections();
    };

    const handleAddNew = () => {
        setEditingCollection(null);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50 transition-colors duration-500">
            <AdminHeader title="Collection Management" />

            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="animate-in slide-in-from-left duration-700">
                        <h1 className="text-2xl font-light tracking-tight">Curated Collections</h1>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium opacity-60">Organize products into seasonal or category-based groups</p>
                    </div>
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:opacity-80 transition-all shadow-xl hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New Collection
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Collections...</p>
                    </div>
                ) : collections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {collections.map((collection, index) => (
                            <div 
                                key={collection.id} 
                                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="aspect-[4/5] bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center relative overflow-hidden">
                                    {collection.image ? (
                                        <Image 
                                            src={collection.image} 
                                            alt={collection.name} 
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                                            unoptimized
                                        />
                                    ) : (
                                        <Layers className="w-12 h-12 text-gray-200 group-hover:scale-125 transition-transform duration-700" />
                                    )}
                                    <div className="absolute top-6 right-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md ${collection.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                                            {collection.status}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="p-7 flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold uppercase tracking-[0.1em]">{collection.name}</h3>
                                        {collection.subtitle && (
                                            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight line-clamp-1">{collection.subtitle}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter opacity-50">{collection.itemsCount || 0} Products</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleEdit(collection)}
                                            className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-full transition-all"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(collection.id, collection.name)}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-zinc-900/[0.02] dark:bg-zinc-900/40 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-[3rem] p-24 text-center animate-in fade-in duration-1000">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Library className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-light text-gray-500 dark:text-gray-400 tracking-tight">Your collection showroom is empty</h3>
                        <p className="text-xs text-gray-400 mt-3 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-medium opacity-60">Create rich, immersive pages for your collections with editorial content and high-resolution media.</p>
                        <button 
                            onClick={handleAddNew}
                            className="mt-10 inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:opacity-80 transition-all shadow-xl hover:scale-[1.05]"
                        >
                            <Plus className="w-4 h-4" /> Start First Collection
                        </button>
                    </div>
                )}
            </main>

            <CollectionModal 
                isOpen={isModalOpen} 
                onClose={handleModalClose}
                initialCollection={editingCollection}
            />
        </div>
    );
}
