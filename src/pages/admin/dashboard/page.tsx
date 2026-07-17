import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, Wallet, TrendingUp, AlertTriangle, Server, Database, Cpu, MemoryStick, Clock, CheckCircle, XCircle, LifeBuoy, MessageSquare } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import api from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';

import { AdminActivityChart } from '../../../components/admin/AdminActivityChart';
import { AdminBillingStats } from '../../../components/admin/AdminBillingStats';
import { AdminQuickPricing } from '../../../components/admin/AdminQuickPricing';
import { BazikWalletCard } from '../../../components/admin/BazikWalletCard';

function CTODashboard() {
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/system/health'),
      api.get('/api/admin/system/logs'),
    ]).then(([h, l]) => {
      setHealth(h.data.data);
      setLogs(l.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-txt-2 text-sm p-8">Chargement système...</div>;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-1 flex items-center gap-3">
          <Server className="text-purple-400" />
          Dashboard Technique — CTO
        </h1>
        <p className="text-txt-2 text-sm">Supervision en temps réel de l'infrastructure Behind The Trades</p>
      </div>

      {/* Health KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Server size={16} className="text-purple-400" />
            <span className="text-xs font-bold text-txt-3 uppercase tracking-widest">API</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-win" />
            <span className="font-black text-win">Opérationnel</span>
          </div>
          <p className="text-txt-3 text-xs mt-1">Latence: {health?.api?.latency || '—'}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-blue-400" />
            <span className="text-xs font-bold text-txt-3 uppercase tracking-widest">Base de données</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-win" />
            <span className="font-black text-win">Connectée</span>
          </div>
          <p className="text-txt-3 text-xs mt-1">Latence: {health?.database?.latency || '—'} · {health?.database?.provider || 'PostgreSQL'}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} className="text-accent" />
            <span className="text-xs font-bold text-txt-3 uppercase tracking-widest">CPU Load</span>
          </div>
          <p className="font-black text-2xl text-txt">{health?.server?.cpuLoad || '—'}</p>
          <p className="text-txt-3 text-xs mt-1">Charge moyenne (1 min)</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <MemoryStick size={16} className="text-yellow-400" />
            <span className="text-xs font-bold text-txt-3 uppercase tracking-widest">Mémoire</span>
          </div>
          <p className="font-black text-2xl text-txt">{health?.server?.memoryUsage || '—'}</p>
          <p className="text-txt-3 text-xs mt-1">Uptime: {health?.api?.uptime || '—'}</p>
        </div>
      </div>

      {/* System Logs — complets */}
      <div className="glass rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Clock size={16} className="text-txt-2" />
            Logs Système
            <span className="text-xs font-normal text-txt-3">({logs.length} entrées)</span>
          </h3>
          <button
            onClick={() => api.get('/api/admin/system/logs').then(r => setLogs(r.data.data || []))}
            className="text-xs text-accent hover:underline"
          >
            Rafraîchir
          </button>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-txt-3 italic">Aucun log disponible</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-surface/80 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-txt-3 font-bold uppercase tracking-widest">Horodatage</th>
                  <th className="px-4 py-2 text-left text-txt-3 font-bold uppercase tracking-widest">Niveau</th>
                  <th className="px-4 py-2 text-left text-txt-3 font-bold uppercase tracking-widest">Type</th>
                  <th className="px-4 py-2 text-left text-txt-3 font-bold uppercase tracking-widest">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {logs.map((log: any, i: number) => (
                  <tr key={log.id || i} className="hover:bg-elevated/30 transition-colors">
                    <td className="px-4 py-2 font-mono text-txt-3 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.level === 'error' ? 'bg-loss/20 text-loss' :
                        log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-win/10 text-win'
                      }`}>
                        {log.level || 'info'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-txt-3">{log.type || '—'}</td>
                    <td className="px-4 py-2 text-txt max-w-xs truncate">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
function StaffDashboard() {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Espace Staff</h1>
          <p className="text-txt-2 text-sm">Bienvenue dans votre espace de gestion et support.</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold border border-primary/20 flex items-center gap-2">
          <LifeBuoy size={14} />
          Staff
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/support" className="glass p-6 rounded-2xl border-white/5 hover:border-primary/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LifeBuoy size={24} />
          </div>
          <h2 className="font-bold text-lg mb-2">Helpdesk</h2>
          <p className="text-sm text-txt-2">Gérer les tickets de support et assister les utilisateurs.</p>
        </Link>
        
        <Link to="/admin/users" className="glass p-6 rounded-2xl border-white/5 hover:border-accent/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <h2 className="font-bold text-lg mb-2">Utilisateurs</h2>
          <p className="text-sm text-txt-2">Rechercher un client et vérifier son statut.</p>
        </Link>

        <Link to="/admin/messaging" className="glass p-6 rounded-2xl border-white/5 hover:border-win/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-win/10 text-win flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <h2 className="font-bold text-lg mb-2">Messagerie</h2>
          <p className="text-sm text-txt-2">Répondre aux messages de la plateforme.</p>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isStaffMode = sessionStorage.getItem('btt_staff_mode') === 'true';

  if (user?.role === 'cto' && !isStaffMode) return <CTODashboard />;
  if (user?.role === 'staff' || isStaffMode) return <StaffDashboard />;

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
          <BazikWalletCard />
        </div>
      </div>
    </div>
  );
}
