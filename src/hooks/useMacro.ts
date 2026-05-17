import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface MacroEvent {
  id: string;
  externalId: string | null;
  source: string;
  pays: string | null;
  typeEvent: string | null;
  titre: string | null;
  dateEvent: string | null;
  importance: number | null;
  valeurPrev: string | number | null;
  valeurConsensus: string | number | null;
  valeurActual: string | number | null;
  unite: string | null;
  note: string | null;
}

interface UseMacroOpts {
  hours?: number;       // fenêtre temporelle à venir (défaut: 24h)
  minImportance?: number; // 1 low, 2 med, 3 high
  pays?: string;
}

export const useMacroEvents = ({ hours = 24, minImportance = 2, pays }: UseMacroOpts = {}) => {
  return useQuery<MacroEvent[]>({
    queryKey: ['macro-events', hours, minImportance, pays],
    queryFn: async () => {
      const now = new Date();
      const to = new Date(now.getTime() + hours * 3600 * 1000);
      const params = new URLSearchParams({
        from: now.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        importance: String(minImportance),
      });
      if (pays) params.set('pays', pays);
      const { data } = await api.get(`/api/macro/events?${params}`);
      // Trier par dateEvent croissant et garder seulement les events futurs
      const list: MacroEvent[] = Array.isArray(data) ? data : [];
      return list
        .filter(e => e.dateEvent && new Date(e.dateEvent) >= now && new Date(e.dateEvent) <= to)
        .sort((a, b) => new Date(a.dateEvent!).getTime() - new Date(b.dateEvent!).getTime());
    },
    refetchInterval: 5 * 60 * 1000, // refresh toutes les 5 min
    staleTime: 60 * 1000,
  });
};
