import axios from 'axios';
import { useToast } from '../store/toast';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://nmrc-api.onrender.com/api' : 'http://localhost:3000/api');

// Timeout amplio: el free tier de Render "duerme" y tarda ~50s en despertar
export const api = axios.create({ baseURL, timeout: 60000 });
export const apiBaseURL = baseURL;

// Aviso único cuando la API no responde (cold start de Render)
let coldNotified = false;
api.interceptors.response.use(undefined, (error) => {
  if (!error.response && !coldNotified) {
    coldNotified = true;
    useToast.getState().show('Despertando el servidor… dale unos segundos');
    setTimeout(() => {
      coldNotified = false;
    }, 20000);
  }
  return Promise.reject(error);
});

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
