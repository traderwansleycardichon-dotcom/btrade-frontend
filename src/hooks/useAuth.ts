import { create } from 'zustand';
import api from '../lib/api';
import { queryClient } from '../main';

export type Tier = 'PRO' | 'VIP';
export type BillingInterval = 'MONTHLY' | 'ANNUAL';
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
export type PaymentProvider = 'STRIPE' | 'BAZIK' | 'MANUAL';

/**
 * Adhésion résolue par le backend. C'est la seule source d'affichage :
 * le frontend ne redérive jamais un droit depuis un nom de plan.
 */
export interface Membership {
  active: boolean;
  tier: Tier | null;
  status: MembershipStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingInterval: BillingInterval | null;
  provider: PaymentProvider | null;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  plan: 'free' | 'pro' | 'vip' | 'locked';
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
  membership: Membership | null;
  /** Droits calculés côté serveur. Masquer un écran reste du confort :
   *  chaque endpoint payant revérifie de son côté. */
  entitlements: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User, subscription?: Subscription | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscription: null,
  membership: null,
  entitlements: [],
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
    set({
      user: null,
      subscription: null,
      membership: null,
      entitlements: [],
      isAuthenticated: false,
      isLoading: false,
    });
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
        membership: data.data.membership || null,
        entitlements: data.data.entitlements || [],
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      localStorage.clear();
      set({
        user: null,
        subscription: null,
        membership: null,
        entitlements: [],
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export const useAuth = () => {
  const store = useAuthStore();
  return store;
};
