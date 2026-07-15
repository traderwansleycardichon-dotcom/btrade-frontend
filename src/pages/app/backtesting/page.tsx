import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { BarChart2, Lock } from 'lucide-react';
import { BacktestingWorkspace } from '../../../components/backtesting/BacktestingWorkspace';

export default function BacktestingPage() {
  const { user } = useAuth();

  const isPro =
    user?.plan === 'pro' ||
    (user?.plan as string) === 'lifetime' ||
    user?.role === 'admin' ||
    user?.role === 'superadmin';

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text mb-3">Backtesting Module</h1>
        <p className="text-text-muted max-w-md mb-6">
          Le module de backtesting professionnel est réservé aux membres PRO.
          Testez vos stratégies sur des données historiques Futures réelles.
        </p>
        <button
          onClick={() => (window.location.href = '/app/upgrade')}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Passer au Plan PRO
        </button>
      </div>
    );
  }

  return <BacktestingWorkspace />;
}
