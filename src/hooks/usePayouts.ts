import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const usePayouts = (accountId: string) => {
  const queryClient = useQueryClient();

  const payoutsQuery = useQuery({
    queryKey: ['payouts', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/api/comptes/${accountId}/payouts`);
      return data.data.payouts || [];
    },
    enabled: !!accountId,
  });

  const requestPayout = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(`/api/comptes/${accountId}/payouts`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts', accountId] });
      queryClient.invalidateQueries({ queryKey: ['accounts', accountId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const confirmPayout = useMutation({
    mutationFn: async (payoutId: string) => {
      await api.patch(`/api/payouts/${payoutId}/confirm`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts', accountId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const rejectPayout = useMutation({
    mutationFn: async (payoutId: string) => {
      await api.patch(`/api/payouts/${payoutId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts', accountId] });
    },
  });

  return {
    payouts: payoutsQuery.data || [],
    isLoading: payoutsQuery.isLoading,
    requestPayout,
    confirmPayout,
    rejectPayout,
  };
};
