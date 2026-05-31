import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */
export interface ChatUser {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface ChatMessage {
  id: string;
  senderId: string | null;
  recipientId: string | null;
  sujet: string | null;
  contenu: string | null;
  lu: boolean;
  luAt: string | null;
  parentId: string | null;
  createdAt: string;
  sender: ChatUser | null;
  recipient: ChatUser | null;
}

export interface Conversation extends ChatMessage {
  replies: ChatMessage[];
  unreadCount: number;
  _count: { replies: number };
}

/* ------------------------------------------------------------------ */
/* Hook: liste des conversations de l'utilisateur                      */
/* ------------------------------------------------------------------ */
export const useConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: ['messaging', 'conversations'],
    queryFn: async () => {
      const { data } = await api.get('/api/messaging/conversations');
      return data.data ?? [];
    },
    refetchInterval: 15000, // Poll toutes les 15s pour les nouveaux messages
    staleTime: 10000,
  });
};

/* ------------------------------------------------------------------ */
/* Hook: toutes les conversations (admin only)                         */
/* ------------------------------------------------------------------ */
export const useAdminConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: ['messaging', 'admin', 'conversations'],
    queryFn: async () => {
      const { data } = await api.get('/api/messaging/admin/conversations');
      return data.data ?? [];
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
};

/* ------------------------------------------------------------------ */
/* Hook: thread d'une conversation                                     */
/* ------------------------------------------------------------------ */
export const useThread = (rootId: string | null) => {
  return useQuery<ChatMessage[]>({
    queryKey: ['messaging', 'thread', rootId],
    queryFn: async () => {
      const { data } = await api.get(`/api/messaging/thread/${rootId}`);
      return data.data ?? [];
    },
    enabled: !!rootId,
    refetchInterval: 8000,  // Poll plus fréquemment dans le thread actif
    staleTime: 5000,
  });
};

/* ------------------------------------------------------------------ */
/* Hook: compteur de non-lus                                           */
/* ------------------------------------------------------------------ */
export const useUnreadMessagesCount = () => {
  return useQuery<number>({
    queryKey: ['messaging', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/api/messaging/unread-count');
      return data.data?.count ?? 0;
    },
    refetchInterval: 20000,
    staleTime: 10000,
  });
};

/* ------------------------------------------------------------------ */
/* Mutation: envoyer un message                                        */
/* ------------------------------------------------------------------ */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      recipientId: string;
      sujet?: string;
      contenu: string;
      parentId?: string;
    }) => {
      const { data } = await api.post('/api/messaging/send', payload);
      return data.data as ChatMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging'] });
    },
  });
};
