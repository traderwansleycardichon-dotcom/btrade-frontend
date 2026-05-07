import React from 'react';
import { TradesTable } from '../../../components/trading/TradesTable';
import { KpiCard } from '../../../components/ui/KpiCard';
import { useAccounts } from '../../../hooks/useAccounts';

const TradesPage: React.FC = () => {
  const { accounts, useStats } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const activeAccount = safeAccounts.find((a: any) => a.statut === 'actif') || safeAccounts[0];
  const { data: stats, isLoading: statsLoading } = useStats(activeAccount?.id);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard 
          label="Profit Total" 
          value={stats?.plTotal?.toLocaleString() || '0'} 
          currency="$" 
          loading={statsLoading}
        />
        <KpiCard 
          label="Win Rate" 
          value={stats?.winRate?.toFixed(1) || '0'} 
          currency="%" 
          loading={statsLoading}
        />
        <KpiCard 
          label="RR Moyen" 
          value={stats?.rrMoyen?.toFixed(2) || '0.00'} 
          loading={statsLoading}
        />
        <KpiCard 
          label="Profit Moyen" 
          value={stats?.plMoyen?.toLocaleString() || '0'} 
          currency="$" 
          loading={statsLoading}
        />
      </div>

      <TradesTable />
    </div>
  );
};

export default TradesPage;
