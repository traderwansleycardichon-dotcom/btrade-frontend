import React from 'react';
import { SparkLine } from '../ui/SparkLine';
import { Chip } from '../ui/Chip';
import { useDashboard } from '../../hooks/useDashboard';

export const PnlCard: React.FC = () => {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="glass p-6 rounded-3xl animate-pulse">
        <div className="h-4 w-32 bg-border rounded mb-4" />
        <div className="h-10 w-48 bg-border rounded" />
      </div>
    );
  }

  const pnl = data?.moisCourant?.pnlTotal || 3847;
  const isPositive = pnl >= 0;
  const winRate = data?.moisCourant?.winRate || 68;
  const equityPoints = data?.trading?.equityCurve?.map((p: any) => Number(p.equity)) || [0, 5, 2, 8, 12, 10, 15];

  return (
    <div className="glass p-6 rounded-3xl relative overflow-hidden group">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
        <div className="text-9xl font-mono font-black text-accent">$</div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-txt-2 text-xs font-bold uppercase tracking-widest mb-1">Net P&L · 30 derniers jours</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-mono font-bold tracking-tight ${isPositive ? 'text-win' : 'text-loss'}`}>
                {isPositive ? '+' : ''}${Math.abs(pnl).toLocaleString()}
              </span>
              <Chip variant={isPositive ? 'win' : 'loss'} withDot>
                {winRate}% WR
              </Chip>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-txt-2 uppercase tracking-tighter">Equity Growth</div>
            <SparkLine points={equityPoints} width={80} height={30} animated />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div>
            <div className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter mb-1">Avg / jour</div>
            <div className="text-sm font-mono font-bold">${Math.round(pnl / 30).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter mb-1">Best Day</div>
            <div className="text-sm font-mono font-bold text-win">+$842</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter mb-1">Worst Day</div>
            <div className="text-sm font-mono font-bold text-loss">-$214</div>
          </div>
        </div>
      </div>
    </div>
  );
};
