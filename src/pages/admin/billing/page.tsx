import React, { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import api from '../../../lib/api';

export default function AdminBillingPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, transRes] = await Promise.all([
          api.get('/api/admin/billing/stats'),
          api.get('/api/admin/billing/transactions')
        ]);
        setStats(statsRes.data.data);
        setTransactions(transRes.data.data);
      } catch (err) {
        console.error('Erreur billing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-2">Gestion Financière</h1>
        <p className="text-txt-2 text-sm">Suivi des revenus, abonnements et santé économique.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          label="MRR (Revenu Mensuel)" 
          value={stats?.mrr?.toLocaleString() || '0'} 
          currency="$"
          loading={loading}
          variation={stats?.mrrGrowth}
        />
        <KpiCard 
          label="Abonnements Actifs" 
          value={stats?.activeSubs || 0} 
          loading={loading}
        />
        <KpiCard 
          label="Taux d'Attrition (Churn)" 
          value={stats?.churnRate ? `${stats.churnRate}%` : '0%'} 
          loading={loading}
        />
        <KpiCard 
          label="ARPU (Moyen/User)" 
          value={stats ? Math.round(stats.mrr / stats.activeSubs) : 0} 
          currency="$"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-3xl overflow-hidden border border-border">
          <div className="px-6 py-4 border-b border-border bg-surface/50 flex justify-between items-center">
            <h3 className="font-bold">Transactions Récentes</h3>
            <button className="text-xs font-bold text-loss hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface/30">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Utilisateur</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Montant</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-txt-3">Chargement...</td></tr>
                ) : transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold">{tx.user}</div>
                      <div className="text-[10px] text-txt-3">{tx.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tx.plan === 'Pro' ? 'bg-win/10 text-win' : 'bg-elevated text-txt-2'}`}>
                        {tx.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tx.status === 'succeeded' ? 'bg-win/10 text-win' : 'bg-loss/10 text-loss'}`}>
                        {tx.status === 'succeeded' ? 'Succès' : 'Échec'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-border">
          <h3 className="font-bold mb-6">Répartition des Plans</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-txt-2">PRO PLAN (70%)</span>
                <span>$8,715</span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-win" style={{ width: '70%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-txt-2">FREE PLAN (30%)</span>
                <span>$0</span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-loss" style={{ width: '30%' }} />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-loss/5 border border-loss/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-loss/10 rounded-lg text-loss">
                <CreditCard size={16} />
              </div>
              <span className="text-sm font-bold">Alerte Stripe</span>
            </div>
            <p className="text-xs text-txt-2 leading-relaxed">
              3 paiements ont échoué au cours des dernières 24 heures. Pensez à vérifier les litiges Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
