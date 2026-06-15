import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  image?: string;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, image?: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (message, image) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, image }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
