"use client";

import { useState } from "react";
import { Star, CheckCircle2, ThumbsUp, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Review } from "@/lib/types";

interface ProductReviewsProps {
    reviews?: Review[];
    averageRating?: number;
    totalReviews?: number;
}

const MOCK_REVIEWS: Review[] = [
    {
        id: "r1",
        userName: "Alexandra M.",
        rating: 5,
        comment: "Absolutely stunning quality. The material is much better than I expected, and the fit is perfect. It's definitely worth every piastre. I'll be ordering in other colors too!",
        date: "2024-02-15",
        verified: true
    },
    {
        id: "r2",
        userName: "Karim H.",
        rating: 4,
        comment: "Great experience shopping here. Fast delivery and the packaging was very luxurious. The product itself is high-end, though I wish it was a bit more oversized as per the description.",
        date: "2024-02-10",
        verified: true
    },
    {
        id: "r3",
        userName: "Laila S.",
        rating: 5,
        comment: "Shopaholic never disappoints. This is my third purchase and the craftsmanship is consistently top-tier. Elegant, minimalist, and exactly what I was looking for.",
        date: "2024-01-28",
        verified: true
    }
];

export default function ProductReviews({ 
    reviews = MOCK_REVIEWS, 
    averageRating = 4.8, 
    totalReviews = 124 
}: ProductReviewsProps) {
    const [filter, setFilter] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState("recent");

    const filteredReviews = filter 
        ? reviews.filter(r => r.rating === filter)
        : reviews;

    return (
        <section id="reviews" className="py-24 border-t border-neutral-100 dark:border-neutral-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* Summary Sidebar */}
                <div className="lg:col-span-4 bg-neutral-50 dark:bg-neutral-900/50 p-8 md:p-12 rounded-sm h-fit">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-8">Customer Reviews</h2>
                    
                    <div className="flex items-end gap-4 mb-8">
                        <span className="text-6xl font-serif leading-none">{averageRating.toFixed(1)}</span>
                        <div className="pb-1">
                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={clsx(
                                            "w-4 h-4",
                                            i < Math.floor(averageRating) ? "text-amber-400 fill-amber-400" : "text-neutral-200 dark:text-neutral-800"
                                        )} 
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Based on {totalReviews} reviews</p>
                        </div>
                    </div>

                    {/* Bars */}
                    <div className="space-y-4 mb-10">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = star === 5 ? 85 : star === 4 ? 20 : star === 3 ? 10 : star === 2 ? 5 : 4;
                            const percentage = (count / totalReviews) * 100;
                            return (
                                <button 
                                    key={star} 
                                    onClick={() => setFilter(filter === star ? null : star)}
                                    className={clsx(
                                        "w-full flex items-center gap-4 group transition-opacity",
                                        filter && filter !== star ? "opacity-40" : "opacity-100"
                                    )}
                                >
                                    <span className="text-[10px] font-bold w-3">{star}</span>
                                    <div className="flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute inset-0 bg-black dark:bg-white"
                                        />
                                    </div>
                                    <span className="text-[10px] font-medium text-neutral-400 w-8 text-right">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button className="w-full py-4 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors">
                        Write a Review
                    </button>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Showing {filteredReviews.length} Reviews</h3>
                            {filter && (
                                <button 
                                    onClick={() => setFilter(null)}
                                    className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sort by</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-16">
                        <AnimatePresence mode="popLayout">
                            {filteredReviews.map((review, idx) => (
                                <motion.div 
                                    key={review.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="relative"
                                >
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="md:w-48 flex-shrink-0">
                                            <p className="text-xs font-bold uppercase tracking-widest mb-1">{review.userName}</p>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                {review.verified && (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Verified</span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-medium text-neutral-400">{new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={clsx(
                                                            "w-3 h-3",
                                                            i < review.rating ? "text-amber-400 fill-amber-400" : "text-neutral-200 dark:text-neutral-800"
                                                        )} 
                                                    />
                                                ))}
                                            </div>
                                            <h4 className="text-base font-serif italic mb-4 leading-relaxed">
                                                &quot;{review.comment}&quot;
                                            </h4>
                                            <div className="flex items-center gap-6">
                                                <button className="flex items-center gap-2 group">
                                                    <ThumbsUp className="w-3.5 h-3.5 text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Helpful</span>
                                                </button>
                                                <button className="flex items-center gap-2 group">
                                                    <MessageSquare className="w-3.5 h-3.5 text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Reply</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <button className="mt-16 text-[10px] font-bold uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:opacity-60 transition-opacity">
                        Load More Reviews
                    </button>
                </div>
            </div>
        </section>
    );
}
