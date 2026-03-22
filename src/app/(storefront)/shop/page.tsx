import { getProducts } from "@/lib/db";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopSortSelect } from "@/components/shop/ShopSortSelect";
import { getCategoriesDB } from "@/lib/db";

interface ShopPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const resolvedParams = await searchParams;
    const category = resolvedParams.category || "all";
    const sort = resolvedParams.sort || "newest";
    const type = resolvedParams.type;
    const size = resolvedParams.size;
    const color = resolvedParams.color;
    const minPrice = resolvedParams.minPrice ? parseInt(resolvedParams.minPrice) : undefined;
    const maxPrice = resolvedParams.maxPrice ? parseInt(resolvedParams.maxPrice) : undefined;
    const minRating = resolvedParams.rating ? parseInt(resolvedParams.rating) : undefined;
    const isPopular = resolvedParams.popular === "true";

    const categories = await getCategoriesDB();
    const products = await getProducts({ 
        category, 
        sort, 
        type, 
        size, 
        color, 
        minPrice, 
        maxPrice,
        minRating,
        isPopular
    });

    const currentCategoryLabel = category === "all" ? "All Products" : (categories.find(c => c.id === category)?.label || category);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-8 border-b border-neutral-100 dark:border-neutral-900 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif capitalize mb-3 tracking-tight">
                        {currentCategoryLabel}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-neutral-300 dark:bg-neutral-700"></span>
                        <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em]">Showing {products.length} products</p>
                    </div>
                </div>

                <div className="hidden md:block w-56">
                    <ShopSortSelect initialSort={sort} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <FilterSidebar />
                <div className="flex-1">
                    <ProductGrid products={products} />
                </div>
            </div>
        </div>
    );
}
