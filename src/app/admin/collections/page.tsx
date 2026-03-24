"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AdminHeader } from "../components/AdminLayout";
import { Library, Plus, Pencil, Trash2, Layers, Loader2, Sparkles, ChevronRight, LayoutGrid, MoreVertical } from "lucide-react";
import { CollectionModal } from "../components/CollectionModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { getCuratedCollections, deleteCollection } from "../actions";
import { Collection } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminCollectionsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

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

    const handleDeleteClick = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteCollection(itemToDelete.id);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
            fetchCollections();
        } catch (error) {
            console.error("Failed to delete collection:", error);
        } finally {
            setIsDeleting(false);
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
            <AdminHeader title="Storefront Collections" />

            <main className="flex-1 p-6 md:p-10 space-y-10">
                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-black/[0.03] dark:border-white/[0.03]">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-black dark:text-white opacity-40" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/40">Luxury Curation</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight flex items-center gap-3">
                            Curated <span className="italic font-serif">Groups</span>
                        </h1>
                        <p className="text-xs text-gray-500 max-w-md uppercase tracking-[0.15em] font-medium leading-relaxed opacity-60">
                            Organize your boutique&apos;s essence into seasonal narratives and stylistic collections.
                        </p>
                    </motion.div>

                    <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddNew}
                        className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] transition-all duration-500"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                             <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                             New Narrative
                        </span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur" />
                    </motion.button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 animate-spin-slow text-black/10 dark:text-white/10" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5 text-black/20 dark:text-white/20" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 animate-pulse">Loading Collections...</p>
                    </div>
                ) : collections.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        <AnimatePresence mode="popLayout">
                            {collections.map((collection, index) => (
                                <motion.div 
                                    key={collection.id} 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className="group flex flex-col h-full"
                                >
                                    {/* ── Collection Image Wrapper ── */}
                                    <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-zinc-900/40 shadow-sm border border-black/[0.02] dark:border-white/[0.02] transition-all duration-700 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]">
                                        {collection.image ? (
                                            <Image 
                                                src={collection.image} 
                                                alt={collection.name} 
                                                fill
                                                className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 group-hover:rotate-1" 
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                <Layers className="w-20 h-20" />
                                            </div>
                                        )}
                                        
                                        {/* ── Status Badge ── */}
                                        <div className="absolute top-6 left-6 z-10">
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-xl transition-all duration-500",
                                                collection.status === 'Active' 
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]" 
                                                    : "bg-black/40 text-white/60 border border-white/5"
                                            )}>
                                                {collection.status}
                                            </div>
                                        </div>

                                        {/* ── Hover Overlay Actions ── */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 z-20">
                                            <motion.button 
                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,1)', color: 'black' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleEdit(collection)}
                                                className="w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-full backdrop-blur-md transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(220,38,38,1)', color: 'white' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteClick(collection.id, collection.name)}
                                                className="w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-full backdrop-blur-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        </div>

                                        {/* ── Subtle Bottom Fade ── */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-700" />
                                        
                                        {/* ── Item Count Bubble ── */}
                                        <div className="absolute bottom-6 right-6 z-10 scale-90 group-hover:scale-100 transition-transform duration-500">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-[9px] text-white font-bold uppercase tracking-[0.1em]">
                                                {collection.itemsCount || 0} Pieces
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Collection Info ── */}
                                    <div className="mt-8 px-2 space-y-1.5 flex-1 relative">
                                        <div className="flex items-center justify-between group/title">
                                            <h3 className="text-xl font-light tracking-tight group-hover:translate-x-1 transition-transform duration-500 uppercase">{collection.name}</h3>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0" />
                                        </div>
                                        
                                        {collection.subtitle && (
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-[0.15em] opacity-80 leading-relaxed font-serif italic">
                                                {collection.subtitle}
                                            </p>
                                        )}
                                        
                                        <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                                            <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                                            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-black/20 dark:text-white/20">Edit Details</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="bg-zinc-900/[0.01] dark:bg-zinc-900/30 border border-black/[0.05] dark:border-white/[0.05] rounded-[4rem] p-24 text-center shadow-[inset_0_20px_40px_-20px_rgba(0,0,0,0.02)]"
                    >
                        <div className="w-24 h-24 bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-transparent dark:from-zinc-800 opacity-50 group-hover:scale-150 transition-transform duration-[2s]" />
                            <Library className="w-10 h-10 text-black/10 dark:text-white/10 relative z-10" />
                        </div>
                        <h3 className="text-3xl font-light text-black/80 dark:text-white/80 tracking-tight leading-relaxed">
                            Your narrative awaits its <br /> <span className="italic font-serif">first chapter</span>
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-6 max-w-sm mx-auto leading-loose uppercase tracking-[0.25em] font-medium opacity-60">
                            Create rich, immersive pages for your collections with editorial content and high-resolution media.
                        </p>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddNew}
                            className="mt-12 inline-flex items-center gap-3 px-10 py-5 bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-bold uppercase tracking-[0.3em] rounded-full shadow-2xl transition-all"
                        >
                            <Plus className="w-4 h-4" /> Start First Collection
                        </motion.button>
                    </motion.div>
                )}
            </main>

            <CollectionModal 
                isOpen={isModalOpen} 
                onClose={handleModalClose}
                initialCollection={editingCollection}
            />
            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Archieve Perspective?"
                description={`This will permanently remove "${itemToDelete?.name}" from your digital catalog. This action cannot be undone.`}
                confirmText="Confirm Removal"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
