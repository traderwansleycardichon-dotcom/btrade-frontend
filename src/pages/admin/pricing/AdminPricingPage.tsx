import React, { useEffect, useState } from 'react';
import { CreditCard, Edit2, Zap, Sparkles } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { useSettings } from '../../../contexts/SettingsContext';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string | null;
  description: string;
  features: string[];
  recommended: boolean;
  stripePriceId: string;
  icon: string;
  color: string;
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [newOriginalPrice, setNewOriginalPrice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/admin/pricing');
      setPlans(res.data);
    } catch (err: any) {
      addToast('Erreur lors du chargement des plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setNewPrice(plan.price);
    setNewOriginalPrice(plan.originalPrice || '');
  };

  const handleSave = async () => {
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) < 0) {
      addToast('Veuillez entrer un prix valide', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/admin/pricing/${editingPlan?.id}/price`, {
        newPrice: Number(newPrice),
        originalPrice: newOriginalPrice ? Number(newOriginalPrice) : null
      });
      addToast('Prix mis à jour avec succès (synchronisé avec Stripe)');
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur lors de la mise à jour du prix', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-2">Plans Tarifaires</h1>
        <p className="text-txt-2 text-sm">Gérez le prix des abonnements. Les changements sont automatiquement synchronisés avec Stripe.</p>
      </div>

      {loading ? (
        <div className="text-center text-txt-3 py-10">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass rounded-3xl p-6 border ${plan.recommended ? 'border-accent' : 'border-border'} relative overflow-hidden`}>
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-accent text-bg px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
                  Recommandé
                </div>
              )}
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${plan.color}/10`}>
                    {plan.id === 'pro' ? <Sparkles className={`text-${plan.color}`} size={20} /> : <Zap className={`text-${plan.color}`} size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-xs text-txt-3">{plan.description}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                {plan.originalPrice && (
                  <div className="text-sm font-bold text-txt-3 line-through mb-1">
                    ${plan.originalPrice}
                  </div>
                )}
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-sm font-bold text-txt-3 mb-1">/mois</span>
                </div>
                {plan.price && settings?.USD_TO_HTG_RATE && (
                  <div className="text-xs font-bold text-[#FF0000] mt-1">
                    ≈ {Math.ceil(Number(plan.price) * Number(settings.USD_TO_HTG_RATE))} HTG / mois
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-txt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleEdit(plan)}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                  plan.id === 'pro' ? 'bg-surface hover:bg-elevated text-txt border border-border' : 'opacity-50 cursor-not-allowed bg-surface border border-border'
                }`}
                disabled={plan.id !== 'pro'}
                title={plan.id !== 'pro' ? "Seul le plan PRO peut être modifié" : ""}
              >
                <Edit2 size={16} />
                Modifier le prix
              </button>
            </div>
          ))}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-md animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold mb-2">Modifier le prix : {editingPlan.name}</h3>
            <p className="text-sm text-txt-2 mb-6">
              L'Ancien Prix Barré est purement visuel (marketing). Si vous modifiez le <strong>vrai prix</strong>, cela créera un nouveau prix sur Stripe et mettra à jour tous les abonnés actuels.
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Nouveau Prix Mensuel ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-txt-2">$</span>
                  </div>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="49.99"
                    step="0.01"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Ancien Prix Barré ($) - Optionnel</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-txt-2">$</span>
                  </div>
                  <input
                    type="number"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="99.99"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-elevated hover:bg-border transition-colors text-txt"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold bg-loss hover:opacity-90 transition-colors text-white flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving ? 'Sauvegarde...' : 'Confirmer le nouveau prix'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
