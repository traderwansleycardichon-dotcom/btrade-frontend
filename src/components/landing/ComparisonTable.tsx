import React from 'react';
import { Check, Minus, Info } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const features = [
    { name: 'Journalisation Automatique', btt: true, tradezella: true, myfxbook: false },
    { name: 'Multi-comptes Prop Firms', btt: true, tradezella: true, myfxbook: true },
    { name: 'Analyse de Discipline (Score)', btt: true, tradezella: false, myfxbook: false },
    { name: 'Playbooks & Setups Statistiques', btt: true, tradezella: true, myfxbook: false },
    { name: 'Export PDF pour Financement', btt: true, tradezella: false, myfxbook: false },
    { name: 'Alertes Drawdown Real-time', btt: true, tradezella: false, myfxbook: false },
    { name: 'Calcul du Risque par Position', btt: true, tradezella: true, myfxbook: true },
    { name: 'IA Advice & Analyse de Setups', btt: true, tradezella: false, myfxbook: false },
  ];

  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Pourquoi choisir <span className="text-accent">BTrade ?</span></h2>
          <p className="text-txt-2">Comparez nos fonctionnalités avec les solutions existantes.</p>
        </div>

        <div className="max-w-4xl mx-auto glass rounded-[2rem] overflow-hidden border border-border/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-8 py-6 text-xs font-bold text-txt-3 uppercase tracking-widest">Fonctionnalités</th>
                <th className="px-8 py-6 text-center">
                  <span className="text-sm font-black text-accent tracking-tighter">BTrade</span>
                </th>
                <th className="px-8 py-6 text-center text-xs font-bold text-txt-2">Tradezella</th>
                <th className="px-8 py-6 text-center text-xs font-bold text-txt-2">MyFXBook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {features.map((f, i) => (
                <tr key={i} className="hover:bg-elevated/30 transition-colors group">
                  <td className="px-8 py-5 text-sm font-medium text-txt-2 group-hover:text-txt flex items-center gap-2">
                    {f.name}
                    <Info size={12} className="opacity-0 group-hover:opacity-100 text-txt-3 transition-opacity cursor-help" />
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center">
                      {f.btt ? <Check size={20} className="text-accent" strokeWidth={3} /> : <Minus size={20} className="text-txt-3" />}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center">
                      {f.tradezella ? <Check size={20} className="text-txt-3" /> : <Minus size={20} className="text-txt-3" />}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center">
                      {f.myfxbook ? <Check size={20} className="text-txt-3" /> : <Minus size={20} className="text-txt-3" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
