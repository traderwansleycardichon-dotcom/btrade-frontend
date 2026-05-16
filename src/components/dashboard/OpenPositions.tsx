import React from 'react';
import { MOCK_OPEN_POSITIONS } from '../../lib/mocks';
import { Chip } from '../ui/Chip';

export const OpenPositions: React.FC = () => {
  return (
    <div className="glass p-6 rounded-3xl h-fit">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Positions Ouvertes</h3>
        <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Live</span>
      </div>

      <div className="space-y-4">
        {MOCK_OPEN_POSITIONS.map((pos) => (
          <div key={pos.id} className="p-4 rounded-2xl bg-bg/50 border border-border group hover:border-accent/30 transition-all">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm">{pos.symbol}</span>
                <Chip variant={pos.direction === 'BUY' ? 'buy' : 'sell'} className="scale-75 origin-left">
                  {pos.direction}
                </Chip>
              </div>
              <div className={`font-mono font-bold ${pos.pnl >= 0 ? 'text-win' : 'text-loss'}`}>
                {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}$
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[9px] font-bold text-txt-3 uppercase mb-0.5">Entrée</div>
                <div className="text-xs font-mono">{pos.entryPrice}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-txt-3 uppercase mb-0.5">SL / TP</div>
                <div className="text-xs font-mono text-txt-2">{pos.sl} / {pos.tp}</div>
              </div>
            </div>

            <div className="relative h-1 bg-border rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-accent transition-all duration-1000"
                style={{ width: `${pos.progressPct}%` }}
              />
            </div>
          </div>
        ))}
        {MOCK_OPEN_POSITIONS.length === 0 && (
          <div className="py-8 text-center text-txt-3 italic text-sm">
            Aucune position ouverte actuellement.
          </div>
        )}
      </div>
    </div>
  );
};
