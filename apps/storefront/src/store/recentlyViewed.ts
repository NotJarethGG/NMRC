import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX = 8;

interface RecentState {
  ids: string[];
  track: (productId: string) => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      track: (productId) =>
        set((s) => ({
          ids: [productId, ...s.ids.filter((id) => id !== productId)].slice(0, MAX),
        })),
    }),
    { name: 'nmrc_recent' },
  ),
);
