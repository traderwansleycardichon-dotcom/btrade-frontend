import React, { useCallback, useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import {
  BillingInterval,
  MONTHLY,
  YEARLY,
  formatUsd,
  intervalLabel,
  intervalSuffix,
  shortName,
} from '../../lib/membership';

interface StripeEntry {
  priceId: string | null;
  source: string | null;
  available: boolean;
  amount: number | null;
  currency: string | null;
}

interface AdminMembership {
  plan: string;
  name: string;
  listPrices: Record<BillingInterval, { amount: number | null; currency: string }>;
  stripe: Record<BillingInterval, StripeEntry>;
}

const INTERVALS: BillingInterval[] = [MONTHLY, YEARLY];

interface EditTarget {
  plan: string;
  name: string;
  billingInterval: BillingInterval;
  currency: string;
}

export const AdminQuickPricing = () => {
  const [memberships, setMemberships] = useState<AdminMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchPricing = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/pricing');
      setMemberships(Array.isArray(data?.data?.memberships) ? data.data.memberships : []);
    } catch (err: any) {
      addToast('Erreur lors du chargement des formules', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const openEditor = (membership: AdminMembership, billingInterval: BillingInterval) => {
    const entry = membership.stripe?.[billingInterval];
    const listed = membership.listPrices?.[billingInterval];
    setEditing({
      plan: membership.plan,
      name: membership.name,
      billingInterval,
      currency: entry?.currency || listed?.currency || 'usd',
    });
    setNewPrice(entry?.amount != null ? String(entry.amount) : listed?.amount != null ? String(listed.amount) : '');
  };

  const handleSave = async () => {
    if (!editing) return;
    const amount = Number(newPrice);
    if (!newPrice || !Number.isFinite(amount) || amount <= 0) {
      addToast('Veuillez entrer un prix valide', 'error');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put(`/api/admin/pricing/${editing.plan}/price`, {
        newPrice: amount,
        billingInterval: editing.billingInterval,
        currency: editing.currency,
      });
      addToast(data?.data?.note || 'Nouveau prix Stripe créé pour les prochains abonnés.');
      setEditing(null);
      await fetchPricing();
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Erreur lors de la mise à jour du prix', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="glass p-6 rounded-3xl animate-pulse h-32" />;
  }

  return (
    <div className="glass p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg">Contrôle Rapide des Prix</h3>
          <p className="text-txt-2 text-xs">
            Prix Stripe facturé aux nouveaux abonnés, par formule et par intervalle
          </p>
        </div>
      </div>

      {memberships.length === 0 ? (
        <p className="text-txt-3 text-sm">Aucune formule à afficher.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberships.map((membership) =>
            INTERVALS.map((billingInterval) => {
              const entry = membership.stripe?.[billingInterval];
              const listed = membership.listPrices?.[billingInterval];
              const amount = entry?.amount ?? listed?.amount ?? null;

              return (
                <div
                  key={`${membership.plan}-${billingInterval}`}
                  className="flex items-center justify-between p-4 bg-bg/50 border border-border/50 rounded-2xl hover:border-accent/30 transition-all"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">
                      {shortName(membership.name)} · {intervalLabel(billingInterval)}
                    </p>
                    <p className="text-xs text-txt-2 font-bold">
                      {amount != null ? `${formatUsd(amount)} ${intervalSuffix(billingInterval)}` : 'Prix non configuré'}
                    </p>
                    {!entry?.available && (
                      <p className="text-[10px] text-loss font-bold mt-0.5">Pas encore vendable</p>
                    )}
                  </div>

                  <button
                    onClick={() => openEditor(membership, billingInterval)}
                    className="p-2 rounded-xl border border-border hover:bg-elevated text-txt transition-colors flex items-center justify-center shrink-0"
                    title="Modifier le prix Stripe"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm animate-[scaleIn_0.2s_ease-out]">
            <h3 className="font-bold mb-2 text-center">
              {shortName(editing.name)} · {intervalLabel(editing.billingInterval)}
            </h3>
            <p className="text-[11px] text-txt-2 text-center mb-5 leading-relaxed">
              Un nouveau prix Stripe sera créé pour les prochains abonnés. Les abonnements en cours
              gardent leur tarif.
            </p>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-txt-2 font-bold">$</span>
              </div>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-3 font-bold focus:outline-none focus:border-accent transition-colors"
                placeholder="119"
                step="0.01"
                min="1"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-elevated hover:bg-border transition-colors text-txt text-sm"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold bg-accent text-white hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                disabled={saving}
              >
                {saving ? '...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
