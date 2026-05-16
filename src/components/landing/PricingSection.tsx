import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, Loader2, Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const icons: Record<string, any> = { Sparkles, Zap, Shield, Rocket };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/api/billing/plans');
        setPlans(data.data);
      } catch (err) {
        console.error('Erreur plans landing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="py-32 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <section id="pricing" className="py-16 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">Plans Transparents.</h2>
          <p className="text-txt-2 text-lg">Investissez dans votre discipline, pas dans des fioritures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = icons[plan.icon] || Zap;
            return (
              <div 
                key={plan.id}
                className={`relative glass rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 hover:-translate-y-2 border ${
                  plan.recommended ? 'border-accent shadow-[0_0_50px_rgba(243,108,0,0.1)] bg-accent/[0.02]' : 'border-border'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-10 bg-accent text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
                    Recommandé
                  </div>
                )}

                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={20} className={`text-${plan.color}`} />
                    <h3 className="text-[10px] font-black text-txt-3 uppercase tracking-[0.3em]">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-black">${plan.price}</span>
                    <span className="text-txt-3 text-xs font-bold uppercase tracking-widest">/mois</span>
                  </div>
                  <p className="text-sm text-txt-2 leading-relaxed font-medium min-h-[40px]">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  {(Array.isArray(plan.features) ? plan.features : []).map((f: string) => (
                    <div key={f} className="flex items-center gap-3 text-xs font-bold text-txt-2">
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.recommended ? 'bg-accent/10 text-accent' : 'bg-white/5 text-txt-3'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                <Link 
                  to="/register"
                  className={`w-full py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all group ${
                    plan.recommended 
                      ? 'bg-accent text-white hover:bg-accent-2 shadow-[0_0_20px_rgba(243,108,0,0.2)]' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {plan.id === 'free' ? 'Commencer Gratuitement' : 'Accès Immédiat'}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

