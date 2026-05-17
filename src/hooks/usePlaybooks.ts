import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Playbook {
  id: string;
  userId: string | null;
  titre: string | null;
  description: string | null;
  regles: string | null;
  typeStrategie: string | null;
  instruments: any;
  conditionsEntree: string | null;
  conditionsSortie: string | null;
  gestionRisque: any;
  rrTarget: string | number | null;
  tauxReussiteEstime: string | number | null;
  actif: boolean;
  setupId: string | null;
  imageUrl: string | null;
  couleur: string | null;
  createdAt: string;
  updatedAt: string;
  setup?: { id: string; nom: string | null } | null;
}

export const usePlaybooks = () => {
  const qc = useQueryClient();

  const listQuery = useQuery<Playbook[]>({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const { data } = await api.get('/api/playbooks');
      return data.data || [];
    },
  });

  const createPlaybook = useMutation({
    mutationFn: async (payload: Partial<Playbook> & { titre: string }) => {
      const { data } = await api.post('/api/playbooks', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playbooks'] }),
  });

  const updatePlaybook = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Playbook> }) => {
      const { data } = await api.patch(`/api/playbooks/${id}`, patch);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playbooks'] }),
  });

  const deletePlaybook = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/playbooks/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playbooks'] }),
  });

  return {
    playbooks: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
  };
};
