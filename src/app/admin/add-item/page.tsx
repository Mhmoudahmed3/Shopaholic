import { getCategoriesDB, getProduct } from "@/lib/db";
import { getSiteSettings } from "../actions";
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

    const settings = await getSiteSettings();
    const isEditing = !!initialProduct;

    return (
        <div className="w-full pt-20 pb-12 px-4 sm:px-6 lg:px-20 min-h-screen bg-gray-50/20 dark:bg-[#050505]/40 backdrop-blur-[200px] md:py-16">

            {/* Header Section with Refined Typography */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-black/5 dark:border-white/5 pb-10 gap-6">
                <div className="flex items-start gap-4">
                    <Link 
                        href="/admin/inventory" 
                        className="group p-3 border border-black/5 dark:border-white/10 rounded-2xl hover:bg-black dark:hover:bg-white transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-white dark:group-hover:text-black" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Studio</span>
                            <div className="w-4 h-px bg-black/10 dark:bg-white/10" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Product Forge</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-black dark:text-white">
                            {isEditing ? "Curate Selection" : "Define New Piece"}
                        </h1>
                        <p className="text-sm text-gray-400 mt-2 font-medium">
                            {isEditing 
                                ? `Refining ${initialProduct?.name} for the boutique experience.` 
                                : "Add a new masterpiece to your luxury collection."}
                        </p>
                    </div>
                </div>
                
                <div className="hidden lg:flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Inventory Sync</p>
                        <p className="text-sm font-semibold text-green-500">Active & Live</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center bg-green-500/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </div>

            <ProductForm 
                categories={categories} 
                initialProduct={initialProduct} 
                sizeScales={settings.sizeScales}
            />
        </div>
    );
}
