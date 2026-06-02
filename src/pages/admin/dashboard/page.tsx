import React, { useEffect, useState } from 'react';
import { Users, Activity, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import api from '../../../lib/api';

import { AdminActivityChart } from '../../../components/admin/AdminActivityChart';
import { AdminBillingStats } from '../../../components/admin/AdminBillingStats';
import { AdminQuickPricing } from '../../../components/admin/AdminQuickPricing';

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
          <p className="text-txt-2 text-sm">Vue d'ensemble de la plateforme Behind The Trade</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">
          <AdminActivityChart />
          <AdminQuickPricing />
        </div>
        <div className="space-y-8">
          <AdminBillingStats data={stats?.billing} loading={loading} />
        </div>
      </div>
    </div>
  );
}
