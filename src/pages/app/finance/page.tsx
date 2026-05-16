import React, { useState } from 'react';
import { CreditCard, ArrowUpCircle, ArrowDownCircle, Filter, Download, Plus } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { useFinance } from '../../../hooks/useFinance';
import { AddRevenuModal } from '../../../components/finance/AddRevenuModal';
import { AddDepenseModal } from '../../../components/finance/AddDepenseModal';
import { ExportDataModal } from '../../../components/finance/ExportDataModal';

const FinancePage: React.FC = () => {
  const { revenus, depenses, totalRevenus, totalDepenses, isLoading } = useFinance();
  const [isRevenuModalOpen, setIsRevenuModalOpen] = useState(false);
  const [isDepenseModalOpen, setIsDepenseModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fusionner et trier les transactions par date
  const transactions = [
    ...revenus.map((r: any) => ({ ...r, type: 'revenu', label: r.source })),
    ...depenses.map((d: any) => ({ ...d, type: 'depense' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Budget & Flux</h2>
          <p className="text-txt-2 text-sm">Gérez vos revenus et contrôlez vos dépenses.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsRevenuModalOpen(true)}
              className="bg-win/10 text-win px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-win/20 transition-all"
            >
              <Plus size={16} /> Revenu
            </button>
            <button 
              onClick={() => setIsDepenseModalOpen(true)}
              className="bg-loss/10 text-loss px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-loss/20 transition-all"
            >
              <Plus size={16} /> Dépense
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          label="Solde Mensuel" 
          value={(totalRevenus - totalDepenses).toLocaleString()} 
          currency="$" 
          colorClass={(totalRevenus - totalDepenses) >= 0 ? 'text-win' : 'text-loss'} 
          loading={isLoading}
        />
        <KpiCard 
          label="Revenus Totaux" 
          value={totalRevenus.toLocaleString()} 
          currency="$" 
          colorClass="text-win" 
          loading={isLoading}
        />
        <KpiCard 
          label="Dépenses Totales" 
          value={totalDepenses.toLocaleString()} 
          currency="$" 
          colorClass="text-loss" 
          loading={isLoading}
        />
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
              {transactions.map((t: any, i) => (
                <tr key={i} className="hover:bg-elevated/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium">
                    {new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      t.type === 'revenu' ? 'bg-win/10 text-win' : 'bg-loss/10 text-loss'
                    }`}>
                      {t.type === 'revenu' ? 'REVENU' : (t.categorie || 'AUTRE')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-txt-2">{t.label}</td>
                  <td className={`px-6 py-4 text-sm font-mono font-bold text-right ${
                    t.type === 'revenu' ? 'text-win' : 'text-loss'
                  }`}>
                    {t.type === 'revenu' ? '+' : '-'}{Number(t.montant).toLocaleString()}$
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-txt-3 italic text-sm">
                    Aucune transaction enregistrée ce mois-ci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddRevenuModal 
        isOpen={isRevenuModalOpen} 
        onClose={() => setIsRevenuModalOpen(false)} 
      />
      <AddDepenseModal 
        isOpen={isDepenseModalOpen} 
        onClose={() => setIsDepenseModalOpen(false)} 
      />
      <ExportDataModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
    </div>
  );
};

export default FinancePage;
