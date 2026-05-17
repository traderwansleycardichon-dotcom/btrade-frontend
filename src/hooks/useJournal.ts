import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface JournalEntry {
  id: string;
  userId: string;
  tradeId: string | null;
  accountId: string | null;
  titre: string | null;
  contenu: string | null;
  note: string | null;
  sentiment: string | null;
  tags: any;
  disciplineScore: number | null;
  executionScore: number | null;
  respectPlan: boolean;
  erreurIdentifiee: string | null;
  createdAt: string;
}

export const useJournal = () => {
  const qc = useQueryClient();

  const listQuery = useQuery<JournalEntry[]>({
    queryKey: ['journal'],
    queryFn: async () => {
      const { data } = await api.get('/api/journal');
      return data.data || [];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (payload: Partial<JournalEntry>) => {
      const { data } = await api.post('/api/journal', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/journal/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  });

  return {
    entries: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createEntry,
    deleteEntry,
  };
};
