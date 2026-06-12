import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Check, ArrowRight, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../contexts/SettingsContext';

const BG_CTA = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=2400&q=80';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
  originalPrice?: string | null;
}

// Plans affichés tant que le backend ne répond pas (ou si /api/billing/plans renvoie vide).
// Si le backend retourne des plans, ils remplacent ce fallback automatiquement.
const FALLBACK_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Découverte',
    price: 0,
    description:
      "Pour tester le journal et comprendre vos premiers patterns avant d'investir.",
    features: [
      'Jusqu’à 50 trades / mois',
      '1 compte Prop Firm',
      'Statistiques de base (P&L, win rate, drawdown)',
      'Journal psychologique simple',
      'Export CSV',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    recommended: true,
    description:
      'L’arsenal complet pour protéger un compte financé et passer vos évaluations.',
    features: [
      'Trades illimités',
      'Comptes Prop Firm illimités (FTMO, MyFundedFX, FundedNext…)',
      'Score de discipline algorithmique en temps réel',
      'Détection IA des biais (revenge trading, FOMO, sur-exposition)',
      'Alertes drawdown & breach Prop Firm',
      'Playbooks statistiques + export PDF pour audit',
      'Support prioritaire',
    ],
  },
];

export const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<Plan | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/billing/plans');
        if (!cancelled && Array.isArray(data?.data) && data.data.length > 0) {
          setPlans(data.data);
        }
      } catch {
        // silencieux — on garde FALLBACK_PLANS déjà en state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    // Plan gratuit → inscription simple
    if (plan.id === 'free' || plan.price === 0) {
      navigate('/register');
      return;
    }

    // Pas connecté (ou connecté mais on veut un nouvel abonnement)
    // Au lieu de l'inscrire au hasard, on demande la passerelle de paiement
    setSelectedPaidPlan(plan);
    setShowPaymentModal(true);
  };

  const proceedWithGateway = (gateway: 'stripe' | 'moncash') => {
    if (!selectedPaidPlan) return;
    
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('btt_pending_plan', selectedPaidPlan.id);
        sessionStorage.setItem('btt_pending_gateway', gateway);
      } catch {}
      navigate(`/register?plan=${encodeURIComponent(selectedPaidPlan.id)}&gateway=${gateway}`);
      return;
    }

    // Déjà connecté -> va faire le checkout classique
    setCheckoutLoading(selectedPaidPlan.id);
    setShowPaymentModal(false);
    
    const url = gateway === 'moncash' 
      ? '/api/billing/create-moncash-session' 
      : '/api/billing/create-checkout-session';

    api.post(url, { planId: selectedPaidPlan.id })
      .then((res) => {
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          addToast('Réponse de paiement invalide.', 'error');
          setCheckoutLoading(null);
        }
      })
      .catch((err) => {
        addToast(err?.response?.data?.error || 'Impossible de lancer le paiement.', 'error');
        setCheckoutLoading(null);
      });
  };

  return (
    <>
      {/* PLANS */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent mb-3">
              Tarifs
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white mb-4">
              Un prix lisible, des limites claires.
            </h2>
            <p className="text-white/55">
              Démarrez gratuitement. Passez Pro quand vous serez financé.
              Annulez quand vous voulez.
            </p>
          </div>

          {loading && (
            <div className="absolute right-6 top-6 text-white/30">
              <Loader2 className="animate-spin" size={14} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => {
                const featured = plan.recommended;
                const isFree = plan.id === 'free' || plan.price === 0;
                const isCurrent = isAuthenticated && user?.plan === plan.id;
                const isBusy = checkoutLoading === plan.id;

                const cta = isCurrent
                  ? 'Votre plan actuel'
                  : isFree
                    ? 'Commencer gratuitement'
                    : isAuthenticated
                      ? "S'abonner"
                      : 'Créer un compte';

                return (
                  <article
                    key={plan.id}
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
                    <p className="text-[13px] text-white/55 leading-relaxed min-h-[40px] mb-6">
                      {plan.description}
                    </p>

                    <div className="flex flex-col mb-8">
                      {plan.originalPrice && (
                        <div className="text-[13px] font-bold text-white/40 line-through mb-1">
                          ${plan.originalPrice}
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-5xl font-semibold tracking-tight tabular-nums ${
                            featured ? 'text-accent' : 'text-white'
                          }`}
                        >
                          ${plan.price}
                        </span>
                        <span className="text-white/45 text-sm">/ mois</span>
                      </div>
                      {!isFree && settings?.USD_TO_HTG_RATE && plan.price && (
                        <div className="text-xs font-bold text-accent mt-1">
                          ≈ {Math.ceil(Number(plan.price) * Number(settings.USD_TO_HTG_RATE))} HTG / mois
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-10 flex-1">
                      {(Array.isArray(plan.features) ? plan.features : []).map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[14px] text-white/75 leading-relaxed">
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
                      onClick={() => handleSubscribe(plan)}
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
                          Redirection…
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
        </div>
      </section>

      {/* CTA */}
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
            Rejoignez les traders qui ont fait de Behind The Trade leur garde-fou quotidien.
            Pas d'engagement, pas de carte.
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

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedPaidPlan && (
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
              Choisissez comment vous souhaitez payer pour le plan {selectedPaidPlan.name}.
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
                    <div className="font-semibold text-white group-hover:text-accent transition-colors">Carte Bancaire</div>
                    <div className="text-xs text-white/50">Paiement sécurisé via Stripe en USD</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-accent transition-colors" />
              </button>

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
