import React, { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  symbol:    string;
  timeframe: string;
  /** If provided, skips internal fetch and uses these candles instead (replay mode) */
  externalCandles?:  Candle[];
  /** In replay mode: index of the last visible replay candle (0-based within externalCandles) */
  replayIndex?:      number;
  /** How many candles at the start of externalCandles are pre-history (always visible) */
  preHistoryCount?:  number;
  /** Auto-follow the frontier candle when replayIndex increases */
  autoFollow?:       boolean;
}

// ── Chart constants ──────────────────────────────────────────────────────────
const PRICE_SCALE_W  = 70;
const TIME_SCALE_H   = 24;
const VOL_RATIO      = 0.14;
const MIN_CW         = 2;
const MAX_CW         = 40;
const INIT_VISIBLE   = 120;
const GAP_RATIO      = 0.25;

const C = {
  bg:          '#0d1117',
  grid:        '#21262d',
  border:      '#30363d',
  scale:       '#161b22',
  bull:        '#26a641',
  bear:        '#f85149',
  vol:         '#30363d',
  crosshair:   '#484f58',
  label:       '#e6edf3',
  timeLabel:   '#8b949e',
  curPrice:    '#f78166',
  frontier:    '#3b82f6',   // blue line at replay start
  currentCdl:  '#f59e0b',   // amber glow on frontier candle
  preHistory:  0.5,         // alpha for pre-history candles in replay mode
};

interface ChartState {
  candles:          Candle[];
  offset:           number;
  candleWidth:      number;
  mouse:            { x: number; y: number };
  isDragging:       boolean;
  dragStartX:       number;
  dragStartOffset:  number;
  width:            number;
  height:           number;
  // Replay fields
  replayMode:       boolean;
  replayIndex:      number;   // -1 = show all
  preHistoryCount:  number;
  autoFollow:       boolean;
  lastFollowIndex:  number;   // last replayIndex we auto-followed
}

