import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const usePsychology = () => {
  const queryClient = useQueryClient();

  const psychologyQuery = useQuery({
    queryKey: ['psychology'],
    queryFn: async () => {
      const { data } = await api.get('/api/psychology');
      return data.data || [];
    },
  });

  const createTracking = useMutation({
    mutationFn: async (payload: any) => {
      // Le backend attend du snake_case (emotional_state, discipline_score, note, tilt_detected)
      const formattedPayload = {
        emotional_state: payload.mood,
        discipline_score: Number(payload.disciplineScore),
        fatigue_level: Number(payload.fatigueLevel),
        tilt_detected: payload.mood === 'tilt',
        note: payload.notes
      };
      
      const { data } = await api.post('/api/psychology', formattedPayload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychology'] });
    },
  });

  return {
    trackings: psychologyQuery.data || [],
    isLoading: psychologyQuery.isLoading,
    createTracking,
  };
};
