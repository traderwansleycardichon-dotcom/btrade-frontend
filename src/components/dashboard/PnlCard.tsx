import React from 'react';
import { SparkLine } from '../ui/SparkLine';
import { Chip } from '../ui/Chip';

interface PnlCardProps {
  plTotal?: number;
  winRate?: number;
  equityPoints?: number[];
  avgPerDay?: number;
  bestDay?: number;
  worstDay?: number;
  loading?: boolean;
}

export const PnlCard: React.FC<PnlCardProps> = ({
  plTotal = 0,
  winRate = 0,
  equityPoints = [],
  avgPerDay = 0,
  bestDay = 0,
  worstDay = 0,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="glass p-6 rounded-3xl animate-pulse">
        <div className="h-4 w-32 bg-border rounded mb-4" />
        <div className="h-10 w-48 bg-border rounded" />
      </div>
    );
  }

  const isPositive = plTotal >= 0;

  return (
    <div className="glass p-5 rounded-3xl relative overflow-hidden group h-full w-full flex flex-col">
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
        <div className="text-9xl font-mono font-black text-accent">$</div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-txt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">
              Net P&amp;L · 30 derniers jours
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-3xl sm:text-4xl font-mono font-bold tracking-tight ${isPositive ? 'text-win' : 'text-loss'}`}>
                {isPositive ? '+' : '-'}${Math.abs(plTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              {winRate > 0 && (
                <Chip variant={isPositive ? 'win' : 'loss'} withDot>
                  {winRate.toFixed(0)}% WR
                </Chip>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-txt-2 uppercase tracking-tighter">Equity Growth</div>
            {equityPoints.length > 1 ? (
              <SparkLine points={equityPoints} width={80} height={30} animated />
            ) : (
              <div className="text-[10px] text-txt-3 mt-1">—</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50 mt-auto">
          <div>
            <div className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter mb-1">Avg / jour</div>
            <div className="text-sm font-mono font-bold">
              {avgPerDay !== 0
                ? `${avgPerDay >= 0 ? '+' : '-'}$${Math.abs(Math.round(avgPerDay)).toLocaleString()}`
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter mb-1">Best Day</div>
            <div className="text-sm font-mono font-bold text-win">
              {bestDay > 0 ? `+$${Math.round(bestDay).toLocaleString()}` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter mb-1">Worst Day</div>
            <div className="text-sm font-mono font-bold text-loss">
              {worstDay < 0 ? `-$${Math.abs(Math.round(worstDay)).toLocaleString()}` : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
