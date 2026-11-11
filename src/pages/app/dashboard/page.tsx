import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { useAccounts } from '../../../hooks/useAccounts';
import { useAccountStats } from '../../../hooks/useDashboardData';
import { useMultiAccountTrades } from '../../../hooks/useMultiAccountTrades';
import { useTrades } from '../../../hooks/useTrades';
import { usePlaybooks } from '../../../hooks/usePlaybooks';
import { useMacroEvents, MacroEvent } from '../../../hooks/useMacro';

import { KpiCard } from '../../../components/ui/KpiCard';
import { PnlCard } from '../../../components/dashboard/PnlCard';
import { WinRateGauge } from '../../../components/dashboard/WinRateGauge';
import { EquityCurve } from '../../../components/dashboard/EquityCurve';
import { LatestTrades } from '../../../components/dashboard/LatestTrades';

import { RDistribution } from '../../../components/dashboard/RDistribution';
import { CalendarHeatmap } from '../../../components/dashboard/CalendarHeatmap';
import { DisciplinePanel } from '../../../components/dashboard/DisciplinePanel';
import { BadgesPanel } from '../../../components/dashboard/BadgesPanel';
import { MacroNext24h } from '../../../components/dashboard/MacroNext24h';
import { TimeHeatmap } from '../../../components/dashboard/TimeHeatmap';
import { ChevronDown, Check } from 'lucide-react';

