import { useReducer, useEffect, useRef, useCallback } from 'react';
import api from '../../../lib/api';

export interface ReplayCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ReplaySpeed = 0.5 | 1 | 2 | 5 | 10;
export type ReplayStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended';

// ms between candle reveals at 1× speed
const BASE_INTERVAL_MS = 600;

// Number of candles to load BEFORE startDate as chart context
const PRE_HISTORY_LIMIT = 200;

interface ReplayState {
  status:          ReplayStatus;
  speed:           ReplaySpeed;
  allCandles:      ReplayCandle[];  // pre-history + replay candles
  preHistoryCount: number;           // candles before replay start (always visible)
  replayIndex:     number;           // candles revealed in replay portion (0 = none)
  symbol:          string;
  timeframe:       string;
  startDate:       string;
  endDate:         string;
  error:           string | null;
}

type Action =
  | { type: 'SET_RANGE';  symbol: string; timeframe: string; startDate: string; endDate: string }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; allCandles: ReplayCandle[]; preHistoryCount: number }
  | { type: 'LOAD_ERROR';  error: string }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'STEP_FWD' }
  | { type: 'STEP_BACK' }
  | { type: 'TICK' }
  | { type: 'SET_SPEED'; speed: ReplaySpeed }
  | { type: 'JUMP_TO'; index: number };

const initialState: ReplayState = {
  status:          'idle',
  speed:           1,
  allCandles:      [],
  preHistoryCount: 0,
  replayIndex:     0,
  symbol:          'NAS100',
  timeframe:       '1m',
  startDate:       '',
  endDate:         '',
  error:           null,
};

function replayTotal(state: ReplayState) {
  return state.allCandles.length - state.preHistoryCount;
}

function reducer(state: ReplayState, action: Action): ReplayState {
  switch (action.type) {
    case 'SET_RANGE':
      return { ...state, symbol: action.symbol, timeframe: action.timeframe, startDate: action.startDate, endDate: action.endDate };

    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        status:          'ready',
        allCandles:      action.allCandles,
        preHistoryCount: action.preHistoryCount,
        replayIndex:     0,
        error:           null,
      };

    case 'LOAD_ERROR':
      return { ...state, status: 'idle', error: action.error };

    case 'PLAY':
      if (state.status !== 'ready' && state.status !== 'paused') return state;
      return { ...state, status: 'playing' };

    case 'PAUSE':
      return { ...state, status: 'paused' };

    case 'RESET':
      return { ...state, status: 'ready', replayIndex: 0 };

    case 'STEP_FWD': {
      const total = replayTotal(state);
      if (state.replayIndex >= total - 1) return { ...state, status: 'ended' };
      return { ...state, status: state.status === 'ended' ? 'paused' : state.status, replayIndex: state.replayIndex + 1 };
    }

    case 'STEP_BACK':
      return {
        ...state,
        status: state.status === 'playing' ? 'paused' : state.status,
        replayIndex: Math.max(0, state.replayIndex - 1),
      };

    case 'TICK': {
      const total = replayTotal(state);
      if (state.replayIndex >= total - 1) return { ...state, status: 'ended' };
      return { ...state, replayIndex: state.replayIndex + 1 };
    }

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'JUMP_TO':
      return {
        ...state,
        status:      state.status === 'playing' ? 'paused' : state.status,
        replayIndex: Math.max(0, Math.min(action.index, replayTotal(state) - 1)),
      };

    default:
      return state;
  }
}

export function useReplayEngine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer management ────────────────────────────────────────────────────
  useEffect(() => {
    if (state.status !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.round(BASE_INTERVAL_MS / state.speed);
    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.speed]);

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadReplay = useCallback(async (
    symbol: string,
    timeframe: string,
    startDate: string,
    endDate: string,
  ) => {
    dispatch({ type: 'SET_RANGE', symbol, timeframe, startDate, endDate });
    dispatch({ type: 'LOAD_START' });

    try {
      // Parallel: pre-history (before startDate) + replay candles (startDate → endDate)
      const [preRes, replayRes] = await Promise.all([
        api.get('/api/backtest/candles', {
          params: { symbol, timeframe, before: new Date(startDate).toISOString(), limit: PRE_HISTORY_LIMIT },
        }),
        api.get('/api/backtest/candles', {
          params: {
            symbol,
            timeframe,
            from: new Date(startDate).toISOString(),
            to:   new Date(endDate + 'T23:59:59').toISOString(),
            limit: 20000,
          },
        }),
      ]);

      const preHistory    = (preRes.data.data    as ReplayCandle[]) ?? [];
      const replayCandles = (replayRes.data.data  as ReplayCandle[]) ?? [];

      if (replayCandles.length === 0) {
        dispatch({ type: 'LOAD_ERROR', error: `Aucune donnée disponible pour ${symbol} ${timeframe} sur cette période. Téléchargez les données d'abord.` });
        return;
      }

      dispatch({
        type:            'LOAD_SUCCESS',
        allCandles:      [...preHistory, ...replayCandles],
        preHistoryCount: preHistory.length,
      });
    } catch (err: any) {
      dispatch({ type: 'LOAD_ERROR', error: err.response?.data?.error ?? 'Erreur lors du chargement des données.' });
    }
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const total = replayTotal(state);

  /** Candles to render (slice of allCandles visible at current replay position) */
  const visibleCandles = state.allCandles.slice(
    0,
    state.preHistoryCount + state.replayIndex + 1,
  );

  /** The current frontier candle (last revealed replay candle) */
  const currentCandle = state.allCandles[state.preHistoryCount + state.replayIndex] ?? null;

  const progress = total > 0 ? state.replayIndex / (total - 1) : 0;

  return {
    state,
    dispatch,
    // Actions
    loadReplay,
    play:     () => dispatch({ type: 'PLAY' }),
    pause:    () => dispatch({ type: 'PAUSE' }),
    reset:    () => dispatch({ type: 'RESET' }),
    stepFwd:  () => dispatch({ type: 'STEP_FWD' }),
    stepBack: () => dispatch({ type: 'STEP_BACK' }),
    setSpeed: (s: ReplaySpeed) => dispatch({ type: 'SET_SPEED', speed: s }),
    jumpTo:   (i: number) => dispatch({ type: 'JUMP_TO', index: i }),
    // Derived
    visibleCandles,
    currentCandle,
    progress,
    total,
    preHistoryCount: state.preHistoryCount,
  };
}
