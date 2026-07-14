import React, { useState, useEffect } from 'react';
import { HelpCircle, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export function SimulatorPerformanceStats({ account, trades }: { account: any, trades: any[] }) {
  const [dailyQuote, setDailyQuote] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await api.get('/api/simulator/daily-quote');
        if (res.data?.success && res.data?.data) {
          setDailyQuote(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch daily quote", err);
      } finally {
        setLoadingQuote(false);
      }
    };
    fetchQuote();
  }, []);
  if (!account) return null;

  const closedTrades = trades.filter(t => t.status === 'closed');
  
  const totalPnl = parseFloat(account.currentBalance) - parseFloat(account.initialBalance);
  
  const winningTrades = closedTrades.filter(t => parseFloat(t.profitLoss || 0) > 0);
  const losingTrades = closedTrades.filter(t => parseFloat(t.profitLoss || 0) < 0);
  
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  
  const grossProfit = winningTrades.reduce((acc, t) => acc + parseFloat(t.profitLoss || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + parseFloat(t.profitLoss || 0), 0));
  
  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? grossProfit : 0);
  
  // Group by day for Best Day % and Day Win %
  const days: Record<string, number> = {};
  closedTrades.forEach(t => {
    if (!t.closeDate) return;
    const date = new Date(t.closeDate).toLocaleDateString();
    days[date] = (days[date] || 0) + parseFloat(t.profitLoss || 0);
  });
  
  const dayValues = Object.values(days);
  const winningDays = dayValues.filter(pnl => pnl > 0).length;
  const totalDays = dayValues.length;
  const dayWinRate = totalDays > 0 ? (winningDays / totalDays) * 100 : 0;
  
  const bestDayPnl = dayValues.length > 0 ? Math.max(...dayValues) : 0;
  const bestDayPercentage = totalPnl > 0 && bestDayPnl > 0 ? (bestDayPnl / totalPnl) * 100 : 0;

  // Avg Win / Avg Loss Ratio (for the progress bar)
  const totalAvg = avgWin + avgLoss;
  const avgWinPercent = totalAvg > 0 ? (avgWin / totalAvg) * 100 : 50;

  // Render SVG arc for semi-circle
  const renderSemiCircle = (percentage: number) => {
    const angle = (percentage / 100) * 180;
    return (
      <div className="relative w-24 h-12 overflow-hidden flex justify-center mt-2">
        <div 
          className="absolute w-24 h-24 rounded-full border-8 border-red-500 border-t-green-500 border-r-green-500 transform transition-transform duration-1000"
          style={{ transform: `rotate(${-135 + angle}deg)` }}
        ></div>
        <div className="absolute bottom-0 w-full flex justify-between text-xs font-bold px-2 bg-[#21242c] pt-2">
           <span className="text-red-400 z-10 bg-[#21242c] pr-1">{losingTrades.length}</span>
           <span className="text-green-400 z-10 bg-[#21242c] pl-1">{winningTrades.length}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Coach Tip Banner */}
      <div className="bg-[#1e2329] border border-[#2d333b] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
        <div className="bg-[#e9ecef] text-gray-800 font-bold px-4 py-1.5 rounded-full text-sm shrink-0">
          Coach T® Tip
        </div>
        <div className="text-gray-300 text-sm leading-relaxed flex-1">
          {loadingQuote ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération du conseil du jour...
            </div>
          ) : (
            <p>{dailyQuote || "Gérez votre risque avec discipline, et la patience fera fructifier votre capital."}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total P&L */}
        <div className="bg-[#1e2329] border border-[#2d333b] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
            Total P&L <HelpCircle className="w-3 h-3 text-gray-500" />
          </div>
          <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalPnl >= 0 ? '' : '-'}${Math.abs(totalPnl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>

        {/* Trade Win % */}
        <div className="bg-[#1e2329] border border-[#2d333b] rounded-xl p-5 shadow-sm flex flex-row items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
              Trade Win % <HelpCircle className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {winRate.toFixed(2)}%
            </div>
          </div>
          {renderSemiCircle(winRate)}
        </div>

        {/* Avg Win / Avg Loss */}
        <div className="bg-[#1e2329] border border-[#2d333b] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between w-full">
            <div>
              <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                Avg Win / Avg Loss <HelpCircle className="w-3 h-3 text-gray-500" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {(avgLoss > 0 ? (avgWin / avgLoss) : (avgWin > 0 ? avgWin : 0)).toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col items-end justify-center w-1/2">
              <div className="w-full bg-red-500 h-2 rounded-full overflow-hidden flex mb-2">
                <div className="bg-green-500 h-full transition-all" style={{ width: `${avgWinPercent}%` }}></div>
              </div>
              <div className="flex justify-between w-full text-[10px] font-semibold">
                <span className="text-green-500">${avgWin >= 1000 ? (avgWin / 1000).toFixed(1) + 'k' : avgWin.toFixed(0)}</span>
                <span className="text-red-500">-${avgLoss >= 1000 ? (avgLoss / 1000).toFixed(1) + 'k' : avgLoss.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Win % */}
        <div className="bg-[#1e2329] border border-[#2d333b] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
            Day Win % <HelpCircle className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalDays > 0 ? `${dayWinRate.toFixed(2)}%` : 'No trades'}
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#1e2329] border border-[#2d333b] rounded-xl p-5 shadow-sm flex flex-row items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
              Profit Factor <HelpCircle className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {profitFactor.toFixed(2)}
            </div>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-14 h-14 rounded-full border-[5px] border-green-500 border-r-red-500 transform -rotate-45"></div>
            <div className="flex justify-between w-full mt-1.5 text-[10px] font-bold px-0.5">
              <span className="text-green-500">${grossProfit > 1000 ? (grossProfit/1000).toFixed(1) + 'k' : grossProfit.toFixed(0)}</span>
              <span className="text-red-500">-${grossLoss > 1000 ? (grossLoss/1000).toFixed(1) + 'k' : grossLoss.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Best Day % of Total Profit */}
        <div className="bg-[#1e2329] border border-[#2d333b] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
            Best Day % of Total Profit <HelpCircle className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalPnl > 0 ? `${bestDayPercentage.toFixed(2)}%` : '0.00%'}
          </div>
        </div>
      </div>
    </div>
  );
}
