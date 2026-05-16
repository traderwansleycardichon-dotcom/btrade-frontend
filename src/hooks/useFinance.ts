import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useFinance = (mois?: string) => {
  const queryClient = useQueryClient();

  // --- Revenus ---
  const revenusQuery = useQuery({
    queryKey: ['finance', 'revenus', mois],
    queryFn: async () => {
      const { data } = await api.get(`/api/revenus${mois ? `?mois=${mois}` : ''}`);
      return data.data;
    },
  });

  const createRevenu = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/revenus', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'revenus'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patrimoine'] });
    },
  });

  // --- Dépenses ---
  const depensesQuery = useQuery({
    queryKey: ['finance', 'depenses', mois],
    queryFn: async () => {
      const { data } = await api.get(`/api/depenses${mois ? `?mois=${mois}` : ''}`);
      return data.data;
    },
  });

  const createDepense = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/depenses', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'depenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patrimoine'] });
    },
  });

  return {
    revenus: revenusQuery.data?.revenus || [],
    totalRevenus: revenusQuery.data?.total || 0,
    depenses: depensesQuery.data?.depenses || [],
    totalDepenses: depensesQuery.data?.total || 0,
    parCategorie: depensesQuery.data?.parCategorie || {},
    isLoading: revenusQuery.isLoading || depensesQuery.isLoading,
    createRevenu,
    createDepense,
  };
};
