import { useState } from 'react';
import api from '../lib/api';

export type AiSource = 'openrouter' | 'anthropic' | 'stub' | 'guard';

export type BlockedReason =
  | 'empty'
  | 'too_short'
  | 'too_long'
  | 'code'
  | 'injection'
  | 'off_topic'
  | 'rate_hour'
  | 'rate_day';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source?: AiSource;
  blocked?: BlockedReason;
}

export interface AiConversation {
  id: string;
  title: string;
  updatedAt: string;
}

export const useAiChat = (initialConversationId: string | null = null, context: any = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);

  const loadConversation = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/ai/chat/conversations/${id}`);
      if (data.success) {
        setConversationId(id);
        setMessages(data.conversation.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          source: m.modelUsed
        })));
      }
    } catch (e: any) {
      setError("Erreur lors du chargement de la conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question) return;

    const userMsg: ChatMessage = { role: 'user', content: question };
    const historyBefore = messages;
    setMessages(m => [...m, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      let currentConvoId = conversationId;

      // Create conversation instantly if it doesn't exist so it appears in history immediately
      if (!currentConvoId) {
        const title = question.substring(0, 30) + (question.length > 30 ? '...' : '');
        const { data: convoData } = await api.post('/api/ai/chat/conversations', { title });
        if (convoData.success && convoData.conversation) {
          currentConvoId = convoData.conversation.id;
          setConversationId(currentConvoId); // This immediately triggers fetchHistory in the UI
        }
      }

      const payload: any = {
        question,
        context,
      };
      if (currentConvoId) {
        payload.conversationId = currentConvoId;
      }
      
      const { data } = await api.post('/api/ai/chat', payload);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data?.content || '',
        source: data?.source as AiSource | undefined,
        blocked: data?.blocked as BlockedReason | undefined,
      };
      setMessages(m => [...m, assistantMsg]);
      return data.conversationId;
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erreur de communication avec l\'IA');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pushAssistant = (content: string, source?: AiSource) => {
    setMessages(m => [...m, { role: 'assistant', content, source }]);
  };

  const reset = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  return { messages, isLoading, error, send, pushAssistant, reset, setMessages, conversationId, loadConversation, setConversationId };
};

export const explainEvent = async (eventId: string) => {
  const { data } = await api.get(`/api/ai/chat/explain-event/${eventId}`);
  return {
    event: data?.event,
    explanation: {
      content: data?.content || '',
      source: data?.source as AiSource | undefined,
    },
  };
};
