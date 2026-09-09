import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DeepAnalyticsPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/journal/deep-analytics');
        setStats(data.data);
      } catch (err) {
        console.error("Erreur lors du chargement des analytics profonds", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-48 flex items-center justify-center text-gray-500">Chargement des données analytiques...</div>;
  if (!stats) return null;

  const daysMap = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayData = Object.keys(stats.byDayOfWeek).map(day => ({
    name: daysMap[parseInt(day)],
    pnl: stats.byDayOfWeek[day as any].pnl,
    count: stats.byDayOfWeek[day as any].count
  })).filter(d => d.count > 0);

  const sessionData = [
    { name: 'Asiatique (0h-8h)', pnl: stats.bySession.asian.pnl },
    { name: 'Londres (8h-13h)', pnl: stats.bySession.london.pnl },
    { name: 'New York (13h-20h)', pnl: stats.bySession.newyork.pnl },
    { name: 'Autres', pnl: stats.bySession.other.pnl }
  ].filter(d => d.pnl !== 0);

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-6">
      <h2 className="text-xl font-bold text-txt mb-6">Deep Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance par jour */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400">P&L par jour de la semaine</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, 'P&L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {dayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance par session */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400">P&L par session de trading</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, 'P&L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#3B82F6' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
