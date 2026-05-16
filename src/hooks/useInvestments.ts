import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useInvestments = () => {
  const queryClient = useQueryClient();

  const kpisQuery = useQuery({
    queryKey: ['investments', 'kpis'],
    queryFn: async () => {
      const { data } = await api.get('/api/investments');
      return data.data;
    },
  });

  const allocationQuery = useQuery({
    queryKey: ['investments', 'allocation'],
    queryFn: async () => {
      const { data } = await api.get('/api/investments/allocation');
      return data.data;
    },
  });

  const createInvestment = useMutation({
    mutationFn: async (payload: any) => {
      // Backend expects snake_case for some fields based on investments.repo.js
      const formattedPayload = {
        nom: payload.nom,
        type_actif: payload.typeActif,
        symbole: payload.symbole,
        quantite: payload.quantite,
        prix_achat: payload.prixAchat,
        prix_actuel: payload.prixActuel || payload.prixAchat,
        devise: payload.devise || 'USD',
        date_achat: payload.dateAchat,
        actif: payload.actif !== false,
        note: payload.note
      };
      
      const { data } = await api.post('/api/investments', formattedPayload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patrimoine'] });
    },
  });

  return {
    positions: kpisQuery.data?.positions || [],
    kpis: kpisQuery.data?.kpis || null,
    allocation: allocationQuery.data?.allocation || [],
    totalValeur: allocationQuery.data?.totalValeur || 0,
    isLoading: kpisQuery.isLoading || allocationQuery.isLoading,
    createInvestment,
  };
};
