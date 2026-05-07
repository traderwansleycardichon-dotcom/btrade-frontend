import React from 'react';
import { AccountCard } from '../../../components/trading/AccountCard';
import { useAccounts } from '../../../hooks/useAccounts';
import { Plus } from 'lucide-react';

const AccountsPage: React.FC = () => {
  const { accounts, isLoading } = useAccounts();

  const totalCapital = accounts.reduce((acc, a) => acc + Number(a.tailleCompte), 0);
  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balanceCourante), 0);
  const totalPnL = totalBalance - totalCapital;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl">
          <div className="text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1">Comptes Actifs</div>
          <div className="text-3xl font-mono font-bold">{accounts.length}</div>
        </div>
        <div className="glass p-6 rounded-3xl">
          <div className="text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1">Capital Sous Gestion</div>
          <div className="text-3xl font-mono font-bold">${totalCapital.toLocaleString()}</div>
        </div>
        <div className="glass p-6 rounded-3xl">
          <div className="text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1">P&L Global</div>
          <div className={`text-3xl font-mono font-bold ${totalPnL >= 0 ? 'text-win' : 'text-loss'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Mes Comptes Trading</h2>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Ajouter un compte
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass h-64 rounded-3xl animate-pulse bg-elevated/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
          
          <button className="glass rounded-3xl border-dashed border-2 border-border hover:border-accent/30 hover:bg-accent/5 transition-all flex flex-col items-center justify-center p-8 group min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="text-txt-3 group-hover:text-accent" />
            </div>
            <span className="font-bold text-txt-2 group-hover:text-txt">Lier un nouveau compte</span>
            <span className="text-[10px] text-txt-3 mt-1 uppercase tracking-widest">MT4 / MT5 / CTrader</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
