import { useState } from 'react';
import api from '../lib/api';

export type AiSource = 'openrouter' | 'anthropic' | 'stub';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  source?: AiSource;
}

/**
 * Hook chat IA.
 *
 * Contrat backend (POST /api/ai/chat) :
 *   request : { question: string, context?: object, history?: ChatMessage[] }
 *   reply   : { success: boolean, source: AiSource, content: string }
 *
 * Le state local `messages` agrège les bulles affichées (user + assistant).
 * On envoie au backend la question courante + l'historique précédent.
 */
export const useAiChat = (context: any = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question) return;

    const userMsg: ChatMessage = { role: 'user', content: question };
    const historyBefore = messages;
    setMessages(m => [...m, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/api/ai/chat', {
        question,
        context,
        history: historyBefore.map(m => ({ role: m.role, content: m.content })),
      });
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data?.content || '',
        source: data?.source as AiSource | undefined,
      };
      setMessages(m => [...m, assistantMsg]);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erreur de communication avec l\'IA');
    } finally {
      setIsLoading(false);
    }
  };

  const pushAssistant = (content: string, source?: AiSource) => {
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
  // data = { success, event, source, content }
  return {
    event: data?.event,
    explanation: {
      content: data?.content || '',
      source: data?.source as AiSource | undefined,
    },
  };
};
