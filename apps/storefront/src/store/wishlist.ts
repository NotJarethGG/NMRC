import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
  count: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((s) => ({
          ids: s.ids.includes(productId)
            ? s.ids.filter((id) => id !== productId)
            : [productId, ...s.ids],
        })),
      has: (productId) => get().ids.includes(productId),
      remove: (productId) => set((s) => ({ ids: s.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
      count: () => get().ids.length,
    }),
    { name: 'nmrc_wishlist' },
  ),
);
