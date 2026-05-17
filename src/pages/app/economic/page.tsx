import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Search, X, MessageSquare, Sparkles } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { MacroEvent } from '../../../hooks/useMacro';

// ──────────────────────────────────────────────────────────────────────────
// Drapeaux : on utilise flagcdn (CDN public, PNG 32x24 par défaut)
// Codes Finnhub : US, GB, EU, JP, CA, AU, CH, CN, NZ, DE, FR, IT, ES, ...
// EU n'a pas de code ISO-2 ; on fallback sur eu.svg de flagcdn (existe).
const COUNTRY_TO_ISO: Record<string, string> = {
  US: 'us', USD: 'us',
  EU: 'eu', EUR: 'eu',
  GB: 'gb', GBP: 'gb', UK: 'gb',
  JP: 'jp', JPY: 'jp',
  CA: 'ca', CAD: 'ca',
  AU: 'au', AUD: 'au',
  CH: 'ch', CHF: 'ch',
  CN: 'cn', CNY: 'cn',
  NZ: 'nz', NZD: 'nz',
  DE: 'de', FR: 'fr', IT: 'it', ES: 'es',
  HK: 'hk', SG: 'sg', IN: 'in', BR: 'br',
  MX: 'mx', ZA: 'za', KR: 'kr', TR: 'tr',
  RU: 'ru', SE: 'se', NO: 'no', DK: 'dk',
  PL: 'pl', NL: 'nl', BE: 'be', AT: 'at',
  PT: 'pt', IE: 'ie', GR: 'gr', FI: 'fi',
};

const Flag: React.FC<{ code: string; size?: number; title?: string }> = ({
  code,
  size = 18,
  title,
}) => {
  const iso = COUNTRY_TO_ISO[code?.toUpperCase()] || '';
  if (!iso) {
    return (
      <span
        className="inline-flex items-center justify-center mono text-[8px] font-bold text-txt-3 bg-elevated border border-border rounded"
        style={{ width: size * 1.33, height: size, lineHeight: `${size}px` }}
        title={title || code}
      >
        {code}
      </span>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/${size * 2}x${Math.round((size * 2 * 3) / 4)}/${iso}.png`}
      srcSet={`https://flagcdn.com/${size * 4}x${Math.round((size * 4 * 3) / 4)}/${iso}.png 2x`}
      alt={code}
      title={title || code}
      className="inline-block rounded-sm object-cover flex-shrink-0"
      style={{ width: size * 1.33, height: size }}
      loading="lazy"
    />
  );
};

// ──────────────────────────────────────────────────────────────────────────

const IMP_META: Record<number, { label: string; color: string; bar: string }> = {
  3: { label: 'High',   color: 'text-loss',   bar: 'bg-loss' },
  2: { label: 'Med',    color: 'text-accent', bar: 'bg-accent' },
  1: { label: 'Low',    color: 'text-txt-3',  bar: 'bg-border' },
};

const formatVal = (v: any) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (Number.isFinite(n)) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }
  return String(v);
};

const surpriseColor = (consensus: any, actual: any) => {
  if (actual === null || actual === undefined || actual === '') return 'text-txt';
  if (consensus === null || consensus === undefined || consensus === '') return 'text-txt';
  const c = Number(consensus);
  const a = Number(actual);
  if (!Number.isFinite(c) || !Number.isFinite(a)) return 'text-txt';
  if (a > c) return 'text-win';
  if (a < c) return 'text-loss';
  return 'text-txt';
};

type Range = '24h' | '7d' | '30d' | 'past';

