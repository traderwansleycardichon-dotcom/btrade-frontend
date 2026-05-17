import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import api from '../lib/api';

export interface Payout {
  id: string;
  accountId: string;
  userId: string;
  montant: string | number | null;
  methode: string | null;
  statut: string;
  dateDemande: string | null;
  dateReception: string | null;
  referenceExt: string | null;
  note: string | null;
  transfertPatrimoine: boolean;
  transfertAt: string | null;
  createdAt: string;
}

export interface PayoutsResponse {
  payouts: Payout[];
  totalCumule: number;
  totalCeMois: number;
}

export const usePayouts = (accountId: string | undefined) => {
  const queryClient = useQueryClient();

  const payoutsQuery = useQuery<PayoutsResponse>({
    queryKey: ['payouts', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/api/comptes/${accountId}/payouts`);
      return data.data;
    },
    enabled: !!accountId,
  });

  const createPayout = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(`/api/comptes/${accountId}/payouts`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const confirmPayout = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data } = await api.patch(`/api/payouts/${payoutId}/confirm`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const rejectPayout = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data } = await api.patch(`/api/payouts/${payoutId}/reject`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });

  return {
    payouts: payoutsQuery.data?.payouts || [],
    totalCumule: payoutsQuery.data?.totalCumule || 0,
    totalCeMois: payoutsQuery.data?.totalCeMois || 0,
    isLoading: payoutsQuery.isLoading,
    createPayout,
    confirmPayout,
    rejectPayout,
  };
};

/**
 * Mutations payouts indépendantes du scope (confirm/reject via id global,
 * create via accountId param).
 */
export const usePayoutMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['payouts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };

  const createPayout = useMutation({
    mutationFn: async ({ accountId, data }: { accountId: string; data: any }) => {
      const { data: res } = await api.post(`/api/comptes/${accountId}/payouts`, data);
      return res.data;
    },
    onSuccess: invalidate,
  });

  const confirmPayout = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data } = await api.patch(`/api/payouts/${payoutId}/confirm`);
      return data.data;
    },
    onSuccess: invalidate,
  });

  const rejectPayout = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data } = await api.patch(`/api/payouts/${payoutId}/reject`);
      return data.data;
    },
    onSuccess: invalidate,
  });

  return { createPayout, confirmPayout, rejectPayout };
};

/**
 * Aggrège les payouts sur plusieurs comptes en parallèle.
 */
export const useAllPayouts = (accountIds: string[]) => {
  const results = useQueries({
    queries: accountIds.map(id => ({
      queryKey: ['payouts', id],
      queryFn: async () => {
        const { data } = await api.get(`/api/comptes/${id}/payouts`);
        return data.data as PayoutsResponse;
      },
      enabled: !!id,
      staleTime: 60 * 1000,
    })),
  });

  const isLoading = results.some(r => r.isLoading);
  const payouts = results.flatMap(r => r.data?.payouts || []);
  payouts.sort(
    (a, b) =>
      new Date(b.dateDemande || b.createdAt).getTime() -
      new Date(a.dateDemande || a.createdAt).getTime()
  );

  const totalCumule = results.reduce((s, r) => s + Number(r.data?.totalCumule || 0), 0);
  const totalCeMois = results.reduce((s, r) => s + Number(r.data?.totalCeMois || 0), 0);

  return { payouts, totalCumule, totalCeMois, isLoading };
};
