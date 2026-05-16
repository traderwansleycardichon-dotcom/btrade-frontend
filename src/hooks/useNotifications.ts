import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/api/notifications');
      return {
        list: data.data?.notifications || [],
        unreadCount: data.data?.unreadCount || 0
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api.patch('/api/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: notificationsQuery.data?.list || [],
    unreadCount: notificationsQuery.data?.unreadCount || 0,
    isLoading: notificationsQuery.isLoading,
    markAsRead,
    markAllAsRead,
  };
};
