import React, { useState } from 'react';
import { Wallet, PieChart, TrendingUp, Landmark, ShieldCheck, CreditCard, Plus } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { usePatrimoine } from '../../../hooks/usePatrimoine';
import { useInvestments } from '../../../hooks/useInvestments';
import { AddInvestmentModal } from '../../../components/finance/AddInvestmentModal';

const PatrimoinePage: React.FC = () => {
  const { dashboard, isLoading: isLoadingPatrimoine } = usePatrimoine();
  const { kpis, allocation, isLoading: isLoadingInvestments } = useInvestments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLoading = isLoadingPatrimoine || isLoadingInvestments;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mon Patrimoine</h2>
          <p className="text-txt-2 text-sm">Vue globale de vos actifs et de votre situation nette.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <PieChart size={18} />
            Répartition des Actifs
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Nouvel Investissement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard 
          label="Situation Nette" 
          value={dashboard?.patrimoineNet?.toLocaleString() || '0'} 
          currency="$" 
          colorClass="text-win" 
          loading={isLoading}
        />
        <KpiCard 
          label="Actifs Immobiliers" 
          value={allocation?.find((a: any) => a.typeActif === 'immobilier')?.valeur?.toLocaleString() || '0'} 
          currency="$" 
          loading={isLoading}
        />
        <KpiCard 
          label="Investissements Bourse/Crypto" 
          value={kpis?.valeurTotale?.toLocaleString() || '0'} 
          currency="$" 
          loading={isLoading}
        />
        <KpiCard 
          label="Comptes de Trading (Payouts)" 
          value={dashboard?.totalPayouts?.toLocaleString() || '0'} 
          currency="$" 
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Évolution de la Situation Nette</h3>
          <div className="h-64 flex items-end gap-3 px-4">
            {/* TODO: Use useCourbe data here when component is ready */}
            {[30, 45, 40, 60, 55, 75, 85, 80, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-accent/20 hover:bg-accent/40 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold">Répartition Investissements</h3>
          <div className="space-y-4">
            {allocation?.map((item: any, i: number) => {
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500'];
              const color = colors[i % colors.length];
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-txt-2">{item.typeActif}</span>
                    <span>{item.pourcentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${item.pourcentage}%` }} />
                  </div>
                </div>
              );
            })}
            {(!allocation || allocation.length === 0) && !isLoading && (
              <div className="text-sm text-txt-3 text-center italic py-4">Aucune donnée d'allocation.</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl">
        <h3 className="text-lg font-bold mb-6">Résumé Financier</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-win uppercase tracking-widest px-1">Flux Positifs (Mois)</h4>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-win/5 border border-win/10">
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-win" />
                <span className="font-bold text-sm">Revenus du mois</span>
              </div>
              <span className="font-mono font-bold">{dashboard?.totalRevenusMois?.toLocaleString() || '0'} $</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-win/5 border border-win/10">
              <div className="flex items-center gap-3">
                <Wallet size={18} className="text-win" />
                <span className="font-bold text-sm">Payouts Cumulés</span>
              </div>
              <span className="font-mono font-bold">{dashboard?.totalPayouts?.toLocaleString() || '0'} $</span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-loss uppercase tracking-widest px-1">Flux Négatifs (Mois)</h4>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-loss/5 border border-loss/10">
              <div className="flex items-center gap-3">
                <Landmark size={18} className="text-loss" />
                <span className="font-bold text-sm">Dépenses du mois</span>
              </div>
              <span className="font-mono font-bold">{dashboard?.totalDepensesMois?.toLocaleString() || '0'} $</span>
            </div>
          </div>
        </div>
      </div>

      <AddInvestmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default PatrimoinePage;
