import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Trash2, TrendingUp, TrendingDown, Pencil, Search } from 'lucide-react';
import { useAccounts } from '../../../hooks/useAccounts';
import { useTrades } from '../../../hooks/useTrades';
import { useToast } from '../../../hooks/useToast';
import { TradeFormModal } from '../../../components/trading/TradeFormModal';

const num = (v: any) => Number(v ?? 0);
const fmt = (v: any) =>
  num(v).toLocaleString('en-US', { maximumFractionDigits: 2 });

/** P&L compact : 1234.56 → "$1,234", 12500 → "$12.5k", 1500000 → "$1.5M" */
const fmtPL = (v: number) => {
  const abs = Math.abs(v);
  const sign = v > 0 ? '+' : v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000)    return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const fmtDate = (s: string | null | undefined) => {
  if (!s) return { date: '—', time: '' };
  const d = new Date(s);
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
};

const TradesPage: React.FC = () => {
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { addToast } = useToast();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<any>(null);
  const [filter, setFilter] = useState<'tous' | 'wins' | 'losses' | 'be'>('tous');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Ouverture auto du modal via ?new=1 (depuis le bouton TopBar)
  useEffect(() => {
    if (searchParams.get('new') === '1' && safeAccounts.length > 0) {
      setIsAddOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, accountsLoading]);

  const activeId = selectedAccountId || safeAccounts.find((a: any) => a.statut === 'actif')?.id || safeAccounts[0]?.id;
  const { trades, isLoading, deleteTrade } = useTrades(activeId);
  const tradesList = Array.isArray(trades) ? trades : [];

  const filtered = useMemo(() => {
    let out = tradesList;
    if (filter === 'wins')   out = out.filter((t: any) => t.resultat === 'win');
    if (filter === 'losses') out = out.filter((t: any) => t.resultat === 'loss');
    if (filter === 'be')     out = out.filter((t: any) => t.resultat === 'breakeven');
    if (search.trim()) {
      const q = search.trim().toUpperCase();
      out = out.filter((t: any) =>
        (t.instrument || '').toUpperCase().includes(q) ||
        (t.setup || '').toUpperCase().includes(q)
      );
    }
    return out;
  }, [tradesList, filter, search]);

  const stats = useMemo(() => {
    const total = tradesList.length;
    const wins = tradesList.filter((t: any) => num(t.plNet) > 0).length;
    const losses = tradesList.filter((t: any) => num(t.plNet) < 0).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const plTotal = tradesList.reduce((s: number, t: any) => s + num(t.plNet), 0);
    return { total, wins, losses, winRate, plTotal };
  }, [tradesList]);

  const onDelete = async (id: string, instrument: string) => {
    if (!confirm(`Supprimer le trade ${instrument} ?`)) return;
    try {
      await deleteTrade.mutateAsync(id);
      addToast('Trade supprimé');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (safeAccounts.length === 0) {
    return (
      <div className="surface rounded-xl px-5 py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center mx-auto mb-3 text-accent">
          <TrendingUp size={22} />
        </div>
        <p className="text-sm font-bold mb-1">Aucun compte de trading</p>
        <p className="text-[11px] text-txt-2 mb-4 max-w-xs mx-auto">
          Crée d'abord un compte trading pour pouvoir y enregistrer des trades.
        </p>
        <Link to="/app/accounts" className="btn-primary px-3 py-1.5 rounded-md text-[11px] font-semibold inline-block">
          Aller dans Comptes →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-txt-2">Total trades</p>
          <p className="text-xl font-black mono mt-1">{stats.total}</p>
        </div>
        <div className="surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-txt-2">Win rate</p>
          <p className="text-xl font-black mono mt-1">{stats.winRate.toFixed(1)}%</p>
          <p className="text-[10px] mono text-txt-3 mt-0.5">{stats.wins}W · {stats.losses}L</p>
        </div>
        <div className="surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-txt-2">P&amp;L total</p>
          <p className={`text-xl font-black mono mt-1 ${stats.plTotal > 0 ? 'text-win' : stats.plTotal < 0 ? 'text-loss' : 'text-txt-2'}`}>
            {stats.plTotal >= 0 ? '+' : '-'}${fmt(Math.abs(stats.plTotal))}
          </p>
        </div>
        <div className="surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-txt-2">P&amp;L moyen</p>
          <p className={`text-xl font-black mono mt-1 ${stats.plTotal > 0 ? 'text-win' : stats.plTotal < 0 ? 'text-loss' : 'text-txt-2'}`}>
            {stats.total > 0
              ? `${stats.plTotal / stats.total >= 0 ? '+' : '-'}$${fmt(Math.abs(stats.plTotal / stats.total))}`
              : '—'}
          </p>
        </div>
      </div>

      {/* HEADER + FILTERS */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-xs">Trades</h3>
            <select
              value={activeId || ''}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="bg-bg border border-border rounded-md py-1.5 px-2.5 text-[11px] mono focus:border-accent/50 outline-none"
            >
              {safeAccounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.nom} — ${fmt(a.tailleCompte)}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              {(['tous', 'wins', 'losses', 'be'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-pill ${filter === f ? 'active' : ''}`}
                  style={{ fontSize: 10 }}
                >
                  {f === 'tous' ? 'Tous' : f === 'be' ? 'BE' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-txt-3 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Symbole, setup…"
                className="bg-bg border border-border rounded-md py-1.5 pl-7 pr-2 text-[11px] mono w-44 focus:border-accent/50 outline-none placeholder:text-txt-3"
              />
            </div>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            disabled={!activeId}
            className="btn-primary px-2.5 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50"
          >
            <Plus size={12} /> Nouveau trade
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-txt-2 text-[11px]">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-xs font-bold mb-1">
              {tradesList.length === 0 ? 'Aucun trade pour ce compte' : 'Aucun trade ne correspond au filtre'}
            </p>
            {tradesList.length === 0 && (
              <>
                <p className="text-[10px] text-txt-2 mb-4">Commence par ajouter ton premier trade.</p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="btn-primary px-3 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Ajouter un trade
                </button>
              </>
            )}
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-separate border-spacing-0">
              <thead>
                <tr className="bg-bg/60 text-txt-3">
                  <th className="px-3 py-2.5 text-left font-bold uppercase tracking-widest text-[9px] sticky top-0 bg-bg/60 backdrop-blur-sm">Date</th>
                  <th className="px-3 py-2.5 text-left font-bold uppercase tracking-widest text-[9px] sticky top-0 bg-bg/60 backdrop-blur-sm">Symbole</th>
                  <th className="px-3 py-2.5 text-left font-bold uppercase tracking-widest text-[9px] sticky top-0 bg-bg/60 backdrop-blur-sm">Setup</th>
                  <th className="px-3 py-2.5 text-right font-bold uppercase tracking-widest text-[9px] sticky top-0 bg-bg/60 backdrop-blur-sm">Qty</th>
                  <th className="px-3 py-2.5 text-right font-bold uppercase tracking-widest text-[9px] sticky top-0 bg-bg/60 backdrop-blur-sm">P&amp;L</th>
                  <th className="px-3 py-2.5 text-center font-bold uppercase tracking-widest text-[9px] sticky top-0 bg-bg/60 backdrop-blur-sm">Résultat</th>
                  <th className="px-3 py-2.5 sticky top-0 bg-bg/60 backdrop-blur-sm" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t: any) => {
                  const pl = num(t.plNet);
                  const isLong = t.direction === 'long' || t.direction === 'buy';
                  const DirIcon = isLong ? TrendingUp : TrendingDown;
                  const dirColor = isLong ? 'text-win' : 'text-loss';
                  const resKey = (t.resultat || 'breakeven').toLowerCase();
                  const resColor = resKey === 'win' ? 'text-win bg-win/10 border-win/20'
                    : resKey === 'loss' ? 'text-loss bg-loss/10 border-loss/20'
                    : 'text-txt-2 bg-elevated border-border';
                  const resLabel = resKey === 'win' ? 'Win' : resKey === 'loss' ? 'Loss' : 'BE';
                  const dt = fmtDate(t.dateEntree);

                  return (
                    <tr
                      key={t.id}
                      className="border-t border-border/60 hover:bg-bg/40 transition-colors group"
                    >
                      {/* DATE */}
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col leading-tight">
                          <span className="mono text-[11px] text-txt">{dt.date}</span>
                          <span className="mono text-[9px] text-txt-3">{dt.time}</span>
                        </div>
                      </td>
                      {/* SYMBOLE + DIRECTION */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <DirIcon size={12} className={dirColor} />
                          <span className="font-bold mono text-[12px] tracking-wide">{t.instrument}</span>
                        </div>
                      </td>
                      {/* SETUP */}
                      <td className="px-3 py-2.5">
                        {t.setup ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-elevated text-txt-2 border border-border">
                            {t.setup}
                          </span>
                        ) : (
                          <span className="text-txt-3 text-[11px]">·</span>
                        )}
                      </td>
                      {/* QTY */}
                      <td className="px-3 py-2.5 text-right mono text-[11px] text-txt-2">
                        {t.quantite ?? '—'}
                      </td>
                      {/* P&L */}
                      <td className={`px-3 py-2.5 text-right mono text-[12px] font-bold ${
                        pl > 0 ? 'text-win' : pl < 0 ? 'text-loss' : 'text-txt-2'
                      }`}>
                        {pl === 0 ? '—' : fmtPL(pl)}
                      </td>
                      {/* RÉSULTAT */}
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${resColor}`}>
                          {resLabel}
                        </span>
                      </td>
                      {/* ACTIONS — visibles au hover */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditTrade(t)}
                            className="p-1.5 rounded text-txt-3 hover:text-accent hover:bg-accent/10 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => onDelete(t.id, t.instrument)}
                            disabled={deleteTrade.isPending}
                            className="p-1.5 rounded text-txt-3 hover:text-loss hover:bg-loss/10 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER : count + somme du filtré */}
          <div className="px-4 py-2.5 border-t border-border flex items-center justify-between text-[10px] mono text-txt-3">
            <span>
              {filtered.length}{filtered.length !== tradesList.length ? ` / ${tradesList.length}` : ''} trade{filtered.length > 1 ? 's' : ''}
            </span>
            {(() => {
              const sum = filtered.reduce((s: number, t: any) => s + num(t.plNet), 0);
              return (
                <span>
                  Σ P&amp;L ·
                  <span className={`ml-1.5 font-bold ${sum > 0 ? 'text-win' : sum < 0 ? 'text-loss' : 'text-txt-2'}`}>
                    {sum === 0 ? '—' : fmtPL(sum)}
                  </span>
                </span>
              );
            })()}
          </div>
          </>
        )}
      </div>

      {activeId && (
        <>
          <TradeFormModal
            accountId={activeId}
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
          />
          <TradeFormModal
            accountId={activeId}
            isOpen={!!editTrade}
            onClose={() => setEditTrade(null)}
            initialTrade={editTrade}
          />
        </>
      )}
    </div>
  );
};

export default TradesPage;
