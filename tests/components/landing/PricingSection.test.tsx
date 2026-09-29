import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { PricingSection } from '@/components/landing/PricingSection';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

// useAuth importe le queryClient depuis main.tsx, qui monte l'application.
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
  useAuthStore: () => ({ user: null, isAuthenticated: false }),
}));

// Forme réelle de GET /api/billing/plans (catalogue à deux formules).
const plansPayload = {
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
        yearlySaving: {
          twelveMonthsAtMonthlyRate: 1428,
          yearlyPrice: 1100,
          savingAmount: 328,
          savingPercent: 23,
        },
        featureGroups: [
          { title: 'Plateforme SaaS', entitlement: 'TRADING_JOURNAL', items: ['Journal de trading complet'] },
        ],
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
        yearlySaving: {
          twelveMonthsAtMonthlyRate: 4200,
          yearlyPrice: 3500,
          savingAmount: 700,
          savingPercent: 16.7,
        },
        featureGroups: [
          { title: 'Mentorat individuel', entitlement: 'PRIVATE_MENTORSHIP', items: ['Mentorat avec Wansley Cardichon'] },
        ],
        cta: { label: 'Join VIP Incubator', action: 'subscribe', disabled: false },
      },
    ],
    viewer: null,
  },
};

const mockGet = (billingResponse: unknown | Error) => {
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.includes('/api/settings')) return { data: { success: true, data: {} } } as any;
    if (url.includes('/api/billing/plans')) {
      if (billingResponse instanceof Error) throw billingResponse;
      return { data: billingResponse } as any;
    }
    return { data: { data: [] } } as any;
  });
};

describe('PricingSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche les trois paliers, pas une seule formule', async () => {
    mockGet(plansPayload);
    render(<PricingSection />);

    await waitFor(() => expect(screen.getByText('Haitian Wall Street Pro')).toBeInTheDocument());
    expect(screen.getByText('Haitian Wall Street VIP Incubator')).toBeInTheDocument();
    // Le palier gratuit ne vient pas de l'API : il n'a ni prix ni objet Stripe.
    expect(screen.getByText('Découverte')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('/ 7 jours')).toBeInTheDocument();
    expect(screen.getByText('$119')).toBeInTheDocument();
    expect(screen.getByText('$350')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer un compte gratuit/ })).toBeEnabled();
  });

  it('garde le palier gratuit à 0 quand on bascule sur l\'annuel', async () => {
    mockGet(plansPayload);
    render(<PricingSection />);

    await waitFor(() => expect(screen.getByText('$119')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /Annuel/i }));

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('/ 7 jours')).toBeInTheDocument();
    // Aucune équivalence mensuelle ni économie annoncée sur un palier non facturé.
    expect(screen.queryByText('soit $0 par mois')).not.toBeInTheDocument();
  });

  it('bascule sur les prix annuels', async () => {
    mockGet(plansPayload);
    render(<PricingSection />);

    await waitFor(() => expect(screen.getByText('$119')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /Annuel/i }));

    expect(screen.getByText('$1 100')).toBeInTheDocument();
    expect(screen.getByText('$3 500')).toBeInTheDocument();
    expect(screen.queryByText('$119')).not.toBeInTheDocument();
  });

  it('garde les deux formules quand le backend ne répond pas', async () => {
    mockGet(new Error('network down'));
    render(<PricingSection />);

    await waitFor(() => expect(screen.getByText('Haitian Wall Street Pro')).toBeInTheDocument());
    expect(screen.getByText('Haitian Wall Street VIP Incubator')).toBeInTheDocument();
    expect(screen.getByText('Découverte')).toBeInTheDocument();
  });

  it('ignore une réponse dans un format inattendu plutôt que de vider la grille', async () => {
    mockGet({ success: true, data: [{ id: 'pro', name: 'Pro', price: 550 }] });
    render(<PricingSection />);

    await waitFor(() => expect(screen.getByText('Haitian Wall Street Pro')).toBeInTheDocument());
    expect(screen.getByText('Haitian Wall Street VIP Incubator')).toBeInTheDocument();
    expect(screen.getByText('Découverte')).toBeInTheDocument();
    expect(screen.queryByText('$550')).not.toBeInTheDocument();
  });
});
