import React from 'react';
import { CreditCard, ArrowUpCircle, ArrowDownCircle, Filter, Download } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';

const FinancePage: React.FC = () => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Budget & Flux</h2>
          <p className="text-txt-2 text-sm">Gérez vos revenus et contrôlez vos dépenses.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <button className="btn-primary">
            + Nouvelle Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Solde Mensuel" value="2,450" currency="$" colorClass="text-win" />
        <KpiCard label="Revenus Totaux" value="6,800" currency="$" colorClass="text-win" icon={ArrowUpCircle} />
        <KpiCard label="Dépenses Totales" value="4,350" currency="$" colorClass="text-loss" icon={ArrowDownCircle} />
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface/50">
          <h3 className="font-bold">Dernières Transactions</h3>
          <button className="text-txt-3 hover:text-txt transition-colors">
            <Filter size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-txt-3 uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { date: '05 Mai 2026', cat: 'Salaire', desc: 'Virement Entreprise X', amount: '+4,500', color: 'text-win' },
                { date: '04 Mai 2026', cat: 'Loyer', desc: 'Loyer Appartement', amount: '-1,200', color: 'text-loss' },
                { date: '03 Mai 2026', cat: 'Trading', desc: 'Payout MyFundedFX', amount: '+1,800', color: 'text-win' },
                { date: '02 Mai 2026', cat: 'Loisirs', desc: 'Restaurant', amount: '-85', color: 'text-loss' },
                { date: '01 Mai 2026', cat: 'Abonnement', desc: 'TradingView Pro', amount: '-49', color: 'text-loss' },
              ].map((t, i) => (
                <tr key={i} className="hover:bg-elevated/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-border text-txt-2 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                      {t.cat}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-txt-2">{t.desc}</td>
                  <td className={`px-6 py-4 text-sm font-mono font-bold text-right ${t.color}`}>
                    {t.amount}$
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
