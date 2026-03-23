import { getCategoriesDB, getProduct } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductForm from "./ProductForm";

export const dynamic = 'force-dynamic';

export default async function AddItemPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
    const categories = await getCategoriesDB();
    const resolvedParams = await searchParams;
    const productId = resolvedParams.productId;
    
    let initialProduct = undefined;
    if (productId) {
        initialProduct = await getProduct(productId);
    }

    const isEditing = !!initialProduct;

    return (
        <div className="w-full pt-20 pb-12 px-4 sm:px-6 lg:px-12 md:py-16">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <Link href="/admin" className="p-2 -ml-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-light tracking-tight">
                            {isEditing ? "Edit Product" : "Add New Item"}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {isEditing 
                                ? `Updating information for ${initialProduct?.name}` 
                                : "Create a detailed product listing for your store."}
                        </p>
                    </div>
                </div>
            </div>

            <ProductForm categories={categories} initialProduct={initialProduct} />
        </div>
    );
}
