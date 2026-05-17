import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface TechnicalAnalyse {
  id: string;
  userId: string | null;
  titre: string | null;
  contenu: string | null;
  screenshotUrl: string | null;
  instrument: string | null;
  timeframe: string | null;
  biais: string | null;
  tags: any;
  publie: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useTechnicalAnalyses = (tradeId?: string) => {
  const qc = useQueryClient();

  const list = useQuery<TechnicalAnalyse[]>({
    queryKey: ['analyses', tradeId || 'all'],
    queryFn: async () => {
      const params = tradeId ? `?trade_id=${tradeId}` : '';
      const { data } = await api.get(`/api/analysis/analyses${params}`);
      return data.data || [];
    },
  });

  const createAnalyse = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/analysis/analyses', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analyses'] }),
  });

  const deleteAnalyse = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/analysis/analyses/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analyses'] }),
  });

  return {
    analyses: list.data || [],
    isLoading: list.isLoading,
    createAnalyse,
    deleteAnalyse,
  };
};
