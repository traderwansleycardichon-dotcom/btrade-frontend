import React from 'react';
import { Chip } from '../ui/Chip';

interface Trade {
  id: string;
  instrument: string | null;
  direction: string | null;
  prixEntree: string | number | null;
  prixSortie: string | number | null;
  dateSortie: string | null;
  plNet: string | number | null;
  quantite: string | number | null;
}

interface OpenPositionsProps {
  trades?: Trade[];
}

const num = (v: any) => Number(v ?? 0);

export const OpenPositions: React.FC<OpenPositionsProps> = ({ trades = [] }) => {
  // Position "ouverte" = pas de dateSortie OU pas de prixSortie
  const open = (trades || []).filter(t => !t.dateSortie || !t.prixSortie).slice(0, 4);

  return (
    <div className="glass p-6 rounded-3xl h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Positions Ouvertes</h3>
        <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
          {open.length > 0 ? 'Live' : '—'}
        </span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {open.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center text-txt-3 italic text-sm py-8">
            Aucune position ouverte.
          </div>
        )}
        {open.map(pos => {
          const dir = (pos.direction || '').toLowerCase();
          const isBuy = dir === 'long' || dir === 'buy';
          const pl = num(pos.plNet);
          return (
            <div
              key={pos.id}
              className="p-4 rounded-2xl bg-bg/50 border border-border group hover:border-accent/30 transition-all"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">{pos.instrument || '—'}</span>
                  <Chip variant={isBuy ? 'buy' : 'sell'} className="scale-75 origin-left">
                    {isBuy ? 'BUY' : 'SELL'} {num(pos.quantite).toFixed(2)}
                  </Chip>
                </div>
                <div className={`font-mono font-bold text-sm ${pl >= 0 ? 'text-win' : 'text-loss'}`}>
                  {pl >= 0 ? '+' : '-'}${Math.abs(pl).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                <div>
                  <div className="text-txt-3 uppercase mb-0.5">Entrée</div>
                  <div className="text-txt">{pos.prixEntree ?? '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-txt-3 uppercase mb-0.5">Quantité</div>
                  <div className="text-txt-2">{pos.quantite ?? '—'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
