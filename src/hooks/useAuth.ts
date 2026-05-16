import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  plan: 'free' | 'pro';
  role?: string;
  onboarded: boolean;
  avatarUrl?: string;
  timezone?: string;
  currency?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('btt_access_token'),
  isLoading: !!localStorage.getItem('btt_access_token'),
  login: (accessToken, refreshToken, user) => {
    localStorage.setItem('btt_access_token', accessToken);
    localStorage.setItem('btt_refresh_token', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('btt_access_token');
    localStorage.removeItem('btt_refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  refreshUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/api/me');
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.clear();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export const useAuth = () => {
  const store = useAuthStore();
  return store;
};
