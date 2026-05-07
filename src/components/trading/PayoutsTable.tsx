import React from 'react';
import { usePayouts } from '../../hooks/usePayouts';
import { Chip } from '../ui/Chip';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreditCard, Download, CheckCircle, XCircle } from 'lucide-react';

export const PayoutsTable: React.FC<{ accountId: string }> = ({ accountId }) => {
  const { payouts, isLoading, confirmPayout, rejectPayout } = usePayouts(accountId);

  if (isLoading) {
    return <div className="glass h-64 rounded-3xl animate-pulse bg-elevated/50" />;
  }

  return (
    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-border bg-surface/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-accent" />
          <h3 className="font-bold text-lg">Historique des Payouts</h3>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-elevated border border-border rounded-xl text-xs font-bold text-txt-2 hover:text-txt transition-all">
          <Download size={14} />
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-bg/30">
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Date de demande</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Profit Partagé</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-center">Split</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Montant Net</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Méthode</th>
              <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-right">Statut</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-elevated/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-xs font-bold text-txt">
                    {format(new Date(p.dateDemande), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                  <div className="text-[10px] text-txt-2 uppercase">{p.id.split('-')[0]}</div>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-sm text-win">
                  +${Number(p.profitTotal).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 rounded-lg bg-border text-[10px] font-bold text-txt-2">
                    {p.partTrader}% / {100 - p.partTrader}%
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-base text-accent">
                  ${Number(p.montantNet).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-elevated border border-border flex items-center justify-center text-[8px] font-black uppercase">
                      {p.methode === 'crypto' ? '₿' : '🏦'}
                    </div>
                    <span className="text-xs font-medium text-txt-2 uppercase">{p.methode}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Chip variant={p.statut === 'payé' ? 'win' : 'orange'} withDot>
                    {p.statut}
                  </Chip>
                </td>
                <td className="px-6 py-4 text-right">
                  {p.statut === 'en_attente' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => confirmPayout.mutate(p.id)}
                        className="p-2 text-win hover:bg-win/10 rounded-lg transition-all"
                        title="Confirmer la réception"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => rejectPayout.mutate(p.id)}
                        className="p-2 text-loss hover:bg-loss/10 rounded-lg transition-all"
                        title="Annuler / Rejeter"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-txt-3 italic">
                  Aucun historique de paiement pour ce compte.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