const num = (v: any) => Number(v ?? 0);
const fmt = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2, ...opts });

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const { playbooks } = usePlaybooks();
  const { data: macroList } = useMacroEvents({ hours: 24, minImportance: 2 });

  const { data: dashboard, error: dashboardError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard');
      return data?.data ?? null;
    },
    staleTime: 30 * 1000,
    retry: 1,
    // Toujours refetch au montage pour ne pas montrer un cache stale après reload.
    refetchOnMount: 'always',
  });
  if (dashboardError) {
    // eslint-disable-next-line no-console
    console.warn('[dashboard] /api/dashboard failed:', (dashboardError as any)?.message);
  }

  // ── Scope (cumul ou compte unique) ────────────────────────────────────
  const [scope, setScope] = useState<'all' | string>('all');
  const [scopeOpen, setScopeOpen] = useState(false);

  const isAll = scope === 'all';
  const singleAccount = !isAll ? safeAccounts.find((a: any) => a.id === scope) : null;
  const activeAccount = singleAccount || safeAccounts[0];

  const { data: singleStats, isLoading: singleStatsLoading } = useAccountStats(isAll ? undefined : scope);
  const { trades: singleTrades, isLoading: singleTradesLoading } = useTrades(isAll ? undefined : scope);
  const { trades: allTrades, isLoading: allTradesLoading } = useMultiAccountTrades(
    isAll ? safeAccounts.map((a: any) => a.id) : []
  );

  const trades = isAll ? allTrades : singleTrades;
  const isLoading = isAll ? allTradesLoading : (singleStatsLoading || singleTradesLoading);

  // ── Stats agrégées ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!isAll) return singleStats;
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0, winRate: 0, plTotal: 0, winsCount: 0, lossesCount: 0,
        profitFactor: 0, expectancy: 0, avgWin: 0, avgLoss: 0,
        bestTrade: 0, worstTrade: 0, rrMoyen: 0, maxConsecutiveWins: 0,
        equityCurve: [],
      };
    }
    let plTotal = 0, grossWin = 0, grossLoss = 0;
    let winsCount = 0, lossesCount = 0;
    let bestTrade = 0, worstTrade = 0;
    trades.forEach((t: any) => {
      const pl = num(t.plNet);
      plTotal += pl;
      if (pl > 0) { winsCount++; grossWin += pl; }
      else if (pl < 0) { lossesCount++; grossLoss += Math.abs(pl); }
      if (pl > bestTrade) bestTrade = pl;
      if (pl < worstTrade) worstTrade = pl;
    });
    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winsCount / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0;
    const expectancy = totalTrades > 0 ? plTotal / totalTrades : 0;
    const avgWin = winsCount > 0 ? grossWin / winsCount : 0;
    const avgLoss = lossesCount > 0 ? grossLoss / lossesCount : 0;

    const sortedAsc = [...trades].sort(
      (a: any, b: any) => new Date(a.dateEntree).getTime() - new Date(b.dateEntree).getTime()
    );
    const totalCapital = safeAccounts.reduce((s: number, a: any) => s + num(a.tailleCompte), 0);
    let eq = totalCapital;
    const equityCurve = sortedAsc.map((t: any) => {
      eq += num(t.plNet);
      return { date: new Date(t.dateEntree).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), equity: eq };
    });
    if (equityCurve.length > 0) {
      equityCurve.unshift({
        date: new Date(sortedAsc[0].dateEntree).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        equity: totalCapital,
      });
    }
    return {
      totalTrades, winRate, plTotal, winsCount, lossesCount,
      profitFactor, expectancy, avgWin, avgLoss,
      bestTrade, worstTrade, rrMoyen: 0, maxConsecutiveWins: 0,
      equityCurve,
    };
  }, [isAll, singleStats, trades, safeAccounts]);

  // Convert equityCurve dates to display format for single account mode
  const equityCurveDisplay = useMemo(() => {
    const raw = stats?.equityCurve || [];
    if (!isAll) {
      // Backend format: { date: ISO, equity: number }
      return raw.map((p: any) => ({
        date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        equity: num(p.equity),
      }));
    }
    return raw as Array<{ date: string; equity: number }>;
  }, [stats, isAll]);

  const equitySparkPoints = useMemo(() => equityCurveDisplay.map(p => p.equity), [equityCurveDisplay]);

  // Daily P&L pour best/worst/avg
  const { bestDay, worstDay, avgPerDay } = useMemo(() => {
    if (!trades || trades.length === 0) return { bestDay: 0, worstDay: 0, avgPerDay: 0 };
    const byDay = new Map<string, number>();
    trades.forEach((t: any) => {
      if (!t.dateEntree) return;
      const k = new Date(t.dateEntree).toISOString().slice(0, 10);
      byDay.set(k, (byDay.get(k) || 0) + num(t.plNet));
    });
    const vals = Array.from(byDay.values());
    if (vals.length === 0) return { bestDay: 0, worstDay: 0, avgPerDay: 0 };
    return {
      bestDay: Math.max(...vals),
      worstDay: Math.min(...vals),
      avgPerDay: vals.reduce((s, v) => s + v, 0) / vals.length,
    };
  }, [trades]);

  // Refs unifiés
  const totalTrades = num(stats?.totalTrades);
  const winRate = num(stats?.winRate);
  const plTotal = num(stats?.plTotal);
  const refCapital = isAll
    ? safeAccounts.reduce((s: number, a: any) => s + num(a.tailleCompte), 0)
    : num(activeAccount?.tailleCompte);
  const totalBalance = isAll
    ? safeAccounts.reduce((s: number, a: any) => s + num(a.balanceCourante), 0)
    : num(activeAccount?.balanceCourante);

  // ── Fallbacks robustes ─────────────────────────────────────────────────
  // Si /api/dashboard n'a pas (encore) répondu, on reste fonctionnel grâce
  // aux comptes + trades déjà chargés. Les vraies valeurs viendront écraser
  // au prochain render quand la réponse arrive.
  const apiPatrimoine = num(dashboard?.patrimoine?.valeurNette);
  const patrimoineNet = apiPatrimoine !== 0 ? apiPatrimoine : (totalBalance - refCapital);
  const apiProfitMois = dashboard?.moisCourant?.balance;
  const profitMois = apiProfitMois !== undefined && apiProfitMois !== null
    ? num(apiProfitMois)
    : plTotal; // approx : à défaut, le P&L total des trades chargés

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* ACCOUNT SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AccountScopeSwitcher
          scope={scope}
          setScope={setScope}
          accounts={safeAccounts}
          open={scopeOpen}
          setOpen={setScopeOpen}
        />
        <div className="flex items-center gap-3 text-xs text-txt-3">
          {refCapital > 0 && (
            <>
              <span>Capital total · <span className="text-txt font-bold font-mono">${fmt(refCapital, { maximumFractionDigits: 0 })}</span></span>
              <span className="hidden sm:inline">·</span>
            </>
          )}
          {totalBalance > 0 && (
            <span>Balance · <span className="text-txt font-bold font-mono">${fmt(totalBalance, { maximumFractionDigits: 0 })}</span></span>
          )}
        </div>
      </div>

      {/* KPI HEADER — 4 cards responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <KpiCard
          label="Patrimoine Net"
          value={fmt(patrimoineNet, { maximumFractionDigits: 0 })}
          currency="$"
          variation={undefined}
          loading={isLoading}
        />
        <KpiCard
          label="Balance Trading"
          value={fmt(totalBalance, { maximumFractionDigits: 0 })}
          currency="$"
          colorClass="text-accent"
          loading={isLoading}
        />
        <KpiCard
          label="Profit ce mois"
          value={fmt(profitMois, { maximumFractionDigits: 0 })}
          currency="$"
          variation={undefined}
          loading={isLoading}
        />
        <KpiCard
          label="Win Rate"
          value={winRate.toFixed(1)}
          currency="%"
          loading={isLoading}
        />
      </div>

      <BadgesPanel />

      {/* MIDDLE ROW : PnL Card + WinRate Gauge + Open Positions — même hauteur */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 items-stretch">
        <div className="xl:col-span-5 flex">
          <PnlCard
            plTotal={plTotal}
            winRate={winRate}
            equityPoints={equitySparkPoints}
            avgPerDay={avgPerDay}
            bestDay={bestDay}
            worstDay={worstDay}
            loading={isLoading}
          />
        </div>
        <div className="xl:col-span-3 flex">
          <WinRateGauge
            winRate={winRate}
            totalTrades={totalTrades}
            winsCount={num(stats?.winsCount)}
            lossesCount={num(stats?.lossesCount)}
            loading={isLoading}
          />
        </div>
        <div className="md:col-span-2 xl:col-span-4 flex">
          <LatestTrades trades={trades} onSeeAll={() => navigate('/app/trades')} />
        </div>
      </div>

      {/* CHARTS ROW : Equity Curve + Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        <div className="xl:col-span-8">
          <EquityCurve data={equityCurveDisplay} loading={isLoading} />
        </div>
        <div className="xl:col-span-4">
          <MiniCalendar trades={trades} onSeeAll={() => navigate('/app/calendar')} />
        </div>
      </div>

      {/* BOTTOM ROW : Top playbooks + Macro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <TopPlaybooks playbooks={playbooks} onSeeAll={() => navigate('/app/playbooks')} />
        <MacroPanel events={macroList || []} onSeeAll={() => navigate('/app/economic')} />
      </div>

    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Switcher

const AccountScopeSwitcher: React.FC<{
  scope: 'all' | string;
  setScope: (s: 'all' | string) => void;
  accounts: any[];
  open: boolean;
  setOpen: (b: boolean) => void;
}> = ({ scope, setScope, accounts, open, setOpen }) => {
  const isAll = scope === 'all';
  const selected = !isAll ? accounts.find((a: any) => a.id === scope) : null;

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const t = setTimeout(() => window.addEventListener('click', close), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('click', close);
    };
  }, [open, setOpen]);

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-2 px-3 py-2 glass rounded-xl hover:border-accent/40 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <div className="text-left">
          <p className="text-[9px] uppercase tracking-widest text-txt-3 leading-none mb-0.5">Vue</p>
          <p className="text-xs font-bold leading-none">
            {isAll
              ? `Cumul · ${accounts.length} compte${accounts.length > 1 ? 's' : ''}`
              : (selected?.nom || 'Compte')}
          </p>
        </div>
        <ChevronDown
          size={12}
          className={`text-txt-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          className="absolute top-full left-0 mt-1 w-[280px] glass rounded-xl shadow-2xl z-50 py-1 max-h-[400px] overflow-y-auto"
        >
          <ScopeItem
            label="Cumul de tous les comptes"
            sublabel={`${accounts.length} compte${accounts.length > 1 ? 's' : ''} agrégé${accounts.length > 1 ? 's' : ''}`}
            selected={isAll}
            onClick={() => { setScope('all'); setOpen(false); }}
            highlight
          />
          {accounts.length > 0 && (
            <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-txt-3 border-t border-border mt-1 pt-2">
              Par compte
            </div>
          )}
          {accounts.map((a: any) => {
            const pl = num(a.balanceCourante) - num(a.tailleCompte);
            return (
              <ScopeItem
                key={a.id}
                label={a.nom || 'Sans nom'}
                sublabel={`${a.propFirm || '—'} · $${fmt(num(a.tailleCompte), { maximumFractionDigits: 0 })} · ${a.typeCompte}`}
                badge={pl !== 0 ? `${pl >= 0 ? '+' : '-'}$${fmt(Math.abs(pl), { maximumFractionDigits: 0 })}` : undefined}
                badgeColor={pl > 0 ? 'text-win' : pl < 0 ? 'text-loss' : ''}
                selected={scope === a.id}
                onClick={() => { setScope(a.id); setOpen(false); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const ScopeItem: React.FC<{
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  selected?: boolean;
  highlight?: boolean;
  onClick: () => void;
}> = ({ label, sublabel, badge, badgeColor = '', selected, highlight, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-bg/60 transition-colors ${
      highlight ? 'bg-bg/30' : ''
    }`}
  >
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-bold truncate ${selected ? 'text-accent' : ''}`}>{label}</p>
      {sublabel && <p className="text-[10px] text-txt-3 mono truncate mt-0.5">{sublabel}</p>}
    </div>
    {badge && <span className={`text-[10px] mono font-bold ${badgeColor}`}>{badge}</span>}
    {selected && <Check size={12} className="text-accent flex-shrink-0" />}
  </button>
);

// ──────────────────────────────────────────────────────────────────────
// Mini Calendar (mois courant)

/** Clé "YYYY-MM-DD" en heure LOCALE (pas UTC), pour matcher trade ↔ cellule
 *  quel que soit le fuseau du user. Indispensable côté Europe/+1 où l'ISO
 *  UTC de minuit local tombe la veille. */
const localDayKey = (d: Date) =>
  `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

const MiniCalendar: React.FC<{ trades: any[]; onSeeAll: () => void }> = ({ trades, onSeeAll }) => {
  const { cells, monthPL, tradedDays } = useMemo(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const offset = (first.getDay() + 6) % 7; // semaine commence lundi
    const totalDays = last.getDate();

    const byDay = new Map<string, { pl: number; count: number }>();
    trades.forEach(t => {
      const d = t.dateEntree ? new Date(t.dateEntree) : null;
      if (!d || d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return;
      const k = localDayKey(d);
      const prev = byDay.get(k) || { pl: 0, count: 0 };
      byDay.set(k, { pl: prev.pl + num(t.plNet), count: prev.count + 1 });
    });

    const out: Array<{ pl: number; count: number; day: number | null; today: boolean; weekend: boolean }> = [];
    for (let i = 0; i < offset; i++) out.push({ pl: 0, count: 0, day: null, today: false, weekend: false });
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const k = localDayKey(date);
      const entry = byDay.get(k) || { pl: 0, count: 0 };
      out.push({
        pl: entry.pl,
        count: entry.count,
        day: d,
        today: date.toDateString() === new Date().toDateString(),
        weekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }

    let total = 0;
    let traded = 0;
    byDay.forEach(({ pl, count }) => {
      total += pl;
      if (count > 0) traded++;
    });
    return { cells: out, monthPL: total, tradedDays: traded };
  }, [trades]);

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Coloration simple : plein accent si gagnant, pâle si perdant, neutre sinon
  const cellBg = (pl: number, hasTrade: boolean) => {
    if (!hasTrade) return 'rgba(24,28,37,0.4)';
    if (pl > 0) return 'rgba(243,108,0,0.85)';   // accent plein
    if (pl < 0) return 'rgba(239,68,68,0.18)';   // rouge pâle
    return 'rgba(24,28,37,0.5)';                 // breakeven
  };

  return (
    <div className="glass p-6 rounded-3xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-bold text-base capitalize leading-tight">{monthLabel}</h3>
          <p className="text-[10px] mono text-txt-3 mt-0.5">
            <span className={monthPL > 0 ? 'text-win' : monthPL < 0 ? 'text-loss' : 'text-txt-3'}>
              {monthPL >= 0 ? '+' : '-'}${fmt(Math.abs(monthPL), { maximumFractionDigits: 0 })}
            </span>
            {' · '}
            <span>{tradedDays} j tradés</span>
          </p>
        </div>
        <button onClick={onSeeAll} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent-2">
          Vue plus &rsaquo;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[9px] mb-1.5 font-bold uppercase tracking-wider text-txt-3">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i} className="text-center">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((c, i) => {
          if (c.day === null) {
            return <div key={i} className="aspect-square rounded opacity-25" style={{ background: 'rgba(24,28,37,0.2)' }} />;
          }
          const hasTrade = c.count > 0;
          const isWin = hasTrade && c.pl > 0;
          return (
            <div
              key={i}
              className={`aspect-square rounded flex items-center justify-center text-[10px] mono transition-colors ${
                c.today ? 'ring-1 ring-accent ring-inset' : ''
              } ${c.weekend && !hasTrade ? 'opacity-50' : ''}`}
              style={{ background: cellBg(c.pl, hasTrade) }}
              title={
                hasTrade
                  ? `${c.day} ${monthLabel} · ${c.count} trade${c.count > 1 ? 's' : ''} · ${c.pl >= 0 ? '+' : '-'}$${fmt(Math.abs(c.pl), { maximumFractionDigits: 0 })}`
                  : `${c.day} ${monthLabel} · pas de trade`
              }
            >
              <span className={`leading-none ${
                isWin ? 'text-txt font-bold'
                  : c.today ? 'text-accent font-bold'
                  : hasTrade ? 'text-loss font-bold'
                  : 'text-txt-3'
              }`}>
                {c.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Top playbooks

const TopPlaybooks: React.FC<{ playbooks: any[]; onSeeAll: () => void }> = ({ playbooks, onSeeAll }) => (
  <div className="glass p-6 rounded-3xl">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-base">Top playbooks</h3>
      <button onClick={onSeeAll} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent-2">
        Tout voir &rsaquo;
      </button>
    </div>
    {playbooks.length === 0 ? (
      <div className="py-6 text-center">
        <p className="text-xs text-txt-2 mb-3">Aucun playbook</p>
        <button onClick={onSeeAll} className="text-[11px] font-bold uppercase tracking-widest text-accent">
          + Créer un playbook
        </button>
      </div>
    ) : (
      <div className="space-y-2">
        {playbooks.slice(0, 5).map((p: any) => {
          const tauxR = num(p.tauxReussiteEstime);
          const color = p.couleur || '#F36C00';
          return (
            <button
              key={p.id}
              onClick={onSeeAll}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg/40 transition text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: color + '22', color }}
              >
                <span className="font-black text-xs">
                  {(p.titre || '?').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{p.titre || 'Sans titre'}</p>
                <p className="text-[10px] mono text-txt-2 truncate">{p.typeStrategie || '—'}</p>
              </div>
              {tauxR > 0 && (
                <span className={`font-black mono text-sm ${tauxR >= 60 ? 'text-win' : tauxR >= 40 ? 'text-accent' : 'text-loss'}`}>
                  {tauxR.toFixed(0)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// Macro panel

const COUNTRY_FLAG_ISO: Record<string, string> = {
  US: 'us', USD: 'us', EU: 'eu', EUR: 'eu', GB: 'gb', GBP: 'gb',
  JP: 'jp', JPY: 'jp', CA: 'ca', AU: 'au', CH: 'ch', CN: 'cn',
};

const MacroPanel: React.FC<{ events: MacroEvent[]; onSeeAll: () => void }> = ({ events, onSeeAll }) => {
  const highCount = events.filter(e => e.importance === 3).length;
  return (
    <div className="glass p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base">Macro · 24h</h3>
          {highCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-loss bg-loss/10 px-1.5 py-0.5 rounded">
              {highCount} high
            </span>
          )}
        </div>
        <button onClick={onSeeAll} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent-2">
          Tout &rsaquo;
        </button>
      </div>
      {events.length === 0 ? (
        <p className="text-[11px] text-txt-3 text-center py-6 italic">Aucun event macro dans les 24h.</p>
      ) : (
        <div className="space-y-2 max-h-[260px] overflow-y-auto">
          {events.slice(0, 5).map(e => {
            const d = e.dateEvent ? new Date(e.dateEvent) : null;
            const time = d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';
            const curr = e.pays || '—';
            const iso = COUNTRY_FLAG_ISO[curr] || '';
            const lvlBar = e.importance === 3 ? 'bg-loss' : e.importance === 2 ? 'bg-accent' : 'bg-elevated';
            return (
              <button
                key={e.id}
                onClick={onSeeAll}
                className="w-full flex items-start gap-3 p-2.5 rounded-xl bg-bg/40 hover:bg-bg/70 transition text-left"
              >
                <div className="text-center flex-shrink-0 w-9">
                  <p className="text-[10px] mono uppercase text-txt-2">{time}</p>
                  <p className="text-[9px] mono text-txt-3">LOC</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" title={e.titre || ''}>
                    {e.titre || e.typeEvent || '—'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {iso && (
                      <img
                        src={`https://flagcdn.com/24x18/${iso}.png`}
                        alt={curr}
                        className="w-4 h-3 rounded-sm object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="text-[10px] mono text-txt-2">{curr}</span>
                    {e.valeurPrev != null && (
                      <span className="text-[10px] mono text-txt-3">
                        Préc {e.valeurPrev}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`w-1 h-12 rounded ${lvlBar}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default DashboardPage;
