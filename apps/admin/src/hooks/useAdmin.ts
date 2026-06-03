import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Category, Collection, Order, Product, User } from '../lib/types';

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () =>
      (await api.get<Product[]>('/products', { params: { includeAll: 'true' } })).data,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => (await api.get<Collection[]>('/collections')).data,
  });
}

export function useOrders(status?: string) {
  return useQuery({
    queryKey: ['admin-orders', status],
    queryFn: async () =>
      (await api.get<Order[]>('/orders', { params: { status: status || undefined } })).data,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<User[]>('/users')).data,
  });
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post<{ url: string }>('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
