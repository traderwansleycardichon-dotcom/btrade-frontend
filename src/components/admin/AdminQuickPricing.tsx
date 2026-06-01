import React, { useState, useEffect } from 'react';
import { Edit2, Zap, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  icon: string;
  color: string;
}

export const AdminQuickPricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

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
  };

  const handleSave = async () => {
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) < 0) {
      addToast('Veuillez entrer un prix valide', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/admin/pricing/${editingPlan?.id}/price`, {
        newPrice: Number(newPrice)
      });
      addToast('Prix mis à jour avec succès (synchronisé avec Stripe)');
      setEditingPlan(null);
      fetchPlans();
      // Reload the page to refresh MRR stats on the dashboard
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur lors de la mise à jour du prix', 'error');
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
          <p className="text-txt-2 text-xs">Ajustez le prix des abonnements directement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="flex items-center justify-between p-4 bg-bg/50 border border-border/50 rounded-2xl group hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-${plan.color}/10`}>
                {plan.id === 'pro' ? <Sparkles className={`text-${plan.color}`} size={16} /> : <Zap className={`text-${plan.color}`} size={16} />}
              </div>
              <div>
                <p className="font-bold text-sm">{plan.name}</p>
                <p className="text-xs text-txt-2 tracking-widest uppercase font-bold">${plan.price}/mois</p>
              </div>
            </div>
            
            <button
              onClick={() => handleEdit(plan)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
                plan.id === 'pro' ? 'border-border hover:bg-elevated text-txt' : 'opacity-50 cursor-not-allowed border-transparent'
              }`}
              disabled={plan.id !== 'pro'}
              title={plan.id !== 'pro' ? "Seul le plan PRO peut être modifié" : "Modifier le prix"}
            >
              <Edit2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Edition Rapide */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm animate-[scaleIn_0.2s_ease-out]">
            <h3 className="font-bold mb-4 text-center">Nouveau prix : {editingPlan.name}</h3>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-txt-2 font-bold">$</span>
              </div>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-3 font-bold focus:outline-none focus:border-accent transition-colors"
                placeholder="49.99"
                step="0.01"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-elevated hover:bg-border transition-colors text-txt text-sm"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold bg-loss hover:opacity-90 transition-colors text-white text-sm"
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
