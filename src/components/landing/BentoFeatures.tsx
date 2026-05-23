import React from 'react';

export const BentoFeatures: React.FC = () => {
  return (
    <>
      <section id="performance" className="py-24 border-b border-border bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="space-y-4">
              <div className="text-accent font-mono text-xs">[01]</div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Analyse par IA</h3>
              <p className="text-txt-2 text-sm leading-relaxed">
                Notre algorithme identifie vos biais cognitifs et vos erreurs récurrentes. Ne tradez plus à l'aveugle.
              </p>
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <div className="h-1 bg-accent/20 w-full">
                  <div className="h-1 bg-accent w-2/3" />
                </div>
                <span className="text-[10px] font-mono text-txt-2">DISCIPLINE SCORE: 67%</span>
              </div>
            </div>

            <div id="psychologie" className="space-y-4">
              <div className="text-accent font-mono text-xs">[02]</div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Psychologie de précision</h3>
              <p className="text-txt-2 text-sm leading-relaxed">
                Documentez votre état émotionnel avant chaque trade pour optimiser votre gestion du risque et du stress.
              </p>
              <div className="pt-4 border-t border-border">
                <div className="flex gap-1">
                  <div className="h-8 w-1/5 bg-accent/40" />
                  <div className="h-8 w-1/5 bg-accent/10" />
                  <div className="h-8 w-1/5 bg-accent/60" />
                  <div className="h-8 w-1/5 bg-accent/20" />
                  <div className="h-8 w-1/5 bg-accent/50" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-accent font-mono text-xs">[03]</div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Audit Prop Firm</h3>
              <p className="text-txt-2 text-sm leading-relaxed">
                Validation automatique de vos règles de trading pour garantir votre conformité avec les critères FTMO, MyFundedFX et autres.
              </p>
              <div className="pt-4 border-t border-border flex justify-between text-[10px] font-mono">
                <span className="text-accent">COMPLIANT</span>
                <span className="text-txt-2">RULE_SET: AGGRESSIVE_100K</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tighter">Journal de Bord</h2>
              <p className="text-txt-2 mt-2 font-mono text-xs">DERNIÈRES EXÉCUTIONS SIGNALÉES PAR LE TERMINAL</p>
            </div>
            <a href="#" className="text-xs font-mono text-accent hover:underline">VOIR TOUT →</a>
          </div>

          <div className="border border-border divide-y divide-border font-mono text-[11px] overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-6 bg-white/5 p-4 text-txt-2 uppercase tracking-wider">
                <span>Symbole</span>
                <span>Type</span>
                <span>Entrée</span>
                <span>Sortie</span>
                <span>P&L</span>
                <span className="text-right">Statut</span>
              </div>
              <div className="grid grid-cols-6 p-4 hover:bg-white/[0.03] transition-colors text-txt">
                <span className="font-bold">NAS100</span>
                <span className="text-accent">LONG</span>
                <span>15,242.1</span>
                <span>15,294.5</span>
                <span className="text-accent">+4,200€</span>
                <span className="text-right">WIN</span>
              </div>
              <div className="grid grid-cols-6 p-4 hover:bg-white/[0.03] transition-colors text-txt">
                <span className="font-bold">XAUUSD</span>
                <span className="text-loss">SHORT</span>
                <span>1,942.2</span>
                <span>1,945.8</span>
                <span className="text-loss">-1,250€</span>
                <span className="text-right">LOSS</span>
              </div>
              <div className="grid grid-cols-6 p-4 hover:bg-white/[0.03] transition-colors text-txt">
                <span className="font-bold">EURUSD</span>
                <span className="text-accent">LONG</span>
                <span>1.0842</span>
                <span>1.0890</span>
                <span className="text-accent">+840€</span>
                <span className="text-right">WIN</span>
              </div>
              <div className="grid grid-cols-6 p-4 hover:bg-white/[0.03] transition-colors text-txt">
                <span className="font-bold">GBPJPY</span>
                <span className="text-accent">SHORT</span>
                <span>189.42</span>
                <span>188.91</span>
                <span className="text-accent">+1,510€</span>
                <span className="text-right">WIN</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
