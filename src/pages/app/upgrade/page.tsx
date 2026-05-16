import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';

export default function UpgradePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/api/billing/plans');
        setPlans(data.data);
      } catch (err) {
        console.error('Erreur plans:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = async (planId: 'pro') => {
    setLoading(planId);
    try {
      const res = await api.post('/api/billing/create-checkout-session', { planId });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Erreur checkout:', err);
      alert('Erreur lors de la création de la session de paiement.');
    } finally {
      setLoading(null);
    }
  };

  const icons: Record<string, any> = { Sparkles, Zap, Shield, Rocket };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black mb-4">Plans Transparents</h1>
        <p className="text-txt-2 text-lg max-w-2xl mx-auto font-bold text-accent">
          Investissez dans votre discipline, pas dans des fioritures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = icons[plan.icon] || Zap;
          const isCurrent = user?.plan === plan.id;
          const isFree = plan.id === 'free';
          const buttonText = isCurrent ? 'Votre Plan Actuel' : (isFree ? 'Plan Gratuit' : `Passer au Plan ${plan.name}`);

          return (
            <div 
              key={plan.id}
              className={`glass p-8 rounded-[2rem] border transition-all relative flex flex-col ${
                plan.recommended ? 'border-accent shadow-[0_20px_50px_rgba(243,108,0,0.15)] scale-105 z-10' : 'border-border hover:border-accent/30'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Recommandé
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Icon size={24} className={`text-${plan.color}`} />
                  <h3 className="text-xl font-black">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-txt-3 text-sm font-bold">/ mois</span>
                </div>
                <p className="text-xs text-txt-2 mt-4 leading-relaxed">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isFree ? 'bg-border text-txt-3' : 'bg-win/10 text-win'}`}>
                      <Check size={10} strokeWidth={4} />
                    </div>
                    <span className="text-xs text-txt-2 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => !isFree && handleUpgrade(plan.id as any)}
                disabled={isFree || isCurrent || (loading !== null)}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isCurrent 
                    ? 'bg-elevated text-txt-3 cursor-default' 
                    : plan.recommended 
                      ? 'bg-accent text-white shadow-xl hover:scale-105 hover:shadow-accent/20' 
                      : 'bg-surface border border-border hover:border-accent/50'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? 'Redirection...' : buttonText}
                {!isCurrent && !isFree && <ArrowRight size={18} />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 glass p-8 rounded-3xl border border-border flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-2xl bg-win/10 text-win flex items-center justify-center shrink-0">
          <Shield size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-lg mb-1">Paiement 100% sécurisé via Stripe</h4>
          <p className="text-xs text-txt-2 leading-relaxed">
            Vos informations de paiement sont traitées par Stripe. Vous pouvez annuler votre abonnement à tout moment d'un simple clic depuis vos paramètres. Aucune donnée bancaire n'est stockée sur nos serveurs.
          </p>
        </div>
        <div className="flex gap-4 grayscale opacity-50">
          {/* Icons simplified */}
          <div className="w-12 h-8 bg-elevated rounded border border-border" />
          <div className="w-12 h-8 bg-elevated rounded border border-border" />
          <div className="w-12 h-8 bg-elevated rounded border border-border" />
        </div>
      </div>
    </div>
  );
}
