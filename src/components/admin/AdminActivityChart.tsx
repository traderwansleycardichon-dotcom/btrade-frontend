import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../lib/api';
import { Activity } from 'lucide-react';

export const AdminActivityChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/chart-data')
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/90 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl">
          <p className="text-txt font-bold mb-2">
            {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-txt-2">{entry.name}:</span>
              <span className="font-bold text-txt">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="glass p-8 rounded-3xl h-96 flex flex-col items-center justify-center border-border">
        <Activity size={48} className="text-txt-3 mb-4 animate-pulse" />
        <span className="text-txt-3">Chargement du graphique...</span>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-3xl h-96 flex flex-col border-border">
      <div className="mb-6">
        <h3 className="font-bold text-lg">Activité de la Plateforme (30 jours)</h3>
        <p className="text-txt-2 text-sm">Nouveaux utilisateurs et nouveaux trades</p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f36c00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f36c00" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTrades" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'dd/MM')} 
              stroke="#ffffff50" 
              fontSize={12}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis stroke="#ffffff50" fontSize={12} tickFormatter={(val) => Math.round(val).toString()} />
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="newUsers" 
              name="Inscriptions"
              stroke="#f36c00" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsers)" 
            />
            <Area 
              type="monotone" 
              dataKey="newTrades" 
              name="Nouveaux Trades"
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTrades)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
