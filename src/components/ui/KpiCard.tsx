import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiCardProps {
  label: string;
  value: string | number;
  variation?: number;
  currency?: string;
  colorClass?: string;
  className?: string;
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  variation,
  currency,
  colorClass,
  className,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={cn("glass p-5 rounded-2xl animate-pulse", className)}>
        <div className="h-4 w-24 bg-border rounded mb-3" />
        <div className="h-8 w-32 bg-border rounded" />
      </div>
    );
  }

  const isPositive = variation !== undefined && variation >= 0;

  return (
    <div className={cn("glass p-5 rounded-2xl group hover:border-accent/30 transition-all duration-300", className)}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-txt-2 text-sm font-medium uppercase tracking-wider">{label}</span>
        {variation !== undefined && (
          <div className={cn(
            "flex items-center text-xs font-bold px-1.5 py-0.5 rounded",
            isPositive ? "text-win bg-win/10" : "text-loss bg-loss/10"
          )}>
            {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {isPositive ? '+' : ''}{variation}%
          </div>
        )}
      </div>
      <div className="flex items-baseline">
        {currency && <span className="text-txt-2 text-lg md:text-xl font-mono mr-1">{currency}</span>}
        <span className={cn("text-2xl md:text-3xl font-mono font-bold tracking-tight", colorClass || "text-txt")}>
          {value}
        </span>
      </div>
    </div>
  );
};
