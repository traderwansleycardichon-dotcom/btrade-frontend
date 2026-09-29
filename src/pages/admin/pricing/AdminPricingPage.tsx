import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Copy, CheckCircle, AlertTriangle, History, Loader2 } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { useSettings } from '../../../contexts/SettingsContext';
import {
  BillingInterval,
  MONTHLY,
  YEARLY,
  formatHtg,
  formatUsd,
  intervalLabel,
  intervalSuffix,
} from '../../../lib/membership';

interface StripeEntry {
  priceId: string | null;
  source: 'env' | 'database' | 'legacy' | null;
  available: boolean;
  amount: number | null;
  currency: string | null;
}

interface ListPrice {
  amount: number | null;
  currency: string;
}

interface AdminMembership {
  plan: string;
  name: string;
  listPrices: Record<BillingInterval, ListPrice>;
  yearlySaving: { savingAmount: number; savingPercent: number } | null;
  stripe: Record<BillingInterval, StripeEntry>;
}

interface PriceHistoryRow {
  id: string;
  priceId: string;
  amount: number;
  currency: string;
  plan: string | null;
  interval: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Variables d'environnement qui ont priorité sur le prix enregistré en base. */
const PRICE_ENV_KEYS: Record<string, Record<BillingInterval, string>> = {
  pro: {
    MONTHLY: 'STRIPE_PRO_MONTHLY_PRICE_ID',
    YEARLY: 'STRIPE_PRO_YEARLY_PRICE_ID',
  },
  vip_incubator: {
    MONTHLY: 'STRIPE_VIP_MONTHLY_PRICE_ID',
    YEARLY: 'STRIPE_VIP_YEARLY_PRICE_ID',
  },
};

const SOURCE_LABELS: Record<string, string> = {
  env: "Variable d'environnement",
  database: 'Enregistré via ce panel',
  legacy: 'Prix historique (repli)',
};

const INTERVALS: BillingInterval[] = [MONTHLY, YEARLY];

interface EditTarget {
  plan: string;
  name: string;
  billingInterval: BillingInterval;
  currentAmount: number | null;
  currency: string;
  source: StripeEntry['source'];
}

export default function AdminPricingPage() {
  const [memberships, setMemberships] = useState<AdminMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [priceAlert, setPriceAlert] = useState<{
    priceId: string;
    note: string;
    envKey: string | null;
    copied: boolean;
  } | null>(null);
  const [history, setHistory] = useState<PriceHistoryRow[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { addToast } = useToast();
  const { settings } = useSettings();

  const rate = Number(settings?.USD_TO_HTG_RATE) || 0;

  const fetchPricing = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/pricing');
      const list = Array.isArray(data?.data?.memberships) ? data.data.memberships : [];
      if (list.length === 0) {
        setLoadError("Le catalogue d'abonnements est vide ou dans un format inattendu.");
        setMemberships([]);
        return;
      }
      setMemberships(list);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err?.response?.data?.error || 'Erreur lors du chargement des formules.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const toggleHistory = async () => {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && history === null) {
      setHistoryLoading(true);
      try {
        const { data } = await api.get('/api/admin/pricing/stripe-prices');
        setHistory(Array.isArray(data?.data) ? data.data : []);
      } catch (err: any) {
        addToast(err?.response?.data?.error || "Historique des prix indisponible", 'error');
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    }
  };

  const openEditor = (membership: AdminMembership, billingInterval: BillingInterval) => {
    const entry = membership.stripe[billingInterval];
    const listed = membership.listPrices?.[billingInterval];
    setEditing({
      plan: membership.plan,
      name: membership.name,
      billingInterval,
      currentAmount: entry?.amount ?? listed?.amount ?? null,
      currency: entry?.currency || listed?.currency || 'usd',
      source: entry?.source ?? null,
    });
    setNewPrice(entry?.amount != null ? String(entry.amount) : listed?.amount != null ? String(listed.amount) : '');
  };

  const handleSave = async () => {
    if (!editing) return;
    const amount = Number(newPrice);
    if (!newPrice || !Number.isFinite(amount) || amount <= 0) {
      addToast('Veuillez entrer un prix valide.', 'error');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put(`/api/admin/pricing/${editing.plan}/price`, {
        newPrice: amount,
        billingInterval: editing.billingInterval,
        currency: editing.currency,
      });

      const result = data?.data;
      setEditing(null);
      await fetchPricing();
      setHistory(null);

      if (result?.stripePriceId) {
        setPriceAlert({
          priceId: result.stripePriceId,
          note: result.note || '',
          // Une variable d'environnement a priorité sur la base : sans mise à jour, le
          // nouveau prix ne sera jamais facturé.
          envKey: editing.source === 'env' ? PRICE_ENV_KEYS[editing.plan]?.[editing.billingInterval] || null : null,
          copied: false,
        });
      } else {
        addToast('Prix mis à jour.');
      }
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Erreur lors de la mise à jour du prix.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-2">Plans Tarifaires</h1>
        <p className="text-txt-2 text-sm">
          Deux formules, deux intervalles de facturation. Le prix catalogue est celui affiché sur le
          site. Le prix Stripe est celui réellement facturé aux nouveaux abonnés : les abonnements en
          cours conservent le tarif signé.
        </p>
      </div>

      {priceAlert && (
        <div className="glass p-5 rounded-2xl border border-accent/40 bg-accent/5">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-accent text-sm">Nouveau prix Stripe créé</p>
              {priceAlert.note && <p className="text-txt-2 text-xs mt-1">{priceAlert.note}</p>}
              {priceAlert.envKey && (
                <p className="text-txt-2 text-xs mt-2">
                  Action requise : ce couple plan/intervalle est actuellement résolu par la variable{' '}
                  <code className="bg-elevated px-1 rounded text-accent font-mono">{priceAlert.envKey}</code>,
                  qui a priorité sur ce panel. Mettez-la à jour avec ce nouveau Price ID (ou supprimez-la)
                  puis redémarrez le serveur, sinon l'ancien prix continuera d'être facturé.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-elevated rounded-xl px-4 py-3">
            <code className="font-mono text-sm text-win flex-1 select-all break-all">{priceAlert.priceId}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(priceAlert.priceId);
                setPriceAlert((prev) => (prev ? { ...prev, copied: true } : null));
                setTimeout(() => setPriceAlert((prev) => (prev ? { ...prev, copied: false } : null)), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
            >
              {priceAlert.copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              {priceAlert.copied ? 'Copié' : 'Copier'}
            </button>
            <button
              onClick={() => setPriceAlert(null)}
              className="text-txt-3 hover:text-txt text-xs font-bold shrink-0"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {loadError && (
        <div className="glass p-5 rounded-2xl border border-loss/30 bg-loss/10 flex items-start gap-3">
          <AlertTriangle size={20} className="text-loss shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-loss text-sm">{loadError}</p>
            <p className="text-txt-2 text-xs mt-1">
              Vérifiez que l'API admin répond sur GET /api/admin/pricing.
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchPricing();
            }}
            className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold hover:bg-elevated transition-colors shrink-0"
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-txt-3 py-10">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {memberships.map((membership) => (
            <div key={membership.plan} className="glass rounded-3xl p-6 border border-border">
              <div className="mb-6">
                <h3 className="font-bold text-lg">{membership.name}</h3>
                <p className="text-[11px] text-txt-3 font-mono mt-1">{membership.plan}</p>
              </div>

              <div className="space-y-4">
                {INTERVALS.map((billingInterval) => {
                  const listed = membership.listPrices?.[billingInterval];
                  const entry = membership.stripe?.[billingInterval];
                  const mismatch =
                    listed?.amount != null && entry?.amount != null && listed.amount !== entry.amount;

                  return (
                    <div key={billingInterval} className="rounded-2xl border border-border/60 bg-bg/40 p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">
                            {intervalLabel(billingInterval)}
                          </p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-black">
                              {listed?.amount != null ? formatUsd(listed.amount) : 'Non défini'}
                            </span>
                            {listed?.amount != null && (
                              <span className="text-xs font-bold text-txt-3">
                                {intervalSuffix(billingInterval)}
                              </span>
                            )}
                          </div>
                          {listed?.amount != null && rate > 0 && (
                            <p className="text-[11px] font-bold text-accent mt-0.5">
                              ≈ {formatHtg(listed.amount, rate)} {intervalSuffix(billingInterval)}
                            </p>
                          )}
                          <p className="text-[10px] text-txt-3 mt-1">Prix catalogue affiché sur le site</p>
                        </div>

                        <button
                          onClick={() => openEditor(membership, billingInterval)}
                          className="px-3 py-2 rounded-xl bg-surface hover:bg-elevated text-txt border border-border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <Edit2 size={13} />
                          Prix Stripe
                        </button>
                      </div>

                      <div className="border-t border-border/60 pt-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] text-txt-2">Prix Stripe facturé</span>
                          <span className="text-[11px] font-bold">
                            {entry?.amount != null
                              ? `${formatUsd(entry.amount)} ${(entry.currency || 'usd').toUpperCase()}`
                              : 'Non enregistré ici'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] text-txt-2">Disponible à la vente</span>
                          <span
                            className={`text-[11px] font-bold ${entry?.available ? 'text-win' : 'text-loss'}`}
                          >
                            {entry?.available ? 'Oui' : 'Non configuré'}
                          </span>
                        </div>
                        {entry?.source && (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] text-txt-2">Source</span>
                            <span className="text-[11px] font-bold">
                              {SOURCE_LABELS[entry.source] || entry.source}
                            </span>
                          </div>
                        )}
                        {entry?.priceId && (
                          <p className="text-[10px] font-mono text-txt-3 break-all pt-1">{entry.priceId}</p>
                        )}

                        {mismatch && (
                          <p className="text-[11px] text-loss font-bold pt-1">
                            Le prix Stripe diffère du prix catalogue. Le site annonce{' '}
                            {formatUsd(listed!.amount!)} alors que Stripe facture {formatUsd(entry!.amount!)}.
                          </p>
                        )}
                        {entry?.source === 'legacy' && (
                          <p className="text-[11px] text-txt-2 pt-1">
                            Aucun prix dédié pour ce couple : repli sur un prix historique. Enregistrez un
                            prix pour lever l'ambiguïté.
                          </p>
                        )}
                        {!entry?.available && (
                          <p className="text-[11px] text-txt-2 pt-1">
                            Renseignez{' '}
                            <code className="bg-elevated px-1 rounded font-mono">
                              {PRICE_ENV_KEYS[membership.plan]?.[billingInterval] || 'la variable Stripe'}
                            </code>{' '}
                            ou créez le prix depuis ce panel pour pouvoir vendre cette option.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {membership.yearlySaving && (
                <p className="text-[11px] text-txt-2 mt-4">
                  Économie annoncée sur l'année : {formatUsd(membership.yearlySaving.savingAmount)} (
                  {membership.yearlySaving.savingPercent}%)
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="glass rounded-3xl border border-border overflow-hidden">
        <button
          onClick={toggleHistory}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-elevated/50 transition-colors"
        >
          <span className="flex items-center gap-2 font-bold text-sm">
            <History size={16} className="text-txt-2" />
            Historique des prix Stripe
          </span>
          <span className="text-xs text-txt-3 font-bold">{historyOpen ? 'Masquer' : 'Afficher'}</span>
        </button>

        {historyOpen && (
          <div className="border-t border-border px-6 py-5">
            {historyLoading ? (
              <div className="flex items-center gap-2 text-txt-3 text-sm">
                <Loader2 size={14} className="animate-spin" />
                Chargement...
              </div>
            ) : history && history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-txt-3 uppercase tracking-widest text-[10px]">
                      <th className="pb-3 pr-4 font-bold">Price ID</th>
                      <th className="pb-3 pr-4 font-bold">Formule</th>
                      <th className="pb-3 pr-4 font-bold">Intervalle</th>
                      <th className="pb-3 pr-4 font-bold">Montant</th>
                      <th className="pb-3 pr-4 font-bold">Statut</th>
                      <th className="pb-3 font-bold">Créé le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {history.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-4 font-mono text-[11px] break-all">{row.priceId}</td>
                        <td className="py-3 pr-4">{row.plan || 'non attribué'}</td>
                        <td className="py-3 pr-4">{row.interval || 'non attribué'}</td>
                        <td className="py-3 pr-4 font-bold">
                          {formatUsd(row.amount)} {row.currency?.toUpperCase()}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={row.isActive ? 'text-win font-bold' : 'text-txt-3'}>
                            {row.isActive ? 'Actif' : 'Retiré'}
                          </span>
                        </td>
                        <td className="py-3 text-txt-2">
                          {new Date(row.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-txt-3 text-sm">Aucun prix enregistré pour le moment.</p>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-md animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold mb-2">
              {editing.name} : prix {intervalLabel(editing.billingInterval).toLowerCase()}
            </h3>
            <p className="text-sm text-txt-2 mb-6 leading-relaxed">
              Les prix Stripe sont immuables : un nouveau prix sera créé et proposé aux nouveaux
              abonnés. Personne n'est refacturé, les abonnements en cours gardent leur tarif.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">
                  Nouveau prix {intervalSuffix(editing.billingInterval)} ({editing.currency.toUpperCase()})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-txt-2">$</span>
                  </div>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="119"
                    step="0.01"
                    min="1"
                  />
                </div>
                {editing.currentAmount != null && (
                  <p className="text-[11px] text-txt-3 mt-2">
                    Prix actuel : {formatUsd(editing.currentAmount)}
                  </p>
                )}
              </div>

              {editing.source === 'env' && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-[11px] text-txt-2">
                  Ce couple est résolu par{' '}
                  <code className="bg-elevated px-1 rounded font-mono text-accent">
                    {PRICE_ENV_KEYS[editing.plan]?.[editing.billingInterval]}
                  </code>
                  . Après création, mettez cette variable à jour (ou supprimez-la) pour que le nouveau
                  prix soit réellement utilisé.
                </div>
              )}

              <div className="rounded-xl border border-border bg-bg/50 p-4 text-[11px] text-txt-2">
                Le prix affiché sur le site vient du catalogue serveur
                (core/config/membership.js). Si vous changez le prix Stripe, alignez aussi le catalogue,
                sinon le site annoncera un montant différent de celui facturé.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-elevated hover:bg-border transition-colors text-txt"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold bg-accent hover:opacity-90 transition-opacity text-white flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Création...' : 'Créer le nouveau prix'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
