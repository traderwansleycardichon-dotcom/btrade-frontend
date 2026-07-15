import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';

interface Market {
  symbol: string;
  dukascopyKey: string;
  name: string;
  category: string;
  pointMultiplier: number;
  tickSize: number;
  tickValue: number;
  pointValue: number;
  currency: string;
  id: string | null;
  candleCount: number;
  hasData: boolean;
}

export function useBacktestMarkets() {
  const { data, isLoading, error } = useQuery<Market[]>({
    queryKey: ['backtest', 'markets'],
    queryFn:  () => api.get('/api/backtest/markets').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  return { markets: data ?? [], isLoading, error };
}
