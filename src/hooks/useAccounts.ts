import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useAccounts = () => {
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get('/api/comptes');
      const results = data.data;
      // Si c'est un objet groupé (evaluation, funded, personnel), on l'aplatit
      if (results && !Array.isArray(results) && typeof results === 'object') {
        return [
          ...(results.evaluation || []),
          ...(results.funded || []),
          ...(results.personnel || [])
        ];
      }
      return results || [];
    },
  });

  const statsQuery = (id: string) => useQuery({
    queryKey: ['accounts', id, 'stats'],
    queryFn: async () => {
      const { data } = await api.get(`/api/comptes/${id}/stats`);
      return data.data;
    },
    enabled: !!id,
  });

  const createAccount = useMutation({
    mutationFn: async (accountData: any) => {
      const { data } = await api.post('/api/comptes', accountData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const passFunded = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/api/comptes/${id}/pass-funded`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/comptes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    accounts: accountsQuery.data || [],
    isLoading: accountsQuery.isLoading,
    useStats: statsQuery,
    createAccount,
    passFunded,
    deleteAccount,
  };
};
