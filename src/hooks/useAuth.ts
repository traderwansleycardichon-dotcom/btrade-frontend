import { create } from 'zustand';
import api from '../lib/api';
import { queryClient } from '../main';

interface User {
  id: string;
  email: string;
  fullName: string;
  plan: 'free' | 'pro' | 'vip_incubator' | 'locked';
  role?: string;
  onboarded: boolean;
  avatarUrl?: string;
  timezone?: string;
  currency?: string;
  phone?: string;
  createdAt?: string;
  trialEnd?: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  stripeSubId?: string;
  stripeCustomerId?: string;
  paymentMethod?: string;
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User, subscription?: Subscription | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscription: null,
  isAuthenticated: !!localStorage.getItem('btt_access_token'),
  isLoading: !!localStorage.getItem('btt_access_token'),
  login: (accessToken, refreshToken, user, subscription = null) => {
    localStorage.setItem('btt_access_token', accessToken);
    localStorage.setItem('btt_refresh_token', refreshToken);
    set({ user, subscription, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('btt_access_token');
    localStorage.removeItem('btt_refresh_token');
    if (queryClient) {
      queryClient.clear();
    }
    set({ user: null, subscription: null, isAuthenticated: false, isLoading: false });
  },
  refreshUser: async () => {
    try {
      // S'il y a déjà un utilisateur chargé, on rafraîchit en tâche de fond pour une UX fluide
      const hasUser = !!useAuthStore.getState().user;
      if (!hasUser) {
        set({ isLoading: true });
      }
      const { data } = await api.get('/api/me');
      set({ 
        user: data.data.user, 
        subscription: data.data.subscription || null, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (err) {
      localStorage.clear();
      set({ user: null, subscription: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export const useAuth = () => {
  const store = useAuthStore();
  return store;
};
