import Image from "next/image";
import { notFound } from "next/navigation";
import { getCollection, getCollectionProducts } from "@/lib/db";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClientMotionDiv } from "@/components/ClientMotionDiv";

interface CollectionPageProps {
    params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { id } = await params;
    const collection = await getCollection(id);

    if (!collection) {
        notFound();
    }

    const products = await getCollectionProducts(collection.productIds || []);

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950">
            {/* Minimalist Hero Header */}
            <div className="relative h-[60vh] w-full overflow-hidden bg-neutral-900">
                {collection.image ? (
                    <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        priority
                        className="object-cover opacity-60 scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-800" />
                )}
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <ClientMotionDiv 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/60 mb-6 block">
                            Curated Series. 0{collection.itemsCount > 0 ? "1" : "0"}
                        </span>
                        <h1 className="text-5xl md:text-8xl font-serif italic text-white mb-8 leading-tight">
                            {collection.name}
                        </h1>
                        <p className="text-white/80 text-sm uppercase tracking-[0.3em] font-light max-w-lg mx-auto leading-relaxed">
                            {collection.subtitle}
                        </p>
                    </ClientMotionDiv>
                </div>

                {/* Back Link */}
                <Link 
                    href="/" 
                    className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-50 transition-all z-20"
                >
                    <ArrowLeft className="w-3 h-3" /> Back
                </Link>
            </div>

            {/* Products Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 pb-8 border-b border-neutral-100 dark:border-neutral-900 gap-6">
                    <div>
                        <h2 className="text-3xl font-serif mb-2">The Collection</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-[1px] bg-neutral-300 dark:bg-neutral-700"></span>
                            <p className="text-neutral-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                                {products.length} {products.length === 1 ? 'Archetype' : 'Archetypes'}
                            </p>
                        </div>
                    </div>
                </div>

                <ProductGrid products={products} />

                {products.length === 0 && (
                    <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                        <p className="text-neutral-400 font-serif italic">This series is currently being curated.</p>
                        <Link href="/shop" className="text-[10px] font-bold uppercase tracking-widest mt-6 inline-block border-b border-black dark:border-white pb-1">
                            Explore All Inventory
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
