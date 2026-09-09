import React, { useState } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { Chip } from '../ui/Chip';
import { Wallet, TrendingUp, AlertTriangle, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AccountStatsModal } from './AccountStatsModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccountCardProps {
  account: any;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { passFunded, deleteAccount } = useAccounts();
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  
  const balance = Number(account.balanceCourante || 0);
  const initial = Number(account.tailleCompte || 0);
  const pnl = balance - initial;
  const pnlPct = Number(account.profitCourantPct || 0);
  
  const currentDrawdown = Number(account.drawdownCourantPct || 0);
  const maxDrawdown = Number(account.maxDrawdownPct || 10);
  const profitTarget = Number(account.profitTargetPct || 10);
  
  const isDrawdownAlert = currentDrawdown > (maxDrawdown * 0.8);

  const canPassFunded = account.typeCompte === 'evaluation' && account.statut === 'actif' && pnlPct >= profitTarget;

  return (
    <>
      <div className="glass p-6 rounded-[2.5rem] group relative overflow-hidden transition-all duration-500 hover:border-accent/30 hover:-translate-y-1">
        {/* Background Icon */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <Wallet size={120} />
        </div>

        <div className="flex justify-between items-start mb-8 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-lg tracking-tight">{account.nom}</h3>
              <Chip variant={account.typeCompte === 'funded' ? 'win' : account.typeCompte === 'evaluation' ? 'orange' : 'be'}>
                {account.typeCompte}
              </Chip>
            </div>
            <p className="text-[10px] font-black text-txt-3 uppercase tracking-widest">{account.id.split('-')[0]}</p>
          </div>
          <div className={cn(
            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
            account.statut === 'actif' ? "bg-win/10 text-win" : "bg-loss/10 text-loss"
          )}>
            {account.statut}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 relative">
          <div>
            <div className="text-[10px] font-black text-txt-3 uppercase tracking-widest mb-2">Current Balance</div>
            <div className="text-2xl font-mono font-black tracking-tighter">${balance.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-txt-3 uppercase tracking-widest mb-2">Total P&L</div>
            <div className={cn(
              "text-2xl font-mono font-black tracking-tighter",
              pnl >= 0 ? "text-win" : "text-loss"
            )}>
              {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-5 mb-8 relative">
          <div>
            <div className="flex justify-between text-[9px] font-black mb-2 uppercase tracking-widest">
              <span className="text-txt-3">Daily Drawdown</span>
              <span className={isDrawdownAlert ? "text-loss" : "text-txt-3"}>
                {currentDrawdown > 0 ? currentDrawdown.toFixed(2) : 0}% / {maxDrawdown}%
              </span>
            </div>
            <div className="h-1 dark:bg-white/5 bg-black/5 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isDrawdownAlert ? "bg-loss shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(243,108,0,0.5)]"
                )}
                style={{ width: `${Math.min((currentDrawdown / maxDrawdown) * 100, 100)}%` }}
              />
            </div>
          </div>

          {account.typeCompte === 'evaluation' && (
            <div>
              <div className="flex justify-between text-[9px] font-black mb-2 uppercase tracking-widest">
                <span className="text-txt-3">Profit Target</span>
                <span className="text-win">{pnlPct > 0 ? pnlPct.toFixed(2) : 0}% / {profitTarget}%</span>
              </div>
              <div className="h-1 dark:bg-white/5 bg-black/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-win shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                  style={{ width: `${Math.min((pnlPct / profitTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 relative">
          {canPassFunded ? (
            <button 
              onClick={() => passFunded.mutate(account.id)}
              className="flex-1 py-3 bg-win hover:bg-win/90 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} />
              Pass to Funded
            </button>
          ) : (
            <button 
              onClick={() => setIsStatsOpen(true)}
              className="flex-1 py-3 dark:bg-white/5 bg-black/5 border border-border text-txt-2 hover:text-txt text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={14} />
              Statistics
            </button>
          )}
          <button 
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte et tout son historique ?')) {
                deleteAccount.mutate(account.id);
              }
            }}
            disabled={deleteAccount.isPending}
            className="px-4 py-3 bg-loss/10 border border-loss/20 text-loss hover:bg-loss/20 rounded-2xl transition-all disabled:opacity-50"
            title="Supprimer le compte"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <AccountStatsModal 
        account={account} 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
      />
    </>
  );
};
