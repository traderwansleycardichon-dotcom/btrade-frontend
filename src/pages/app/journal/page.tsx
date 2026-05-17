import React, { useMemo, useState } from 'react';
import { Plus, Trash2, BookOpen, Search, Smile, Meh, Frown, Award, Zap, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { useJournal, JournalEntry } from '../../../hooks/useJournal';
import { useAccounts } from '../../../hooks/useAccounts';
import { useMultiAccountTrades } from '../../../hooks/useMultiAccountTrades';
import { useToast } from '../../../hooks/useToast';

type Sentiment = 'positif' | 'neutre' | 'frustré' | 'fier' | 'discipliné' | 'impulsif';

const SENTIMENT_META: Record<
  Sentiment,
  { label: string; icon: React.ComponentType<any>; color: string; bg: string; chip: string }
> = {
  positif:     { label: 'Positif',     icon: Smile,          color: 'text-win',    bg: 'rgba(16,185,129,.12)',  chip: 'chip-win' },
  fier:        { label: 'Fier',        icon: Award,          color: 'text-win',    bg: 'rgba(16,185,129,.12)',  chip: 'chip-win' },
  discipliné:  { label: 'Discipliné',  icon: Award,          color: 'text-accent', bg: 'rgba(243,108,0,.12)',   chip: 'chip-orange' },
  neutre:      { label: 'Neutre',      icon: Meh,            color: 'text-txt-2',  bg: 'rgba(107,114,128,.15)', chip: 'chip-be' },
  frustré:     { label: 'Frustré',     icon: Frown,          color: 'text-loss',   bg: 'rgba(239,68,68,.12)',   chip: 'chip-loss' },
  impulsif:    { label: 'Impulsif',    icon: Zap,            color: 'text-loss',   bg: 'rgba(239,68,68,.12)',   chip: 'chip-loss' },
};

const SENTIMENTS = Object.keys(SENTIMENT_META) as Sentiment[];

// Time ago
const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const dateLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yest.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
};

