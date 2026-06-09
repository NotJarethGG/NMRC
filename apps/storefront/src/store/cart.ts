import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLine {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  size: string;
  priceCents: number;
  image?: string;
  quantity: number;
  maxStock: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: CartLine) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
  totalCents: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, quantity: Math.min(l.maxStock, l.quantity + line.quantity) }
                  : l,
              ),
            };
          }
          return { isOpen: true, lines: [...state.lines, line] };
        }),

      remove: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),

      setQuantity: (variantId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.variantId === variantId
              ? { ...l, quantity: Math.max(1, Math.min(l.maxStock, quantity)) }
              : l,
          ),
        })),

      clear: () => set({ lines: [] }),

      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      totalCents: () => get().lines.reduce((n, l) => n + l.priceCents * l.quantity, 0),
    }),
    {
      name: 'nmrc_cart',
      // Solo persistimos las líneas (no el estado abierto/cerrado del drawer)
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);
