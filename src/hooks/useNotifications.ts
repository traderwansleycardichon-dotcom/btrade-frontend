import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import api from '../lib/api';
import { useSound } from '../context/SoundContext';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('btt_access_token');
  const { playSound } = useSound();
  const prevUnreadRef = useRef<number | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/api/notifications');
      return {
        list: data.data?.notifications || [],
        unreadCount: data.data?.unreadCount || 0
      };
    },
    refetchInterval: 60000,
    enabled: hasToken,
  });

  const unreadCount = notificationsQuery.data?.unreadCount || 0;

  useEffect(() => {
    if (prevUnreadRef.current !== null && unreadCount > prevUnreadRef.current) {
      playSound();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, playSound]);

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
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    markAsRead,
    markAllAsRead,
  };
};