const JournalPage: React.FC = () => {
  const { entries, isLoading, error, createEntry, deleteEntry } = useJournal();
  const { accounts } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const accountIds = safeAccounts.map((a: any) => a.id);
  const { trades } = useMultiAccountTrades(accountIds);
  const { addToast } = useToast();

  const [titre, setTitre] = useState('');
  const [note, setNote] = useState('');
  const [sentiment, setSentiment] = useState<Sentiment>('neutre');
  const [tradeId, setTradeId] = useState<string>('');

  const [search, setSearch] = useState('');
  const [filterSent, setFilterSent] = useState<Sentiment | 'all'>('all');
  const [filterTrade, setFilterTrade] = useState<string>('all'); // 'all' | tradeId | 'orphan'

  const stats = useMemo(() => {
    const total = entries.length;
    const ce_mois = entries.filter((e: JournalEntry) => {
      const d = new Date(e.createdAt);
      const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;
    const counts: Record<string, number> = {};
    entries.forEach((e: JournalEntry) => {
      if (e.sentiment) counts[e.sentiment] = (counts[e.sentiment] || 0) + 1;
    });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const last = entries[0];
    return {
      total,
      ce_mois,
      dominant: dominant ? { name: dominant[0], count: dominant[1] } : null,
      last,
    };
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e: JournalEntry) => {
      if (filterSent !== 'all' && e.sentiment !== filterSent) return false;
      if (filterTrade === 'orphan' && e.tradeId) return false;
      if (filterTrade !== 'all' && filterTrade !== 'orphan' && e.tradeId !== filterTrade) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.titre?.toLowerCase().includes(q) ||
          e.contenu?.toLowerCase().includes(q) ||
          e.note?.toLowerCase().includes(q) ||
          e.sentiment?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, filterSent, filterTrade, search]);

  // Index trades par id pour affichage rapide
  const tradesById = useMemo(() => {
    const m = new Map<string, any>();
    trades.forEach((t: any) => m.set(t.id, t));
    return m;
  }, [trades]);

  const grouped = useMemo(() => {
    const groups = new Map<string, JournalEntry[]>();
    filtered.forEach((e: JournalEntry) => {
      const key = new Date(e.createdAt).toDateString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() && !note.trim()) return;
    try {
      await createEntry.mutateAsync({
        titre: titre.trim() || null,
        contenu: note.trim() || null,
        sentiment,
        trade_id: tradeId || null,
      } as any);
      addToast('Entrée ajoutée ✓');
      setTitre('');
      setNote('');
      setSentiment('neutre');
      setTradeId('');
    } catch {
      addToast("Erreur lors de l'enregistrement", 'error');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    try {
      await deleteEntry.mutateAsync(id);
      addToast('Entrée supprimée');
    } catch {
      addToast('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total entrées" value={isLoading ? '—' : stats.total.toString()} icon={BookOpen} />
        <StatCard label="Ce mois" value={isLoading ? '—' : stats.ce_mois.toString()} accent />
        <StatCard
          label="Sentiment dominant"
          value={stats.dominant ? SENTIMENT_META[stats.dominant.name as Sentiment]?.label || stats.dominant.name : '—'}
          sub={stats.dominant ? `${stats.dominant.count} entrée${stats.dominant.count > 1 ? 's' : ''}` : undefined}
        />
        <StatCard
          label="Dernière entrée"
          value={stats.last ? timeAgo(stats.last.createdAt) : '—'}
          sub={stats.last?.titre || undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* FORM (colonne gauche) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface rounded-xl">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <BookOpen size={14} className="text-accent" />
              <h3 className="font-bold text-xs">Nouvelle entrée</h3>
            </div>
            <form onSubmit={submit} className="p-4 space-y-3">
              {/* Lier à un trade */}
              <div>
                <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <LinkIcon size={10} /> Trade associé <span className="text-txt-3 normal-case tracking-normal lowercase">· optionnel</span>
                </label>
                <select
                  value={tradeId}
                  onChange={e => setTradeId(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
                >
                  <option value="">— Aucun trade (entrée libre) —</option>
                  {trades.slice(0, 50).map((t: any) => {
                    const d = t.dateEntree ? new Date(t.dateEntree) : null;
                    const dateStr = d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';
                    const pl = Number(t.plNet || 0);
                    return (
                      <option key={t.id} value={t.id}>
                        {dateStr} · {t.instrument} {t.direction === 'long' ? 'L' : 'S'} · {pl >= 0 ? '+' : '-'}${Math.abs(pl).toFixed(0)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
                  Titre <span className="text-txt-3 normal-case tracking-normal lowercase">· optionnel</span>
                </label>
                <input
                  value={titre}
                  onChange={e => setTitre(e.target.value)}
                  placeholder="Session NY ouverture…"
                  className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
                  Note
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={5}
                  placeholder="Observations, réflexions, leçons apprises…"
                  className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">
                  Sentiment du jour
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {SENTIMENTS.map(s => {
                    const meta = SENTIMENT_META[s];
                    const Icon = meta.icon;
                    const sel = sentiment === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSentiment(s)}
                        className={`py-2 px-2 rounded-lg text-[10px] font-bold border flex items-center justify-center gap-1 transition-all ${
                          sel
                            ? `${meta.color} border-current`
                            : 'border-border text-txt-2 hover:text-txt'
                        }`}
                        style={sel ? { background: meta.bg } : undefined}
                      >
                        <Icon size={10} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={createEntry.isPending || (!titre.trim() && !note.trim())}
                className="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Plus size={14} />
                {createEntry.isPending ? 'Enregistrement…' : 'Sauvegarder'}
              </button>
            </form>
          </div>

          {/* Mini tips */}
          <div className="surface rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                <AlertTriangle size={14} />
              </div>
              <div>
                <p className="text-xs font-bold mb-1">Conseil</p>
                <p className="text-[11px] text-txt-2 leading-relaxed">
                  Écris ton journal <strong className="text-txt">tous les jours</strong>, même 2 lignes.
                  Les traders profitables passent en revue leurs sessions chaque fin de journée.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE (colonne droite) */}
        <div className="lg:col-span-3">
          <div className="surface rounded-xl">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-border space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-xs">Historique</h3>
                <span className="text-[10px] mono text-txt-3">
                  {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-3" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-full bg-bg border border-border rounded-md py-1.5 pl-7 pr-2.5 text-[11px] focus:border-accent/50 outline-none"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setFilterSent('all')}
                    className={`filter-pill ${filterSent === 'all' ? 'active' : ''}`}
                    style={{ fontSize: 10 }}
                  >
                    Tous
                  </button>
                  {SENTIMENTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterSent(s)}
                      className={`filter-pill ${filterSent === s ? 'active' : ''}`}
                      style={{ fontSize: 10 }}
                    >
                      {SENTIMENT_META[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre par trade */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-txt-3 flex items-center gap-1">
                  <LinkIcon size={10} /> Trade
                </span>
                <select
                  value={filterTrade}
                  onChange={e => setFilterTrade(e.target.value)}
                  className="flex-1 bg-bg border border-border rounded-md py-1 px-2 text-[10px] focus:border-accent/50 outline-none"
                >
                  <option value="all">Tous (avec ou sans trade)</option>
                  <option value="orphan">Entrées libres (sans trade)</option>
                  {trades.slice(0, 50).map((t: any) => {
                    const d = t.dateEntree ? new Date(t.dateEntree) : null;
                    const dateStr = d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';
                    return (
                      <option key={t.id} value={t.id}>
                        {dateStr} · {t.instrument}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {isLoading && (
                <p className="text-txt-2 text-[11px] text-center py-12">Chargement…</p>
              )}
              {error && (
                <p className="text-loss text-[11px] text-center py-12">
                  Erreur : impossible de charger le journal.
                </p>
              )}
              {!isLoading && !error && grouped.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center mx-auto mb-3 text-accent">
                    <BookOpen size={20} />
                  </div>
                  <p className="text-xs font-bold mb-1">
                    {entries.length === 0 ? 'Aucune entrée pour l\'instant' : 'Aucun résultat'}
                  </p>
                  <p className="text-[10px] text-txt-2">
                    {entries.length === 0
                      ? 'Crée ta première entrée à gauche !'
                      : 'Essaie de modifier ta recherche ou le filtre.'}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {grouped.map(([dateKey, items]) => (
                  <div key={dateKey}>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-surface py-1 z-10">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-txt-3 capitalize">
                        {dateLabel(items[0].createdAt)}
                      </h4>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] mono text-txt-3">
                        {items.length} entrée{items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map(e => {
                        const meta = (e.sentiment && SENTIMENT_META[e.sentiment as Sentiment]) || SENTIMENT_META.neutre;
                        const Icon = meta.icon;
                        return (
                          <div
                            key={e.id}
                            className="group relative pl-4 pr-3 py-3 rounded-lg bg-bg/40 hover:bg-elevated/40 border border-transparent hover:border-border transition-all"
                            style={{ borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: meta.bg.replace(/[\d.]+\)$/, '0.6)') }}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {e.titre && (
                                    <p className="font-bold text-xs">{e.titre}</p>
                                  )}
                                  <span className={`chip ${meta.chip} inline-flex items-center gap-1`} style={{ fontSize: 9 }}>
                                    <Icon size={9} /> {meta.label}
                                  </span>
                                  {e.tradeId && tradesById.has(e.tradeId) && (() => {
                                    const t = tradesById.get(e.tradeId);
                                    const pl = Number(t.plNet || 0);
                                    return (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                                        <LinkIcon size={8} /> {t.instrument} · {pl >= 0 ? '+' : '-'}${Math.abs(pl).toFixed(0)}
                                      </span>
                                    );
                                  })()}
                                </div>
                                {(e.contenu || e.note) && (
                                  <p className="text-[11px] text-txt-2 leading-relaxed whitespace-pre-wrap">
                                    {e.contenu || e.note}
                                  </p>
                                )}
                                <p className="text-[9px] mono text-txt-3 mt-1.5">
                                  {timeAgo(e.createdAt)} ·{' '}
                                  {new Date(e.createdAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={() => onDelete(e.id)}
                                disabled={deleteEntry.isPending}
                                className="p-1 text-txt-3 hover:text-loss opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                title="Supprimer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  icon?: React.ComponentType<any>;
}> = ({ label, value, sub, accent, icon: Icon }) => (
  <div className="surface rounded-xl px-4 py-3 relative overflow-hidden">
    {accent && (
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(243,108,0,.18), transparent 70%)' }}
      />
    )}
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon size={11} className="text-txt-3" />}
      <p className="text-[10px] uppercase tracking-widest text-txt-2">{label}</p>
    </div>
    <p className={`text-xl font-black mono ${accent ? 'text-accent' : 'text-txt'}`}>{value}</p>
    {sub && <p className="text-[10px] text-txt-3 mt-0.5 truncate">{sub}</p>}
  </div>
);

export default JournalPage;
