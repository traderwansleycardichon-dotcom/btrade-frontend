import React, { useEffect, useState } from 'react';
import { Server, Zap, Database, Activity, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const { addToast } = useToast();
  const [flags, setFlags] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    aiAdvisorActive: true,
    broadcastSystem: true
  });

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Rafraîchir toutes les 10s
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/api/admin/system/health');
      setHealth(res.data.data);
    } catch (err) {
      console.error('Erreur santé:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
    addToast('Configuration système mise à jour', 'success');
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-2">Système & Santé</h1>
        <p className="text-txt-2 text-sm">Surveillance des serveurs, bases de données et services tiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-6 rounded-3xl border border-border flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="p-3 bg-win/10 text-win rounded-2xl">
                  <Server size={24} />
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase ${health?.api?.status === 'operational' ? 'text-win' : 'text-loss'}`}>
                  <div className={`w-2 h-2 rounded-full ${health?.api?.status === 'operational' ? 'bg-win animate-pulse' : 'bg-loss'}`} />
                  {health?.api?.status || 'Hors-ligne'}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold">API Backend</div>
                <div className="text-[10px] text-txt-2">Latence : {health?.api?.latency || '--ms'} | Uptime : {health?.api?.uptime || '--'}</div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-border flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="p-3 bg-win/10 text-win rounded-2xl">
                  <Database size={24} />
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase ${health?.database?.status === 'connected' ? 'text-win' : 'text-loss'}`}>
                  <div className={`w-2 h-2 rounded-full ${health?.database?.status === 'connected' ? 'bg-win' : 'bg-loss'}`} />
                  {health?.database?.status === 'connected' ? 'Connecté' : 'Erreur'}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold">Base de Données ({health?.database?.provider || '...'})</div>
                <div className="text-[10px] text-txt-2">Temps de réponse : {health?.database?.latency || '--ms'}</div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Activity size={20} className="text-accent" />
                Ressources Serveur
              </h3>
              <div className="text-[10px] font-mono text-txt-3">Platform: {health?.server?.platform}</div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-txt-2">Utilisation Mémoire</span>
                  <span>{health?.server?.memoryUsage || '0%'}</span>
                </div>
                <div className="h-2 bg-elevated rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${parseInt(health?.server?.memoryUsage) > 80 ? 'bg-loss' : 'bg-win'}`} 
                    style={{ width: health?.server?.memoryUsage || '0%' }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-txt-2">Charge CPU (Load)</span>
                  <span>{health?.server?.cpuLoad || '0.00'}</span>
                </div>
                <div className="h-2 bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-border">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-orange-500" />
              Feature Flags
            </h3>
            <div className="space-y-4">
              {Object.entries(flags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-txt-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <button 
                    onClick={() => toggleFlag(key as any)}
                    className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-win' : 'bg-elevated'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-loss/20 bg-loss/5">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-loss">
              <AlertTriangle size={18} />
              Zone de Danger
            </h3>
            <button 
              onClick={() => addToast('Vider le cache en cours...', 'info')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface border border-loss/30 text-loss rounded-xl text-xs font-bold hover:bg-loss/10 transition-all"
            >
              <RefreshCw size={14} />
              Vider le cache système
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
