import React from 'react';
import { Award, Target, ShieldX, Clock, Activity } from 'lucide-react';

interface StatsProps {
  stats: {
    totalAttempts: number;
    passedCount: number;
    failedCount: number;
    expiredCount: number;
    successRate: number;
  };
}

export function TraderProfileStats({ stats }: StatsProps) {
  if (!stats) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-accent" /> Statistiques Globales
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background rounded-xl p-3 border border-border">
          <div className="flex items-center gap-1.5 text-gray-400 mb-2">
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider truncate">Total</span>
          </div>
          <div className="text-xl font-black text-white">{stats.totalAttempts}</div>
          <div className="text-xs text-gray-500 mt-1">Challenges démarrés</div>
        </div>

        <div className="bg-background rounded-xl p-3 border border-green-500/20">
          <div className="flex items-center gap-1.5 text-green-500 mb-2">
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider truncate">Réussis</span>
          </div>
          <div className="text-xl font-black text-green-500">{stats.passedCount}</div>
          <div className="text-xs text-green-500/70 mt-1">Taux: {stats.successRate.toFixed(1)}%</div>
        </div>

        <div className="bg-background rounded-xl p-3 border border-red-500/20">
          <div className="flex items-center gap-1.5 text-red-500 mb-2">
            <ShieldX className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider truncate">Échoués</span>
          </div>
          <div className="text-xl font-black text-red-500">{stats.failedCount}</div>
          <div className="text-xs text-red-500/70 mt-1">Règles violées</div>
        </div>

        <div className="bg-background rounded-xl p-3 border border-yellow-500/20">
          <div className="flex items-center gap-1.5 text-yellow-500 mb-2">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider truncate">Expirés</span>
          </div>
          <div className="text-xl font-black text-yellow-500">{stats.expiredCount}</div>
          <div className="text-xs text-yellow-500/70 mt-1">Temps écoulé</div>
        </div>
      </div>
    </div>
  );
}
