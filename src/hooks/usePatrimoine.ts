import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const usePatrimoine = () => {
  const dashboard = useQuery({
    queryKey: ['patrimoine', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/patrimoine/dashboard');
      return data.data;
    },
  });

  const courbe = (periode: string = '3m') => useQuery({
    queryKey: ['patrimoine', 'courbe', periode],
    queryFn: async () => {
      const { data } = await api.get(`/api/patrimoine/courbe?periode=${periode}`);
      return data.data;
    },
  });

  const balanceMensuelle = (mois: string) => useQuery({
    queryKey: ['patrimoine', 'balance', mois],
    queryFn: async () => {
      const { data } = await api.get(`/api/patrimoine/balance-mensuelle?mois=${mois}`);
      return data.data;
    },
    enabled: !!mois,
  });

  return {
    dashboard: dashboard.data,
    isLoading: dashboard.isLoading,
    useCourbe: courbe,
    useBalance: balanceMensuelle,
  };
};
