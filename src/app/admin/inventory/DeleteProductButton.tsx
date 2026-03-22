"use client";

import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteProduct } from "../actions";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DeleteProductButton({ productId, productName }: { productId: string, productName: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProduct(productId);
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Failed to delete product. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setShowConfirm(true)}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Delete Product"
            >
                <Trash2 className="w-4.5 h-4.5" />
            </button>

            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setShowConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Product?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-[280px]">
                                        Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-gray-100">&quot;{productName}&quot;</span>? 
                                        This action is permanent and cannot be undone.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full py-3.5 px-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Confirm Deletion"
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => setShowConfirm(false)}
                                        disabled={isDeleting}
                                        className="w-full py-3.5 px-4 bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
