import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard');
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};
