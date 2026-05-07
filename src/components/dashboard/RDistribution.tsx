import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { MOCK_R_DISTRIBUTION } from '../../lib/mocks';

export const RDistribution: React.FC = () => {
  const data = [...MOCK_R_DISTRIBUTION.losses, ...MOCK_R_DISTRIBUTION.wins];

  return (
    <div className="glass p-6 rounded-3xl h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Distribution R</h3>
        <span className="text-[10px] font-bold text-txt-2 uppercase tracking-widest">30 Derniers Jours</span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="r" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(243,108,0,0.05)' }}
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#181C25] border border-border p-2 rounded-lg text-[10px]">
                      <div className="font-bold mb-1">R-Multiple: {payload[0].payload.r}</div>
                      <div className="text-accent">{payload[0].value} trades</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry: any, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.r.startsWith('-') ? 'rgba(239,68,68,0.4)' : '#F36C00'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-[10px] font-bold text-txt-3">Avg R: <span className="text-win">+1.8</span></div>
        <div className="text-[10px] font-bold text-txt-3">Skewness: <span className="text-accent">Positive</span></div>
      </div>
    </div>
  );
};
