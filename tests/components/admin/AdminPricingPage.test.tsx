import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import AdminPricingPage from '@/pages/admin/pricing/AdminPricingPage';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

// Forme réelle de GET /api/admin/pricing.
const pricingPayload = {
  success: true,
  data: {
    memberships: [
      {
        plan: 'pro',
        name: 'Haitian Wall Street Pro',
        listPrices: {
          MONTHLY: { amount: 119, currency: 'usd' },
          YEARLY: { amount: 1100, currency: 'usd' },
        },
        yearlySaving: { savingAmount: 328, savingPercent: 23 },
        stripe: {
          MONTHLY: { priceId: 'price_pro_m', source: 'env', available: true, amount: 129, currency: 'usd' },
          YEARLY: { priceId: null, source: null, available: false, amount: null, currency: null },
        },
      },
      {
        plan: 'vip_incubator',
        name: 'Haitian Wall Street VIP Incubator',
        listPrices: {
          MONTHLY: { amount: 350, currency: 'usd' },
          YEARLY: { amount: 3500, currency: 'usd' },
        },
        yearlySaving: { savingAmount: 700, savingPercent: 16.7 },
        stripe: {
          MONTHLY: { priceId: 'price_vip_m', source: 'database', available: true, amount: 350, currency: 'usd' },
          YEARLY: { priceId: 'price_vip_y', source: 'database', available: true, amount: 3500, currency: 'usd' },
        },
      },
    ],
  },
  plans: [],
};

const mockGet = (body: unknown | Error) => {
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.includes('/api/settings')) return { data: { success: true, data: {} } } as any;
    if (url.includes('/api/admin/pricing/stripe-prices')) return { data: { success: true, data: [] } } as any;
    if (url.includes('/api/admin/pricing')) {
      if (body instanceof Error) throw body;
      return { data: body } as any;
    }
    return { data: { data: [] } } as any;
  });
};

describe('AdminPricingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche les deux formules et leurs deux intervalles', async () => {
    mockGet(pricingPayload);
    render(<AdminPricingPage />);

    await waitFor(() => expect(screen.getByText('Haitian Wall Street Pro')).toBeInTheDocument());
    expect(screen.getByText('Haitian Wall Street VIP Incubator')).toBeInTheDocument();
    expect(screen.getAllByText('Mensuel')).toHaveLength(2);
    expect(screen.getAllByText('Annuel')).toHaveLength(2);
    expect(screen.getByText('$1 100')).toBeInTheDocument();
    expect(screen.getByText('$3 500')).toBeInTheDocument();
  });

  it('signale un prix Stripe qui ne correspond pas au prix catalogue', async () => {
    mockGet(pricingPayload);
    render(<AdminPricingPage />);

    await waitFor(() => expect(screen.getByText(/Le prix Stripe diffère du prix catalogue/)).toBeInTheDocument());
    expect(screen.getByText('STRIPE_PRO_YEARLY_PRICE_ID')).toBeInTheDocument();
  });

  it('envoie le nouveau prix avec son intervalle de facturation', async () => {
    mockGet(pricingPayload);
    vi.mocked(api.put).mockResolvedValue({
      data: { success: true, data: { stripePriceId: 'price_new', note: 'Nouveau prix enregistré.' } },
    } as any);
    render(<AdminPricingPage />);

    await waitFor(() => expect(screen.getByText('Haitian Wall Street Pro')).toBeInTheDocument());
    // Premier bouton : Pro / mensuel.
    await userEvent.click(screen.getAllByRole('button', { name: /Prix Stripe/ })[0]);
    const input = await screen.findByPlaceholderText('119');
    await userEvent.clear(input);
    await userEvent.type(input, '149');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le nouveau prix' }));

    expect(api.put).toHaveBeenCalledWith('/api/admin/pricing/pro/price', {
      newPrice: 149,
      billingInterval: 'MONTHLY',
      currency: 'usd',
    });
    // La variable d'environnement a priorité : l'admin doit être averti.
    await waitFor(() => expect(screen.getByText('price_new')).toBeInTheDocument());
    expect(screen.getByText('STRIPE_PRO_MONTHLY_PRICE_ID')).toBeInTheDocument();
  });

  it('signale une réponse inattendue au lieu d\'afficher une grille vide', async () => {
    mockGet({ success: true, plans: [{ id: 'pro', price: '550' }] });
    render(<AdminPricingPage />);

    await waitFor(() =>
      expect(screen.getByText(/catalogue d'abonnements est vide ou dans un format inattendu/)).toBeInTheDocument()
    );
  });
});
