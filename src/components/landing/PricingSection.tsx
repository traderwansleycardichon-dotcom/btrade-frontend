import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      description: 'Pour découvrir la puissance du journalisme.',
      features: ['1 Compte Trading', 'Journalisation illimitée', 'Calendrier P&L', 'Dashboard Basic', 'Support Communauté'],
      cta: 'Get Started',
      featured: false
    },
    {
      name: 'Pro',
      price: '19',
      description: 'Le choix des traders en phase d\'évaluation.',
      features: ['Comptes illimités', 'Analyse de Discipline', 'Playbooks Statistiques', 'Exports PDF Prop Firms', 'Alertes Drawdown', 'Support Prioritaire'],
      cta: 'Try Free Now',
      featured: true
    },
    {
      name: 'Elite',
      price: '49',
      description: 'Pour les traders gérant des capitaux massifs.',
      features: ['Tout le plan Pro', 'IA Setup Analysis', 'Mentoring via Chat', 'Calculateur de Risque Avancé', 'Early Access Features', 'Account Manager dédié'],
      cta: 'Go Elite',
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">Plans Transparent.</h2>
          <p className="text-txt-2 text-lg">Investissez dans votre discipline, pas dans des fioritures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative glass rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 hover:-translate-y-2 ${
                plan.featured ? 'border-accent/30 shadow-[0_0_50px_rgba(243,108,0,0.1)] bg-accent/[0.02]' : ''
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-10 bg-accent text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-[10px] font-black text-txt-3 uppercase tracking-[0.3em] mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black">${plan.price}</span>
                  <span className="text-txt-3 text-xs font-bold uppercase tracking-widest">/mo</span>
                </div>
                <p className="text-sm text-txt-2 leading-relaxed font-medium">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-xs font-bold text-txt-2">
                    <Check size={14} className={plan.featured ? "text-accent" : "text-txt-3"} strokeWidth={3} />
                    {f}
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all group ${
                plan.featured 
                  ? 'bg-accent text-white hover:bg-accent-2 shadow-[0_0_20px_rgba(243,108,0,0.2)]' 
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
              }`}>
                {plan.cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
