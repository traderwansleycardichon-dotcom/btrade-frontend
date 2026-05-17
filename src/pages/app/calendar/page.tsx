import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAccounts } from '../../../hooks/useAccounts';
import { useTrades } from '../../../hooks/useTrades';

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const num = (v: any) => Number(v ?? 0);
const fmt = (v: number) =>
  v.toLocaleString('en-US', { maximumFractionDigits: 0 });

const dayOfWeek = (d: Date) => (d.getDay() + 6) % 7;

type DayCell = { date: Date | null; key: string | null };
type WeekSummary = {
  weekNum: number;
  start: Date;
  end: Date;
  pl: number;
  tradeCount: number;
  tradedDays: number;
  wins: number;
  losses: number;
};

const CalendarPage: React.FC = () => {
  const { accounts } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const activeId = selectedAccountId || safeAccounts[0]?.id;
  const { trades } = useTrades(activeId);
  const tradesList = Array.isArray(trades) ? trades : [];

  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const dailyPnL = useMemo(() => {
    const map = new Map<string, { pl: number; count: number }>();
    tradesList.forEach((t: any) => {
      const d = t.dateEntree ? new Date(t.dateEntree) : null;
      if (!d) return;
      if (d.getFullYear() !== cursor.y || d.getMonth() !== cursor.m) return;
      const key = d.toISOString().slice(0, 10);
      const prev = map.get(key) || { pl: 0, count: 0 };
      map.set(key, { pl: prev.pl + num(t.plNet), count: prev.count + 1 });
    });
    return map;
  }, [tradesList, cursor]);

  const grid = useMemo<DayCell[]>(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const last = new Date(cursor.y, cursor.m + 1, 0);
    const offset = dayOfWeek(first);
    const totalDays = last.getDate();
    const cells: DayCell[] = [];
    for (let i = 0; i < offset; i++) cells.push({ date: null, key: null });
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(cursor.y, cursor.m, d);
      cells.push({ date, key: date.toISOString().slice(0, 10) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, key: null });
    return cells;
  }, [cursor]);

  const rowCount = grid.length / 7;

  const weekSummaries = useMemo<WeekSummary[]>(() => {
    const weeks: WeekSummary[] = [];
    for (let w = 0; w < rowCount; w++) {
      const row = grid.slice(w * 7, w * 7 + 7);
      const realDays = row.filter(c => c.date);
      if (realDays.length === 0) continue;
      const start = realDays[0].date!;
      const end = realDays[realDays.length - 1].date!;
      let pl = 0, tradeCount = 0, tradedDays = 0, wins = 0, losses = 0;
      row.forEach(c => {
        if (!c.key) return;
        const day = dailyPnL.get(c.key);
        if (!day) return;
        pl += day.pl;
        tradeCount += day.count;
        if (day.count > 0) tradedDays++;
        if (day.pl > 0) wins++;
        else if (day.pl < 0) losses++;
      });
      weeks.push({ weekNum: w + 1, start, end, pl, tradeCount, tradedDays, wins, losses });
    }
    return weeks;
  }, [grid, dailyPnL, rowCount]);

  const monthStats = useMemo(() => {
    let pl = 0, wins = 0, losses = 0, tradedDays = 0, bestDay = 0, worstDay = 0, tradeCount = 0;
    dailyPnL.forEach(({ pl: dayPL, count }) => {
      pl += dayPL;
      tradeCount += count;
      if (count > 0) tradedDays++;
      if (dayPL > 0) wins++;
      else if (dayPL < 0) losses++;
      if (dayPL > bestDay) bestDay = dayPL;
      if (dayPL < worstDay) worstDay = dayPL;
    });
    return { pl, wins, losses, tradedDays, bestDay, worstDay, tradeCount };
  }, [dailyPnL]);

  // Score sobre, sans gradient
  const monthScore = useMemo(() => {
    if (monthStats.tradedDays === 0) return { letter: '—', color: 'text-txt-3' };
    const winRate = (monthStats.wins / Math.max(monthStats.tradedDays, 1)) * 100;
    if (monthStats.pl > 1000 && winRate >= 65) return { letter: 'A+', color: 'text-accent' };
    if (monthStats.pl > 0 && winRate >= 55) return { letter: 'A', color: 'text-win' };
    if (monthStats.pl > 0 && winRate >= 50) return { letter: 'B', color: 'text-win' };
    if (monthStats.pl > 0) return { letter: 'C', color: 'text-txt-2' };
    return { letter: 'D', color: 'text-loss' };
  }, [monthStats]);

  // Couleur cellule : palette sobre, max 60% d'opacité
  const cellBg = (pl: number) => {
    if (pl === 0) return 'rgba(24,28,37,0.4)';
    const intensity = Math.min(Math.abs(pl) / 500, 1);
    return pl > 0
      ? `rgba(243,108,0,${0.15 + intensity * 0.45})`
      : `rgba(239,68,68,${0.12 + intensity * 0.35})`;
  };

  const prev = () => setCursor(c => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }));
  const next = () => setCursor(c => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }));
  const today = () => {
    const n = new Date();
    setCursor({ y: n.getFullYear(), m: n.getMonth() });
  };

  if (safeAccounts.length === 0) {
    return (
      <div className="surface rounded-lg px-5 py-10 text-center">
        <p className="text-xs font-bold mb-1">Aucun compte</p>
        <p className="text-[10px] text-txt-3">Crée un compte trading pour voir le calendrier P&amp;L.</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 animate-[fadeIn_0.4s_ease-out]"
      style={{ height: 'calc(100vh - 8rem)', minHeight: '480px' }}
    >
      {/* HEADER */}
      <div className="surface rounded-lg px-3 py-2.5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest">Calendrier P&amp;L</span>
          <div className="h-4 w-px bg-border" />
          <select
            value={activeId || ''}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="bg-bg border border-border rounded py-1 px-2 text-[10px] mono focus:border-accent outline-none"
          >
            {safeAccounts.map((a: any) => (
              <option key={a.id} value={a.id}>{a.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={prev} className="p-1.5 rounded bg-bg border border-border text-txt-2 hover:text-txt">
            <ChevronLeft size={12} />
          </button>
          <span className="text-[11px] font-bold capitalize min-w-[120px] text-center">
            {MONTHS[cursor.m]} {cursor.y}
          </span>
          <button onClick={next} className="p-1.5 rounded bg-bg border border-border text-txt-2 hover:text-txt">
            <ChevronRight size={12} />
          </button>
          <button
            onClick={today}
            className="text-[10px] px-2 py-1 rounded mono bg-bg border border-border text-txt-2 hover:text-txt"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Stats inline du mois */}
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
          <InlineStat
            label="P&L"
            value={`${monthStats.pl >= 0 ? '+' : '-'}$${fmt(Math.abs(monthStats.pl))}`}
            color={monthStats.pl > 0 ? 'text-win' : monthStats.pl < 0 ? 'text-loss' : 'text-txt-3'}
          />
          <InlineStat label="Jours" value={monthStats.tradedDays.toString()} />
          <InlineStat label="Trades" value={monthStats.tradeCount.toString()} />
          <InlineStat label="W" value={monthStats.wins.toString()} color="text-win" />
          <InlineStat label="L" value={monthStats.losses.toString()} color="text-loss" />
        </div>
      </div>

      {/* 2 COLONNES */}
      <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
        {/* CALENDRIER */}
        <div className="col-span-12 lg:col-span-8 surface rounded-lg flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 gap-1 px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-txt-3 border-b border-border">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center pb-1">{d}</div>
            ))}
          </div>
          <div
            className="grid grid-cols-7 gap-1 p-3 flex-1"
            style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
          >
            {grid.map((cell, i) => {
              if (!cell.date || !cell.key) {
                return <div key={i} className="rounded opacity-25" style={{ background: 'rgba(24,28,37,0.2)' }} />;
              }
              const day = dailyPnL.get(cell.key);
              const pl = day?.pl ?? 0;
              const count = day?.count ?? 0;
              const dayNum = cell.date.getDate();
              const isToday = cell.date.toDateString() === new Date().toDateString();
              const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

              return (
                <div
                  key={i}
                  className={`relative flex flex-col p-1.5 rounded transition-colors ${
                    isToday ? 'ring-1 ring-accent ring-inset' : ''
                  } ${isWeekend && count === 0 ? 'opacity-50' : ''}`}
                  style={{ background: cellBg(pl) }}
                  title={
                    count > 0
                      ? `${cell.date.toLocaleDateString('fr-FR')} · ${count} trade${count > 1 ? 's' : ''} · ${pl >= 0 ? '+' : ''}$${fmt(pl)}`
                      : cell.date.toLocaleDateString('fr-FR')
                  }
                >
                  <span
                    className={`text-[11px] mono ${
                      isToday ? 'text-accent font-bold' : count > 0 ? 'text-txt font-bold' : 'text-txt-3'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {count > 0 && (
                    <div className="mt-auto">
                      <p
                        className={`text-xs mono font-bold leading-tight ${
                          pl > 0 ? 'text-win' : pl < 0 ? 'text-loss' : 'text-txt-2'
                        }`}
                      >
                        {pl >= 0 ? '+' : '-'}${fmt(Math.abs(pl))}
                      </p>
                      <p className="text-[9px] mono text-txt-3">
                        {count}t
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Légende */}
          <div className="px-3 py-1.5 border-t border-border flex items-center justify-center gap-4 text-[10px] text-txt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-accent" /> Win
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(239,68,68,.4)' }} /> Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(24,28,37,0.5)' }} /> Off
            </span>
            <span>·</span>
            <span>Intensité ∝ taille du P&amp;L</span>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 overflow-hidden">
          {/* Score sobre */}
          <div className="surface rounded-lg p-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-txt-3 mb-1">Score du mois</p>
                <p className={`text-4xl font-black mono leading-none ${monthScore.color}`}>
                  {monthScore.letter}
                </p>
                <p className="text-[10px] mono text-txt-3 mt-1.5">
                  Win rate {monthStats.tradedDays > 0
                    ? `${((monthStats.wins / monthStats.tradedDays) * 100).toFixed(0)}%`
                    : '—'}
                </p>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-txt-3">Best day</p>
                  <p className="text-xs mono font-bold text-win">
                    {monthStats.bestDay > 0 ? `+$${fmt(monthStats.bestDay)}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-txt-3">Worst day</p>
                  <p className="text-xs mono font-bold text-loss">
                    {monthStats.worstDay < 0 ? `-$${fmt(Math.abs(monthStats.worstDay))}` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé hebdo */}
          <div className="surface rounded-lg flex flex-col overflow-hidden flex-1">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold">Résumé hebdomadaire</span>
              <span className="text-[10px] mono text-txt-3">{weekSummaries.length} sem.</span>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-border/40">
              {weekSummaries.map(w => {
                const winRate = w.tradedDays > 0 ? (w.wins / w.tradedDays) * 100 : 0;
                const fromStr = `${w.start.getDate().toString().padStart(2, '0')}`;
                const toStr = `${w.end.getDate().toString().padStart(2, '0')}`;
                const isCurrentWeek = w.start <= new Date() && w.end >= new Date();
                return (
                  <div
                    key={w.weekNum}
                    className={`p-2.5 hover:bg-bg/40 transition-colors ${
                      isCurrentWeek ? 'bg-bg/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">
                          S{w.weekNum}
                        </span>
                        <span className="text-[10px] mono text-txt-2">
                          {fromStr}–{toStr}
                        </span>
                        {isCurrentWeek && (
                          <span className="text-[9px] text-accent uppercase tracking-wider">● en cours</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mono font-bold ${
                          w.pl > 0 ? 'text-win' : w.pl < 0 ? 'text-loss' : 'text-txt-3'
                        }`}
                      >
                        {w.pl === 0 ? '—' : `${w.pl >= 0 ? '+' : '-'}$${fmt(Math.abs(w.pl))}`}
                      </span>
                    </div>
                    {w.tradedDays > 0 ? (
                      <div className="flex items-center justify-between text-[10px] text-txt-3 mono">
                        <div className="flex items-center gap-2">
                          <span>{w.tradedDays}j</span>
                          <span>·</span>
                          <span>{w.tradeCount}t</span>
                          <span>·</span>
                          <span>
                            <span className="text-win">{w.wins}W</span>/<span className="text-loss">{w.losses}L</span>
                          </span>
                        </div>
                        <span className={
                          winRate >= 60 ? 'text-win' : winRate >= 40 ? 'text-accent' : 'text-loss'
                        }>
                          WR {winRate.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-txt-3">Aucun trade</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InlineStat: React.FC<{ label: string; value: string; color?: string }> = ({
  label,
  value,
  color = 'text-txt',
}) => (
  <div className="flex items-baseline gap-1.5">
    <span className="text-txt-3 uppercase tracking-widest">{label}</span>
    <span className={`font-bold mono ${color}`}>{value}</span>
  </div>
);

export default CalendarPage;
