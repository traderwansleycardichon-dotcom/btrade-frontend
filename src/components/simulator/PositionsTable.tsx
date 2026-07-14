import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { sounds } from '../../utils/sounds';

interface Trade {
  id: string;
  asset: string;
  direction: string;
  orderType: string;
  status: string;
  entryPrice: number;
  exitPrice: number | null;
  takeProfit: number | null;
  stopLoss: number | null;
  quantity: number;
  profitLoss: number;
  openDate: string;
  closeDate: string | null;
}

interface Props {
  trades: Trade[];
  onTradeClosed: () => void;
}

export function PositionsTable({ trades, onTradeClosed }: Props) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  const [journalTrade, setJournalTrade] = useState<Trade | null>(null);
  const [journalNotes, setJournalNotes] = useState("");
  const [isJournalSaving, setIsJournalSaving] = useState(false);

  const handleClose = async (tradeId: string, quantity?: number) => {
    try {
      setClosingId(tradeId);
      const payload = quantity ? { quantity } : {};
      await api.post(`/api/simulator/trades/close/${tradeId}`, payload);
      sounds.play('close');
      toast.success(quantity ? `Fermeture partielle (${quantity})` : 'Position fermée');
      onTradeClosed();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la fermeture');
    } finally {
      setClosingId(null);
    }
  };

  const handleCancel = async (tradeId: string) => {
    try {
      setCancellingId(tradeId);
      await api.delete(`/api/simulator/trades/cancel/${tradeId}`);
      toast.success('Ordre annulé');
      onTradeClosed();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'annulation');
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveJournal = async () => {
    if (!journalTrade) return;
    try {
      setIsJournalSaving(true);
      await api.put(`/api/simulator/trades/${journalTrade.id}/journal`, { notes: journalNotes });
      toast.success('Notes sauvegardées avec succès');
      onTradeClosed(); // refresh
      setJournalTrade(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde du journal');
    } finally {
      setIsJournalSaving(false);
    }
  };

  const pendingTrades = trades.filter(t => t.status === 'pending');
  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');

  return (
    <div className="flex flex-col h-full bg-surface border-t border-border overflow-hidden">

      {/* Pending (Limit) Orders */}
      {pendingTrades.length > 0 && (
        <>
          <div className="p-3 border-b border-border bg-background/50 flex items-center gap-2">
            <h3 className="font-bold text-text text-sm">Ordres en Attente</h3>
            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{pendingTrades.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text">
              <thead className="bg-background">
                <tr>
                  <th className="p-3 font-medium text-text-muted">Asset</th>
                  <th className="p-3 font-medium text-text-muted">Direction</th>
                  <th className="p-3 font-medium text-text-muted text-right">Qté</th>
                  <th className="p-3 font-medium text-text-muted text-right">Prix Limite</th>
                  <th className="p-3 font-medium text-text-muted text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold">{trade.asset}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${trade.direction === 'long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        LIMIT {trade.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">{trade.quantity}</td>
                    <td className="p-3 text-right font-mono">${Number(trade.entryPrice).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleCancel(trade.id)}
                        disabled={cancellingId === trade.id}
                        className="bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-300 px-3 py-1 rounded text-xs font-semibold transition-colors border border-gray-600 hover:border-red-500/40 disabled:opacity-50"
                      >
                        {cancellingId === trade.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="py-2 px-3 border-b border-border bg-background/50 flex items-center gap-2">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Positions Ouvertes</span>
        <span className="text-[10px] font-bold text-text-muted">({openTrades.length})</span>
      </div>

      <div className="overflow-y-auto overflow-x-auto max-h-[240px]">
        <table className="w-full text-left text-xs text-text">
          <thead className="bg-background sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3 font-medium text-text-muted">Asset</th>
              <th className="py-2 px-3 font-medium text-text-muted">Date</th>
              <th className="py-2 px-3 font-medium text-text-muted">Type</th>
              <th className="py-2 px-3 font-medium text-text-muted text-right">Qté</th>
              <th className="py-2 px-3 font-medium text-text-muted text-right">Entrée</th>
              <th className="py-2 px-3 font-medium text-text-muted text-right">TP / SL</th>
              <th className="py-2 px-3 font-medium text-text-muted text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {openTrades.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-text-muted">
                  Aucune position ouverte
                </td>
              </tr>
            ) : (
              openTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-1.5 px-3 font-bold">{trade.asset}</td>
                  <td className="py-1.5 px-3 text-text-muted">{format(new Date(trade.openDate), 'dd MMM HH:mm', { locale: fr })}</td>
                  <td className="py-1.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${trade.direction === 'long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-right">{trade.quantity}</td>
                  <td className="py-1.5 px-3 text-right font-mono">${Number(trade.entryPrice).toLocaleString()}</td>
                  <td className="py-1.5 px-3 text-right font-mono">
                    {trade.takeProfit ? <div className="text-green-500">TP: {Number(trade.takeProfit).toLocaleString()}</div> : null}
                    {trade.stopLoss ? <div className="text-red-500">SL: {Number(trade.stopLoss).toLocaleString()}</div> : null}
                    {!trade.takeProfit && !trade.stopLoss && <span className="text-gray-500">-</span>}
                  </td>
                  <td className="py-1.5 px-3 text-right">
                    <div className="flex justify-end gap-1">
                      {trade.quantity > 0.01 && (
                        <button
                          onClick={() => handleClose(trade.id, Number((trade.quantity / 2).toFixed(2)))}
                          disabled={closingId === trade.id}
                          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors disabled:opacity-50"
                          title="Fermer 50%"
                        >
                          50%
                        </button>
                      )}
                      <button
                        onClick={() => handleClose(trade.id)}
                        disabled={closingId === trade.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold transition-colors disabled:opacity-50"
                      >
                        {closingId === trade.id ? '...' : 'Fermer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="py-2 px-3 border-y border-border bg-background/50 flex items-center gap-2">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Historique des Trades</span>
        <span className="text-[10px] font-bold text-text-muted">({closedTrades.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[240px]">
        <table className="w-full text-left text-xs text-text">
          <thead className="bg-background sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3 font-medium text-text-muted">Asset</th>
              <th className="py-2 px-3 font-medium text-text-muted">Clôture</th>
              <th className="py-2 px-3 font-medium text-text-muted text-right">Sortie</th>
              <th className="py-2 px-3 font-medium text-text-muted text-right">P&L</th>
              <th className="py-2 px-3 font-medium text-text-muted text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {closedTrades.map((trade) => (
              <tr key={trade.id} className="border-b border-border/50">
                <td className="py-1.5 px-3">
                  <span className="font-bold mr-1">{trade.asset}</span>
                  <span className={`text-[10px] ${trade.direction === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.direction.toUpperCase()}
                  </span>
                </td>
                <td className="py-1.5 px-3 text-text-muted">{trade.closeDate ? format(new Date(trade.closeDate), 'dd MMM HH:mm', { locale: fr }) : '-'}</td>
                <td className="py-1.5 px-3 text-right font-mono">${Number(trade.exitPrice).toLocaleString()}</td>
                <td className={`py-1.5 px-3 text-right font-bold ${Number(trade.profitLoss) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Number(trade.profitLoss) >= 0 ? '+' : ''}{Number(trade.profitLoss).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="py-1.5 px-3 text-right">
                  <button
                    onClick={() => {
                      setJournalTrade(trade);
                      setJournalNotes(trade.notes || "");
                    }}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors"
                  >
                    Journal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {journalTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d27] border border-[#2a2e39] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2a2e39] flex justify-between items-center bg-[#1e222d]">
              <h3 className="font-bold text-white">Journal - {journalTrade.asset}</h3>
              <button 
                onClick={() => setJournalTrade(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Notes & Leçons</label>
              <textarea
                value={journalNotes}
                onChange={(e) => setJournalNotes(e.target.value)}
                placeholder="Ex: Raison d'entrée, émotions, erreurs commises..."
                className="w-full bg-[#0d1117] border border-[#2a2e39] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary h-32 resize-none"
              />
            </div>
            <div className="p-4 border-t border-[#2a2e39] flex justify-end gap-3 bg-[#1e222d]">
              <button
                onClick={() => setJournalTrade(null)}
                className="px-4 py-2 rounded font-bold text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveJournal}
                disabled={isJournalSaving}
                className="bg-primary hover:bg-primary-hover text-[#0d1117] px-4 py-2 rounded font-bold text-sm transition-colors disabled:opacity-50"
              >
                {isJournalSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
