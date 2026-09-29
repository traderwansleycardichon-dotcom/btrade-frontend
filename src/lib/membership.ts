/**
 * Contrat partagé du catalogue d'abonnements Haitian Wall Street.
 *
 * Source de vérité côté serveur : GET /api/billing/plans, qui sert le
 * catalogue de core/config/membership.js (deux formules payantes, deux
 * intervalles de facturation). Tout écran qui affiche des prix passe par ici
 * pour que la landing, l'espace membre et le panel admin ne divergent jamais.
 */

export type BillingInterval = 'MONTHLY' | 'YEARLY';

export const MONTHLY: BillingInterval = 'MONTHLY';
export const YEARLY: BillingInterval = 'YEARLY';

export interface PlanPrice {
  amount: number | null;
  currency: string;
  available: boolean;
}

export interface FeatureGroup {
  title: string;
  entitlement?: string;
  items: string[];
}

export interface YearlySaving {
  twelveMonthsAtMonthlyRate: number;
  yearlyPrice: number;
  savingAmount: number;
  savingPercent: number;
}

export interface PlanCta {
  label: string;
  action: 'subscribe' | 'upgrade' | 'manage' | 'resume';
  disabled: boolean;
  isCurrent?: boolean;
}

export interface MembershipPlan {
  plan: string;
  name: string;
  tagline: string;
  recommended: boolean;
  inherits: string | null;
  prices: Record<BillingInterval, PlanPrice>;
  yearlySaving: YearlySaving | null;
  featureGroups: FeatureGroup[];
  cta: PlanCta;
}

/** Ce que le serveur sait de l'abonnement du visiteur connecté. */
export interface MembershipViewer {
  plan: string;
  isStaffOverride: boolean;
  status: string | null;
  billingInterval: BillingInterval | null;
  paymentProvider: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
  isManageableInStripe: boolean;
  canAccessPro: boolean;
  canAccessVip: boolean;
}

export interface PlansPayload {
  plans: MembershipPlan[];
  defaultInterval: BillingInterval;
  viewer: MembershipViewer | null;
}

export const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  locked: 'Accès expiré',
  pro: 'Pro',
  vip_incubator: 'VIP Incubator',
};

/** Hiérarchie d'accès, identique à core/config/plans.js. */
export const PLAN_RANK: Record<string, number> = {
  locked: 0,
  free: 0,
  pro: 1,
  vip_incubator: 2,
};

export const PAID_PLANS = ['pro', 'vip_incubator'];

export const normalizePlan = (raw?: string | null): string => {
  const key = String(raw ?? '').trim().toLowerCase();
  if (!key) return 'free';
  if (key === 'vip' || key === 'vip-incubator' || key === 'incubator') return 'vip_incubator';
  if (key === 'lifetime') return 'pro';
  if (key in PLAN_RANK) return key;
  return 'free';
};

export const isPaidPlan = (raw?: string | null): boolean => PAID_PLANS.includes(normalizePlan(raw));

export const isBillingInterval = (value: unknown): value is BillingInterval =>
  value === MONTHLY || value === YEARLY;

export const normalizeInterval = (raw?: string | null): BillingInterval =>
  String(raw ?? '').toUpperCase() === YEARLY ? YEARLY : MONTHLY;

export const intervalLabel = (billingInterval: BillingInterval) =>
  billingInterval === MONTHLY ? 'Mensuel' : 'Annuel';

export const intervalSuffix = (billingInterval: BillingInterval) =>
  billingInterval === MONTHLY ? '/ mois' : '/ an';

/** "Haitian Wall Street VIP Incubator" devient "VIP Incubator". */
export const shortName = (name: string) =>
  name.replace(/^haitian wall street\s*/i, '').trim() || name;

export const formatUsd = (amount: number) => `$${amount.toLocaleString('fr-FR')}`;

export const formatHtg = (amountUsd: number, rate: number) =>
  `${Math.ceil(amountUsd * rate).toLocaleString('fr-FR')} HTG`;

export const planName = (plan?: string | null) => {
  const normalized = normalizePlan(plan);
  return PLAN_LABELS[normalized] || normalized;
};

const readPrice = (raw: any): PlanPrice => ({
  amount: typeof raw?.amount === 'number' ? raw.amount : null,
  currency: typeof raw?.currency === 'string' ? raw.currency : 'usd',
  available: Boolean(raw?.available),
});

/** Normalise un plan renvoyé par /api/billing/plans. */
export const readPlan = (raw: any): MembershipPlan | null => {
  const id = raw?.plan ?? raw?.id;
  if (!id || typeof id !== 'string') return null;

  const groups: FeatureGroup[] = Array.isArray(raw?.featureGroups)
    ? raw.featureGroups
        .map((group: any) => ({
          title: typeof group?.title === 'string' ? group.title : '',
          entitlement: group?.entitlement,
          items: Array.isArray(group?.items)
            ? group.items.filter((item: any) => typeof item === 'string')
            : [],
        }))
        .filter((group: FeatureGroup) => group.items.length > 0)
    : [];

  return {
    plan: id,
    name: typeof raw?.name === 'string' ? raw.name : id,
    tagline: typeof raw?.tagline === 'string' ? raw.tagline : '',
    recommended: Boolean(raw?.recommended),
    inherits: typeof raw?.inherits === 'string' ? raw.inherits : null,
    prices: {
      MONTHLY: readPrice(raw?.prices?.MONTHLY),
      YEARLY: readPrice(raw?.prices?.YEARLY),
    },
    yearlySaving: raw?.yearlySaving ?? null,
    featureGroups: groups,
    cta: {
      label: typeof raw?.cta?.label === 'string' ? raw.cta.label : '',
      action: raw?.cta?.action ?? 'subscribe',
      disabled: Boolean(raw?.cta?.disabled),
      isCurrent: Boolean(raw?.cta?.isCurrent),
    },
  };
};

