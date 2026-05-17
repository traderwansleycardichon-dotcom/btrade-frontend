import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface PsychologyEntry {
  id: string;
  userId: string | null;
  date: string | null;
  emotionalState: string | null;
  disciplineScore: number | null;
  tiltDetected: boolean;
  note: string | null;
  createdAt: string;
}

export const usePsychology = () => {
  const qc = useQueryClient();

  const listQuery = useQuery<PsychologyEntry[]>({
    queryKey: ['psychology'],
    queryFn: async () => {
      const { data } = await api.get('/api/psychology');
      return data.data || [];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (payload: Partial<PsychologyEntry>) => {
      const { data } = await api.post('/api/psychology', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['psychology'] }),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/psychology/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['psychology'] }),
  });

  return {
    entries: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createEntry,
    deleteEntry,
  };
};
