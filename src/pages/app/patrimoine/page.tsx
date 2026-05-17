import React, { useState } from 'react';
import { Wallet, PieChart, TrendingUp, Landmark, ShieldCheck, CreditCard, Plus } from 'lucide-react';
import { PieChart as ChartPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { KpiCard } from '../../../components/ui/KpiCard';
import { usePatrimoine } from '../../../hooks/usePatrimoine';
import { useInvestments } from '../../../hooks/useInvestments';
import { AddInvestmentModal } from '../../../components/finance/AddInvestmentModal';
import { Modal } from '../../../components/ui/Modal';

import { FeatureGate } from '../../../components/ui/FeatureGate';

const assetClassTranslations: Record<string, string> = {
  actions: 'Actions / Bourse',
  crypto: 'Cryptomonnaies',
  immobilier: 'Immobilier',
  liquidites: 'Cash / Liquidités',
  metaux: 'Métaux Précieux',
  autres: 'Autres Actifs'
};

const ASSET_COLORS: Record<string, string> = {
  actions: '#3B82F6', // Blue
  crypto: '#F59E0B',  // Amber
  immobilier: '#10B981', // Emerald
  liquidites: '#6366F1', // Indigo
  metaux: '#EC4899', // Pink
  autres: '#8B5CF6'  // Purple
};

const getColorForAsset = (type: string) => ASSET_COLORS[type] || '#8B5CF6';

const PatrimoinePage: React.FC = () => {
  const { dashboard, isLoading: isLoadingPatrimoine } = usePatrimoine();
  const { kpis, allocation, isLoading: isLoadingInvestments } = useInvestments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  const isLoading = isLoadingPatrimoine || isLoadingInvestments;

  const pieData = React.useMemo(() => {
    if (!allocation) return [];
    return allocation.map((item: any) => ({
      name: assetClassTranslations[item.typeActif] || item.typeActif.charAt(0).toUpperCase() + item.typeActif.slice(1),
      value: item.valeur || 0,
      pourcentage: item.pourcentage || 0,
      rawType: item.typeActif
    }));
  }, [allocation]);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mon Patrimoine</h2>
          <p className="text-txt-2 text-sm">Vue globale de vos actifs et de votre situation nette.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAllocationModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
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

      <Modal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        title="📊 Répartition Globale de vos Actifs"
        size="md"
      >
        {pieData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PieChart size={48} className="text-txt-3 mb-4 opacity-50 animate-[pulse_2s_infinite]" />
            <p className="text-sm font-bold text-txt-2 mb-1">Aucun investissement enregistré</p>
            <p className="text-xs text-txt-3 max-w-xs">
              Ajoutez votre premier investissement pour voir la répartition graphique de vos actifs.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-8 py-4">
            <div className="w-48 h-48 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <ChartPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={getColorForAsset(entry.rawType)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#181C25] border border-border p-3 rounded-xl shadow-2xl text-xs">
                            <div className="font-bold mb-1 text-txt">{data.name}</div>
                            <div className="text-accent font-mono font-bold mb-0.5">{data.value.toLocaleString()} $</div>
                            <div className="text-txt-3 font-semibold">{data.pourcentage.toFixed(1)}% du total</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </ChartPie>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-bold text-txt-3 uppercase tracking-[0.18em] mb-0.5">Total</span>
                <span className="text-sm font-black text-txt font-mono">
                  {pieData.reduce((acc: number, curr: any) => acc + curr.value, 0).toLocaleString()} $
                </span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 w-full">
              {pieData.map((item: any, i: number) => {
                const color = getColorForAsset(item.rawType);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-elevated/40 border border-border/50 hover:bg-elevated/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-bold text-txt">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-txt">{item.value.toLocaleString()} $</div>
                      <div className="text-[10px] font-bold text-txt-3">{item.pourcentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ProtectedPatrimoinePage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasFinance"
      fallbackTitle="Mon Patrimoine Réservé aux Membres Pro"
      fallbackDesc="Obtenez une vue globale, synthétique et analytique de vos investissements, de vos actifs et de votre situation nette globale."
    >
      <PatrimoinePage />
    </FeatureGate>
  );
};

export default ProtectedPatrimoinePage;
