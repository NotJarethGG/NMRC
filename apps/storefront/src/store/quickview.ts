import { create } from 'zustand';
import type { Product } from '../lib/types';

interface QuickViewState {
  product: Product | null;
  open: (p: Product) => void;
  close: () => void;
}

// Vista rápida de producto (modal) — abrir desde cualquier card
export const useQuickView = create<QuickViewState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
