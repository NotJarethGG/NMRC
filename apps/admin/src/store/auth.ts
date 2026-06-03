import { create } from 'zustand';
import { api, getToken, setToken } from '../lib/api';
import type { User } from '../lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const isStaff = (role?: string) => role === 'ADMIN' || role === 'STAFF';

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    if (!getToken()) return set({ loading: false });
    try {
      const { data } = await api.get<User>('/auth/me');
      if (!isStaff(data.role)) {
        setToken(null);
        return set({ user: null, loading: false });
      }
      set({ user: data, loading: false });
    } catch {
      setToken(null);
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    if (!isStaff(data.user.role)) {
      throw new Error('Esta cuenta no tiene acceso al panel administrativo.');
    }
    setToken(data.token);
    set({ user: data.user });
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },
}));
