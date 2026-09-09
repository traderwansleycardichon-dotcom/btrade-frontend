import React from 'react';
import { Target, AlertTriangle, ShieldCheck, Clock, ShieldX, ShieldAlert } from 'lucide-react';
import { EquityCurveChart } from "./EquityCurveChart";

interface Props {
  account: any;
  todayPnl: number;
  trades?: any[];
}

export function PropFirmDashboard({ account, todayPnl, trades = [] }: Props) {
  if (!account || !account.challengeLevel) return null;

  const initialBalance = parseFloat(account.initialBalance);
  const currentBalance = parseFloat(account.currentBalance);
  const profitTarget = parseFloat(account.profitTarget);
  const maxDrawdownLimit = parseFloat(account.maxDrawdownLimit);
  const dailyLossLimit = parseFloat(account.dailyLossLimit);
  
  // Progress to Target
  const currentProfit = Math.max(0, currentBalance - initialBalance);
  const profitProgress = Math.min(100, (currentProfit / profitTarget) * 100);

  // Drawdown remaining
  const currentDrawdown = parseFloat(account.currentDrawdown);
  const maxDrawdownRemaining = Math.max(0, maxDrawdownLimit - currentDrawdown);
  const drawdownProgress = (currentDrawdown / maxDrawdownLimit) * 100;

  // Daily loss remaining
  const currentDailyLoss = Math.max(0, -todayPnl);
  const dailyLossRemaining = Math.max(0, dailyLossLimit - currentDailyLoss);
  const dailyLossProgress = Math.min(100, (currentDailyLoss / dailyLossLimit) * 100);

  // Status mapping
  const statusColors: any = {
    'active': 'text-green-500 bg-green-500/10 border-green-500/20',
    'passed': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    'failed_drawdown': 'text-red-500 bg-red-500/10 border-red-500/20',
    'failed_daily': 'text-red-500 bg-red-500/10 border-red-500/20',
    'failed_consistency': 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  const statusLabels: any = {
    'active': 'Challenge en cours',
    'passed': 'Funded Account Débloqué',
    'failed_drawdown': 'Échoué (Drawdown dépassé)',
    'failed_daily': 'Échoué (Perte Jour dépassée)',
    'failed_consistency': 'Échoué (Règle de cohérence)',
    'expired': 'Challenge Expiré',
  };

  const getRemainingDays = () => {
    if (!account.expiresAt) return null;
    const now = new Date().getTime();
    const end = new Date(account.expiresAt).getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const remainingDays = getRemainingDays();

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt uppercase tracking-wider flex items-center gap-2">
            {account.challengeLevel} Challenge <span className="text-sm text-gray-500 normal-case">#{(account.attemptNumber || 1).toString().padStart(3, '0')}</span>
          </h2>
          <div className="flex gap-2 items-center mt-2">
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${statusColors[account.status] || 'text-gray-400 bg-gray-800'}`}>
              {statusLabels[account.status] || account.status}
            </div>
            {account.status === 'active' && remainingDays !== null && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-3 h-3" /> {remainingDays} Jours Restants
              </div>
            )}
          </div>
        </div>
        
        {/* Max Position Size Tracker */}
        {(() => {
          const maxPositionSize = initialBalance >= 150000 ? 15 : initialBalance >= 100000 ? 10 : 5;
          const openTrades = trades.filter(t => t.status === 'open');
          const currentOpenQuantity = openTrades.reduce((sum, t) => sum + Number(t.quantity), 0);
          const positionSizeProgress = Math.min(100, (currentOpenQuantity / maxPositionSize) * 100);

          return (
            <div className="hidden md:block bg-background px-4 py-2 rounded-xl border border-border flex-1 max-w-[220px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Max Pos Size</span>
                <span className="font-bold text-txt text-xs">{currentOpenQuantity} / {maxPositionSize}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                <div className={`h-1.5 rounded-full transition-all ${positionSizeProgress > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${positionSizeProgress}%` }}></div>
              </div>
            </div>
          );
        })()}

        <div className="flex gap-4 flex-wrap">
          <div className="bg-background px-4 py-2 rounded-xl border border-border">
            <p className="text-gray-400 text-xs uppercase mb-1">Balance Actuelle</p>
            <p className={`font-bold text-xl ${currentBalance >= initialBalance ? 'text-green-500' : 'text-red-500'}`}>
              ${currentBalance.toLocaleString()}
            </p>
          </div>
          <div className="bg-background px-4 py-2 rounded-xl border border-border">
            <p className="text-gray-400 text-xs uppercase mb-1">PnL du Jour</p>
            <p className={`font-bold text-xl ${todayPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${todayPnl.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <EquityCurveChart trades={trades} initialBalance={initialBalance} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profit Target */}
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center text-gray-400 text-xs mb-1">
            <Target className="w-3.5 h-3.5 mr-1 shrink-0"/> Profit Target
          </div>
          <div className="flex justify-between items-baseline gap-2 mb-2">
            <span className="text-xs font-bold text-txt">${currentProfit.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500">/ ${profitTarget.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${profitProgress}%` }}></div>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center text-gray-400 text-xs mb-1">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 shrink-0"/> Max Drawdown
          </div>
          <div className="flex justify-between items-baseline gap-2 mb-2">
            <span className="text-xs font-bold text-red-400">-${currentDrawdown.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500">/ -${maxDrawdownLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${drawdownProgress > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${drawdownProgress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">Reste: ${maxDrawdownRemaining.toLocaleString()}</p>
        </div>

        {/* Daily Loss */}
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center text-gray-400 text-xs mb-1">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0"/> Daily Loss Limit
          </div>
          <div className="flex justify-between items-baseline gap-2 mb-2">
            <span className="text-xs font-bold text-red-400">-${currentDailyLoss.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500">/ -${dailyLossLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${dailyLossProgress > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${dailyLossProgress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">Reste: ${dailyLossRemaining.toLocaleString()}</p>
        </div>

      </div>
      
      {account.status.startsWith('failed') && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-4">
          <ShieldX className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <h3 className="text-red-500 font-bold">Challenge Échoué</h3>
            <p className="text-red-400 text-sm mt-1">Vous avez violé une règle de risque. Votre compte a été verrouillé. La discipline est la clé du trading. Prenez une pause, analysez vos erreurs et recommencez.</p>
            {account.failureReason && (
              <div className="mt-2 inline-block bg-red-950/50 px-3 py-1 rounded text-xs text-red-300 font-mono">
                Raison: {account.failureReason.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}

      {account.status === 'passed' && (
        <div className="mt-6 bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-green-500 shrink-0" />
          <div>
            <h3 className="text-green-500 font-bold">Félicitations ! Challenge Réussi !</h3>
            <p className="text-green-400 text-sm mt-1">Vous avez atteint votre cible de profit tout en respectant toutes les règles de risque. Vous êtes prêt pour la prochaine étape !</p>
          </div>
        </div>
      )}
    </div>
  );
}
