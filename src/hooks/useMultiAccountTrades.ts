import { useQueries } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Récupère en parallèle les trades de plusieurs comptes.
 * Retourne une liste plate triée par date desc + stats agrégées.
 */
export const useMultiAccountTrades = (accountIds: string[]) => {
  const results = useQueries({
    queries: accountIds.map(id => ({
      queryKey: ['trades', id],
      queryFn: async () => {
        const { data } = await api.get(`/api/comptes/${id}/trades`);
        return Array.isArray(data.data) ? data.data : [];
      },
      enabled: !!id,
      staleTime: 60 * 1000,
    })),
  });

  const isLoading = results.some(r => r.isLoading);
  const trades = results.flatMap(r => r.data || []);
  trades.sort(
    (a: any, b: any) =>
      new Date(b.dateEntree).getTime() - new Date(a.dateEntree).getTime()
  );

  return { trades, isLoading };
};
