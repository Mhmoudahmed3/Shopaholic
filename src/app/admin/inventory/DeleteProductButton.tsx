"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";
import { useState, useCallback } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function DeleteProductButton({ productId, productName }: { productId: string, productName: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await deleteProduct(productId);
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to delete product:", error);
            // Optionally we could show a different modal for errors
        } finally {
            setIsDeleting(false);
        }
    }, [productId]);

    return (
        <>
            <button 
                onClick={() => setShowConfirm(true)}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Delete Product"
            >
                <Trash2 className="w-4.5 h-4.5" />
            </button>

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Product?"
                description={`Are you sure you want to delete "${productName}"? This action is permanent and cannot be undone.`}
                confirmText="Delete Product"
                isLoading={isDeleting}
                variant="danger"
            />
        </>
    );
}
