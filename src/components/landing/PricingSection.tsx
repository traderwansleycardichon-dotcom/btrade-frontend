import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      {/* Plan Section (Requested by user) */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Plans Transparents</h2>
            <p className="text-txt-2 mt-4 font-mono text-xs">CHOISISSEZ L'ARSENAL QUI CORRESPOND À VOS OBJECTIFS</p>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`border p-8 flex flex-col ${plan.recommended ? 'border-accent bg-accent/5' : 'border-border bg-white/[0.02]'}`}
                >
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold uppercase tracking-tight">{plan.name}</h3>
                      {plan.recommended && <span className="text-[10px] font-mono text-accent border border-accent/20 px-2 py-1 bg-accent/10">RECOMMANDÉ</span>}
                    </div>
                    <div className="flex items-baseline gap-1 mb-4 font-mono">
                      <span className="text-4xl font-bold text-accent">${plan.price}</span>
                      <span className="text-txt-2 text-xs">/MOIS</span>
                    </div>
                    <p className="text-txt-2 text-sm min-h-[40px]">{plan.description}</p>
                  </div>

                  <div className="space-y-3 mb-10 flex-1 font-mono text-xs">
                    {(Array.isArray(plan.features) ? plan.features : []).map((f: string) => (
                      <div key={f} className="flex items-start gap-3 text-txt">
                        <span className="text-accent mt-0.5">↳</span>
                        <span className="leading-relaxed uppercase tracking-wider">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link 
                    to="/register"
                    className={`h-12 w-full flex items-center justify-center font-bold text-xs tracking-widest uppercase transition-all ${
                      plan.recommended ? 'bg-accent text-white hover:brightness-110' : 'border border-border text-txt hover:bg-white/5'
                    }`}
                  >
                    {plan.id === 'free' ? 'Commencer' : 'S\'abonner'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section (From Lovable Design) */}
      <section id="tarification" className="py-32 bg-accent text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
            PRÊT POUR LE PROCHAIN NIVEAU ?
          </h2>
          <p className="max-w-2xl mx-auto text-lg font-medium opacity-90 mb-10">
            Rejoignez des milliers de traders qui utilisent BTrade pour sécuriser leurs comptes financés et maximiser leurs payouts.
          </p>
          <Link to="/register" className="inline-flex items-center justify-center h-16 px-12 bg-bg text-white font-bold text-sm tracking-widest uppercase hover:bg-surface border border-transparent transition-all">
            Ouvrir mon compte trader
          </Link>
        </div>
      </section>
    </>
  );
};
