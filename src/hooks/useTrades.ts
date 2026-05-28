import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useTrades = (accountId?: string) => {
  const queryClient = useQueryClient();

  const tradesQuery = useQuery({
    queryKey: ['trades', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/api/comptes/${accountId}/trades`);
      // Backend retourne { success, data: [...], pagination: {...} }
      return Array.isArray(data?.data) ? data.data : [];
    },
    enabled: !!accountId,
    staleTime: 0,            // jamais en cache — refetch à chaque invalidation
    refetchOnMount: 'always', // recharge au montage même si cache frais
  });

  const createTrade = useMutation({
    mutationFn: async (tradeData: any) => {
      const { data } = await api.post(`/api/comptes/${accountId}/trades`, tradeData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', accountId] });
      queryClient.invalidateQueries({ queryKey: ['accounts', accountId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      await api.delete(`/api/trades/${tradeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', accountId] });
      queryClient.invalidateQueries({ queryKey: ['accounts', accountId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    trades: tradesQuery.data || [],
    isLoading: tradesQuery.isLoading,
    createTrade,
    deleteTrade,
  };
};
