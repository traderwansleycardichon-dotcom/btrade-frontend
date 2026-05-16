import React from 'react';
import { Check, Minus } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const features = [
    { name: 'Journalisation Automatique', btt: true, competitors: true },
    { name: 'Multi-comptes Prop Firms', btt: true, competitors: true },
    { name: 'Analyse de Discipline (Score)', btt: true, competitors: false },
    { name: 'Playbooks & Setups Statistiques', btt: true, competitors: true },
    { name: 'Export PDF pour Financement', btt: true, competitors: false },
    { name: 'Alertes Drawdown Real-time', btt: true, competitors: false },
    { name: 'Calcul du Risque par Position', btt: true, competitors: true },
    { name: 'IA Advice & Analyse de Setups', btt: true, competitors: false },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-tighter uppercase">No Match.</h2>

        <div className="max-w-4xl mx-auto glass rounded-[2.5rem] overflow-hidden border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-10 py-8 text-[10px] font-black text-txt-3 uppercase tracking-[0.3em]">Features</th>
                <th className="px-10 py-8 text-center text-xs font-black text-accent uppercase tracking-[0.2em]">BTrade</th>
                <th className="px-10 py-8 text-center text-[10px] font-black text-txt-3 uppercase tracking-[0.2em]">Others</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map((f, i) => (
                <tr key={i}>
                  <td className="px-10 py-6 text-xs font-bold text-txt-2">{f.name}</td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                      {f.btt ? <Check size={18} className="text-accent" strokeWidth={3} /> : <Minus size={18} className="text-txt-3" />}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                      {f.competitors ? <Check size={18} className="text-txt-3" /> : <Minus size={18} className="text-txt-3" />}
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