const EconomicPage: React.FC = () => {
  const { addToast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [range, setRange] = useState<Range>('7d');
  const [minImportance, setMinImportance] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState('');
  const [pays, setPays] = useState<string | null>(null);
  const [selected, setSelected] = useState<MacroEvent | null>(null);

  const { fromISO, toISO } = useMemo(() => {
    const now = new Date();
    let from: Date, to: Date;
    if (range === '24h')      { from = now;                                  to = new Date(now.getTime() + 24 * 3600 * 1000); }
    else if (range === '7d')  { from = now;                                  to = new Date(now.getTime() + 7  * 24 * 3600 * 1000); }
    else if (range === '30d') { from = now;                                  to = new Date(now.getTime() + 30 * 24 * 3600 * 1000); }
    else                       { from = new Date(now.getTime() - 7 * 24 * 3600 * 1000); to = now; }
    return { fromISO: from.toISOString().slice(0, 10), toISO: to.toISOString().slice(0, 10) };
  }, [range]);

  const { data: events, isLoading, isFetching } = useQuery<MacroEvent[]>({
    queryKey: ['macro-events-page', fromISO, toISO, minImportance, pays],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: fromISO,
        to: toISO,
        importance: String(minImportance),
      });
      if (pays) params.set('pays', pays);
      const { data } = await api.get(`/api/macro/events?${params}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60 * 1000,
  });

  const filtered = useMemo(() => {
    const list = events || [];
    let result = list.filter(e => e.dateEvent !== null);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        e =>
          e.titre?.toLowerCase().includes(q) ||
          e.typeEvent?.toLowerCase().includes(q) ||
          e.pays?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) =>
      new Date(a.dateEvent!).getTime() - new Date(b.dateEvent!).getTime()
    );
  }, [events, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, MacroEvent[]>();
    filtered.forEach(e => {
      const key = new Date(e.dateEvent!).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    (events || []).forEach(e => e.pays && set.add(e.pays));
    return Array.from(set).sort();
  }, [events]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const high = filtered.filter(e => e.importance === 3).length;
    const med = filtered.filter(e => e.importance === 2).length;
    const sources = new Set(filtered.map(e => e.source)).size;
    return { total, high, med, sources };
  }, [filtered]);

  const sync = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/macro/events/sync', {});
      return data;
    },
    onSuccess: (res: any) => {
      const finnhub = Array.isArray(res) ? res.find((r: any) => r.source === 'finnhub') : null;
      addToast(`Sync · ${finnhub?.count ?? 0} évènements`);
      qc.invalidateQueries({ queryKey: ['macro-events-page'] });
      qc.invalidateQueries({ queryKey: ['macro-events'] });
    },
    onError: () => addToast('Erreur de synchronisation', 'error'),
  });

  return (
    <div className="space-y-3 animate-[fadeIn_0.4s_ease-out]">
      {/* STATS BAR */}
      <div className="grid grid-cols-4 gap-2">
        <div className="surface rounded-lg px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-txt-3">Évènements</p>
          <p className="text-lg font-black mono">{stats.total}</p>
        </div>
        <div className="surface rounded-lg px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-txt-3">High impact</p>
          <p className="text-lg font-black mono text-loss">{stats.high}</p>
        </div>
        <div className="surface rounded-lg px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-txt-3">Medium impact</p>
          <p className="text-lg font-black mono text-accent">{stats.med}</p>
        </div>
        <div className="surface rounded-lg px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-txt-3">Sources</p>
          <p className="text-lg font-black mono">{stats.sources}</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="surface rounded-lg px-3 py-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-txt-3 mr-1">Période</span>
        {(['24h', '7d', '30d', 'past'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`text-[11px] px-2.5 py-1 rounded mono transition-colors ${
              range === r
                ? 'bg-accent text-white font-bold'
                : 'bg-bg text-txt-2 hover:text-txt border border-border'
            }`}
          >
            {r === 'past' ? '7j passés' : r === '24h' ? '24h' : r === '7d' ? '7j' : '30j'}
          </button>
        ))}

        <div className="h-5 w-px bg-border mx-1" />

        <span className="text-[10px] uppercase tracking-widest text-txt-3 mr-1">Impact</span>
        {([1, 2, 3] as const).map(i => (
          <button
            key={i}
            onClick={() => setMinImportance(i)}
            className={`text-[11px] px-2.5 py-1 rounded mono transition-colors ${
              minImportance === i
                ? 'bg-accent text-white font-bold'
                : 'bg-bg text-txt-2 hover:text-txt border border-border'
            }`}
          >
            {i === 1 ? 'Tous' : i === 2 ? 'Med+' : 'High'}
          </button>
        ))}

        <div className="h-5 w-px bg-border mx-1" />

        <select
          value={pays || ''}
          onChange={e => setPays(e.target.value || null)}
          className="bg-bg border border-border rounded py-1 px-2 text-[11px] mono focus:border-accent outline-none"
        >
          <option value="">Tous pays</option>
          {availableCountries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="ml-auto relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-txt-3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un événement…"
            className="bg-bg border border-border rounded py-1.5 pl-6 pr-2 text-[11px] focus:border-accent outline-none w-[220px]"
          />
        </div>

        <button
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
          className="text-[11px] px-2.5 py-1.5 rounded mono bg-bg border border-border text-txt-2 hover:text-txt hover:border-txt-3 flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw size={11} className={sync.isPending ? 'animate-spin' : ''} />
          {sync.isPending ? 'Sync…' : 'Sync Finnhub'}
        </button>
      </div>

      {/* TABLE */}
      <div className="surface rounded-lg overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-bg/60 text-txt-3 border-b border-border">
            <tr>
              <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[110px]">Date · Heure</th>
              <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[80px]">Pays</th>
              <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Évènement</th>
              <th className="text-right px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Préc.</th>
              <th className="text-right px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Cons.</th>
              <th className="text-right px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Actuel</th>
              <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Unité</th>
              <th className="text-center px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[70px]">Impact</th>
              <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[70px]">Source</th>
              <th className="text-right px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-txt-3">Chargement…</td>
              </tr>
            )}
            {!isLoading && grouped.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <p className="text-xs font-bold mb-1">Aucun évènement</p>
                  <p className="text-[10px] text-txt-3 mb-3">Ajuste les filtres ou synchronise Finnhub.</p>
                  <button
                    onClick={() => sync.mutate()}
                    className="text-[11px] px-2.5 py-1.5 rounded mono bg-bg border border-border text-txt-2 hover:text-txt inline-flex items-center gap-1.5"
                  >
                    <RefreshCw size={11} />
                    Synchroniser
                  </button>
                </td>
              </tr>
            )}
            {grouped.map(([dateKey, items]) => {
              const d = new Date(items[0].dateEvent!);
              const today = new Date();
              const yest = new Date(today.getTime() - 86400000);
              const tmrw = new Date(today.getTime() + 86400000);
              let dateLabel: string;
              if (d.toDateString() === today.toDateString()) dateLabel = "Aujourd'hui";
              else if (d.toDateString() === yest.toDateString()) dateLabel = 'Hier';
              else if (d.toDateString() === tmrw.toDateString()) dateLabel = 'Demain';
              else dateLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });

              return (
                <React.Fragment key={dateKey}>
                  <tr className="bg-bg/40">
                    <td colSpan={9} className="px-3 py-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-txt capitalize">
                          {dateLabel}
                        </span>
                        <span className="text-[10px] mono text-txt-3">
                          {d.toLocaleDateString('fr-FR')}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] mono text-txt-3">{items.length} évèn.</span>
                      </div>
                    </td>
                  </tr>
                  {items.map(e => {
                    const dd = new Date(e.dateEvent!);
                    const time = dd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    const imp = IMP_META[e.importance || 1];
                    const isPast = dd < new Date();
                    const actualColor = surpriseColor(e.valeurConsensus, e.valeurActual);

                    return (
                      <tr
                        key={e.id}
                        onClick={() => setSelected(e)}
                        className={`border-t border-border/50 hover:bg-bg/50 cursor-pointer transition-colors ${
                          isPast ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="px-3 py-2 mono text-txt-2">
                          <span className="text-[11px]">{time}</span>
                          <span className="text-[9px] text-txt-3 ml-1">
                            {dd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Flag code={e.pays || ''} size={14} />
                            <span className="text-[10px] mono text-txt-2">{e.pays || '—'}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <p className="text-[11px] truncate max-w-[340px]" title={e.titre || ''}>
                            {e.titre || e.typeEvent || '—'}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right mono text-txt-2">
                          {formatVal(e.valeurPrev) || <span className="text-txt-3">—</span>}
                        </td>
                        <td className="px-3 py-2 text-right mono text-txt-2">
                          {formatVal(e.valeurConsensus) || <span className="text-txt-3">—</span>}
                        </td>
                        <td className={`px-3 py-2 text-right mono font-bold ${actualColor}`}>
                          {formatVal(e.valeurActual) || <span className="text-txt-3 font-normal">—</span>}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-txt-3 mono">{e.unite || '—'}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`block w-1 h-3 rounded-sm ${imp.bar}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${imp.color}`}>
                              {imp.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[10px] uppercase tracking-wider text-txt-3 mono">
                          {e.source || '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={ev => {
                              ev.stopPropagation();
                              navigate(`/app/ai-chat?eventId=${e.id}`);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-accent hover:text-accent-2 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-accent/10 transition-colors opacity-70 group-hover:opacity-100"
                            title="Discuter avec l'IA"
                          >
                            <Sparkles size={10} /> Discuter
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {isFetching && !isLoading && (
          <p className="text-[10px] text-txt-3 text-center py-2 border-t border-border/40">Mise à jour…</p>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {selected && (
        <EventDetailDrawer
          event={selected}
          onClose={() => setSelected(null)}
          onDiscuss={() => navigate(`/app/ai-chat?eventId=${selected.id}`)}
        />
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────

const EventDetailDrawer: React.FC<{ event: MacroEvent; onClose: () => void; onDiscuss: () => void }> = ({ event, onClose, onDiscuss }) => {
  const d = event.dateEvent ? new Date(event.dateEvent) : null;
  const imp = IMP_META[event.importance || 1];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] surface border-l border-border h-full overflow-y-auto">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag code={event.pays || ''} size={16} />
            <span className="text-[11px] mono text-txt-2">{event.pays || '—'}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${imp.color}`}>
              {imp.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-txt-2 hover:text-txt">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold leading-tight">{event.titre || event.typeEvent || '—'}</h3>
              {event.typeEvent && event.typeEvent !== event.titre && (
                <p className="text-[10px] uppercase tracking-widest text-txt-3 mt-1">{event.typeEvent}</p>
              )}
            </div>
            <button
              onClick={onDiscuss}
              className="text-[10px] font-bold uppercase tracking-widest bg-accent hover:bg-accent-2 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 flex-shrink-0"
            >
              <Sparkles size={11} /> Discuter avec l'IA
            </button>
          </div>

          {d && (
            <div className="grid grid-cols-2 gap-3 pb-4 border-b border-border">
              <Field label="Date" value={d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} />
              <Field label="Heure" value={d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} mono />
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pb-4 border-b border-border">
            <Cell label="Précédent" value={formatVal(event.valeurPrev)} />
            <Cell label="Consensus" value={formatVal(event.valeurConsensus)} />
            <Cell
              label="Actuel"
              value={formatVal(event.valeurActual)}
              valueColor={surpriseColor(event.valeurConsensus, event.valeurActual)}
            />
          </div>

          <div className="space-y-2">
            <Field label="Unité" value={event.unite || '—'} mono />
            <Field label="Source" value={event.source || '—'} mono />
            {event.note && <Field label="Note" value={event.note} block />}
          </div>

          <details className="pt-3 border-t border-border">
            <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-txt-3 hover:text-txt-2">
              Métadonnées techniques
            </summary>
            <div className="mt-2 space-y-1.5 text-[10px] mono text-txt-3">
              <div><span className="text-txt-2">ID :</span> {event.id}</div>
              {event.externalId && <div className="break-all"><span className="text-txt-2">External :</span> {event.externalId}</div>}
              <div><span className="text-txt-2">Importance :</span> {event.importance ?? '—'} / 3</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; mono?: boolean; block?: boolean }> = ({
  label,
  value,
  mono,
  block,
}) => (
  <div className={block ? 'space-y-1' : 'flex items-baseline gap-3'}>
    <span className="text-[10px] uppercase tracking-widest text-txt-3">{label}</span>
    <span className={`text-xs ${mono ? 'mono' : ''} text-txt ${block ? 'block leading-relaxed' : ''}`}>
      {value}
    </span>
  </div>
);

const Cell: React.FC<{ label: string; value: string | null; valueColor?: string }> = ({
  label,
  value,
  valueColor = 'text-txt',
}) => (
  <div className="bg-bg/40 border border-border rounded p-2.5">
    <p className="text-[9px] uppercase tracking-widest text-txt-3 mb-1">{label}</p>
    <p className={`text-sm mono font-bold ${valueColor}`}>{value || <span className="text-txt-3 font-normal">—</span>}</p>
  </div>
);

export default EconomicPage;
