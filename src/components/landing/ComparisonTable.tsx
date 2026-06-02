import React from 'react';
import { Check, X } from 'lucide-react';

const features = [
  { name: 'Journalisation automatique', btt: true, others: true },
  { name: 'Multi-comptes Prop Firms', btt: true, others: true },
  { name: 'Score de discipline algorithmique', btt: true, others: false },
  { name: 'Playbooks statistiques', btt: true, others: true },
  { name: 'Export PDF pour financement', btt: true, others: false },
  { name: 'Alertes drawdown temps réel', btt: true, others: false },
  { name: 'Calcul du risque par position', btt: true, others: true },
  { name: 'Analyse IA des biais cognitifs', btt: true, others: false },
];

export const ComparisonTable: React.FC = () => {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent mb-3">
            La différence
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white">
            Aucun outil ne fait l'équivalent.
          </h2>
          <p className="text-white/55 mt-4 max-w-xl mx-auto">
            On a comparé ligne par ligne aux journaux les plus utilisés.
            Voilà ce que vous gagnez en venant chez Behind The Trade.
          </p>
        </div>

        <div className="glass-frost glass-rim rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.22em] text-white/40 font-medium">
                  Fonctionnalité
                </th>
                <th className="px-6 py-6 text-center text-[11px] uppercase tracking-[0.22em] font-semibold text-accent">
                  Behind The Trade
                </th>
                <th className="px-6 py-6 text-center text-[10px] uppercase tracking-[0.22em] text-white/40 font-medium">
                  Autres
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {features.map((f) => (
                <tr key={f.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5 text-[14px] text-white/80">{f.name}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {f.btt ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent/15 text-accent">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <X size={16} className="text-white/25" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {f.others ? (
                        <Check size={16} className="text-white/40" />
                      ) : (
                        <X size={16} className="text-white/25" />
                      )}
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
