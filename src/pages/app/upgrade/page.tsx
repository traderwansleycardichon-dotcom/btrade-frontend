import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Shield,
  ArrowRight,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useSettings } from '../../../contexts/SettingsContext';
import {
  BillingInterval,
  MONTHLY,
  MembershipPlan,
  MembershipViewer,
  PLAN_RANK,
  YEARLY,
  formatHtg,
  formatUsd,
  intervalLabel,
  intervalSuffix,
  isPaidPlan,
  normalizePlan,
  planName,
  readPlansPayload,
  shortName,
} from '../../../lib/membership';

type CardAction = 'checkout' | 'change' | 'resume' | 'none';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  trialing: "Période d'essai",
  past_due: 'Paiement en retard',
  unpaid: 'Impayé',
  canceled: 'Annulé',
  incomplete: 'Paiement incomplet',
  none: 'Aucun abonnement',
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('fr-FR');
};

export default function UpgradePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [viewer, setViewer] = useState<MembershipViewer | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(MONTHLY);
  const [isFetching, setIsFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalTouched = useRef(false);

  const paymentStatus = searchParams.get('payment'); // 'success' | 'canceled' | null

  const fetchPlans = useCallback(async () => {
    try {
      const { data } = await api.get('/api/billing/plans');
      const payload = readPlansPayload(data);
      if (!payload) {
        setLoadError(true);
        return;
      }
      setPlans(payload.plans);
      setViewer(payload.viewer);
      setLoadError(false);
      // On préselectionne l'intervalle de l'abonnement en cours, sans écraser
      // un choix déjà fait par le membre.
      if (!intervalTouched.current) {
        setBillingInterval(payload.viewer?.billingInterval || payload.defaultInterval);
      }
    } catch (err) {
      setLoadError(true);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Après un retour de paiement réussi, on attend que le webhook débloque le compte.
  useEffect(() => {
    if (paymentStatus !== 'success') return;

    refreshUser();
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      await refreshUser();
      await fetchPlans();
      if (attempts >= 10 && pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentStatus, refreshUser, fetchPlans]);

  // Redirection vers le dashboard dès que l'accès payant est effectif.
  useEffect(() => {
    if (paymentStatus === 'success' && isPaidPlan(user?.plan)) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      const timer = setTimeout(() => navigate('/app/dashboard'), 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.plan, paymentStatus, navigate]);

  const rate = Number(settings?.USD_TO_HTG_RATE) || 0;
  const currentPlan = normalizePlan(viewer?.plan ?? user?.plan);
  const periodEnd = formatDate(viewer?.currentPeriodEnd ?? null);

  const selectInterval = (next: BillingInterval) => {
    intervalTouched.current = true;
    setBillingInterval(next);
  };

  const resolveCard = (plan: MembershipPlan) => {
    const price = plan.prices[billingInterval];

    if (!price.available || price.amount === null) {
      return { label: 'Indisponible pour le moment', disabled: true, action: 'none' as CardAction };
    }

    const isSamePlan = currentPlan === plan.plan;
    const sameInterval = viewer?.billingInterval === billingInterval;
    const label = shortName(plan.name);

    if (isSamePlan && viewer?.isStaffOverride) {
      return { label: 'Accès accordé par votre rôle', disabled: true, action: 'none' as CardAction };
    }

    if (isSamePlan && viewer?.cancelAtPeriodEnd) {
      return { label: 'Reprendre mon abonnement', disabled: false, action: 'resume' as CardAction };
    }

    if (isSamePlan && (sameInterval || !viewer?.isManageableInStripe)) {
      return { label: 'Votre plan actuel', disabled: true, action: 'none' as CardAction };
    }

    if (isSamePlan) {
      return {
        label: billingInterval === YEARLY ? 'Passer au paiement annuel' : 'Passer au paiement mensuel',
        disabled: false,
        action: 'change' as CardAction,
      };
    }

    if (viewer?.isManageableInStripe) {
      const isUpgrade = (PLAN_RANK[plan.plan] ?? 0) > (PLAN_RANK[currentPlan] ?? 0);
      return {
        label: isUpgrade ? `Passer à ${label}` : `Revenir à ${label}`,
        disabled: false,
        action: 'change' as CardAction,
      };
    }

    return { label: `S'abonner à ${label}`, disabled: false, action: 'checkout' as CardAction };
  };

  const handleCheckout = async (plan: MembershipPlan) => {
    setBusy(plan.plan);
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
    } catch (err: any) {
      const body = err?.response?.data;
      if (body?.error === 'SUBSCRIPTION_EXISTS') {
        addToast(body.message || 'Vous avez déjà un abonnement actif.', 'error');
        await fetchPlans();
      } else {
        addToast(body?.message || body?.error || 'Impossible de lancer le paiement.', 'error');
      }
    } finally {
      setBusy(null);
    }
  };

  const handleChangePlan = async (plan: MembershipPlan) => {
    setBusy(plan.plan);
    try {
      const { data } = await api.post('/api/billing/change-plan', {
        plan: plan.plan,
        billingInterval,
      });
      setNotice(data?.data?.message || 'Votre changement de formule a été enregistré.');
      await Promise.all([refreshUser(), fetchPlans()]);
    } catch (err: any) {
      const body = err?.response?.data;
      addToast(body?.message || body?.error || 'Changement de formule impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleResume = async (planId: string) => {
    setBusy(planId);
    try {
      await api.post('/api/billing/resume');
      setNotice('Votre abonnement est réactivé. Il se renouvellera normalement.');
      await Promise.all([refreshUser(), fetchPlans()]);
    } catch (err: any) {
      const body = err?.response?.data;
      addToast(body?.message || body?.error || 'Réactivation impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    setBusy('cancel');
    try {
      const { data } = await api.post('/api/billing/cancel');
      setConfirmCancel(false);
      setNotice(data?.data?.message || "Votre abonnement prendra fin à l'issue de la période en cours.");
      await Promise.all([refreshUser(), fetchPlans()]);
    } catch (err: any) {
      const body = err?.response?.data;
      addToast(body?.message || body?.error || 'Annulation impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handlePortal = async () => {
    setBusy('portal');
    try {
      const { data } = await api.post('/api/billing/customer-portal');
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      addToast('Portail de facturation indisponible.', 'error');
    } catch (err: any) {
      const body = err?.response?.data;
      addToast(body?.message || body?.error || 'Portail de facturation indisponible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const runAction = (plan: MembershipPlan, action: CardAction) => {
    if (action === 'checkout') return handleCheckout(plan);
    if (action === 'change') return handleChangePlan(plan);
    if (action === 'resume') return handleResume(plan.plan);
    return undefined;
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-[fadeIn_0.5s_ease-out] relative">
      {/* Retour de paiement réussi */}
      {paymentStatus === 'success' && (
        <div className="mb-8 p-6 rounded-2xl border border-win/30 bg-win/10 flex flex-col sm:flex-row items-center gap-4">
          <CheckCircle size={32} className="text-win shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-black text-win text-lg">Paiement reçu</p>
            <p className="text-txt-2 text-sm mt-1">
              {isPaidPlan(user?.plan)
                ? 'Votre compte est actif. Redirection vers le dashboard.'
                : 'Votre paiement est en cours de traitement. Votre accès sera débloqué dans quelques instants.'}
            </p>
          </div>
          {isPaidPlan(user?.plan) ? (
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-5 py-2.5 bg-win text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-win/80 transition-all"
            >
              Accéder au Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <Loader2 size={20} className="animate-spin text-win shrink-0" />
          )}
        </div>
      )}

      {paymentStatus === 'canceled' && (
        <div className="mb-8 p-5 rounded-2xl border border-loss/30 bg-loss/10 flex items-center gap-4">
          <XCircle size={28} className="text-loss shrink-0" />
          <p className="text-txt-2 text-sm">
            <span className="font-bold text-loss">Paiement annulé.</span> Vous pouvez réessayer ci-dessous.
          </p>
        </div>
      )}

      {notice && (
        <div className="mb-8 p-5 rounded-2xl border border-accent/30 bg-accent/5 flex items-start gap-4">
          <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
          <p className="text-txt-2 text-sm flex-1">{notice}</p>
          <button onClick={() => setNotice(null)} className="text-txt-3 hover:text-txt text-xs font-bold">
            Fermer
          </button>
        </div>
      )}

      {loadError && (
        <div className="mb-8 p-5 rounded-2xl border border-loss/30 bg-loss/10 flex items-start gap-4">
          <AlertTriangle size={20} className="text-loss shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-loss text-sm">Impossible de charger les formules</p>
            <p className="text-txt-2 text-xs mt-1">
              Le catalogue d'abonnements est momentanément indisponible. Réessayez dans quelques instants.
            </p>
          </div>
          <button
            onClick={() => {
              setIsFetching(true);
              fetchPlans();
            }}
            className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold hover:bg-elevated transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="flex justify-start mb-6">
        <Link
          to="/app/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-semibold bg-surface hover:bg-elevated border border-border text-txt-2 hover:text-txt transition-all shadow-sm"
        >
          <ArrowLeft size={12} />
          Retour au Dashboard
        </Link>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-black mb-4">Votre abonnement</h1>
        <p className="text-txt-2 text-sm max-w-2xl mx-auto">
          Deux formules : Pro pour la plateforme complète, VIP Incubator pour un accompagnement
          individuel avec Wansley Cardichon.
        </p>
      </div>

      {/* État de l'abonnement en cours */}
      {viewer && (
        <div className="glass p-6 rounded-3xl border border-border mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">
                Formule actuelle
              </p>
              <p className="text-xl font-black">{planName(viewer.plan)}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-txt-2">
                {viewer.status && <span>{STATUS_LABELS[viewer.status] || viewer.status}</span>}
                {viewer.billingInterval && <span>Facturation {intervalLabel(viewer.billingInterval).toLowerCase()}</span>}
                {periodEnd && (
                  <span>
                    {viewer.cancelAtPeriodEnd ? "Accès jusqu'au" : 'Prochain renouvellement le'} {periodEnd}
                  </span>
                )}
              </div>
              {viewer.isStaffOverride && (
                <p className="text-xs text-txt-3 mt-2">
                  Accès complet accordé par votre rôle sur la plateforme, sans facturation.
                </p>
              )}
              {viewer.cancelAtPeriodEnd && (
                <p className="text-xs text-loss font-bold mt-2">
                  Annulation programmée. Vous gardez votre accès jusqu'à la fin de la période payée.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {viewer.hasStripeCustomer && (
                <button
                  onClick={handlePortal}
                  disabled={busy !== null}
                  className="px-4 py-2.5 rounded-xl bg-surface border border-border text-sm font-bold flex items-center gap-2 hover:bg-elevated transition-colors disabled:opacity-50"
                >
                  <CreditCard size={16} />
                  {busy === 'portal' ? 'Ouverture...' : 'Factures et moyen de paiement'}
                </button>
              )}
              {viewer.isManageableInStripe && !viewer.cancelAtPeriodEnd && (
                <button
                  onClick={() => setConfirmCancel(true)}
                  disabled={busy !== null}
                  className="px-4 py-2.5 rounded-xl border border-loss/30 text-loss text-sm font-bold hover:bg-loss/10 transition-colors disabled:opacity-50"
                >
                  Annuler mon abonnement
                </button>
              )}
              {viewer.cancelAtPeriodEnd && (
                <button
                  onClick={() => handleResume(viewer.plan)}
                  disabled={busy !== null}
                  className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Reprendre mon abonnement
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sélecteur d'intervalle */}
      {plans.length > 0 && (
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-surface border border-border">
            {([MONTHLY, YEARLY] as BillingInterval[]).map((option) => {
              const active = billingInterval === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectInterval(option)}
                  aria-pressed={active}
                  className={`h-10 px-5 rounded-xl text-sm font-bold transition-all ${
                    active ? 'bg-accent text-white' : 'text-txt-2 hover:text-txt'
                  }`}
                >
                  {intervalLabel(option)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
        {plans.map((plan) => {
          const price = plan.prices[billingInterval];
          const card = resolveCard(plan);
          const isBusy = busy === plan.plan;
          const monthlyEquivalent =
            billingInterval === YEARLY && price.amount !== null ? Math.round(price.amount / 12) : null;

          return (
            <div
              key={plan.plan}
              className={`glass p-8 rounded-[2rem] border transition-all relative flex flex-col ${
                plan.recommended
                  ? 'border-accent shadow-[0_20px_50px_rgba(243,108,0,0.15)]'
                  : 'border-border hover:border-accent/30'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                  Recommandé
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">
                    {price.amount !== null ? formatUsd(price.amount) : 'Sur demande'}
                  </span>
                  {price.amount !== null && (
                    <span className="text-txt-3 text-sm font-bold">{intervalSuffix(billingInterval)}</span>
                  )}
                </div>
                {monthlyEquivalent !== null && (
                  <div className="text-xs text-txt-3 mt-1">soit {formatUsd(monthlyEquivalent)} par mois</div>
                )}
                {price.amount !== null && rate > 0 && (
                  <div className="text-xs font-bold text-accent mt-1">
                    ≈ {formatHtg(price.amount, rate)} {intervalSuffix(billingInterval)}
                  </div>
                )}
                {billingInterval === YEARLY && plan.yearlySaving && (
                  <div className="text-xs text-txt-3 mt-1">
                    {formatUsd(plan.yearlySaving.savingAmount)} économisés sur douze mois
                  </div>
                )}
                <p className="text-xs text-txt-2 mt-4 leading-relaxed">{plan.tagline}</p>
              </div>

              {plan.inherits && (
                <div className="mb-6 rounded-2xl bg-bg/50 border border-border/60 px-4 py-3 text-xs text-txt-2">
                  Tout ce que contient le plan Pro est inclus.
                </div>
              )}

              <div className="space-y-6 mb-10 flex-1">
                {plan.featureGroups.map((group) => (
                  <div key={group.title}>
                    {group.title && (
                      <p className="text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-3">
                        {group.title}
                      </p>
                    )}
                    <div className="space-y-2.5">
                      {group.items.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-win/10 text-win">
                            <Check size={10} strokeWidth={4} />
                          </div>
                          <span className="text-xs text-txt-2 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => runAction(plan, card.action)}
                disabled={card.disabled || busy !== null}
                className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  card.disabled
                    ? 'bg-elevated text-txt-3 cursor-default'
                    : plan.recommended
                      ? 'bg-accent text-white shadow-xl hover:opacity-90'
                      : 'bg-surface border border-border hover:border-accent/50'
                }`}
              >
                {isBusy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    {card.label}
                    {!card.disabled && <ArrowRight size={18} />}
                  </>
                )}
              </button>

              {card.action === 'change' && (
                <p className="text-[11px] text-txt-3 mt-3 leading-relaxed">
                  Une montée de formule est effective immédiatement (Stripe calcule la différence au
                  prorata). Une baisse prend effet à la fin de la période déjà payée.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-16 glass p-8 rounded-3xl border border-border flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-2xl bg-win/10 text-win flex items-center justify-center shrink-0">
          <Shield size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-lg mb-1">Paiement sécurisé via Stripe</h4>
          <p className="text-xs text-txt-2 leading-relaxed">
            Vos informations de paiement sont traitées par Stripe. Vous pouvez annuler votre
            abonnement à tout moment depuis cette page. Aucune donnée bancaire n'est stockée sur nos
            serveurs.
          </p>
        </div>
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface border border-border p-8 rounded-3xl w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <h3 className="text-xl font-black mb-4">Annuler votre abonnement</h3>
            <p className="text-txt-2 text-sm mb-6 leading-relaxed">
              Votre accès reste complet jusqu'à la fin de la période déjà payée
              {periodEnd ? ` (${periodEnd})` : ''}. Votre journal et vos données sont conservés.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={busy === 'cancel'}
                className="flex-1 py-3 rounded-2xl font-bold bg-elevated hover:bg-border transition-colors text-sm disabled:opacity-50"
              >
                Garder mon abonnement
              </button>
              <button
                onClick={handleCancel}
                disabled={busy === 'cancel'}
                className="flex-1 py-3 rounded-2xl font-bold bg-loss text-white hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
              >
                {busy === 'cancel' ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
