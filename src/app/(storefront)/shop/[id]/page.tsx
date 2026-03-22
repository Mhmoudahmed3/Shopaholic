import { getProduct, getRelatedProducts } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import ProductReviews from "@/components/product/ProductReviews";
import { ProductGrid } from "@/components/shop/ProductGrid";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.id);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.id, product.category);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

            {/* Back Button */}
            <div className="mb-8">
                <Link href="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
                </Link>
            </div>

            {/* Main Product — Gallery + Info synchronized via ProductPageClient */}
            <div className="mb-32">
                <ProductPageClient product={product} />
            </div>

            {/* Product Description details */}
            <div className="border-t border-gray-200 dark:border-gray-800 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-8 text-neutral-400">Details</h2>
                    <p className="text-xl font-serif leading-relaxed italic">
                        &quot;{product.description}&quot;
                    </p>
                </div>
            </div>

            {/* Reviews Section */}
            <ProductReviews 
                averageRating={product.rating} 
                totalReviews={product.reviewsCount} 
            />

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="border-t border-neutral-100 dark:border-neutral-800 pt-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-4">Complete your look</h2>
                            <h3 className="text-4xl font-serif">You May Also Like</h3>
                        </div>
                        <Link href="/shop" className="text-[10px] font-bold uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:opacity-60 transition-opacity">
                            View All Collection
                        </Link>
                    </div>
                    <ProductGrid products={relatedProducts} />
                </section>
            )}

        </div>
    );
}
