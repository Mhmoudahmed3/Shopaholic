import { getCollectionsDB, getProducts } from "@/lib/db";
import { BestSellersSection } from "@/app/(storefront)/HomePageClient";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DragScrollContainer } from "@/app/(storefront)/HomePageClient";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
    const collections = await getCollectionsDB();

    return (
        <main className="min-h-screen pt-24 pb-32 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif italic mb-6">Our Collections</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-12">
                        Explore Our Curated Series
                    </p>


                </div>

                {/* Collections List in a full-screen scrollable layout */}
                <div className="space-y-32">
                    {collections.map((col, index) => (
                        <div key={col.id} className="group relative">
                            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                                {/* Image Showcase */}
                                <div className="w-full lg:w-3/5 aspect-video relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                                    {col.image && (
                                        <Image 
                                            src={col.image}
                                            alt={col.name}
                                            fill
                                            className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                                        />
                                    )}
                                    <div className="absolute top-6 left-6 mix-blend-difference">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.5em] opacity-40">
                                            Series. 0{index + 1}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="w-full lg:w-2/5 space-y-8">
                                    <div>
                                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-neutral-400 mb-4 block">
                                            {col.subtitle || "The Core Series"}
                                        </span>
                                        <h2 className="text-4xl md:text-5xl font-serif mb-6">{col.name}</h2>
                                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm">
                                            {col.itemsCount > 0 
                                                ? `A meticulously crafted collection featuring ${col.itemsCount} handpicked ${col.itemsCount === 1 ? 'essential' : 'essentials'}.`
                                                : "This series is currently being curated for the upcoming season."
                                            }
                                        </p>
                                    </div>

                                    <Link 
                                        href={`/collections/${col.id}`}
                                        className="group inline-flex items-center gap-4 text-xs font-bold tracking-[0.3em] uppercase bg-black dark:bg-white text-white dark:text-black px-10 py-5 transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                    >
                                        Browse the Collection <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Best Sellers reference scroll bar (for context) */}
                <div className="mt-40 pt-20 border-t border-neutral-100 dark:border-neutral-900">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-400 mb-12">Related Best Sellers</h3>
                    {/* Placeholder or actual Best Sellers functionality? The user just mentioned it as reference. */}
                </div>
            </div>
        </main>
    );
}
