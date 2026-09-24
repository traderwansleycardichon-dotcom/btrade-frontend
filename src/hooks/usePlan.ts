import { useAuth } from './useAuth';

/**
 * Droits d'accès, tels que résolus par le backend.
 *
 * Les noms correspondent exactement aux constantes de
 * src/core/entitlements/entitlements.js côté serveur. Le frontend ne décide
 * de rien : il lit la liste renvoyée par /api/me et masque en conséquence.
 * Chaque endpoint payant revérifie de son côté ; cacher un écran n'est
 * qu'un confort d'interface, jamais une protection.
 */
export const ENTITLEMENTS = {
  JOURNAL: 'JOURNAL',
  ANALYTICS: 'ANALYTICS',
  PROP_TRACKER: 'PROP_TRACKER',
  FINANCE: 'FINANCE',
  ADVANCED_EXPORTS: 'ADVANCED_EXPORTS',
  SIMULATOR: 'SIMULATOR',
  TODO: 'TODO',
  AI_BEHAVIORAL_ANALYTICS: 'AI_BEHAVIORAL_ANALYTICS',
  TI_JOHN: 'TI_JOHN',
  COURSES: 'COURSES',
  MASTERCLASSES: 'MASTERCLASSES',
  COMMUNITY: 'COMMUNITY',
  LIVE_TRADING: 'LIVE_TRADING',
  ONE_ON_ONE_MENTORSHIP: 'ONE_ON_ONE_MENTORSHIP',
  WEALTH_ROADMAP: 'WEALTH_ROADMAP',
  DIRECT_TRADE_AUDITS: 'DIRECT_TRADE_AUDITS',
  PROP_CHALLENGE_BLUEPRINT: 'PROP_CHALLENGE_BLUEPRINT',
} as const;

export type Entitlement = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

/**
 * Correspondance entre les anciennes clés de fonctionnalité et les
 * entitlements, le temps que les composants qui les utilisent encore
 * (FeatureGate) soient migrés.
 */
const LEGACY_FEATURE_MAP: Record<string, Entitlement> = {
  hasAiChat: ENTITLEMENTS.TI_JOHN,
  hasAiInsights: ENTITLEMENTS.AI_BEHAVIORAL_ANALYTICS,
  hasAdvancedExports: ENTITLEMENTS.ADVANCED_EXPORTS,
  hasAnalytics: ENTITLEMENTS.ANALYTICS,
  hasFinance: ENTITLEMENTS.FINANCE,
  hasAcademy: ENTITLEMENTS.COURSES,
};

export type FeatureKey = keyof typeof LEGACY_FEATURE_MAP | Entitlement;

export const usePlan = () => {
  const { membership, entitlements } = useAuth();

  const granted = new Set(entitlements || []);

  const can = (entitlement: Entitlement): boolean => granted.has(entitlement);

  /** Accepte un entitlement ou une ancienne clé de fonctionnalité. */
  const canUse = (feature: FeatureKey): boolean => {
    const mapped = LEGACY_FEATURE_MAP[feature as string];
    return granted.has(mapped || (feature as Entitlement));
  };

  return {
    membership,
    tier: membership?.tier ?? null,
    isActive: !!membership?.active,
    /** Adhésion payante active, quel que soit le palier. */
    isPro: !!membership?.active,
    isVip: membership?.active === true && membership.tier === 'VIP',
    /** Aucune adhésion active : compte gratuit, expiré ou impayé. */
    isFree: !membership?.active,
    entitlements: granted,
    can,
    canUse,
  };
};
