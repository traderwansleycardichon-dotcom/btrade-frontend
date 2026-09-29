import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Check, ArrowRight, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import {
  BillingInterval,
  FALLBACK_PLANS,
  FREE_PLAN,
  MONTHLY,
  MembershipPlan,
  PlanPrice,
  YEARLY,
  formatHtg,
  formatUsd,
  intervalLabel,
  normalizePlan,
  intervalSuffix,
  readPlansPayload,
  shortName,
} from '../../lib/membership';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../contexts/SettingsContext';

const BG_CTA = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=2400&q=80';

/** Nombre de groupes de fonctionnalités visibles avant dépliage. */
const VISIBLE_GROUPS = 2;

export const PricingSection: React.FC = () => {
  const [paidPlans, setPaidPlans] = useState<MembershipPlan[]>(FALLBACK_PLANS);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(MONTHLY);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/billing/plans');
        const payload = readPlansPayload(data);
        if (!cancelled && payload) {
          setPaidPlans(payload.plans);
          setBillingInterval(payload.defaultInterval);
        }
      } catch {
        // silencieux : on garde le catalogue de secours déjà en state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rate = Number(settings?.USD_TO_HTG_RATE) || 0;
  const viewerPlan = normalizePlan(user?.plan);

  // Le palier gratuit n'est pas facturé, donc il ne vient pas du catalogue serveur.
  const plans = useMemo(() => [FREE_PLAN, ...paidPlans], [paidPlans]);

  // La meilleure économie annuelle du catalogue, pour l'étiquette du sélecteur.
  const bestYearlySaving = useMemo(
    () =>
      plans.reduce((best, plan) => {
        const percent = plan.yearlySaving?.savingPercent;
        return typeof percent === 'number' && percent > best ? percent : best;
      }, 0),
    [plans]
  );

  const resolveCta = (plan: MembershipPlan, price: PlanPrice) => {
    if (plan.plan === 'free') {
      if (!isAuthenticated) {
        return { label: 'Créer un compte gratuit', disabled: false, action: 'subscribe' as const };
      }
      return {
        label: viewerPlan === 'free' ? 'Votre plan actuel' : 'Déjà inclus dans votre abonnement',
        disabled: true,
        action: 'manage' as const,
      };
    }
    if (plan.cta.isCurrent) {
      return { label: 'Votre plan actuel', disabled: true, action: 'manage' as const };
    }
    if (!price.available || price.amount === null) {
      return { label: 'Indisponible pour le moment', disabled: true, action: 'manage' as const };
    }
    if (!isAuthenticated) {
      return { label: `Rejoindre ${shortName(plan.name)}`, disabled: false, action: 'subscribe' as const };
    }
    if (plan.cta.action === 'resume') {
      return { label: 'Reprendre mon abonnement', disabled: false, action: 'resume' as const };
    }
    if (plan.cta.action === 'upgrade') {
      return { label: `Passer à ${shortName(plan.name)}`, disabled: false, action: 'upgrade' as const };
    }
    if (plan.cta.action === 'manage') {
      return { label: 'Gérer mon abonnement', disabled: false, action: 'manage' as const };
    }
    return { label: "S'abonner", disabled: false, action: 'subscribe' as const };
  };

  const handleSubscribe = async (plan: MembershipPlan, action: 'subscribe' | 'upgrade' | 'resume' | 'manage') => {
    // Palier gratuit : simple inscription, aucun paiement à reprendre.
    if (plan.plan === 'free') {
      try {
        sessionStorage.removeItem('btt_pending_plan');
        sessionStorage.removeItem('btt_pending_interval');
      } catch {}
      navigate('/register');
      return;
    }

    // Visiteur : on mémorise le plan choisi et on reprend le paiement après inscription.
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('btt_pending_plan', plan.plan);
        sessionStorage.setItem('btt_pending_interval', billingInterval);
      } catch {}
      navigate(`/register?plan=${encodeURIComponent(plan.plan)}&interval=${billingInterval}`);
      return;
    }

    // Un abonné existant change de formule depuis son espace, pas depuis la page publique :
    // le backend refuse un second abonnement (SUBSCRIPTION_EXISTS).
    if (action !== 'subscribe') {
      navigate('/app/upgrade');
      return;
    }

    setCheckoutLoading(plan.plan);
    try {
      const { data } = await api.post('/api/billing/create-checkout-session', {
        plan: plan.plan,
        planId: plan.plan,
        billingInterval,
      });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      addToast('Réponse de paiement invalide.', 'error');
      setCheckoutLoading(null);
    } catch (err: any) {
      if (err?.response?.data?.error === 'SUBSCRIPTION_EXISTS') {
        addToast(err.response.data.message || 'Vous avez déjà un abonnement actif.', 'error');
        navigate('/app/upgrade');
        return;
      }
      addToast(err?.response?.data?.error || 'Impossible de lancer le paiement.', 'error');
      setCheckoutLoading(null);
    }
  };

  const gridCols = plans.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2';
  const gridWidth = plans.length >= 3 ? 'max-w-6xl' : 'max-w-4xl';

  return (
    <>
      {/* PLANS */}
      <section id="tarification" className="relative py-24 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white mb-4">
              Commencez gratuitement, montez quand vous êtes prêt.
            </h2>
            <p className="text-white/55">
              7 jours pour tester, la plateforme complète avec Pro, ou l'accompagnement individuel
              avec le VIP Incubator. Sans engagement, annulez quand vous voulez.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 rounded-xl glass-subtle p-1">
              {([MONTHLY, YEARLY] as BillingInterval[]).map((option) => {
                const active = billingInterval === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBillingInterval(option)}
                    aria-pressed={active}
                    className={`h-10 px-5 rounded-lg text-[13px] font-semibold transition-all ${
                      active ? 'bg-accent text-white shadow-[0_8px_24px_-12px_rgba(243,108,0,0.8)]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {intervalLabel(option)}
                    {option === YEARLY && bestYearlySaving > 0 && (
                      <span className={`ml-2 text-[11px] font-medium ${active ? 'text-white/80' : 'text-white/40'}`}>
                        jusqu'à {Math.round(bestYearlySaving)}% en moins
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center mb-8 text-white/30">
              <Loader2 className="animate-spin" size={14} />
            </div>
          )}

          <div className={`grid grid-cols-1 ${gridCols} gap-6 ${gridWidth} mx-auto items-start`}>
            {plans.map((plan) => {
              const featured = plan.recommended;
              const isFree = plan.plan === 'free';
              const price = plan.prices[billingInterval];
              const cta = resolveCta(plan, price);
              const isBusy = checkoutLoading === plan.plan;
              const isOpen = Boolean(expanded[plan.plan]);
              const groups = isOpen ? plan.featureGroups : plan.featureGroups.slice(0, VISIBLE_GROUPS);
              const hiddenGroups = plan.featureGroups.length - VISIBLE_GROUPS;
              const monthlyEquivalent =
                !isFree && billingInterval === YEARLY && price.amount !== null
                  ? Math.round(price.amount / 12)
                  : null;

              return (
                <article
                  key={plan.plan}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    featured
                      ? 'glass-frost glass-rim ring-1 ring-accent/40 shadow-[0_30px_80px_-30px_rgba(243,108,0,0.5)]'
                      : 'glass-frost glass-rim'
                  }`}
                >
                  {featured && (
                    <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
                      <Sparkles size={11} />
                      Recommandé
                    </div>
                  )}

                  <h3 className="text-xl font-semibold tracking-tight text-white mb-2">{plan.name}</h3>
                  <p className="text-[13px] text-white/55 leading-relaxed mb-6">{plan.tagline}</p>

                  <div className="flex flex-col mb-8">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-5xl font-semibold tracking-tight tabular-nums ${
                          featured ? 'text-accent' : 'text-white'
                        }`}
                      >
                        {price.amount !== null ? formatUsd(price.amount) : 'Sur demande'}
                      </span>
                      {price.amount !== null && (
                        <span className="text-white/45 text-sm">
                          {isFree ? '/ 7 jours' : intervalSuffix(billingInterval)}
                        </span>
                      )}
                    </div>
                    {monthlyEquivalent !== null && (
                      <div className="text-xs text-white/45 mt-1">
                        soit {formatUsd(monthlyEquivalent)} par mois
                      </div>
                    )}
                    {!isFree && price.amount !== null && rate > 0 && (
                      <div className="text-xs font-semibold text-accent mt-1">
                        ≈ {formatHtg(price.amount, rate)} {intervalSuffix(billingInterval)}
                      </div>
                    )}
                    {!isFree && billingInterval === YEARLY && plan.yearlySaving && (
                      <div className="text-xs text-white/45 mt-1">
                        {formatUsd(plan.yearlySaving.savingAmount)} économisés sur douze mois
                      </div>
                    )}
                  </div>

                  {plan.inherits && (
                    <div className="mb-6 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-[13px] text-white/70">
                      Tout ce que contient le plan Pro est inclus.
                    </div>
                  )}

                  <div className="space-y-6 mb-8 flex-1">
                    {groups.map((group) => (
                      <div key={group.title}>
                        {group.title && (
                          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-3">
                            {group.title}
                          </div>
                        )}
                        <ul className="space-y-2.5">
                          {group.items.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3 text-[14px] text-white/75 leading-relaxed"
                            >
                              <Check
                                size={16}
                                className={`mt-0.5 shrink-0 ${featured ? 'text-accent' : 'text-white/45'}`}
                                strokeWidth={2.5}
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {hiddenGroups > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => ({ ...prev, [plan.plan]: !isOpen }))}
                      className="mb-6 text-[13px] font-medium text-white/60 hover:text-white transition-colors text-left"
                    >
                      {isOpen ? 'Réduire le détail' : `Voir tout le détail (${hiddenGroups} de plus)`}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan, cta.action)}
                    disabled={cta.disabled || isBusy}
                    className={`inline-flex items-center justify-center gap-2 h-12 w-full rounded-xl text-[14px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      cta.disabled
                        ? 'bg-white/[0.04] text-white/60'
                        : featured
                          ? 'bg-accent hover:bg-accent-2 text-white shadow-[0_10px_30px_-10px_rgba(243,108,0,0.6)]'
                          : 'glass-subtle text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Redirection...
                      </>
                    ) : (
                      <>
                        {cta.label}
                        {!cta.disabled && <ArrowRight size={14} />}
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={BG_CTA}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/85 to-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(243,108,0,0.18),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-white mb-6 leading-[1.05]">
            Prêt à protéger votre
            <br />
            compte financé ?
          </h2>
          <p className="text-white/65 text-lg leading-relaxed mb-10">
            Rejoignez les traders qui ont fait de Haitian Wall Street leur garde-fou quotidien.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-accent hover:bg-accent-2 text-white font-semibold text-[15px] shadow-[0_10px_40px_-10px_rgba(243,108,0,0.6)] transition-all"
            >
              Créer mon compte
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-14 px-8 rounded-xl glass-frost text-white font-medium text-[15px] hover:bg-white/[0.08] transition-all"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
