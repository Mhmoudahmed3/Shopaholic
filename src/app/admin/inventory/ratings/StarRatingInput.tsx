"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
    name: string;
    initialRating?: number;
}

export function StarRatingInput({ name, initialRating = 5 }: StarRatingInputProps) {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col gap-2">
            <input type="hidden" name={name} value={rating} />
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 h-[50px]">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform active:scale-90"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <Star 
                                className={`w-6 h-6 transition-colors ${
                                    star <= (hover || rating) 
                                        ? "text-amber-400 fill-amber-400" 
                                        : "text-gray-300 dark:text-gray-700"
                                }`} 
                            />
                        </button>
                    ))}
                </div>
                <span className="ml-2 text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[80px]">
                    {rating === 5 ? "5 - Excellent" : 
                     rating === 4 ? "4 - Very Good" : 
                     rating === 3 ? "3 - Good" : 
                     rating === 2 ? "2 - Fair" : "1 - Poor"}
                </span>
            </div>
        </div>
    );
}
