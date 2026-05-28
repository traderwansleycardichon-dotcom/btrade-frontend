import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface AiInsight {
  id: string;
  userId: string | null;
  module: string | null;
  referenceType: string | null;
  referenceId: string | null;
  typeInsight: string | null;
  titre: string | null;
  contenu: string | null;
  metadata: any;
  source: string | null;
  generatedAt: string;
  expiresAt: string | null;
}

export const useAiInsights = () => {
  const qc = useQueryClient();

  const listQuery = useQuery<AiInsight[]>({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data } = await api.get('/api/ai/insights');
      // L'endpoint renvoie directement un tableau (pas {success, data})
      return Array.isArray(data) ? data : (data.data || []);
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const generateTradingInsight = useMutation<AiInsight>({
    mutationFn: async () => {
      const { data } = await api.post('/api/ai/insights/generate-trading');
      return data as AiInsight;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-insights'] }),
  });

  const deleteInsight = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/ai/insights/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-insights'] }),
  });

  return {
    insights: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    generateTradingInsight,
    deleteInsight,
  };
};
