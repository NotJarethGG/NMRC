import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface StoreConfig {
  shippingFlatCents: number;
  freeShippingMinCents: number;
  sinpeNumber: string;
  whatsappNumber: string;
}

const FALLBACK: StoreConfig = {
  shippingFlatCents: 300000, // ₡3.000
  freeShippingMinCents: 6000000, // ₡60.000
  sinpeNumber: '',
  whatsappNumber: '',
};

export function useConfig() {
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: async () => (await api.get<StoreConfig>('/config')).data,
    staleTime: 1000 * 60 * 30,
  });
  return data ?? FALLBACK;
}

/** Calcula el envío para un subtotal dado (mismo criterio que el backend). */
export function shippingFor(subtotalCents: number, cfg: StoreConfig): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= cfg.freeShippingMinCents ? 0 : cfg.shippingFlatCents;
}
