import React from 'react';
import { Link } from 'react-router-dom';
import { useTrades } from '../../hooks/useTrades';
import { useAccounts } from '../../hooks/useAccounts';
import { Chip } from '../ui/Chip';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const RecentTrades: React.FC = () => {
  const { accounts, isLoading: isAccountsLoading } = useAccounts();
  
  // Sécurisation : on s'assure que accounts est bien un tableau
  const accountsList = Array.isArray(accounts) ? accounts : [];
  const activeAccount = accountsList.find((a: any) => a.statut === 'actif') || accountsList[0];
  
  const { trades, isLoading: isTradesLoading } = useTrades(activeAccount?.id);

  if (isAccountsLoading || isTradesLoading) {
    return <div className="glass p-6 rounded-3xl h-[400px] animate-pulse bg-elevated/50" />;
  }

  const tradesList = Array.isArray(trades) ? trades : [];
  const recentTrades = tradesList.slice(0, 5);

  return (
    <div className="glass rounded-3xl overflow-hidden group">
      <div className="p-6 border-b border-border flex justify-between items-center bg-surface/50">
        <h3 className="font-bold text-lg">Derniers Trades</h3>
        <div className="flex gap-2">
          {['Tous', 'Wins', 'Losses'].map(f => (
            <button key={f} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              f === 'Tous' ? 'bg-accent text-white' : 'bg-elevated text-txt-2 hover:text-txt'
            }`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-bg/30">
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Symbole</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Direction</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">P&L Net</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {recentTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-elevated/50 transition-colors cursor-pointer group/row">
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-txt">
                    {format(new Date(trade.dateEntree), 'dd MMM', { locale: fr })}
                  </div>
                  <div className="text-[10px] text-txt-3">{format(new Date(trade.dateEntree), 'HH:mm')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-sm">{trade.instrument}</div>
                  <div className="text-[10px] text-txt-3">{trade.setup || 'No Setup'}</div>
                </td>
                <td className="px-6 py-4">
                  <Chip variant={trade.direction === 'buy' ? 'buy' : 'sell'} withDot>
                    {trade.direction}
                  </Chip>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-surface/30 border-t border-border">
        <Link to="/app/trades" className="flex items-center justify-center gap-2 text-xs font-bold text-accent hover:text-accent-2 transition-all">
          Voir tout l'historique ({tradesList.length} trades)
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
};
