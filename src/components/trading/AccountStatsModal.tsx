import React from 'react';
import { Modal } from '../ui/Modal';
import { useAccounts } from '../../hooks/useAccounts';
import { TrendingUp, BarChart2, Target, PieChart, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AccountStatsModalProps {
  account: any;
  isOpen: boolean;
  onClose: () => void;
}

export const AccountStatsModal: React.FC<AccountStatsModalProps> = ({ account, isOpen, onClose }) => {
  const { useStats } = useAccounts();
  const { data: stats, isLoading } = useStats(account.id);

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Statistiques : ${account.nom}`}
      size="xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-txt-3 font-bold uppercase tracking-widest">Calcul des métriques...</p>
        </div>
      ) : stats ? (
        <div className="space-y-8 p-1">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Win Rate" 
              value={`${stats.winRate || 0}%`} 
              icon={Target} 
              color="text-accent" 
            />
            <StatCard 
              label="Profit Factor" 
              value={stats.profitFactor?.toFixed(2) || '0.00'} 
              icon={Activity} 
              color="text-win" 
            />
            <StatCard 
              label="Trade Moyen" 
              value={`$${stats.avgTrade?.toFixed(2) || '0.00'}`} 
              icon={TrendingUp} 
              color={stats.avgTrade >= 0 ? "text-win" : "text-loss"} 
            />
            <StatCard 
              label="Total Trades" 
              value={stats.totalTrades || 0} 
              icon={PieChart} 
              color="text-txt-2" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Wins vs Losses */}
            <div className="glass p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] font-black text-txt-3 uppercase tracking-widest mb-6">Distribution des Gains/Pertes</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-txt-2 text-xs mb-1 font-bold">Gains (Wins)</div>
                    <div className="text-2xl font-black text-win">{stats.winsCount || 0}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-txt-3 text-[10px] font-bold uppercase mb-1">Moy. Gain</div>
                    <div className="text-lg font-bold text-win flex items-center gap-1 justify-end">
                      <ArrowUpRight size={16} />
                      ${stats.avgWin?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-win" 
                    style={{ width: `${(stats.winsCount / (stats.totalTrades || 1)) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-loss opacity-50" 
                    style={{ width: `${(stats.lossesCount / (stats.totalTrades || 1)) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between items-start">
                   <div className="text-right ml-auto">
                    <div className="text-txt-3 text-[10px] font-bold uppercase mb-1">Moy. Perte</div>
                    <div className="text-lg font-bold text-loss flex items-center gap-1 justify-end">
                      <ArrowDownRight size={16} />
                      ${Math.abs(stats.avgLoss || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="order-first">
                    <div className="text-txt-2 text-xs mb-1 font-bold">Pertes (Losses)</div>
                    <div className="text-2xl font-black text-loss">{stats.lossesCount || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Specifics */}
            <div className="glass p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] font-black text-txt-3 uppercase tracking-widest mb-6">Objectifs de Compte</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs font-bold text-txt-2">Meilleur Trade</span>
                   <span className="font-mono font-bold text-win">+${stats.bestTrade?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs font-bold text-txt-2">Pire Trade</span>
                   <span className="font-mono font-bold text-loss">-${Math.abs(stats.worstTrade || 0).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs font-bold text-txt-2">Expectancy</span>
                   <span className="font-mono font-bold text-accent">{stats.expectancy?.toFixed(2) || '0.00'} R</span>
                 </div>
                 <div className="flex justify-between items-center py-3">
                   <span className="text-xs font-bold text-txt-2">Consécutive Wins</span>
                   <span className="font-mono font-bold text-win">{stats.maxConsecutiveWins || 0} 🔥</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-txt-3 italic">Aucune statistique disponible pour le moment.</p>
        </div>
      )}
    </Modal>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="glass p-4 rounded-2xl border-white/5">
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>
        <Icon size={14} />
      </div>
      <span className="text-[9px] font-black text-txt-3 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xl font-black truncate">{value}</div>
  </div>
);
