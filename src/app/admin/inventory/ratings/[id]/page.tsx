import { getProduct } from "@/lib/db";
import { notFound } from "next/navigation";
import { AdminHeader } from "../../../components/AdminLayout";
import { Star, ArrowLeft, Calendar, User, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { addProductReview, deleteProductReview } from "../../../actions";
import { StarRatingInput } from "../StarRatingInput";

export default async function ProductRatingsPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) notFound();

    const handleAddReview = async (formData: FormData) => {
        "use server";
        await addProductReview(id, formData);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-zinc-950/50 pb-20">
            <AdminHeader title={`Manage Ratings: ${product.name}`} />

            <main className="max-w-5xl mx-auto w-full p-8 space-y-10">
                <div className="flex items-center justify-between">
                    <Link 
                        href="/admin/inventory"
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Inventory
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Product Summary */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm p-6">
                            <div className="aspect-[3/4] relative rounded-xl overflow-hidden mb-6 border border-gray-100 dark:border-gray-800">
                                <Image 
                                    src={product.images[0]} 
                                    alt={product.name} 
                                    fill 
                                    className="object-cover"
                                />
                            </div>
                            <h2 className="text-xl font-serif mb-2">{product.name}</h2>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-800"}`} 
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-bold">{product.rating || "N/A"}</span>
                                <span className="text-xs text-gray-400">({product.reviewsCount || 0} reviews)</span>
                            </div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest leading-loose">{product.description.slice(0, 100)}...</p>
                        </div>
                    </div>

                    {/* Add Review Form */}
                    <div className="col-span-1 md:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8">Add Manual Review</h3>
                            <form action={handleAddReview} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                name="userName"
                                                type="text" 
                                                required
                                                placeholder="e.g. Sarah J."
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rating (1-5)</label>
                                        <StarRatingInput name="rating" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Review Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            name="date"
                                            type="date" 
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Comment</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                        <textarea 
                                            name="comment"
                                            required
                                            rows={4}
                                            placeholder="Write the customer's feedback here..."
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none resize-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all shadow-xl active:scale-[0.98]"
                                >
                                    Submit Review
                                </button>
                            </form>
                        </div>

                        {/* Existing Reviews List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Latest Reviews</h3>
                            {product.reviews && product.reviews.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {product.reviews.map((review) => (
                                        <div key={review.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex justify-between items-start gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold">{review.userName}</span>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={`w-3 h-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-800"}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 italic">&quot;{review.comment}&quot;</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                            <form action={async () => {
                                                "use server";
                                                await deleteProductReview(id, review.id);
                                            }}>
                                                <button 
                                                    type="submit"
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">No reviews found for this product</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
