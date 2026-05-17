import React from 'react';

interface WinRateGaugeProps {
  winRate?: number;
  totalTrades?: number;
  winsCount?: number;
  lossesCount?: number;
  loading?: boolean;
}

export const WinRateGauge: React.FC<WinRateGaugeProps> = ({
  winRate = 0,
  totalTrades = 0,
  winsCount = 0,
  lossesCount = 0,
  loading = false,
}) => {
  if (loading) {
    return <div className="glass rounded-3xl h-full animate-pulse bg-elevated/50 min-h-[260px]" />;
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100) * circumference;
  const breakeven = Math.max(0, totalTrades - winsCount - lossesCount);

  return (
    <div className="glass p-5 rounded-3xl flex flex-col h-full w-full">
      <div className="text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-3">
        Win Rate
      </div>

      <div className="flex-1 flex items-center justify-center gap-4">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-24 h-24 transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-[1500ms] ease-out"
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F36C00" />
                <stop offset="100%" stopColor="#FF8A3D" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-mono font-bold">{Math.round(winRate)}%</span>
          </div>
        </div>

        {/* Stats à droite */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div>
            <div className="text-2xl font-mono font-black leading-none">{totalTrades}</div>
            <div className="text-[9px] font-bold text-txt-3 uppercase tracking-widest mt-0.5">
              Trades
            </div>
          </div>
          <div className="pt-1.5 border-t border-border/50 space-y-0.5">
            <Row label="Wins" value={winsCount} color="text-win" />
            <Row label="Losses" value={lossesCount} color="text-loss" />
            {breakeven > 0 && <Row label="BE" value={breakeven} color="text-txt-2" />}
          </div>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
  </div>
);
