import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAccounts } from './useAccounts';
import { useTrades } from './useTrades';
import { usePlaybooks } from './usePlaybooks';

export interface AccountStats {
  totalTrades: number;
  winsCount: number;
  lossesCount: number;
  winRate: number;
  profitFactor: number;
  plTotal: number;
  plMoyen: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  maxConsecutiveWins: number;
  bestTrade: number;
  worstTrade: number;
  rrMoyen: number;
  equityCurve: Array<{ date: string; equity: number }>;
}

export const useAccountStats = (accountId?: string) => {
  return useQuery<AccountStats | null>({
    queryKey: ['account-stats', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const { data } = await api.get(`/api/comptes/${accountId}/stats`);
      return data.data;
    },
    enabled: !!accountId,
  });
};

/**
 * Hook composite : agrège tout ce qu'il faut au dashboard.
 * - dashboard global (mois courant, patrimoine…)
 * - compte actif + stats détaillées (équité, expectancy, etc.)
 * - trades du compte (pour heatmaps + recent trades)
 * - playbooks
 */
export const useDashboardData = () => {
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard');
      return data.data;
    },
    staleTime: 60 * 1000,
  });

  const { accounts } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const activeAccount = safeAccounts.find((a: any) => a.statut === 'actif') || safeAccounts[0];

  const { data: stats } = useAccountStats(activeAccount?.id);
  const { trades } = useTrades(activeAccount?.id);
  const { playbooks: pbList } = usePlaybooks();

  return {
    isLoading: dashLoading,
    dashboard,
    activeAccount,
    accounts: safeAccounts,
    stats,
    trades: Array.isArray(trades) ? trades : [],
    playbooks: pbList || [],
  };
};
