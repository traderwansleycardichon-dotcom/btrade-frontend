import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line
} from 'recharts';

interface EquityPoint {
  date: string;
  equity: number;
}

interface EquityCurveProps {
  data?: EquityPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#181C25] border border-border p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-mono font-bold text-accent">
          ${Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const EquityCurve: React.FC<EquityCurveProps> = ({ 
  data = [
    { date: '1 Apr', equity: 100000 },
    { date: '5 Apr', equity: 102400 },
    { date: '10 Apr', equity: 101800 },
    { date: '15 Apr', equity: 105600 },
    { date: '20 Apr', equity: 104200 },
    { date: '25 Apr', equity: 108900 },
    { date: '30 Apr', equity: 112450 },
  ],
  loading = false 
}) => {
  if (loading) {
    return <div className="glass h-[350px] rounded-3xl animate-pulse bg-elevated/50" />;
  }

  return (
    <div className="glass p-6 rounded-3xl group">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-lg">Courbe d'équité</h3>
        <div className="flex bg-elevated rounded-lg p-1">
          {['30D', '90D', 'YTD', 'All'].map((p) => (
            <button 
              key={p}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                p === '30D' ? 'bg-accent text-white shadow-lg' : 'text-txt-2 hover:text-txt'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="eqArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F36C00" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#F36C00" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="eqLine" x1="0" y1="0" x2="100%" y2="0">
                <stop offset="0%" stopColor="#F36C00" />
                <stop offset="100%" stopColor="#FF8A3D" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1F2530" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              hide={false} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600, fontFamily: 'JetBrains Mono' }}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${Math.round(val/1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F36C00', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke="url(#eqLine)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#eqArea)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
