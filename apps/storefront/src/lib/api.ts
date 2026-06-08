import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://nmrc-api.onrender.com/api' : 'http://localhost:3000/api');

export const api = axios.create({ baseURL });

const TOKEN_KEY = 'gosth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatCRC(cents: number) {
  return `₡${(cents / 100).toLocaleString('es-CR')}`;
}
