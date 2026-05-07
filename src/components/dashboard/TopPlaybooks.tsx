import React from 'react';
import { MOCK_PLAYBOOKS } from '../../lib/mocks';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TopPlaybooks: React.FC = () => {
  return (
    <div className="glass p-6 rounded-3xl h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Top Playbooks</h3>
        <button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:text-accent-2">Voir tout</button>
      </div>

      <div className="space-y-4">
        {MOCK_PLAYBOOKS.map((pb) => (
          <div key={pb.name} className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-elevated/50 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
              pb.isPositive ? 'bg-win/10 text-win' : 'bg-loss/10 text-loss'
            }`}>
              {pb.initials}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{pb.name}</div>
              <div className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter">
                {pb.trades} trades · {pb.winRate}% WR
              </div>
            </div>

            <div className="text-right">
              <div className={`text-sm font-mono font-bold ${pb.isPositive ? 'text-win' : 'text-loss'}`}>
                {pb.isPositive ? '+' : ''}${pb.pnl.toLocaleString()}
              </div>
              <div className="flex items-center justify-end gap-1">
                {pb.isPositive ? <TrendingUp size={10} className="text-win" /> : <TrendingDown size={10} className="text-loss" />}
                <span className="text-[9px] font-bold text-txt-3">Ce mois</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
