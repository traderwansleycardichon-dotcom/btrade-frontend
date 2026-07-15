import React, { useState } from 'react';
import {
  BarChart2, Settings, List, ChevronDown,
  Play, Pause, RotateCcw, Clock, Download, Database,
} from 'lucide-react';
import { useBacktestMarkets } from './hooks/useBacktestMarkets';
import { DataIngestionPanel } from './panels/DataIngestionPanel';
import { ChartCanvas } from './chart/ChartCanvas';

type Tab = 'chart' | 'ingest' | 'strategy' | 'results';

export function BacktestingWorkspace() {
  const [activeTab, setActiveTab]     = useState<Tab>('chart');
  const [symbol, setSymbol]           = useState('NAS100');
  const [timeframe, setTimeframe]     = useState('1m');
  const [bottomPanel, setBottomPanel] = useState<'trades' | 'performance'>('trades');

  const { markets } = useBacktestMarkets();

  const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0d1117] text-white overflow-hidden">

      {/* ── Top Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[#21262d] bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Backtester</span>
        </div>

        <div className="w-px h-5 bg-[#30363d]" />

        {/* Symbol selector */}
        <div className="relative">
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="appearance-none bg-[#21262d] border border-[#30363d] text-white text-xs px-3 py-1.5 rounded-lg pr-7 focus:outline-none focus:border-primary cursor-pointer"
          >
            {markets.map(m => (
              <option key={m.symbol} value={m.symbol}>{m.symbol} — {m.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Timeframe tabs */}
        <div className="flex gap-0.5 bg-[#21262d] rounded-lg p-0.5">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ingest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'ingest'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-[#21262d] text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Données
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'strategy'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-[#21262d] text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Stratégie
          </button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left tools sidebar */}
        <div className="w-10 bg-[#161b22] border-r border-[#21262d] flex flex-col items-center py-3 gap-3 shrink-0">
          {[
            { icon: '↗', label: 'Trend line',   title: 'Ligne de tendance' },
            { icon: '—', label: 'H-line',        title: 'Ligne horizontale' },
            { icon: '|', label: 'V-line',        title: 'Ligne verticale' },
            { icon: '□', label: 'Rectangle',     title: 'Rectangle' },
            { icon: 'Φ', label: 'Fibonacci',     title: 'Fibonacci retracement' },
            { icon: 'T', label: 'Text',          title: 'Annotation texte' },
          ].map(tool => (
            <button
              key={tool.label}
              title={tool.title}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#21262d] rounded text-xs transition-colors font-mono"
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Chart + panel area */}
        <div className="flex flex-1 min-w-0 flex-col">

          {activeTab === 'ingest' ? (
            <DataIngestionPanel symbol={symbol} onClose={() => setActiveTab('chart')} />
          ) : activeTab === 'strategy' ? (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">Strategy Builder</p>
                <p className="text-xs mt-1 opacity-60">Phase 3 — à venir</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chart area */}
              <div className="flex-1 min-h-0">
                <ChartCanvas symbol={symbol} timeframe={timeframe} />
              </div>

              {/* Bottom panel */}
              <div className="h-40 border-t border-[#21262d] bg-[#161b22] shrink-0 flex flex-col">
                <div className="flex border-b border-[#21262d]">
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
                    ? 'Aucun trade — lancez un backtest pour voir l\'historique'
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
