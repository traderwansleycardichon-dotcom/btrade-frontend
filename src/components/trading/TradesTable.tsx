import React, { useState } from 'react';
import { useTrades } from '../../hooks/useTrades';
import { useAccounts } from '../../hooks/useAccounts';
import { Chip } from '../ui/Chip';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Filter, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export const TradesTable: React.FC = () => {
  const { accounts } = useAccounts();
  const activeAccount = accounts.find(a => a.statut === 'actif') || accounts[0];
  const { trades, isLoading } = useTrades(activeAccount?.id);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-8 space-y-4 animate-pulse">
        <div className="h-8 w-full bg-border rounded" />
        <div className="h-64 w-full bg-border rounded" />
      </div>
    );
  }

  const filteredTrades = trades.filter(t => 
    t.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.setup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const currentTrades = filteredTrades.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
      {/* Header & Filters */}
      <div className="p-6 border-b border-border bg-surface/50 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3 group-focus-within:text-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un symbole, setup..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-bg border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all w-full md:w-80"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-elevated border border-border rounded-xl text-sm font-bold text-txt-2 hover:text-txt transition-all">
              <Filter size={16} />
              Filtres
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-elevated border border-border rounded-xl text-sm font-bold text-txt-2 hover:text-txt transition-all">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['Tous', 'Wins', 'Losses', 'Breakeven', 'En cours'].map(f => (
            <button key={f} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              f === 'Tous' ? 'bg-accent text-white shadow-lg' : 'bg-bg text-txt-2 border border-border hover:border-txt-3'
            }`}>{f}</button>
          ))}
          <div className="w-px h-6 bg-border mx-2" />
          {['London', 'New York', 'Asia'].map(s => (
            <button key={s} className="px-4 py-1.5 rounded-full text-xs font-bold bg-bg text-txt-2 border border-border hover:border-txt-3 transition-all">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="border-b border-border bg-bg/30">
              <th className="px-6 py-4">
                <input type="checkbox" className="rounded border-border bg-bg text-accent focus:ring-accent" />
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Date / Heure</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Symbole</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Direction</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Setup</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Entry / Exit</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-center">R</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">P&L Net</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-right">Résultat</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {currentTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-elevated/50 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded border-border bg-bg text-accent focus:ring-accent" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-bold text-txt">
                    {format(new Date(trade.dateEntree), 'dd MMM yyyy', { locale: fr })}
                  </div>
                  <div className="text-[10px] text-txt-2 font-mono">{format(new Date(trade.dateEntree), 'HH:mm:ss')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-sm tracking-tight">{trade.instrument}</div>
                  <div className="text-[10px] text-txt-3 font-bold uppercase">{trade.quantite} lots</div>
                </td>
                <td className="px-6 py-4">
                  <Chip variant={trade.direction === 'buy' ? 'buy' : 'sell'} withDot>
                    {trade.direction}
                  </Chip>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {trade.setup ? (
                      <span className="px-2 py-0.5 rounded bg-elevated border border-border text-[10px] font-bold text-txt-2">
                        {trade.setup}
                      </span>
                    ) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs">
                  <div className="text-txt">{trade.prixEntree}</div>
                  <div className="text-txt-3">{trade.prixSortie || '-'}</div>
                </td>
                <td className="px-6 py-4 text-center font-mono font-bold text-xs">
                  <span className={trade.plNet >= 0 ? 'text-win' : 'text-loss'}>
                    {trade.plNet >= 0 ? '+' : ''}{(trade.plNet / 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`font-mono font-bold text-sm ${trade.plNet >= 0 ? 'text-win' : 'text-loss'}`}>
                    {trade.plNet >= 0 ? '+' : ''}${Math.abs(trade.plNet).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Chip variant={trade.resultat === 'win' ? 'win' : trade.resultat === 'loss' ? 'loss' : 'be'}>
                    {trade.resultat}
                  </Chip>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-txt-3 hover:text-txt transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 bg-surface/50 border-t border-border flex items-center justify-between">
        <div className="text-xs font-bold text-txt-3">
          Affichage de {(page-1)*itemsPerPage + 1} à {Math.min(page*itemsPerPage, filteredTrades.length)} sur {filteredTrades.length} trades
        </div>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-lg bg-bg border border-border text-txt-2 hover:text-txt disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  page === i + 1 ? 'bg-accent text-white shadow-lg' : 'bg-bg border border-border text-txt-2 hover:text-txt'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-lg bg-bg border border-border text-txt-2 hover:text-txt disabled:opacity-50 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
