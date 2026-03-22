import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
    items: string[]; // Array of product IDs
    addItem: (productId: string) => void;
    removeItem: (productId: string) => void;
    toggleItem: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    getWishlistCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (productId) => set((state) => ({ 
                items: state.items.includes(productId) ? state.items : [...state.items, productId] 
            })),
            removeItem: (productId) => set((state) => ({ 
                items: state.items.filter((id) => id !== productId) 
            })),
            toggleItem: (productId) => set((state) => {
                const exists = state.items.includes(productId);
                if (exists) {
                    return { items: state.items.filter((id) => id !== productId) };
                }
                return { items: [...state.items, productId] };
            }),
            isInWishlist: (productId) => get().items.includes(productId),
            getWishlistCount: () => get().items.length,
        }),
        {
            name: "wishlist-storage",
        }
    )
);
