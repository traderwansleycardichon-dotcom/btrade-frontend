import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Check, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../contexts/SettingsContext';
import { usePlans } from '../../hooks/usePlans';
import {
  BILLING_INTERVALS,
  INTERVAL_LABEL,
  INTERVAL_SUFFIX,
  annualSavings,
  formatUsd,
  supportsOffer,
  type Plan,
} from '../../lib/pricing';
import type { BillingInterval } from '../../hooks/useAuth';

const BG_CTA = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=2400&q=80';

export const PricingSection: React.FC = () => {
  const { plans, paymentMethods, loading, error } = usePlans();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('ANNUAL');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { membership, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const openGatewayPicker = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const proceedWithGateway = (gateway: 'stripe' | 'moncash') => {
    if (!selectedPlan) return;

    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('btt_pending_tier', selectedPlan.tier);
        sessionStorage.setItem('btt_pending_interval', billingInterval);
        sessionStorage.setItem('btt_pending_gateway', gateway);
      } catch {
        // stockage indisponible : les paramètres d'URL prennent le relais
      }
      navigate(
        `/register?tier=${selectedPlan.tier}&interval=${billingInterval}&gateway=${gateway}`
      );
      return;
    }

    setCheckoutLoading(selectedPlan.tier);
    setShowPaymentModal(false);

    const url =
      gateway === 'moncash'
        ? '/api/billing/create-moncash-session'
        : '/api/billing/create-checkout-session';

    api
      .post(url, { tier: selectedPlan.tier, billingInterval })
      .then((res) => {
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          addToast('Réponse de paiement invalide.', 'error');
          setCheckoutLoading(null);
        }
      })
      .catch((err) => {
        addToast(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Impossible de lancer le paiement.',
          'error'
        );
        setCheckoutLoading(null);
      });
  };

  const rate = settings?.USD_TO_HTG_RATE ? Number(settings.USD_TO_HTG_RATE) : null;
  const moncashAvailable =
    selectedPlan && supportsOffer(paymentMethods, 'moncash', selectedPlan.tier, billingInterval);

  return (
    <>
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white mb-4">
              Deux façons de travailler avec nous.
            </h2>
            <p className="text-white/55">
              Le logiciel, l'IA et la salle de trading en direct d'un côté. Le mentorat
              individuel de l'autre. Annulez quand vous voulez.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div
              className="inline-flex items-center gap-1 rounded-xl glass-frost glass-rim p-1"
              role="group"
              aria-label="Périodicité de facturation"
            >
              {BILLING_INTERVALS.map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => setBillingInterval(interval)}
                  aria-pressed={billingInterval === interval}
                  className={`px-5 h-10 rounded-lg text-[13px] font-semibold transition-all ${
                    billingInterval === interval
                      ? 'bg-accent text-white shadow-[0_8px_24px_-8px_rgba(243,108,0,0.6)]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {INTERVAL_LABEL[interval]}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-20 text-white/40">
              <Loader2 className="animate-spin" size={28} />
            </div>
          )}

          {error && !loading && (
            <div className="mx-auto max-w-md rounded-xl glass-frost glass-rim p-6 text-center text-white/70">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => {
                const featured = plan.recommended;
                const price = plan.pricing[billingInterval]?.amount ?? 0;
                const savings = annualSavings(plan);
                const isCurrent = membership?.active && membership.tier === plan.tier;
                const isBusy = checkoutLoading === plan.tier;

                const cta = isCurrent
                  ? 'Votre adhésion actuelle'
                  : isAuthenticated
                    ? "S'abonner"
                    : 'Créer un compte';

                return (
                  <article
                    key={plan.tier}
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

                    <h3 className="text-xl font-semibold tracking-tight text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-[13px] text-white/55 leading-relaxed min-h-[56px] mb-6">
                      {plan.description}
                    </p>

                    <div className="flex flex-col mb-8">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-5xl font-semibold tracking-tight tabular-nums ${
                            featured ? 'text-accent' : 'text-white'
                          }`}
                        >
                          {formatUsd(price)}
                        </span>
                        <span className="text-white/45 text-sm">
                          {INTERVAL_SUFFIX[billingInterval]}
                        </span>
                      </div>

                      {billingInterval === 'ANNUAL' && savings && (
                        <div className="text-xs font-semibold text-emerald-400 mt-2">
                          Vous économisez {formatUsd(savings.amount)} par an ({savings.percent} pour cent)
                          par rapport au mensuel
                        </div>
                      )}

                      {rate && price > 0 && (
                        <div className="text-xs text-white/40 mt-1.5 tabular-nums">
                          environ {Math.ceil(price * rate).toLocaleString('fr-FR')} HTG{' '}
                          {INTERVAL_SUFFIX[billingInterval]}
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-10 flex-1">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-3 text-[14px] text-white/75 leading-relaxed"
                        >
                          <Check
                            size={16}
                            className={`mt-0.5 shrink-0 ${featured ? 'text-accent' : 'text-emerald-400'}`}
                            strokeWidth={2.5}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => openGatewayPicker(plan)}
                      disabled={isCurrent || isBusy}
                      className={`inline-flex items-center justify-center gap-2 h-12 w-full rounded-xl text-[14px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCurrent
                          ? 'bg-white/[0.04] text-white/60'
                          : featured
                            ? 'bg-accent hover:bg-accent-2 text-white shadow-[0_10px_30px_-10px_rgba(243,108,0,0.6)]'
                            : 'glass-subtle text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {isBusy ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Redirection
                        </>
                      ) : (
                        <>
                          {cta}
                          {!isCurrent && <ArrowRight size={14} />}
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="tarification" className="relative py-32 overflow-hidden">
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
            Rejoignez les traders qui ont fait de BEHIND THE TRADES leur garde-fou quotidien.
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

      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl glass-frost glass-rim p-8 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-2xl font-semibold text-white mb-2 text-center">
              Mode de paiement
            </h3>
            <p className="text-sm text-white/60 text-center mb-8">
              {selectedPlan.name}, facturation {INTERVAL_LABEL[billingInterval].toLowerCase()} à{' '}
              {formatUsd(selectedPlan.pricing[billingInterval].amount)}.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => proceedWithGateway('stripe')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white group-hover:text-accent transition-colors">Carte bancaire</div>
                    <div className="text-xs text-white/50">Paiement sécurisé via Stripe, en USD</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-accent transition-colors" />
              </button>

              {moncashAvailable ? (
                <button
                  onClick={() => proceedWithGateway('moncash')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] hover:border-[#FF0000]/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white group-hover:text-[#FF0000] transition-colors">MonCash</div>
                      <div className="text-xs text-white/50">Paiement mobile en HTG</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:text-[#FF0000] transition-colors" />
                </button>
              ) : (
                /* MonCash plafonne chaque paiement à 75 000 HTG : au taux
                   courant, seules les offres mensuelles passent. On le dit
                   plutôt que de laisser le client échouer au moment de payer. */
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-white/35" />
                  <div>
                    <div className="text-sm font-semibold text-white/70">
                      MonCash indisponible pour cette offre
                    </div>
                    <div className="text-xs text-white/45 mt-1 leading-relaxed">
                      MonCash limite chaque paiement à 75 000 HTG. Choisissez la facturation
                      mensuelle, ou réglez par carte.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-6 w-full py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
};
