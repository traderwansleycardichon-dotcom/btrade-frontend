import React from 'react';
import { MOCK_MACRO_EVENTS } from '../../lib/mocks';
import { AlertTriangle, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MacroNext24h: React.FC = () => {
  return (
    <div className="glass p-6 rounded-3xl h-full border-l-4 border-l-accent/30">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent" />
          <h3 className="font-bold text-lg">Macro <span className="text-txt-2">· Next 24h</span></h3>
        </div>
        <div className="flex items-center gap-1.5 bg-accent/10 px-2 py-1 rounded text-[10px] font-bold text-accent">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_MACRO_EVENTS.map((ev, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <div className="text-xs font-mono font-bold text-txt-2 group-hover:text-txt transition-colors">
              {ev.time}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black bg-elevated px-1.5 rounded border border-border">
                  {ev.currency}
                </span>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  ev.impact === 'high' ? 'bg-loss' : 'bg-accent'
                )} />
              </div>
              <div className="font-bold text-sm truncate">{ev.event}</div>
            </div>

            <div className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
              ev.impact === 'high' ? 'text-loss bg-loss/10' : 'text-accent bg-accent/10'
            )}>
              {ev.impact}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-txt-3">
          <Clock size={12} />
          <span className="text-[10px] font-bold uppercase">Prochain impact dans 2h 14m</span>
        </div>
        <button className="text-[10px] font-bold text-accent hover:underline">Full Calendar</button>
      </div>
    </div>
  );
};
