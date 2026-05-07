import React from 'react';
import { PnlCard } from '../../../components/dashboard/PnlCard';
import { WinRateGauge } from '../../../components/dashboard/WinRateGauge';
import { EquityCurve } from '../../../components/dashboard/EquityCurve';
import { CalendarHeatmap } from '../../../components/dashboard/CalendarHeatmap';
import { DisciplinePanel } from '../../../components/dashboard/DisciplinePanel';
import { TopPlaybooks } from '../../../components/dashboard/TopPlaybooks';
import { MacroNext24h } from '../../../components/dashboard/MacroNext24h';
import { RecentTrades } from '../../../components/dashboard/RecentTrades';
import { KpiCard } from '../../../components/ui/KpiCard';
import { useDashboard } from '../../../hooks/useDashboard';
import { MOCK_HEATMAP_DATA } from '../../../lib/mocks';

import { OpenPositions } from '../../../components/dashboard/OpenPositions';
import { RDistribution } from '../../../components/dashboard/RDistribution';
import { TimeHeatmap } from '../../../components/dashboard/TimeHeatmap';

const DashboardPage: React.FC = () => {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          label="Patrimoine Net" 
          value={data?.patrimoine?.netTotal?.toLocaleString() || '---'} 
          currency="$" 
          variation={+4.2} 
          loading={isLoading}
        />
        <KpiCard 
          label="Balance Trading" 
          value={data?.trading?.balanceTotale?.toLocaleString() || '---'} 
          currency="$" 
          loading={isLoading}
          colorClass="text-accent"
        />
        <KpiCard 
          label="Profit ce mois" 
          value={data?.moisCourant?.pnlTotal?.toLocaleString() || '---'} 
          currency="$" 
          variation={+12.8} 
          loading={isLoading}
        />
        <KpiCard 
          label="Win Rate" 
          value={(data?.trading?.winRateGlobal || 0).toFixed(1)} 
          currency="%" 
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PnlCard />
            <WinRateGauge 
              winRate={data?.trading?.winRateGlobal} 
              totalTrades={data?.trading?.totalTrades} 
              loading={isLoading} 
            />
          </div>
          
          <EquityCurve 
            data={data?.trading?.equityCurve} 
            loading={isLoading} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <RDistribution />
             <TimeHeatmap />
          </div>

          <RecentTrades />
        </div>

        {/* Sidebar Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <OpenPositions />
          
          <CalendarHeatmap data={MOCK_HEATMAP_DATA} loading={isLoading} />
          
          <DisciplinePanel />
          
          <div className="grid grid-cols-1 gap-8">
            <MacroNext24h />
            <TopPlaybooks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
