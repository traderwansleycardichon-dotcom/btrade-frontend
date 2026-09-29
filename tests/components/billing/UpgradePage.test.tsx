import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import UpgradePage from '@/pages/app/upgrade/page';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const refreshUser = vi.fn();
let mockUser: any = { id: 'u1', email: 'trader@example.com', plan: 'free' };

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: true, refreshUser }),
  useAuthStore: () => ({ user: mockUser, isAuthenticated: true, refreshUser }),
}));

const buildPlans = (viewer: any = null) => ({
  success: true,
  data: {
    platform: 'HAITIAN WALL STREET',
    currency: 'usd',
    intervals: ['MONTHLY', 'YEARLY'],
    defaultInterval: 'MONTHLY',
    plans: [
      {
        plan: 'pro',
        name: 'Haitian Wall Street Pro',
        tagline: 'Pour les traders autonomes.',
        recommended: true,
        inherits: null,
        prices: {
          MONTHLY: { amount: 119, currency: 'usd', available: true },
          YEARLY: { amount: 1100, currency: 'usd', available: true },
        },
        yearlySaving: { twelveMonthsAtMonthlyRate: 1428, yearlyPrice: 1100, savingAmount: 328, savingPercent: 23 },
        featureGroups: [{ title: 'Plateforme SaaS', items: ['Journal de trading complet'] }],
        cta: { label: 'Join Pro', action: 'subscribe', disabled: false },
      },
      {
        plan: 'vip_incubator',
        name: 'Haitian Wall Street VIP Incubator',
        tagline: 'Accompagnement individuel.',
        recommended: false,
        inherits: 'pro',
        prices: {
          MONTHLY: { amount: 350, currency: 'usd', available: true },
          YEARLY: { amount: 3500, currency: 'usd', available: true },
        },
        yearlySaving: { twelveMonthsAtMonthlyRate: 4200, yearlyPrice: 3500, savingAmount: 700, savingPercent: 16.7 },
        featureGroups: [{ title: 'Mentorat individuel', items: ['Mentorat avec Wansley Cardichon'] }],
        cta: { label: 'Join VIP Incubator', action: 'subscribe', disabled: false },
      },
    ],
    viewer,
  },
});

const proViewer = {
  plan: 'pro',
  isStaffOverride: false,
  status: 'active',
  billingInterval: 'MONTHLY',
  paymentProvider: 'STRIPE',
  currentPeriodStart: '2026-09-01T00:00:00.000Z',
  currentPeriodEnd: '2026-10-01T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  hasStripeCustomer: true,
  isManageableInStripe: true,
  canAccessPro: true,
  canAccessVip: false,
};

const mockGet = (body: unknown | Error) => {
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.includes('/api/settings')) return { data: { success: true, data: {} } } as any;
    if (url.includes('/api/billing/plans')) {
      if (body instanceof Error) throw body;
      return { data: body } as any;
    }
    return { data: { data: [] } } as any;
  });
};

describe('UpgradePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'u1', email: 'trader@example.com', plan: 'free' };
  });

  it('affiche les deux formules au lieu de planter sur la réponse du serveur', async () => {
    mockGet(buildPlans());
    render(<UpgradePage />);

    await waitFor(() => expect(screen.getByText('Haitian Wall Street Pro')).toBeInTheDocument());
    expect(screen.getByText('Haitian Wall Street VIP Incubator')).toBeInTheDocument();
    expect(screen.getByText('$119')).toBeInTheDocument();
    expect(screen.getByText('$350')).toBeInTheDocument();
  });

  it('lance un checkout Stripe avec le plan et l\'intervalle choisis', async () => {
    mockGet(buildPlans());
    vi.mocked(api.post).mockResolvedValue({ data: { url: 'https://checkout.stripe.test/session' } } as any);
    render(<UpgradePage />);

    await waitFor(() => expect(screen.getByText('$119')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Annuel' }));
    await userEvent.click(screen.getByRole('button', { name: /S'abonner à VIP Incubator/ }));

    expect(api.post).toHaveBeenCalledWith('/api/billing/create-checkout-session', {
      plan: 'vip_incubator',
      planId: 'vip_incubator',
      billingInterval: 'YEARLY',
    });
  });

  it('propose le changement de formule à un abonné Stripe existant', async () => {
    mockUser = { id: 'u1', email: 'trader@example.com', plan: 'pro' };
    mockGet(buildPlans(proViewer));
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: { message: 'Votre passage au VIP Incubator est effectif immédiatement.' } },
    } as any);
    render(<UpgradePage />);

    await waitFor(() => expect(screen.getByText('Formule actuelle')).toBeInTheDocument());
    expect(screen.getByText('Votre plan actuel')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Passer à VIP Incubator/ }));

    expect(api.post).toHaveBeenCalledWith('/api/billing/change-plan', {
      plan: 'vip_incubator',
      billingInterval: 'MONTHLY',
    });
    await waitFor(() =>
      expect(screen.getByText('Votre passage au VIP Incubator est effectif immédiatement.')).toBeInTheDocument()
    );
  });

  it('signale une panne du catalogue au lieu d\'afficher une page vide', async () => {
    mockGet(new Error('boom'));
    render(<UpgradePage />);

    await waitFor(() =>
      expect(screen.getByText('Impossible de charger les formules')).toBeInTheDocument()
    );
  });
});
