import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import api from '../lib/api';

/**
 * Statut journalisation des trades d'un compte.
 * Retourne deux Sets d'ids pour des lookups O(1) côté UI.
 */
export const useTradesJournalingStatus = (accountId?: string) => {
  const query = useQuery({
    queryKey: ['trades-journaling-status', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/api/comptes/${accountId}/trades/journaling-status`);
      return data.data as { journaledTradeIds: string[]; analyzedTradeIds: string[] };
    },
    enabled: !!accountId,
    staleTime: 30_000,
  });

  const journaledSet = useMemo(
    () => new Set(query.data?.journaledTradeIds ?? []),
    [query.data?.journaledTradeIds],
  );
  const analyzedSet = useMemo(
    () => new Set(query.data?.analyzedTradeIds ?? []),
    [query.data?.analyzedTradeIds],
  );

  return {
    journaledSet,
    analyzedSet,
    isLoading: query.isLoading,
  };
};
