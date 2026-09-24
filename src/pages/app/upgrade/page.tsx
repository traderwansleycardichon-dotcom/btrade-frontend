import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { useSettings } from '../../../contexts/SettingsContext';
import { usePlans } from '../../../hooks/usePlans';
import {
  BILLING_INTERVALS,
  INTERVAL_LABEL,
  INTERVAL_SUFFIX,
  annualSavings,
  formatUsd,
  supportsOffer,
  type Plan,
} from '../../../lib/pricing';
import type { BillingInterval, MembershipStatus, PaymentProvider, Tier } from '../../../hooks/useAuth';

interface PaymentRow {
  id: string;
  provider: PaymentProvider;
  tier: Tier | null;
  billingInterval: BillingInterval | null;
  amount: string | number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface SubscriptionView {
  membership: {
    active: boolean;
    tier: Tier | null;
    billingInterval: BillingInterval | null;
    provider: PaymentProvider | null;
    status: MembershipStatus | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    entitlements: string[];
  };
  actions: {
    canUpgradeToVip: boolean;
    canChangeInterval: boolean;
    canCancel: boolean;
    canResume: boolean;
    canRenew: boolean;
    managedExternally: boolean;
  };
  payments: PaymentRow[];
}

const STATUS_LABEL: Record<MembershipStatus, string> = {
  ACTIVE: 'Active',
  PENDING: 'En attente de paiement',
  PAST_DUE: 'Paiement en échec',
  CANCELED: 'Résiliée, active jusqu\'à l\'échéance',
  EXPIRED: 'Expirée',
};

const PROVIDER_LABEL: Record<PaymentProvider, string> = {
  STRIPE: 'Carte bancaire',
  BAZIK: 'MonCash',
  MANUAL: 'Accès accordé par l\'équipe',
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  SUCCEEDED: 'Réglé',
  PENDING: 'En attente',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
};

function formatDate(value: string | null | undefined): string {
  if (!value) return 'non applicable';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function UpgradePage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const { plans, paymentMethods, loading: plansLoading, error: plansError } = usePlans();

  const [view, setView] = useState<SubscriptionView | null>(null);
  const [loadingView, setLoadingView] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('ANNUAL');
  const [gatewayFor, setGatewayFor] = useState<Plan | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentStatus = searchParams.get('payment');

  const loadSubscription = async () => {
    try {
      const { data } = await api.get('/api/billing/subscription');
      setView(data.data);
      if (data.data?.membership?.billingInterval) {
        setBillingInterval(data.data.membership.billingInterval);
      }
    } catch {
      setView(null);
    } finally {
      setLoadingView(false);
    }
  };

  useEffect(() => {
    loadSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Retour de la passerelle : l'activation dépend du webhook, pas de cette
   * redirection. On interroge le backend jusqu'à ce qu'il confirme, sans
   * jamais supposer que le paiement est passé.
   */
  useEffect(() => {
    if (paymentStatus !== 'success') return;

    let attempts = 0;
    const tick = async () => {
      attempts += 1;
      await refreshUser();
      await loadSubscription();
      if (attempts >= 10 && pollingRef.current) clearInterval(pollingRef.current);
    };

    tick();
    pollingRef.current = setInterval(tick, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  useEffect(() => {
    if (paymentStatus === 'success' && view?.membership.active) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      const timer = setTimeout(() => navigate('/app/dashboard'), 2500);
      return () => clearTimeout(timer);
    }
  }, [view?.membership.active, paymentStatus, navigate]);

  const startCheckout = async (plan: Plan, gateway: 'stripe' | 'moncash') => {
    setBusy(plan.tier);
    setGatewayFor(null);
    setNotice(null);
    try {
      const url =
        gateway === 'moncash'
          ? '/api/billing/create-moncash-session'
          : '/api/billing/create-checkout-session';
      const res = await api.post(url, { tier: plan.tier, billingInterval });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      setNotice({ tone: 'error', text: 'Réponse de paiement invalide.' });
    } catch (err: any) {
      setNotice({
        tone: 'error',
        text:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Impossible de lancer le paiement.',
      });
    } finally {
      setBusy(null);
    }
  };

  const changeOffer = async (tier: Tier, interval: BillingInterval) => {
    setBusy(`change-${tier}-${interval}`);
    setNotice(null);
    try {
      const res = await api.post('/api/billing/subscription/change', {
        tier,
        billingInterval: interval,
      });
      setNotice({ tone: 'ok', text: res.data?.data?.message || 'Modification enregistrée.' });
      await loadSubscription();
      await refreshUser();
    } catch (err: any) {
      setNotice({
        tone: 'error',
        text: err?.response?.data?.message || 'Modification impossible.',
      });
    } finally {
      setBusy(null);
    }
  };

  const runAction = async (path: string, label: string) => {
    setBusy(path);
    setNotice(null);
    try {
      const res = await api.post(path);
      setNotice({ tone: 'ok', text: res.data?.data?.message || label });
      await loadSubscription();
      await refreshUser();
    } catch (err: any) {
      setNotice({
        tone: 'error',
        text: err?.response?.data?.message || 'Action impossible pour le moment.',
      });
    } finally {
      setBusy(null);
    }
  };

  const openPortal = async () => {
    setBusy('portal');
    try {
      const res = await api.post('/api/billing/customer-portal');
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err: any) {
      setNotice({
        tone: 'error',
        text: err?.response?.data?.message || 'Portail de facturation indisponible.',
      });
    } finally {
      setBusy(null);
    }
  };

  const rate = settings?.USD_TO_HTG_RATE ? Number(settings.USD_TO_HTG_RATE) : null;
  const membership = view?.membership;
  const actions = view?.actions;

  if (loadingView || plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Link
        to="/app/dashboard"
        className="inline-flex items-center gap-2 text-sm text-txt-2 hover:text-txt mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour au tableau de bord
      </Link>

      {paymentStatus === 'success' && (
        <div className="mb-8 p-6 rounded-2xl border border-win/30 bg-win/10 flex items-center gap-4">
          <CheckCircle size={32} className="text-win shrink-0" />
          <div>
            <p className="font-black text-win text-lg">Paiement reçu</p>
            <p className="text-txt-2 text-sm mt-1">
              {membership?.active
                ? 'Votre adhésion est active. Redirection en cours.'
                : 'Nous confirmons le paiement auprès de la passerelle. Cela prend quelques secondes.'}
            </p>
          </div>
        </div>
      )}

      {paymentStatus === 'canceled' && (
        <div className="mb-8 p-6 rounded-2xl border border-loss/30 bg-loss/10 flex items-center gap-4">
          <XCircle size={32} className="text-loss shrink-0" />
          <div>
            <p className="font-black text-loss text-lg">Paiement annulé</p>
            <p className="text-txt-2 text-sm mt-1">Aucun montant n'a été débité.</p>
          </div>
        </div>
      )}

      {notice && (
        <div
          className={`mb-8 p-4 rounded-xl border flex items-start gap-3 ${
            notice.tone === 'ok'
              ? 'border-win/30 bg-win/10 text-win'
              : 'border-loss/30 bg-loss/10 text-loss'
          }`}
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{notice.text}</p>
        </div>
      )}

      {/* ── Adhésion courante ── */}
      <section className="mb-12 rounded-2xl border border-border bg-bg-2 p-8">
        <h1 className="text-2xl font-black text-txt mb-6">Votre adhésion</h1>

        {membership?.active ? (
          <>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <dt className="text-xs uppercase tracking-wider text-txt-2 mb-1">Palier</dt>
                <dd className="text-lg font-bold text-accent">
                  {membership.tier === 'VIP' ? 'VIP Incubator' : 'Pro'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-txt-2 mb-1">Facturation</dt>
                <dd className="text-lg font-bold text-txt">
                  {membership.billingInterval
                    ? INTERVAL_LABEL[membership.billingInterval]
                    : 'non applicable'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-txt-2 mb-1">Statut</dt>
                <dd className="text-lg font-bold text-txt">
                  {membership.status ? STATUS_LABEL[membership.status] : 'inconnu'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-txt-2 mb-1">
                  {membership.cancelAtPeriodEnd ? 'Accès jusqu\'au' : 'Prochain renouvellement'}
                </dt>
                <dd className="text-lg font-bold text-txt">
                  {formatDate(membership.currentPeriodEnd)}
                </dd>
              </div>
            </dl>

            <p className="text-sm text-txt-2 mb-6">
              Moyen de paiement :{' '}
              {membership.provider ? PROVIDER_LABEL[membership.provider] : 'non renseigné'}
            </p>

            <div className="flex flex-wrap gap-3">
              {actions?.canUpgradeToVip && (
                <button
                  type="button"
                  onClick={() => changeOffer('VIP', membership.billingInterval || 'ANNUAL')}
                  disabled={!!busy}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-accent hover:bg-accent-2 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  <Sparkles size={15} />
                  Passer au VIP Incubator
                </button>
              )}

              {actions?.canChangeInterval && membership.tier && (
                <button
                  type="button"
                  onClick={() =>
                    changeOffer(
                      membership.tier as Tier,
                      membership.billingInterval === 'ANNUAL' ? 'MONTHLY' : 'ANNUAL'
                    )
                  }
                  disabled={!!busy}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border text-txt text-sm font-semibold hover:bg-bg-3 disabled:opacity-50 transition-colors"
                >
                  Passer à la facturation{' '}
                  {membership.billingInterval === 'ANNUAL' ? 'mensuelle' : 'annuelle'}
                </button>
              )}

              {actions?.canResume && (
                <button
                  type="button"
                  onClick={() => runAction('/api/billing/subscription/resume', 'Renouvellement réactivé.')}
                  disabled={!!busy}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border text-txt text-sm font-semibold hover:bg-bg-3 disabled:opacity-50 transition-colors"
                >
                  Réactiver le renouvellement
                </button>
              )}

              {actions?.managedExternally && (
                <button
                  type="button"
                  onClick={openPortal}
                  disabled={!!busy}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border text-txt text-sm font-semibold hover:bg-bg-3 disabled:opacity-50 transition-colors"
                >
                  <CreditCard size={15} />
                  Gérer ma carte
                </button>
              )}

              {actions?.canCancel && (
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      '/api/billing/subscription/cancel',
                      'Résiliation enregistrée pour la fin de la période.'
                    )
                  }
                  disabled={!!busy}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-txt-2 text-sm font-medium hover:text-loss disabled:opacity-50 transition-colors"
                >
                  Résilier
                </button>
              )}
            </div>

            {membership.cancelAtPeriodEnd && (
              <p className="mt-5 text-sm text-txt-2">
                Votre adhésion est résiliée mais reste pleinement active jusqu'au{' '}
                {formatDate(membership.currentPeriodEnd)}. Rien ne vous sera facturé ensuite.
              </p>
            )}
          </>
        ) : (
          <p className="text-txt-2">
            {membership?.status === 'EXPIRED' || membership?.status === 'PAST_DUE'
              ? 'Votre adhésion n\'est plus active. Choisissez une offre ci-dessous pour retrouver votre accès.'
              : 'Vous n\'avez pas encore d\'adhésion. Choisissez une offre ci-dessous.'}
          </p>
        )}
      </section>

      {/* ── Offres ── */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-xl font-black text-txt">Nos offres</h2>
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-bg-2 p-1 self-start">
            {BILLING_INTERVALS.map((interval) => (
              <button
                key={interval}
                type="button"
                onClick={() => setBillingInterval(interval)}
                aria-pressed={billingInterval === interval}
                className={`px-4 h-9 rounded-lg text-[13px] font-semibold transition-colors ${
                  billingInterval === interval
                    ? 'bg-accent text-white'
                    : 'text-txt-2 hover:text-txt'
                }`}
              >
                {INTERVAL_LABEL[interval]}
              </button>
            ))}
          </div>
        </div>

        {plansError && <p className="text-txt-2">{plansError}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const price = plan.pricing[billingInterval]?.amount ?? 0;
            const savings = annualSavings(plan);
            const isCurrent =
              membership?.active &&
              membership.tier === plan.tier &&
              membership.billingInterval === billingInterval;

            return (
              <article
                key={plan.tier}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.recommended ? 'border-accent/40 bg-accent/[0.03]' : 'border-border bg-bg-2'
                }`}
              >
                <h3 className="text-lg font-black text-txt mb-2">{plan.name}</h3>
                <p className="text-[13px] text-txt-2 leading-relaxed min-h-[56px] mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-txt tabular-nums">
                      {formatUsd(price)}
                    </span>
                    <span className="text-txt-2 text-sm">{INTERVAL_SUFFIX[billingInterval]}</span>
                  </div>
                  {billingInterval === 'ANNUAL' && savings && (
                    <p className="text-xs font-semibold text-win mt-2">
                      Vous économisez {formatUsd(savings.amount)} par an ({savings.percent} pour cent)
                    </p>
                  )}
                  {rate && price > 0 && (
                    <p className="text-xs text-txt-2 mt-1 tabular-nums">
                      environ {Math.ceil(price * rate).toLocaleString('fr-FR')} HTG{' '}
                      {INTERVAL_SUFFIX[billingInterval]}
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-txt-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setGatewayFor(plan)}
                  disabled={isCurrent || !!busy}
                  className={`inline-flex items-center justify-center gap-2 h-12 w-full rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.recommended
                      ? 'bg-accent hover:bg-accent-2 text-white'
                      : 'border border-border text-txt hover:bg-bg-3'
                  }`}
                >
                  {busy === plan.tier ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Redirection
                    </>
                  ) : isCurrent ? (
                    'Votre offre actuelle'
                  ) : (
                    <>
                      Choisir cette offre
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Historique de paiements ── */}
      <section>
        <h2 className="text-xl font-black text-txt mb-6">Historique de paiements</h2>

        {view?.payments?.length ? (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg-2 text-txt-2">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Date</th>
                  <th className="text-left font-semibold px-5 py-3">Offre</th>
                  <th className="text-left font-semibold px-5 py-3">Moyen</th>
                  <th className="text-right font-semibold px-5 py-3">Montant</th>
                  <th className="text-left font-semibold px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {view.payments.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-5 py-3 text-txt-2 whitespace-nowrap">
                      {formatDate(p.paidAt || p.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-txt">
                      {p.tier || 'non renseigné'}
                      {p.billingInterval ? ` ${INTERVAL_LABEL[p.billingInterval]}` : ''}
                    </td>
                    <td className="px-5 py-3 text-txt-2">{PROVIDER_LABEL[p.provider]}</td>
                    <td className="px-5 py-3 text-right text-txt tabular-nums whitespace-nowrap">
                      {formatUsd(Number(p.amount))}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          p.status === 'SUCCEEDED'
                            ? 'text-win'
                            : p.status === 'FAILED'
                              ? 'text-loss'
                              : 'text-txt-2'
                        }
                      >
                        {PAYMENT_STATUS_LABEL[p.status] || p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-txt-2 text-sm">Aucun paiement enregistré pour le moment.</p>
        )}
      </section>

      {/* ── Choix de la passerelle ── */}
      {gatewayFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setGatewayFor(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg-2 p-8">
            <h3 className="text-xl font-black text-txt mb-2 text-center">Mode de paiement</h3>
            <p className="text-sm text-txt-2 text-center mb-8">
              {gatewayFor.name}, facturation {INTERVAL_LABEL[billingInterval].toLowerCase()} à{' '}
              {formatUsd(gatewayFor.pricing[billingInterval].amount)}.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => startCheckout(gatewayFor, 'stripe')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/40 hover:bg-bg-3 transition-colors text-left"
              >
                <CreditCard size={20} className="text-accent shrink-0" />
                <div>
                  <div className="font-semibold text-txt">Carte bancaire</div>
                  <div className="text-xs text-txt-2">Paiement sécurisé via Stripe, en USD</div>
                </div>
              </button>

              {supportsOffer(paymentMethods, 'moncash', gatewayFor.tier, billingInterval) ? (
                <button
                  type="button"
                  onClick={() => startCheckout(gatewayFor, 'moncash')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/40 hover:bg-bg-3 transition-colors text-left"
                >
                  <Smartphone size={20} className="text-accent shrink-0" />
                  <div>
                    <div className="font-semibold text-txt">MonCash</div>
                    <div className="text-xs text-txt-2">Paiement mobile en HTG</div>
                  </div>
                </button>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-bg-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-txt-2" />
                  <div>
                    <div className="text-sm font-semibold text-txt">
                      MonCash indisponible pour cette offre
                    </div>
                    <div className="text-xs text-txt-2 mt-1 leading-relaxed">
                      MonCash limite chaque paiement à 75 000 HTG. Choisissez la facturation
                      mensuelle, ou réglez par carte.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setGatewayFor(null)}
              className="mt-6 w-full py-3 rounded-xl text-sm font-medium text-txt-2 hover:text-txt transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