export function ChartCanvas({
  symbol, timeframe,
  externalCandles, replayIndex, preHistoryCount = 0, autoFollow = false,
}: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef     = useRef<ChartState>({
    candles:         [],
    offset:          0,
    candleWidth:     8,
    mouse:           { x: -1, y: -1 },
    isDragging:      false,
    dragStartX:      0,
    dragStartOffset: 0,
    width:           0,
    height:          0,
    replayMode:      false,
    replayIndex:     -1,
    preHistoryCount: 0,
    autoFollow:      false,
    lastFollowIndex: -1,
  });
  const rafRef = useRef<number>(0);

  // ── Fetch candles (normal mode only) ────────────────────────────────────
  const { data: fetchedCandles, isLoading, error } = useQuery<Candle[]>({
    queryKey:  ['backtest', 'candles', symbol, timeframe],
    queryFn:   async () => {
      const to   = new Date();
      const from = new Date(); from.setMonth(from.getMonth() - 1);
      const res = await api.get('/api/backtest/candles', {
        params: { symbol, timeframe, from: from.toISOString(), to: to.toISOString(), limit: 5000 },
      });
      return res.data.data;
    },
    enabled:   !externalCandles,
    staleTime: 5 * 60_000,
    retry:     false,
  });

  // ── Render ───────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { width, height, offset, candleWidth } = s;
    if (!width || !height) return;

    // Which candles to render
    const allCandles = s.candles;
    const renderCount = s.replayMode && s.replayIndex >= 0
      ? Math.min(s.preHistoryCount + s.replayIndex + 1, allCandles.length)
      : allCandles.length;
    const displayCandles = allCandles.slice(0, renderCount);
    if (!displayCandles.length) {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height); return;
    }

    const chartW = width  - PRICE_SCALE_W;
    const chartH = height - TIME_SCALE_H;
    const volH   = chartH * VOL_RATIO;
    const priceH = chartH - volH;

    const gap    = candleWidth * GAP_RATIO;
    const bodyW  = candleWidth - gap;
    const maxVis = Math.ceil(chartW / candleWidth) + 1;
    const visible = displayCandles.slice(Math.max(0, offset), Math.min(displayCandles.length, offset + maxVis));
    if (!visible.length) return;

    // Price range
    let pMin = Infinity, pMax = -Infinity, vMax = 0;
    for (const c of visible) {
      if (+c.low  < pMin) pMin = +c.low;
      if (+c.high > pMax) pMax = +c.high;
      const v = +c.volume; if (v > vMax) vMax = v;
    }
    const range   = pMax - pMin || 1;
    const pad     = range * 0.05;
    const lo = pMin - pad;
    const hi = pMax + pad;

    const py = (price: number) => priceH - ((price - lo) / (hi - lo)) * priceH;
    const tx = (i: number) => (i - Math.max(0, offset)) * candleWidth + gap / 2;

    // Background
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      const y = Math.round((i / 6) * priceH);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(chartW, y); ctx.stroke();
    }

    // Frontier line (replay mode only — marks where pre-history ends)
    if (s.replayMode && s.preHistoryCount > 0) {
      const frontierAbsIdx = s.preHistoryCount;
      const frontierX = Math.round(tx(frontierAbsIdx) + bodyW / 2);
      if (frontierX > 0 && frontierX < chartW) {
        ctx.strokeStyle = C.frontier; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(frontierX, 0); ctx.lineTo(frontierX, priceH); ctx.stroke();
        ctx.setLineDash([]);
        // Label
        ctx.fillStyle = C.frontier; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('REPLAY', frontierX, 12);
      }
    }

    // Candles
    for (let i = 0; i < visible.length; i++) {
      const c    = visible[i];
      const absI = Math.max(0, offset) + i;
      const x    = Math.round(tx(absI));
      const isBull = +c.close >= +c.open;

      // Determine if this candle is pre-history (dimmed in replay mode)
      const isPreHistory = s.replayMode && absI < s.preHistoryCount;
      // Determine if this is the frontier candle (current replay candle)
      const isFrontier   = s.replayMode && absI === s.preHistoryCount + s.replayIndex;

      const alpha = isPreHistory ? C.preHistory : 1;
      ctx.globalAlpha = alpha;

      const color = isBull ? C.bull : C.bear;
      const openY  = Math.round(py(+c.open));
      const closeY = Math.round(py(+c.close));
      const highY  = Math.round(py(+c.high));
      const lowY   = Math.round(py(+c.low));
      const bTop   = Math.min(openY, closeY);
      const bBot   = Math.max(openY, closeY);
      const bH     = Math.max(1, bBot - bTop);

      // Wick
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + bodyW / 2, highY); ctx.lineTo(x + bodyW / 2, lowY); ctx.stroke();

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x, bTop, Math.max(1, bodyW), bH);

      // Frontier candle glow
      if (isFrontier) {
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = C.currentCdl; ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, bTop - 1, bodyW + 2, bH + 2);
      }

      ctx.globalAlpha = 1;

      // Volume bar
      if (vMax > 0) {
        const bV = (+c.volume / vMax) * volH;
        ctx.fillStyle = C.vol;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x, priceH + TIME_SCALE_H + (volH - bV), Math.max(1, bodyW), bV);
        ctx.globalAlpha = 1;
      }
    }

    // Price scale
    ctx.fillStyle = C.scale; ctx.fillRect(chartW, 0, PRICE_SCALE_W, height);
    ctx.strokeStyle = C.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(chartW, 0); ctx.lineTo(chartW, height); ctx.stroke();
    ctx.fillStyle = C.label; ctx.font = '10px monospace'; ctx.textAlign = 'right';
    for (let i = 0; i <= 6; i++) {
      const price = lo + ((6 - i) / 6) * (hi - lo);
      ctx.fillText(price.toFixed(2), width - 4, Math.round((i / 6) * priceH) + 3);
    }

    // Current price line
    const lastC = visible[visible.length - 1];
    const lpx   = Math.round(py(+lastC.close));
    ctx.strokeStyle = C.curPrice; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, lpx); ctx.lineTo(chartW, lpx); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.curPrice; ctx.fillRect(chartW, lpx - 9, PRICE_SCALE_W, 18);
    ctx.fillStyle = '#0d1117'; ctx.textAlign = 'right';
    ctx.fillText((+lastC.close).toFixed(2), width - 4, lpx + 4);

    // Time scale
    ctx.fillStyle = C.scale; ctx.fillRect(0, priceH, chartW, TIME_SCALE_H);
    ctx.fillStyle = C.timeLabel; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    const labelEvery = Math.max(1, Math.round(80 / candleWidth));
    for (let i = 0; i < visible.length; i += labelEvery) {
      const absI = Math.max(0, offset) + i;
      const x    = tx(absI) + bodyW / 2;
      const ts   = new Date(visible[i].timestamp);
      const lbl  = timeframe === '1d' || timeframe === '4h'
        ? ts.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
        : ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(lbl, x, priceH + 15);
    }

    // Crosshair
    if (s.mouse.x >= 0 && s.mouse.x < chartW && s.mouse.y >= 0 && s.mouse.y < priceH) {
      ctx.strokeStyle = C.crosshair; ctx.lineWidth = 0.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(s.mouse.x, 0); ctx.lineTo(s.mouse.x, priceH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, s.mouse.y); ctx.lineTo(chartW, s.mouse.y); ctx.stroke();
      ctx.setLineDash([]);
      const hp = lo + (1 - s.mouse.y / priceH) * (hi - lo);
      ctx.fillStyle = '#484f58'; ctx.fillRect(chartW, s.mouse.y - 9, PRICE_SCALE_W, 18);
      ctx.fillStyle = C.label; ctx.textAlign = 'right';
      ctx.fillText(hp.toFixed(2), width - 4, s.mouse.y + 4);
    }
  }, [timeframe]);

  const scheduleRender = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);
  }, [render]);

  // ── Sync external candles (replay mode) ────────────────────────────────
  useEffect(() => {
    if (!externalCandles) return;
    const s = stateRef.current;
    s.replayMode     = true;
    s.candles        = externalCandles;
    s.preHistoryCount = preHistoryCount;
    // On first load, start at end of pre-history
    if (s.offset === 0 && externalCandles.length > 0) {
      const maxVis = Math.ceil(s.width / s.candleWidth) || INIT_VISIBLE;
      s.offset = Math.max(0, preHistoryCount - Math.floor(maxVis * 0.8));
    }
    scheduleRender();
  }, [externalCandles, preHistoryCount, scheduleRender]);

  // ── Sync replayIndex + auto-follow ─────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    if (replayIndex === undefined) { s.replayIndex = -1; return; }
    s.replayIndex = replayIndex;

    if (autoFollow && s.autoFollow !== autoFollow) s.autoFollow = autoFollow;

    if (autoFollow) {
      const frontierAbsIdx = s.preHistoryCount + replayIndex;
      const chartW  = s.width - PRICE_SCALE_W;
      const maxVis  = Math.ceil(chartW / s.candleWidth);
      const preferred = Math.max(0, frontierAbsIdx - Math.floor(maxVis * 0.65));

      // Only scroll right (never left during playback)
      if (preferred > s.offset || s.lastFollowIndex < 0) {
        s.offset = preferred;
      }
      s.lastFollowIndex = replayIndex;
    }

    scheduleRender();
  }, [replayIndex, autoFollow, scheduleRender]);

  // ── Sync fetched candles (normal mode) ─────────────────────────────────
  useEffect(() => {
    if (!fetchedCandles?.length || externalCandles) return;
    const s = stateRef.current;
    s.candles    = fetchedCandles;
    s.replayMode = false;
    s.replayIndex = -1;
    const maxVis  = Math.ceil(s.width / s.candleWidth) || INIT_VISIBLE;
    s.offset      = Math.max(0, fetchedCandles.length - maxVis);
    scheduleRender();
  }, [fetchedCandles, externalCandles, scheduleRender]);

  // ── Resize observer ────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = el.clientWidth, h = el.clientHeight;
      canvas.width = w; canvas.height = h;
      stateRef.current.width = w; stateRef.current.height = h;
      scheduleRender();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scheduleRender]);

  // ── Mouse handlers ─────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const s    = stateRef.current;
    s.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (s.isDragging) {
      const dx  = e.clientX - s.dragStartX;
      const di  = Math.round(-dx / s.candleWidth);
      const disp = s.candles.length - Math.round((s.width - PRICE_SCALE_W) / s.candleWidth);
      s.offset = Math.max(0, Math.min(Math.max(0, disp), s.dragStartOffset + di));
      s.autoFollow = false; // disable auto-follow when user pans manually
    }
    scheduleRender();
  }, [scheduleRender]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const s = stateRef.current;
    s.isDragging = true; s.dragStartX = e.clientX; s.dragStartOffset = s.offset;
  }, []);

  const onMouseUp   = useCallback(() => { stateRef.current.isDragging = false; }, []);
  const onMouseLeave = useCallback(() => {
    const s = stateRef.current;
    s.mouse = { x: -1, y: -1 }; s.isDragging = false;
    scheduleRender();
  }, [scheduleRender]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const s = stateRef.current;
    if (e.ctrlKey || e.metaKey) {
      s.candleWidth = Math.min(MAX_CW, Math.max(MIN_CW, s.candleWidth * (e.deltaY > 0 ? 0.85 : 1.15)));
    } else {
      const disp = s.candles.length - Math.round((s.width - PRICE_SCALE_W) / s.candleWidth);
      s.offset = Math.max(0, Math.min(Math.max(0, disp), s.offset + Math.round(e.deltaY / 40)));
    }
    scheduleRender();
  }, [scheduleRender]);

  // ── Loading / error states ─────────────────────────────────────────────
  if (!externalCandles && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const isEmpty = externalCandles ? externalCandles.length === 0 : (!fetchedCandles?.length && !isLoading);
  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <AlertCircle className="w-7 h-7 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aucune donnée · {symbol} {timeframe}</p>
          <p className="text-xs text-gray-600 mt-1">Téléchargez les données via le panneau "Données"</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 relative bg-[#0d1117]" style={{ cursor: 'crosshair' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
        style={{ display: 'block' }}
      />
      {/* Overlay label */}
      <div className="absolute top-2 left-2 text-[10px] text-gray-600 pointer-events-none select-none font-mono">
        {symbol} · {timeframe}
        {externalCandles && (
          <span className="ml-2 text-blue-600">REPLAY</span>
        )}
      </div>
    </div>
  );
}
