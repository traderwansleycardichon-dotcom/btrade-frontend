import { useAuth } from './useAuth';

export const PLAN_FEATURES = {
  free: {
    maxTradingAccounts: 1,
    maxTradesPerMonth: 20,
    hasAiChat: false,
    hasAiInsights: false,
    hasAdvancedExports: false,
    hasAnalytics: false,
    hasFinance: false,
    hasAcademy: false,
  },
  pro: {
    maxTradingAccounts: -1,
    maxTradesPerMonth: -1,
    hasAiChat: true,
    hasAiInsights: true,
    hasAdvancedExports: true,
    hasAnalytics: true,
    hasFinance: true,
    hasAcademy: true,
  }
} as const;

export type FeatureKey = keyof typeof PLAN_FEATURES.pro;

export const usePlan = () => {
  const { user } = useAuth();
  const plan = user?.plan || 'free';
  // Les utilisateurs "locked" sont bloqués au niveau du layout ; ici on retombe sur les features "free" par sécurité.
  const featureKey: 'free' | 'pro' = plan === 'pro' ? 'pro' : 'free';
  const features = PLAN_FEATURES[featureKey];

  const canUse = (featureName: FeatureKey): boolean => {
    return !!features[featureName];
  };

  return {
    plan,
    features,
    canUse,
    isPro: plan === 'pro',
    isFree: plan === 'free',
  };
};
