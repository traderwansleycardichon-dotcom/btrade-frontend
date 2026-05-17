import React from 'react';

const num = (v: any) => Number(v ?? 0);
const fmt = (n: number) => Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2 });

interface Trade {
  id: string;
  instrument: string | null;
  direction: string | null;
  prixEntree: string | number | null;
  prixSortie: string | number | null;
  quantite: string | number | null;
  plNet: string | number | null;
  resultat: string | null;
  dateEntree: string | null;
  setup?: string | null;
}

interface Props {
  trades: Trade[];
  onSeeAll: () => void;
}

export const LatestTrades: React.FC<Props> = ({ trades, onSeeAll }) => {
  const recent = [...trades]
    .sort((a, b) => new Date(b.dateEntree || 0).getTime() - new Date(a.dateEntree || 0).getTime())
    .slice(0, 2);

  return (
    <div className="glass p-5 rounded-3xl h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Derniers trades</h3>
        <button
          onClick={onSeeAll}
          className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent-2"
        >
          Tout voir &rsaquo;
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {recent.length === 0 && (
          <div className="h-full flex items-center justify-center text-center text-txt-3 italic text-xs py-4">
            Aucun trade enregistré.
          </div>
        )}
        {recent.map(t => {
          const dir = (t.direction || '').toLowerCase();
          const isBuy = dir === 'long' || dir === 'buy';
          const pl = num(t.plNet);
          const resKey = (t.resultat || 'breakeven').toLowerCase();
          const resColor =
            resKey === 'win' ? 'bg-win/10 text-win'
            : resKey === 'loss' ? 'bg-loss/10 text-loss'
            : 'bg-border/40 text-txt-2';
          const d = t.dateEntree ? new Date(t.dateEntree) : null;
          const dateStr = d
            ? `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
            : '—';

          return (
            <div
              key={t.id}
              className="p-3 rounded-2xl bg-bg/50 border border-border hover:border-accent/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-black text-sm truncate">{t.instrument || '—'}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      isBuy ? 'bg-win/10 text-win' : 'bg-loss/10 text-loss'
                    }`}
                  >
                    {isBuy ? 'BUY' : 'SELL'} {num(t.quantite).toFixed(2)}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold text-sm flex-shrink-0 ${
                    pl > 0 ? 'text-win' : pl < 0 ? 'text-loss' : 'text-txt-2'
                  }`}
                >
                  {pl > 0 ? '+' : pl < 0 ? '-' : ''}${fmt(pl)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] mono">
                <span className="text-txt-3">{dateStr}</span>
                <div className="flex items-center gap-2">
                  {t.setup && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                      {t.setup}
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${resColor}`}
                  >
                    {resKey === 'win' ? 'WIN' : resKey === 'loss' ? 'LOSS' : 'BE'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
