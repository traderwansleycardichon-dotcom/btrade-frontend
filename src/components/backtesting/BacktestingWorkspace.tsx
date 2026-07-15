import React, { useState } from 'react';
import {
  BarChart2, Settings, ChevronDown, Download, Play,
} from 'lucide-react';
import { useBacktestMarkets } from './hooks/useBacktestMarkets';
import { DataIngestionPanel } from './panels/DataIngestionPanel';
import { ChartCanvas } from './chart/ChartCanvas';
import { ReplayControls } from './replay/ReplayControls';
import { useReplayEngine } from './replay/useReplayEngine';
import type { ReplaySpeed } from './replay/useReplayEngine';

type Tab = 'chart' | 'replay' | 'ingest' | 'strategy';
type BottomPanel = 'trades' | 'performance';

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

export function BacktestingWorkspace() {
  const [activeTab, setActiveTab]         = useState<Tab>('chart');
  const [symbol, setSymbol]               = useState('NAS100');
  const [timeframe, setTimeframe]         = useState('1m');
  const [bottomPanel, setBottomPanel]     = useState<BottomPanel>('trades');

  const { markets } = useBacktestMarkets();
  const replay      = useReplayEngine();

  const isReplayMode = activeTab === 'replay';

  const handleTabChange = (tab: Tab) => {
    if (tab !== 'replay' && replay.state.status === 'playing') {
      replay.pause();
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0d1117] text-white overflow-hidden">

      {/* ── Top Toolbar ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[#21262d] bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <BarChart2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Backtester</span>
        </div>

        <div className="w-px h-5 bg-[#30363d]" />

        {/* Symbol */}
        <div className="relative">
          <select
            value={symbol}
            onChange={e => { setSymbol(e.target.value); replay.reset(); }}
            className="appearance-none bg-[#21262d] border border-[#30363d] text-white text-xs px-3 py-1.5 rounded-lg pr-7 focus:outline-none focus:border-primary cursor-pointer"
          >
            {markets.map(m => (
              <option key={m.symbol} value={m.symbol}>{m.symbol} — {m.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Timeframes */}
        <div className="flex gap-0.5 bg-[#21262d] rounded-lg p-0.5">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => { setTimeframe(tf); replay.reset(); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                timeframe === tf ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Tab buttons */}
        <div className="ml-auto flex items-center gap-1.5">
          {([
            { id: 'chart',    label: 'Chart',      icon: BarChart2 },
            { id: 'replay',   label: 'Replay',     icon: Play },
            { id: 'ingest',   label: 'Données',    icon: Download },
            { id: 'strategy', label: 'Stratégie',  icon: Settings },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-[#21262d] text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === 'replay' && replay.state.status === 'playing' && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Replay Controls bar (visible only in replay tab) ──── */}
      {isReplayMode && (
        <ReplayControls
          symbol={symbol}
          timeframe={timeframe}
          status={replay.state.status}
          speed={replay.state.speed}
          progress={replay.progress}
          replayIndex={replay.state.replayIndex}
          total={replay.total}
          currentCandle={replay.currentCandle}
          error={replay.state.error}
          onLoad={(s, e) => replay.loadReplay(symbol, timeframe, s, e)}
          onPlay={replay.play}
          onPause={replay.pause}
          onReset={replay.reset}
          onStepFwd={replay.stepFwd}
          onStepBack={replay.stepBack}
          onSetSpeed={(s) => replay.setSpeed(s as ReplaySpeed)}
          onJumpTo={replay.jumpTo}
        />
      )}

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Drawing tools sidebar */}
        <div className="w-10 bg-[#161b22] border-r border-[#21262d] flex flex-col items-center py-3 gap-2.5 shrink-0">
          {[
            { icon: '↗', title: 'Ligne de tendance' },
            { icon: '—', title: 'Ligne horizontale' },
            { icon: '|', title: 'Ligne verticale' },
            { icon: '□', title: 'Rectangle' },
            { icon: 'Φ', title: 'Fibonacci' },
            { icon: 'T', title: 'Annotation' },
          ].map(t => (
            <button
              key={t.title}
              title={t.title}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#21262d] rounded text-xs font-mono transition-colors"
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Chart + bottom panel */}
        <div className="flex flex-1 min-w-0 flex-col">
          {activeTab === 'ingest' ? (
            <DataIngestionPanel symbol={symbol} onClose={() => setActiveTab('chart')} />

          ) : activeTab === 'strategy' ? (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <Settings className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Strategy Builder</p>
                <p className="text-xs mt-1 opacity-50">Phase 3 — à venir</p>
              </div>
            </div>

          ) : (
            <>
              {/* Chart */}
              <div className="flex-1 min-h-0">
                {isReplayMode && replay.visibleCandles.length > 0 ? (
                  <ChartCanvas
                    symbol={symbol}
                    timeframe={timeframe}
                    externalCandles={replay.visibleCandles}
                    replayIndex={replay.state.replayIndex}
                    preHistoryCount={replay.preHistoryCount}
                    autoFollow={replay.state.status === 'playing'}
                  />
                ) : (
                  <ChartCanvas symbol={symbol} timeframe={timeframe} />
                )}
              </div>

              {/* Bottom panel */}
              <div className="h-36 border-t border-[#21262d] bg-[#161b22] shrink-0 flex flex-col">
                <div className="flex border-b border-[#21262d] shrink-0">
                  {(['trades', 'performance'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setBottomPanel(p)}
                      className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                        bottomPanel === p
                          ? 'text-white border-b-2 border-primary'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {p === 'trades' ? 'Historique Trades' : 'Performance'}
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">
                  {bottomPanel === 'trades'
                    ? 'Aucun trade — Phase 3 (Backtesting Engine) à venir'
                    : 'Aucun résultat disponible'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
