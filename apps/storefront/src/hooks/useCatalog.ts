import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Collection, Product } from '../lib/types';

export function useProducts(params?: {
  category?: string;
  collection?: string;
  search?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', {
        params: {
          category: params?.category,
          collection: params?.collection,
          search: params?.search || undefined,
          featured: params?.featured ? 'true' : undefined,
        },
      });
      return data;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await api.get<Collection[]>('/collections');
      return data;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data as { id: string; name: string; slug: string }[];
    },
  });
}
