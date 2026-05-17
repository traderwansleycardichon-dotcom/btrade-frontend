import { useState } from 'react';
import api from '../lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  source?: 'claude' | 'stub';
}

export const useAiChat = (context: any = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/ai/chat', {
        messages: nextHistory,
        context,
      });
      setMessages(m => [...m, data.message]);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erreur de communication avec l\'IA');
    } finally {
      setIsLoading(false);
    }
  };

  const pushAssistant = (content: string, source?: 'claude' | 'stub') => {
    setMessages(m => [...m, { role: 'assistant', content, source }]);
  };

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, isLoading, error, send, pushAssistant, reset, setMessages };
};

export const explainEvent = async (eventId: string) => {
  const { data } = await api.get(`/api/ai/chat/explain-event/${eventId}`);
  return data; // { event, explanation: { content, source } }
};
