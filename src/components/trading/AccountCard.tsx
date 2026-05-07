import React from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { Chip } from '../ui/Chip';
import { Wallet, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccountCardProps {
  account: any;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { passFunded } = useAccounts();
  
  const balance = Number(account.balanceCourante);
  const initial = Number(account.tailleCompte);
  const pnl = balance - initial;
  const pnlPct = (pnl / initial) * 100;
  
  const maxDrawdown = initial * 0.90; // 10% max DD
  const currentDrawdown = ((initial - balance) / initial) * 100;
  const isDrawdownAlert = currentDrawdown > 8;

  const canPassFunded = account.type === 'evaluation' && account.statut === 'actif' && pnlPct >= 10;

  return (
    <div className="glass p-6 rounded-3xl group relative overflow-hidden transition-all duration-300 hover:border-accent/50">
      {/* Background Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Wallet size={120} />
      </div>

      <div className="flex justify-between items-start mb-6 relative">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{account.nom}</h3>
            <Chip variant={account.type === 'funded' ? 'win' : account.type === 'evaluation' ? 'orange' : 'be'}>
              {account.type}
            </Chip>
          </div>
          <p className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">{account.id.split('-')[0]}</p>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
          account.statut === 'actif' ? "bg-win/10 text-win" : "bg-loss/10 text-loss"
        )}>
          {account.statut}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative">
        <div>
          <div className="text-[10px] font-bold text-txt-2 uppercase tracking-tighter mb-1">Solde Actuel</div>
          <div className="text-2xl font-mono font-bold tracking-tight">${balance.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-txt-2 uppercase tracking-tighter mb-1">P&L Total</div>
          <div className={cn(
            "text-2xl font-mono font-bold tracking-tight",
            pnl >= 0 ? "text-win" : "text-loss"
          )}>
            {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6 relative">
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-tighter">
            <span className="text-txt-2">Drawdown Max (10%)</span>
            <span className={isDrawdownAlert ? "text-loss" : "text-txt-2"}>
              {currentDrawdown > 0 ? currentDrawdown.toFixed(2) : 0}% / 10%
            </span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isDrawdownAlert ? "bg-loss" : "bg-accent"
              )}
              style={{ width: `${Math.min((currentDrawdown / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {account.type === 'evaluation' && (
          <div>
            <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-tighter">
              <span className="text-txt-2">Objectif (10%)</span>
              <span className="text-win">{pnlPct > 0 ? pnlPct.toFixed(2) : 0}% / 10%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-win transition-all duration-1000"
                style={{ width: `${Math.min((pnlPct / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 relative">
        {canPassFunded ? (
          <button 
            onClick={() => passFunded.mutate(account.id)}
            className="flex-1 py-2.5 bg-win hover:bg-win/90 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Passer en Funded
          </button>
        ) : (
          <button className="flex-1 py-2.5 bg-elevated border border-border text-txt-2 hover:text-txt text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            Statistiques
          </button>
        )}
        <button className="px-3 py-2.5 bg-elevated border border-border text-txt-2 hover:text-txt rounded-xl transition-all">
          <AlertTriangle size={16} />
        </button>
      </div>
    </div>
  );
};
