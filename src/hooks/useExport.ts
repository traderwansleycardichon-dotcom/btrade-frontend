import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useExport = () => {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['export', 'history'],
    queryFn: async () => {
      const { data } = await api.get('/api/patrimoine/exports');
      return data.data;
    },
  });

  const generateExport = useMutation({
    mutationFn: async ({ format, mois }: { format: 'pdf' | 'csv', mois: string }) => {
      const { data } = await api.get(`/api/patrimoine/export?format=${format}&mois=${mois}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export', 'history'] });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    generateExport,
  };
};
