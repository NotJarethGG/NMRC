import { create } from 'zustand';
import { api, getToken, setToken } from '../lib/api';
import type { AuthResponse, User } from '../lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    if (!getToken()) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get<User>('/auth/me');
      set({ user: data, loading: false });
    } catch {
      setToken(null);
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setToken(data.token);
    set({ user: data.user });
  },

  register: async (payload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    setToken(data.token);
    set({ user: data.user });
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },
}));
