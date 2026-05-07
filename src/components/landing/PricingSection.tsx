import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      description: 'Pour découvrir la puissance du journalisme.',
      features: ['1 Compte Trading', 'Journalisation illimitée', 'Calendrier P&L', 'Dashboard Basic', 'Support Communauté'],
      cta: 'Commencer',
      featured: false
    },
    {
      name: 'Pro',
      price: '19',
      description: 'Le choix des traders en phase d\'évaluation.',
      features: ['Comptes illimités', 'Analyse de Discipline', 'Playbooks Statistiques', 'Exports PDF Prop Firms', 'Alertes Drawdown', 'Support Prioritaire'],
      cta: 'Démarrer l\'essai gratuit',
      featured: true
    },
    {
      name: 'Elite',
      price: '49',
      description: 'Pour les traders gérant des capitaux massifs.',
      features: ['Tout le plan Pro', 'IA Setup Analysis', 'Mentoring via Chat', 'Calculateur de Risque Avancé', 'Early Access Features', 'Account Manager dédié'],
      cta: 'Rejoindre l\'élite',
      featured: false
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Un prix simple pour des <br /><span className="text-accent">résultats concrets.</span></h2>
          <p className="text-txt-2">Essayez gratuitement pendant 14 jours. Aucune carte requise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative glass rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 hover:scale-[1.02] ${
                plan.featured ? 'border-accent border-2 shadow-[0_0_40px_rgba(243,108,0,0.15)] bg-accent/5' : 'border-border/50'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Le plus populaire
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">{plan.price}€</span>
                  <span className="text-txt-2 text-sm">/ mois</span>
                </div>
                <p className="text-sm text-txt-2 leading-relaxed">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm font-medium">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-win/10 flex items-center justify-center">
                      <Check size={12} className="text-win" strokeWidth={3} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group ${
                plan.featured 
                  ? 'bg-accent text-white hover:bg-accent-2 shadow-lg shadow-accent/20' 
                  : 'bg-elevated text-txt hover:bg-border border border-border'
              }`}>
                {plan.cta}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
