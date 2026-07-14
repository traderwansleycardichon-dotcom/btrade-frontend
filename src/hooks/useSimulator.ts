import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const SIM_KEYS = {
  status:   ['simulator', 'status']   as const,
  trades:   ['simulator', 'trades']   as const,
  stats:    ['simulator', 'stats']    as const,
  cooldown: ['simulator', 'cooldown'] as const,
};

const FALLBACK_STATS = {
  totalAttempts: 0,
  passedCount: 0,
  failedCount: 0,
  expiredCount: 0,
  successRate: 0,
};

export function useSimulatorStatus() {
  return useQuery({
    queryKey: SIM_KEYS.status,
    queryFn: () =>
      api.get('/api/simulator/challenge/status').then((r) => r.data.data),
    refetchInterval: 3000,
    staleTime: 2000,
    retry: false,
  });
}

export function useSimulatorTrades() {
  return useQuery({
    queryKey: SIM_KEYS.trades,
    queryFn: () =>
      api.get('/api/simulator/trades').then((r) => r.data.data ?? []),
    refetchInterval: 3000,
    staleTime: 2000,
    retry: false,
  });
}

export function useSimulatorStats() {
  return useQuery({
    queryKey: SIM_KEYS.stats,
    queryFn: () =>
      api
        .get('/api/simulator/challenge/statistics')
        .then((r) => r.data.data ?? FALLBACK_STATS),
    refetchInterval: 15000,
    staleTime: 12000,
    retry: false,
  });
}

export function useSimulatorCooldown() {
  return useQuery({
    queryKey: SIM_KEYS.cooldown,
    queryFn: () =>
      api.get('/api/simulator/challenge/cooldown').then((r) => r.data.data),
    refetchInterval: 15000,
    staleTime: 12000,
    retry: false,
  });
}

/** Invalide tout le cache simulator d'un coup (après mutation) */
export function useSimulatorRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['simulator'] });
}
