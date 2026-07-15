import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  symbol: string;
  timeframe: string;
}

// Chart rendering constants
const PRICE_SCALE_WIDTH = 70;
const TIME_SCALE_HEIGHT = 24;
const VOLUME_HEIGHT_RATIO = 0.15;  // volume takes 15% of chart height
const MIN_CANDLE_WIDTH = 2;
const MAX_CANDLE_WIDTH = 40;
const INITIAL_CANDLES_VISIBLE = 120;
const CANDLE_GAP_RATIO = 0.25;     // gap = 25% of candle width

const COLORS = {
  bg:          '#0d1117',
  grid:        '#21262d',
  border:      '#30363d',
  priceScale:  '#161b22',
  bullCandle:  '#26a641',
  bearCandle:  '#f85149',
  bullWick:    '#26a641',
  bearWick:    '#f85149',
  volume:      '#30363d',
  crosshair:   '#484f58',
  priceLabel:  '#e6edf3',
  timeLabel:   '#8b949e',
  currentPrice:'#f78166',
};

export function ChartCanvas({ symbol, timeframe }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef   = useRef({
    candles:        [] as Candle[],
    offset:         0,         // candle index of the leftmost visible candle
    candleWidth:    8,         // px width of each candle body+gap
    mouse:          { x: -1, y: -1 },
    isDragging:     false,
    dragStartX:     0,
    dragStartOffset: 0,
    width:          0,
    height:         0,
  });
  const animFrameRef = useRef<number>(0);

  // Fetch candles from API
  const { data, isLoading, error } = useQuery<Candle[]>({
    queryKey: ['backtest', 'candles', symbol, timeframe],
    queryFn:  async () => {
      const to   = new Date();
      const from = new Date();
      from.setMonth(from.getMonth() - 1); // last month by default

      const res = await api.get('/api/backtest/candles', {
        params: { symbol, timeframe, from: from.toISOString(), to: to.toISOString(), limit: 5000 },
      });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // ── Render loop ─────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { width, height, candles, offset, candleWidth, mouse } = s;
    if (!width || !height || !candles.length) {
      // Draw empty state
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const chartW = width  - PRICE_SCALE_WIDTH;
    const chartH = height - TIME_SCALE_HEIGHT;
    const volH   = chartH * VOLUME_HEIGHT_RATIO;
    const priceH = chartH - volH;

    const gap     = candleWidth * CANDLE_GAP_RATIO;
    const bodyW   = candleWidth - gap;
    const maxVis  = Math.ceil(chartW / candleWidth) + 1;
    const visible = candles.slice(
      Math.max(0, offset),
      Math.min(candles.length, offset + maxVis),
    );

    if (!visible.length) return;

    // Price range (visible candles only)
    let priceMin = Infinity, priceMax = -Infinity;
    let volMax   = 0;
    for (const c of visible) {
      if (c.low  < priceMin) priceMin = c.low;
      if (c.high > priceMax) priceMax = c.high;
      const vol = Number(c.volume);
      if (vol > volMax) volMax = vol;
    }
    const priceRange = priceMax - priceMin || 1;
    const padding    = priceRange * 0.05;
    const lo  = priceMin - padding;
    const hi  = priceMax + padding;

    const px = (price: number) =>
      priceH - ((price - lo) / (hi - lo)) * priceH;
    const tx = (i: number) =>
      (i - Math.max(0, offset)) * candleWidth + gap / 2;

    // ── Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // ── Grid lines (horizontal — price levels)
    const gridLines = 6;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= gridLines; i++) {
      const y = Math.round((i / gridLines) * priceH);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartW, y);
      ctx.stroke();
    }

    // ── Candles
    for (let i = 0; i < visible.length; i++) {
      const c    = visible[i];
      const absI = Math.max(0, offset) + i;
      const x    = Math.round(tx(absI));
      const isBull = Number(c.close) >= Number(c.open);
      const color  = isBull ? COLORS.bullCandle : COLORS.bearCandle;

      const openY  = Math.round(px(Number(c.open)));
      const closeY = Math.round(px(Number(c.close)));
      const highY  = Math.round(px(Number(c.high)));
      const lowY   = Math.round(px(Number(c.low)));

      const bodyTop = Math.min(openY, closeY);
      const bodyBot = Math.max(openY, closeY);
      const bodyH   = Math.max(1, bodyBot - bodyTop);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(x + bodyW / 2, highY);
      ctx.lineTo(x + bodyW / 2, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, Math.max(1, bodyW), bodyH);

      // Volume bar
      if (volMax > 0) {
        const vol    = Number(c.volume);
        const barH   = (vol / volMax) * volH;
        ctx.fillStyle = COLORS.volume;
        ctx.fillRect(x, priceH + TIME_SCALE_HEIGHT + (volH - barH), Math.max(1, bodyW), barH);
      }
    }

    // ── Price scale (right side)
    ctx.fillStyle = COLORS.priceScale;
    ctx.fillRect(chartW, 0, PRICE_SCALE_WIDTH, height);
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(chartW, 0);
    ctx.lineTo(chartW, height);
    ctx.stroke();

    ctx.fillStyle = COLORS.priceLabel;
    ctx.font      = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const price = lo + ((gridLines - i) / gridLines) * (hi - lo);
      const y     = Math.round((i / gridLines) * priceH);
      ctx.fillText(price.toFixed(2), width - 4, y + 3);
    }

    // Current price line
    const lastC  = visible[visible.length - 1];
    const lastPx = Math.round(px(Number(lastC.close)));
    ctx.strokeStyle = COLORS.currentPrice;
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, lastPx);
    ctx.lineTo(chartW, lastPx);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current price label
    ctx.fillStyle = COLORS.currentPrice;
    ctx.fillRect(chartW, lastPx - 9, PRICE_SCALE_WIDTH, 18);
    ctx.fillStyle = '#0d1117';
    ctx.fillText(Number(lastC.close).toFixed(2), width - 4, lastPx + 4);

    // ── Time scale (bottom)
    ctx.fillStyle = COLORS.priceScale;
    ctx.fillRect(0, priceH, chartW, TIME_SCALE_HEIGHT);
    ctx.fillStyle = COLORS.timeLabel;
    ctx.font      = '9px monospace';
    ctx.textAlign = 'center';

    const labelEvery = Math.max(1, Math.round(80 / candleWidth));
    for (let i = 0; i < visible.length; i += labelEvery) {
      const absI = Math.max(0, offset) + i;
      const x    = tx(absI) + bodyW / 2;
      const ts   = new Date(visible[i].timestamp);
      const label = timeframe === '1d' || timeframe === '4h'
        ? ts.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
        : ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(label, x, priceH + 15);
    }

    // ── Crosshair
    if (mouse.x >= 0 && mouse.x < chartW && mouse.y >= 0 && mouse.y < chartH) {
      ctx.strokeStyle = COLORS.crosshair;
      ctx.lineWidth   = 0.5;
      ctx.setLineDash([4, 4]);
      // Vertical
      ctx.beginPath(); ctx.moveTo(mouse.x, 0); ctx.lineTo(mouse.x, priceH); ctx.stroke();
      // Horizontal
      ctx.beginPath(); ctx.moveTo(0, mouse.y); ctx.lineTo(chartW, mouse.y); ctx.stroke();
      ctx.setLineDash([]);

      // Price at crosshair
      const hPrice = lo + (1 - mouse.y / priceH) * (hi - lo);
      ctx.fillStyle = '#484f58';
      ctx.fillRect(chartW, mouse.y - 9, PRICE_SCALE_WIDTH, 18);
      ctx.fillStyle = '#e6edf3';
      ctx.textAlign = 'right';
      ctx.fillText(hPrice.toFixed(2), width - 4, mouse.y + 4);
    }
  }, [timeframe]);

  // ── Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { clientWidth: w, clientHeight: h } = el;
      canvas.width  = w;
      canvas.height = h;
      stateRef.current.width  = w;
      stateRef.current.height = h;
      render();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    return () => ro.disconnect();
  }, [render]);

  // ── Update candles when data changes
  useEffect(() => {
    if (!data?.length) return;
    const s = stateRef.current;
    s.candles = data;
    // Start with the last N candles visible
    const maxVis = Math.ceil(s.width / s.candleWidth) || INITIAL_CANDLES_VISIBLE;
    s.offset = Math.max(0, data.length - maxVis);
    render();
  }, [data, render]);

  // ── Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const s    = stateRef.current;
    s.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (s.isDragging) {
      const dx  = e.clientX - s.dragStartX;
      const di  = Math.round(-dx / s.candleWidth);
      const newOff = Math.max(0, Math.min(s.candles.length - 1, s.dragStartOffset + di));
      s.offset = newOff;
    }

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(render);
  }, [render]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const s = stateRef.current;
    s.isDragging      = true;
    s.dragStartX      = e.clientX;
    s.dragStartOffset = s.offset;
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const s = stateRef.current;
    s.mouse      = { x: -1, y: -1 };
    s.isDragging = false;
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(render);
  }, [render]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const s = stateRef.current;

    if (e.ctrlKey || e.metaKey) {
      // Zoom (Ctrl+scroll)
      const factor = e.deltaY > 0 ? 0.85 : 1.15;
      s.candleWidth = Math.min(MAX_CANDLE_WIDTH, Math.max(MIN_CANDLE_WIDTH, s.candleWidth * factor));
    } else {
      // Pan (scroll)
      const delta = Math.round(e.deltaY / 40);
      s.offset = Math.max(0, Math.min(s.candles.length - 1, s.offset + delta));
    }

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(render);
  }, [render]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Chargement des candles…</p>
        </div>
      </div>
    );
  }

  if (error || !data?.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-1">Aucune donnée pour {symbol} {timeframe}</p>
          <p className="text-xs text-gray-600">
            Téléchargez les données historiques via le panneau "Données"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 relative bg-[#0d1117]" style={{ cursor: 'crosshair' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ display: 'block' }}
      />
      {/* Symbol/TF label overlay */}
      <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-500 pointer-events-none select-none">
        {symbol} · {timeframe}
        <span className="ml-2 text-gray-700">{data.length} candles</span>
      </div>
    </div>
  );
}
