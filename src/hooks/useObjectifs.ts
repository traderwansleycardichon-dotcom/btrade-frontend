import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useObjectifs = () => {
  const queryClient = useQueryClient();

  const objectifsQuery = useQuery({
    queryKey: ['objectifs'],
    queryFn: async () => {
      const { data } = await api.get('/api/objectifs');
      return data.data;
    },
  });

  const createObjectif = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/objectifs', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectifs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMontant = useMutation({
    mutationFn: async ({ id, montantActuel }: { id: string, montantActuel: number }) => {
      const { data } = await api.patch(`/api/objectifs/${id}/montant`, { montantActuel });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectifs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    objectifs: objectifsQuery.data || [],
    isLoading: objectifsQuery.isLoading,
    createObjectif,
    updateMontant,
  };
};
