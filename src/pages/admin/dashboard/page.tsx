import React, { useEffect, useState } from 'react';
import { Users, Activity, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import api from '../../../lib/api';

import { AdminActivityChart } from '../../../components/admin/AdminActivityChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then((res: any) => setStats(res.data.data))
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Tableau de bord Global</h1>
          <p className="text-txt-2 text-sm">Vue d'ensemble de la plateforme BTrade</p>
        </div>
        <div className="bg-loss/10 text-loss px-3 py-1 rounded-lg text-xs font-bold border border-loss/20 flex items-center gap-2">
          <AlertTriangle size={14} />
          Super Admin
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          label="Total Utilisateurs" 
          value={stats?.totalUsers || 0} 
          loading={loading}
        />
        <KpiCard 
          label="Total Comptes" 
          value={stats?.totalAccounts || 0} 
          loading={loading}
        />
        <KpiCard 
          label="Trades Enregistrés" 
          value={stats?.totalTrades || 0} 
          loading={loading}
        />
        <KpiCard 
          label="Capital sous gestion" 
          value={stats?.totalCapital?.toLocaleString() || '0'} 
          currency="$"
          loading={loading}
          colorClass="text-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminActivityChart />
        
        <div className="glass p-8 rounded-3xl h-96 flex flex-col items-center justify-center border-loss/10 hover:border-loss/30 transition-all">
          <TrendingUp size={48} className="text-txt-3 mb-4 opacity-50" />
          <h3 className="font-bold text-lg mb-2">Revenus & Abonnements</h3>
          <p className="text-txt-2 text-sm text-center max-w-sm">Intégration Stripe en cours de déploiement.</p>
        </div>
      </div>
    </div>
  );
}
