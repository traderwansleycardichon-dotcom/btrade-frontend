import React from 'react';

interface WinRateGaugeProps {
  winRate?: number;
  totalTrades?: number;
  loading?: boolean;
}

export const WinRateGauge: React.FC<WinRateGaugeProps> = ({ 
  winRate = 63, 
  totalTrades = 124,
  loading = false 
}) => {
  if (loading) {
    return <div className="glass aspect-square rounded-3xl animate-pulse bg-elevated/50" />;
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100) * circumference;

  return (
    <div className="glass p-6 rounded-3xl flex flex-col items-center justify-center text-center group">
      <div className="relative mb-4">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-border"
          />
          {/* Progress Circle */}
          <circle
            cx="64"
            cy="64"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold">{winRate}%</span>
          <span className="text-[10px] font-bold text-txt-2 uppercase tracking-tighter">Win Rate</span>
        </div>
      </div>
      
      <div>
        <div className="text-xl font-mono font-bold mb-1">{totalTrades}</div>
        <div className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">Trades Exécutés</div>
      </div>
    </div>
  );
};
