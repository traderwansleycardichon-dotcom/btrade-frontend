import React from 'react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DayData {
  pnl: number;
  trades: number;
}

interface CalendarHeatmapProps {
  data?: Record<number, DayData>;
  month?: string;
  loading?: boolean;
  size?: 'sm' | 'full';
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  data = {},
  month = "Avril 2026",
  loading = false,
  size = 'sm'
}) => {
  if (loading) {
    return <div className="glass aspect-video rounded-3xl animate-pulse bg-elevated/50" />;
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const colorFor = (pnl: number): string => {
    if (pnl > 500) return 'bg-accent text-white';
    if (pnl > 300) return 'bg-accent/85 text-white';
    if (pnl > 100) return 'bg-accent/55 text-white';
    if (pnl > 0)   return 'bg-accent/30 text-accent-2';
    if (pnl === 0) return 'bg-elevated text-txt-2';
    if (pnl > -100) return 'bg-loss/25 text-loss';
    if (pnl > -200) return 'bg-loss/50 text-white';
    return 'bg-loss text-white';
  };

  const getDayData = (day: number) => data[day] || { pnl: 0, trades: 0 };

  return (
    <div className={cn("glass rounded-3xl overflow-hidden", size === 'sm' ? 'p-6' : 'p-8')}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">{month}</h3>
        {size === 'sm' && (
          <Link to="/app/calendar" className="text-xs font-bold text-accent hover:text-accent-2 transition-colors">
            Voir plein écran →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-txt-3 py-1">{d}</div>
        ))}
        
        {/* Placeholder for empty days start of month */}
        {Array.from({ length: 2 }).map((_, i) => <div key={`empty-${i}`} />)}

        {days.map(day => {
          const dayData = getDayData(day);
          return (
            <div 
              key={day}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer shadow-lg group relative",
                colorFor(dayData.pnl)
              )}
            >
              <span className="text-[10px] font-black">{day}</span>
              {dayData.pnl !== 0 && (
                <span className="text-[8px] font-bold opacity-80">${Math.abs(dayData.pnl)}</span>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                <div className="bg-[#181C25] border border-border p-2 rounded-lg text-[10px] whitespace-nowrap shadow-2xl">
                  <div className="font-bold mb-1">{day} {month}</div>
                  <div className={dayData.pnl >= 0 ? 'text-win' : 'text-loss'}>
                    P&L: {dayData.pnl >= 0 ? '+' : ''}${dayData.pnl}
                  </div>
                  <div className="text-txt-2">{dayData.trades} trades</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
