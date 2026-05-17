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
  },
  pro: {
    maxTradingAccounts: 5,
    maxTradesPerMonth: -1,
    hasAiChat: true,
    hasAiInsights: true,
    hasAdvancedExports: true,
    hasAnalytics: true,
    hasFinance: true,
  }
} as const;

export type FeatureKey = keyof typeof PLAN_FEATURES.pro;

export const usePlan = () => {
  const { user } = useAuth();
  const plan = user?.plan || 'free';
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.free;

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
