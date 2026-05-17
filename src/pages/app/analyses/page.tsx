import React, { useMemo, useState } from 'react';
import { BarChart3, Trash2, Link as LinkIcon } from 'lucide-react';
import { useTechnicalAnalyses, TechnicalAnalyse } from '../../../hooks/useTechnicalAnalyses';
import { useAccounts } from '../../../hooks/useAccounts';
import { useMultiAccountTrades } from '../../../hooks/useMultiAccountTrades';
import { useToast } from '../../../hooks/useToast';

const BIAS_COLOR: Record<string, string> = {
  haussier: 'text-win',
  baissier: 'text-loss',
  neutre: 'text-accent',
};

const TYPE_LABEL: Record<string, string> = {
  'pre-trade': 'Pré-trade',
  'in-trade': 'En cours',
  'post-trade': 'Post-trade',
};

const AnalysesPage: React.FC = () => {
  const { analyses, isLoading, deleteAnalyse } = useTechnicalAnalyses();
  const { accounts } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const accountIds = safeAccounts.map((a: any) => a.id);
  const { trades } = useMultiAccountTrades(accountIds);
  const { addToast } = useToast();

  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [filterBias, setFilterBias] = useState<string>('all');

  const tradesById = useMemo(() => {
    const m = new Map<string, any>();
    trades.forEach((t: any) => m.set(t.id, t));
    return m;
  }, [trades]);

  const filtered = useMemo(() => {
    return analyses.filter((a: TechnicalAnalyse) => {
      const tags = a.tags && typeof a.tags === 'object' ? a.tags : null;
      const tradeId = tags?.tradeId || null;
      if (filterTrade === 'orphan' && tradeId) return false;
      if (filterTrade !== 'all' && filterTrade !== 'orphan' && tradeId !== filterTrade) return false;
      if (filterBias !== 'all' && a.biais !== filterBias) return false;
      return true;
    });
  }, [analyses, filterTrade, filterBias]);

  const onDelete = async (a: TechnicalAnalyse) => {
    if (!confirm('Supprimer cette analyse ?')) return;
    try { await deleteAnalyse.mutateAsync(a.id); addToast('Supprimée'); }
    catch { addToast('Erreur', 'error'); }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <BarChart3 size={14} className="text-accent" /> Analyses techniques
        </h2>
        <span className="text-[10px] mono text-txt-3">
          {filtered.length} / {analyses.length} analyse{analyses.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtres */}
      <div className="surface rounded-lg px-3 py-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-txt-3 mr-1">Biais</span>
        {['all', 'haussier', 'neutre', 'baissier'].map(b => (
          <button
            key={b}
            onClick={() => setFilterBias(b)}
            className={`text-[11px] px-2.5 py-1 rounded mono transition-colors ${
              filterBias === b
                ? 'bg-accent text-white font-bold'
                : 'bg-bg text-txt-2 hover:text-txt border border-border'
            }`}
          >
            {b === 'all' ? 'Tous' : b.charAt(0).toUpperCase() + b.slice(1)}
          </button>
        ))}

        <div className="h-5 w-px bg-border mx-1" />

        <span className="text-[10px] uppercase tracking-widest text-txt-3 flex items-center gap-1">
          <LinkIcon size={10} /> Trade
        </span>
        <select
          value={filterTrade}
          onChange={e => setFilterTrade(e.target.value)}
          className="bg-bg border border-border rounded py-1 px-2 text-[10px] focus:border-accent outline-none"
        >
          <option value="all">Tous</option>
          <option value="orphan">Sans trade</option>
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

      {/* Liste */}
      {isLoading ? (
        <div className="surface rounded-lg p-10 text-center text-[11px] text-txt-3">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-lg px-5 py-14 text-center">
          <BarChart3 size={28} className="mx-auto text-txt-3 mb-3" />
          <p className="text-xs font-bold mb-1">Aucune analyse</p>
          <p className="text-[10px] text-txt-3 max-w-md mx-auto">
            Les analyses techniques se créent depuis le formulaire d'un trade (case "+ Joindre une analyse technique").
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a: TechnicalAnalyse) => {
            const tags = a.tags && typeof a.tags === 'object' ? a.tags : null;
            const tradeId = tags?.tradeId || null;
            const trade = tradeId ? tradesById.get(tradeId) : null;
            const typeLabel = (tags?.typeAnalyse && TYPE_LABEL[tags.typeAnalyse]) || '—';
            const biasColor = (a.biais && BIAS_COLOR[a.biais]) || 'text-txt-2';
            const d = new Date(a.createdAt);

            return (
              <div key={a.id} className="surface rounded-lg overflow-hidden group flex flex-col">
                {a.screenshotUrl && (
                  <img
                    src={a.screenshotUrl}
                    alt={a.titre || ''}
                    className="w-full h-32 object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="p-3.5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{a.titre || 'Sans titre'}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {a.instrument && (
                          <span className="text-[9px] font-bold uppercase mono text-txt-2">{a.instrument}</span>
                        )}
                        {a.timeframe && (
                          <span className="text-[9px] mono text-txt-3 bg-bg/60 px-1.5 py-0.5 rounded">{a.timeframe}</span>
                        )}
                        {a.biais && (
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${biasColor}`}>
                            {a.biais === 'haussier' ? '↑' : a.biais === 'baissier' ? '↓' : '→'} {a.biais}
                          </span>
                        )}
                        <span className="text-[9px] text-txt-3 mono">{typeLabel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(a)}
                      className="p-1 text-txt-2 hover:text-loss opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {a.contenu && (
                    <p className="text-[11px] text-txt-2 leading-relaxed line-clamp-4 whitespace-pre-wrap flex-1">
                      {a.contenu}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40 text-[10px] mono text-txt-3">
                    <span>{d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {trade && (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <LinkIcon size={9} /> {trade.instrument}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnalysesPage;