const readViewer = (raw: any): MembershipViewer | null => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    plan: normalizePlan(raw.plan),
    isStaffOverride: Boolean(raw.isStaffOverride),
    status: raw.status ?? null,
    billingInterval: isBillingInterval(raw.billingInterval) ? raw.billingInterval : null,
    paymentProvider: raw.paymentProvider ?? null,
    currentPeriodStart: raw.currentPeriodStart ?? null,
    currentPeriodEnd: raw.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: Boolean(raw.cancelAtPeriodEnd),
    hasStripeCustomer: Boolean(raw.hasStripeCustomer),
    isManageableInStripe: Boolean(raw.isManageableInStripe),
    canAccessPro: Boolean(raw.canAccessPro),
    canAccessVip: Boolean(raw.canAccessVip),
  };
};

/** Lit la réponse de GET /api/billing/plans. Renvoie null si la forme est inattendue. */
export const readPlansPayload = (body: any): PlansPayload | null => {
  const payload = body?.data;
  const list = Array.isArray(payload?.plans) ? payload.plans : [];
  const plans = list.map(readPlan).filter(Boolean) as MembershipPlan[];
  if (plans.length === 0) return null;

  return {
    plans,
    defaultInterval: isBillingInterval(payload?.defaultInterval) ? payload.defaultInterval : MONTHLY,
    viewer: readViewer(payload?.viewer),
  };
};

/**
 * Catalogue de secours, copie de core/config/membership.js. Il sert uniquement
 * quand l'API publique ne répond pas, pour que la page ne montre jamais une
 * seule formule ni un prix inventé.
 */
export const FALLBACK_PLANS: MembershipPlan[] = [
  {
    plan: 'pro',
    name: 'Haitian Wall Street Pro',
    tagline:
      'Pour les traders autonomes et les détenteurs de comptes prop firm qui veulent un logiciel puissant, un suivi IA, des ressources pédagogiques et un accès quotidien au marché en direct.',
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
      {
        title: 'Plateforme SaaS Haitian Wall Street',
        items: [
          'Journal de trading complet',
          'Comptes de trading',
          "Comptes d'évaluation",
          'Comptes funded',
          'Comptes personnels',
          'Calendriers de Net PnL',
          'Suivi du drawdown prop firm',
          'Analytics de trading',
          'Statistiques de performance',
        ],
      },
      {
        title: 'AI Behavioral Analytics',
        items: [
          'Détection du trading émotionnel',
          'Détection du revenge trading',
          "Détection des erreurs d'exécution",
          'Insights comportementaux',
          'Analytics de psychologie de trading',
        ],
      },
      {
        title: 'Ti John, assistant IA de trading',
        items: [
          'Accès à Ti John',
          'Support en créole haïtien',
          'Support en français',
          'Support en anglais',
          'Explications pédagogiques de trading',
          'Connaissance de la plateforme et des cours',
        ],
      },
      {
        title: 'Live Co-Trading Room',
        items: [
          'Sessions du matin',
          "Sessions de l'après-midi",
          "Sessions d'analyse et d'exécution en direct",
        ],
      },
      {
        title: 'Communauté et masterclasses exclusives',
        items: [
          'Communauté privée de traders',
          'Bibliothèque de cours complète',
          'Contenu en anglais',
          'Contenu en créole haïtien',
        ],
      },
    ],
    cta: { label: 'Join Pro', action: 'subscribe', disabled: false },
  },
  {
    plan: 'vip_incubator',
    name: 'Haitian Wall Street VIP Incubator',
    tagline:
      "Tout ce que contient Pro, plus un accompagnement individuel avec Wansley Cardichon, un plan patrimonial personnalisé et l'audit direct de vos trades.",
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
      {
        title: 'Mentorat individuel',
        items: [
          'Sessions de stratégie privées toutes les deux semaines',
          'Mentorat avec Wansley Cardichon',
          'Revue de trades',
          "Optimisation de l'exécution",
        ],
      },
      {
        title: 'Feuille de route patrimoniale personnalisée',
        items: [
          'Plan de protection du capital',
          "Stratégie d'allocation des profits",
          "Feuille de route de construction d'actifs long terme",
          'Ressources de planification financière personnalisées',
        ],
      },
      {
        title: 'Audits de trades directs',
        items: ['Retour privé sur vos setups', 'Revues de trades', 'Messagerie privée'],
      },
      {
        title: 'Prop Firm Challenge Blueprint',
        items: [
          'Plan de gestion du risque personnalisé',
          "Planification des comptes d'évaluation",
          'Gestion du drawdown',
          'Règles de maintien des comptes funded et évaluation',
        ],
      },
    ],
    cta: { label: 'Join VIP Incubator', action: 'subscribe', disabled: false },
  },
];
