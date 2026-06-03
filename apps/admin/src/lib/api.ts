import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const api = axios.create({ baseURL });

const TOKEN_KEY = 'gosth_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const formatCRC = (cents: number) => `₡${(cents / 100).toLocaleString('es-CR')}`;
export const fromCRC = (value: number) => Math.round(value * 100);
