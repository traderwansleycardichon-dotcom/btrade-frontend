import type { BillingInterval, Tier } from '../hooks/useAuth';

/**
 * Offres BEHIND THE TRADES telles que servies par le backend.
 *
 * Les montants ne sont pas écrits ici : ils viennent de /api/billing/plans,
 * pour qu'il n'existe qu'un seul endroit où un tarif est défini.
 */
export interface PlanPricing {
  amount: number;
  annualizedAmount?: number;
  savingsVsMonthly?: number;
}

export interface Plan {
  tier: Tier;
  name: string;
  description: string;
  icon: string;
  color: string;
  recommended: boolean;
  sortOrder: number;
  currency: string;
  features: string[];
  pricing: Record<BillingInterval, PlanPricing>;
}

export interface PaymentMethodOffer {
  tier: Tier;
  billingInterval: BillingInterval;
}

export interface PaymentMethods {
  stripe: { available: boolean; offers: PaymentMethodOffer[] };
  moncash: { available: boolean; offers: PaymentMethodOffer[]; maxAmountGdes: number };
}

export const BILLING_INTERVALS: BillingInterval[] = ['MONTHLY', 'ANNUAL'];

export const INTERVAL_LABEL: Record<BillingInterval, string> = {
  MONTHLY: 'Mensuel',
  ANNUAL: 'Annuel',
};

export const INTERVAL_SUFFIX: Record<BillingInterval, string> = {
  MONTHLY: '/ mois',
  ANNUAL: '/ an',
};

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

/**
 * Économie réalisée en payant à l'année, exprimée en dollars et en pourcentage.
 * Retourne `null` si l'annuel n'est pas avantageux, pour ne rien annoncer de faux.
 */
export function annualSavings(plan: Plan): { amount: number; percent: number } | null {
  const monthlyOverAYear = plan.pricing.MONTHLY.amount * 12;
  const annual = plan.pricing.ANNUAL.amount;
  const saved = monthlyOverAYear - annual;
  if (saved <= 0) return null;
  return { amount: saved, percent: Math.round((saved / monthlyOverAYear) * 100) };
}

/** Une passerelle accepte-t-elle cette offre précise ? */
export function supportsOffer(
  methods: PaymentMethods | null,
  gateway: 'stripe' | 'moncash',
  tier: Tier,
  billingInterval: BillingInterval
): boolean {
  if (!methods) return gateway === 'stripe';
  const entry = gateway === 'stripe' ? methods.stripe : methods.moncash;
  if (!entry.available) return false;
  return entry.offers.some((o) => o.tier === tier && o.billingInterval === billingInterval);
}
