import React, { useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  ChevronLeft, ChevronRight, RotateCcw,
  Loader2, AlertCircle,
} from 'lucide-react';
import type { ReplaySpeed } from './useReplayEngine';

interface ReplayCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  symbol:         string;
  timeframe:      string;
  status:         string;
  speed:          ReplaySpeed;
  progress:       number;     // 0–1
  replayIndex:    number;
  total:          number;
  currentCandle:  ReplayCandle | null;
  error:          string | null;
  onLoad:         (startDate: string, endDate: string) => void;
  onPlay:         () => void;
  onPause:        () => void;
  onReset:        () => void;
  onStepFwd:      () => void;
  onStepBack:     () => void;
  onSetSpeed:     (s: ReplaySpeed) => void;
  onJumpTo:       (i: number) => void;
}

const SPEEDS: ReplaySpeed[] = [0.5, 1, 2, 5, 10];

function fmt(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function fmtPrice(n: number) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ReplayControls({
  symbol, timeframe, status, speed, progress, replayIndex, total,
  currentCandle, error,
  onLoad, onPlay, onPause, onReset, onStepFwd, onStepBack, onSetSpeed, onJumpTo,
}: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');

  const isLoading = status === 'loading';
  const isPlaying = status === 'playing';
  const hasData   = status === 'ready' || status === 'playing' || status === 'paused' || status === 'ended';

  const isBull = currentCandle
    ? Number(currentCandle.close) >= Number(currentCandle.open)
    : true;

  return (
    <div className="bg-[#161b22] border-b border-[#21262d] shrink-0">
      {/* ── Row 1: Date range + Load ───────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#21262d]">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Période</span>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] text-white text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-primary"
        />
        <span className="text-gray-600 text-xs">→</span>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] text-white text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => startDate && endDate && onLoad(startDate, endDate)}
          disabled={isLoading || !startDate || !endDate}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/80 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Chargement…</>
            : 'Charger'}
        </button>

        {error && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs ml-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-xs">{error}</span>
          </div>
        )}

        {hasData && !error && (
          <span className="text-gray-600 text-[10px] ml-auto shrink-0">
            {total} candles · {symbol} {timeframe}
          </span>
        )}
      </div>

      {/* ── Row 2: Controls + Progress + Current candle info ───── */}
      {hasData && (
        <div className="flex items-center gap-4 px-4 py-2">
          {/* Playback controls */}
          <div className="flex items-center gap-1">
            {/* Reset */}
            <button
              onClick={onReset}
              title="Retour au début"
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Step back */}
            <button
              onClick={onStepBack}
              title="Candle précédente"
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              disabled={status === 'ended'}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-8 h-8 flex items-center justify-center bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-40"
            >
              {isPlaying
                ? <Pause  className="w-4 h-4" />
                : <Play   className="w-4 h-4" />}
            </button>

            {/* Step forward */}
            <button
              onClick={onStepFwd}
              title="Candle suivante"
              disabled={status === 'ended'}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#21262d] rounded transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Skip to end */}
            <button
              onClick={() => onJumpTo(total - 1)}
              title="Fin"
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed */}
          <div className="flex gap-0.5 bg-[#0d1117] rounded-lg p-0.5 border border-[#30363d]">
            {SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                  speed === s ? 'bg-[#21262d] text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Progress bar + position */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <input
              type="range"
              min={0}
              max={total - 1}
              value={replayIndex}
              onChange={e => onJumpTo(Number(e.target.value))}
              className="w-full h-1.5 rounded-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-600">
              <span>{replayIndex + 1} / {total}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>

          {/* Current candle OHLCV */}
          {currentCandle && (
            <div className="flex items-center gap-3 shrink-0 pl-3 border-l border-[#30363d]">
              <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                {fmt(currentCandle.timestamp)}
              </span>
              {(['O', 'H', 'L', 'C'] as const).map((lbl, i) => {
                const key = ['open', 'high', 'low', 'close'][i] as keyof typeof currentCandle;
                const val = currentCandle[key] as number;
                const color = lbl === 'C'
                  ? isBull ? 'text-green-400' : 'text-red-400'
                  : 'text-gray-300';
                return (
                  <div key={lbl} className="text-center">
                    <div className="text-[9px] text-gray-600">{lbl}</div>
                    <div className={`text-[10px] font-mono font-bold ${color}`}>
                      {fmtPrice(val)}
                    </div>
                  </div>
                );
              })}
              {status === 'ended' && (
                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                  FIN
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
