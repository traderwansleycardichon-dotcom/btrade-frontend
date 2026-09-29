import { useAuth } from './useAuth';
import { PLAN_RANK, normalizePlan } from '../lib/membership';

const FREE_FEATURES = {
  maxTradingAccounts: 1,
  maxTradesPerMonth: 20,
  hasAiChat: false,
  hasAiInsights: false,
  hasAdvancedExports: false,
  hasAnalytics: false,
  hasFinance: false,
  hasAcademy: false,
  hasMentorship: false,
  hasTradeAudits: false,
  hasRoadmap: false,
  hasPropFirmBlueprint: false,
} as const;

const PRO_FEATURES = {
  maxTradingAccounts: -1,
  maxTradesPerMonth: -1,
  hasAiChat: true,
  hasAiInsights: true,
  hasAdvancedExports: true,
  hasAnalytics: true,
  hasFinance: true,
  hasAcademy: true,
  hasMentorship: false,
  hasTradeAudits: false,
  hasRoadmap: false,
  hasPropFirmBlueprint: false,
} as const;

// Miroir de core/config/plans.js côté serveur. Le VIP Incubator hérite de PRO.
export const PLAN_FEATURES = {
  free: FREE_FEATURES,
  // Un membre dont l'accès a expiré retombe sur les capacités du plan gratuit.
  locked: FREE_FEATURES,
  pro: PRO_FEATURES,
  vip_incubator: {
    ...PRO_FEATURES,
    hasMentorship: true,
    hasTradeAudits: true,
    hasRoadmap: true,
    hasPropFirmBlueprint: true,
  },
} as const;

export type FeatureKey = keyof typeof PLAN_FEATURES.vip_incubator;

type PlanKey = keyof typeof PLAN_FEATURES;

export const usePlan = () => {
  const { user } = useAuth();
  const rawPlan = user?.plan || 'free';
  // 'locked' n'est pas un palier : c'est un ancien abonné dont l'accès a expiré.
  const plan: PlanKey = rawPlan === 'locked' ? 'locked' : (normalizePlan(rawPlan) as PlanKey);
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.free;

  const canUse = (featureName: FeatureKey): boolean => Boolean(features[featureName]);

  const rank = PLAN_RANK[plan] ?? 0;

  return {
    plan,
    features,
    canUse,
    isPro: rank >= PLAN_RANK.pro,
    isVip: rank >= PLAN_RANK.vip_incubator,
    isFree: rank < PLAN_RANK.pro,
  };
};
