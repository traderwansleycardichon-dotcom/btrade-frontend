import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface Props {
  trades: any[];
  initialBalance: number;
}

export function EquityCurveChart({ trades, initialBalance }: Props) {
  const data = useMemo(() => {
    // Trier les trades fermés par date
    const closedTrades = trades
      .filter((t) => t.status === 'closed')
      .sort((a, b) => {
        const dateA = a.closeDate ? new Date(a.closeDate).getTime() : 0;
        const dateB = b.closeDate ? new Date(b.closeDate).getTime() : 0;
        return dateA - dateB;
      });

    let currentBalance = initialBalance;
    const chartData = [{
      trade: 'Début',
      balance: initialBalance,
      pnl: 0,
      date: closedTrades.length > 0 && closedTrades[0].openDate ? closedTrades[0].openDate : new Date().toISOString()
    }];

    closedTrades.forEach((trade, index) => {
      const pnl = Number(trade.profitLoss || 0);
      currentBalance += pnl;
      chartData.push({
        trade: `Trade ${index + 1}`,
        balance: currentBalance,
        pnl: pnl,
        date: trade.closeDate || new Date().toISOString()
      });
    });

    return chartData;
  }, [trades, initialBalance]);

  if (data.length <= 1) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center border border-border bg-background rounded-xl">
        <p className="text-gray-500 text-sm">Prenez votre premier trade pour voir la courbe</p>
      </div>
    );
  }

  const isProfitable = data[data.length - 1].balance >= initialBalance;
  const color = isProfitable ? '#22c55e' : '#ef4444'; // green-500 or red-500
  const gradientId = `colorBalance${isProfitable ? 'Profit' : 'Loss'}`;

  // Find min and max for YAxis to scale beautifully
  const minBalance = Math.min(...data.map(d => d.balance));
  const maxBalance = Math.max(...data.map(d => d.balance));
  const buffer = (maxBalance - minBalance) * 0.1 || initialBalance * 0.01;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1e293b] border border-[#2a2e39] p-3 rounded-lg shadow-xl z-50">
          <p className="text-gray-400 text-xs mb-1">{format(new Date(data.date), 'dd MMM HH:mm')}</p>
          <p className="text-txt font-bold">{data.trade}</p>
          <p className="text-xl font-black mt-1" style={{ color: data.balance >= initialBalance ? '#22c55e' : '#ef4444' }}>
            ${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {data.trade !== 'Début' && (
            <p className={`text-sm mt-1 font-medium ${data.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              PnL: {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[250px] bg-background border border-border rounded-xl p-4">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Évolution du Capital</h3>
      <div className="w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="trade" hide />
            <YAxis 
              domain={[minBalance - buffer, maxBalance + buffer]} 
              hide 
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={initialBalance} stroke="#475569" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#${gradientId})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
