import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface FinanceItem {
  id: string;
  userId: string;
  categorie?: string;
  source?: string;
  label?: string;
  montant: string | number;
  devise: string;
  date: string;
  recurrente?: boolean;
  recurrent?: boolean;
  periode: string | null;
  note: string | null;
  createdAt: string;
}

export interface Objectif {
  id: string;
  userId: string | null;
  nom: string | null;
  montantCible: string | number | null;
  montantActuel: string | number;
  dateCible: string | null;
  couleur: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

const baseInvalidate = (qc: any) => () => {
  qc.invalidateQueries({ queryKey: ['depenses'] });
  qc.invalidateQueries({ queryKey: ['revenus'] });
  qc.invalidateQueries({ queryKey: ['objectifs'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['patrimoine'] });
};

// ── Dépenses ──────────────────────────────────────────────────────────
export const useDepenses = (mois?: string) => {
  const qc = useQueryClient();

  const list = useQuery<any>({
    queryKey: ['depenses', mois || 'all'],
    queryFn: async () => {
      const params = mois ? `?mois=${mois}` : '';
      const { data } = await api.get(`/api/depenses${params}`);
      return data.data || {};
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/depenses', payload);
      return data.data;
    },
    onSuccess: baseInvalidate(qc),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { data } = await api.patch(`/api/depenses/${id}`, patch);
      return data.data;
    },
    onSuccess: baseInvalidate(qc),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/depenses/${id}`); },
    onSuccess: baseInvalidate(qc),
  });

  return {
    depenses: list.data?.depenses || [],
    isLoading: list.isLoading,
    create,
    update,
    remove,
  };
};

// ── Revenus ───────────────────────────────────────────────────────────
export const useRevenus = (mois?: string) => {
  const qc = useQueryClient();

  const list = useQuery<any>({
    queryKey: ['revenus', mois || 'all'],
    queryFn: async () => {
      const params = mois ? `?mois=${mois}` : '';
      const { data } = await api.get(`/api/revenus${params}`);
      return data.data || {};
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/revenus', payload);
      return data.data;
    },
    onSuccess: baseInvalidate(qc),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { data } = await api.patch(`/api/revenus/${id}`, patch);
      return data.data;
    },
    onSuccess: baseInvalidate(qc),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/revenus/${id}`); },
    onSuccess: baseInvalidate(qc),
  });

  return {
    revenus: list.data?.revenus || [],
    isLoading: list.isLoading,
    create,
    update,
    remove,
  };
};

// ── Objectifs ─────────────────────────────────────────────────────────
export const useObjectifs = () => {
  const qc = useQueryClient();

  const list = useQuery<Objectif[]>({
    queryKey: ['objectifs'],
    queryFn: async () => {
      const { data } = await api.get('/api/objectifs');
      return data.data || [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/objectifs', payload);
      return data.data;
    },
    onSuccess: baseInvalidate(qc),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { data } = await api.patch(`/api/objectifs/${id}`, patch);
      return data.data;
    },
    onSuccess: baseInvalidate(qc),
  });

  const updateMontant = useMutation({
    mutationFn: async ({ id, montant }: { id: string; montant: number }) => {
      const { data } = await api.patch(`/api/objectifs/${id}/montant`, { montant_actuel: montant });
      return data.data;
    },
    onSuccess: baseInvalidate(qc),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/objectifs/${id}`); },
    onSuccess: baseInvalidate(qc),
  });

  return {
    objectifs: list.data || [],
    isLoading: list.isLoading,
    create,
    update,
    updateMontant,
    remove,
  };
};

// ── Patrimoine dashboard ──────────────────────────────────────────────
export const usePatrimoineDashboard = () => {
  return useQuery({
    queryKey: ['patrimoine', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/patrimoine/dashboard');
      return data.data;
    },
    staleTime: 60 * 1000,
  });
};
