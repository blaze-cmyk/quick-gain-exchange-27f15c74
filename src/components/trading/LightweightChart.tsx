import { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  CandlestickSeriesPartialOptions,
  IChartApi,
  ISeriesApi,
  LineStyle,
  CrosshairMode,
  ColorType,
  UTCTimestamp,
  PriceLineOptions,
  Time,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  IPriceLine,
  SeriesMarker,
} from 'lightweight-charts';
import { CandleData, Trade } from '@/lib/types';
import type { ChartType, ChartInterval } from './ChartToolbar';

interface LightweightChartProps {
  candles: CandleData[];
  currentPrice: number;
  payout?: number;
  connected?: boolean;
  activeTrades?: Trade[];
  completedTrades?: Trade[];
  selectedDuration?: number;
  chartType?: ChartType;
  chartInterval?: ChartInterval;
}

const COLORS = {
  bg: '#111118',
  grid: 'rgba(255, 255, 255, 0.04)',
  text: 'rgba(255, 255, 255, 0.55)',
  border: '#1a1a24',
  up: '#3dbc84',
  down: '#c94545',
  upWick: '#3dbc84',
  downWick: '#c94545',
  priceLine: '#18dcb5',
  entryUp: '#3dbc84',
  entryDown: '#c94545',
};

function nowUTC(): string {
  const d = new Date();
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m}:${s} ${ampm} UTC`;
}

function detectDecimals(price: number): number {
  if (price >= 1000) return 2;
  if (price >= 10) return 3;
  if (price >= 1) return 4;
  return 5;
}

export default function LightweightChart({
  candles,
  currentPrice,
  payout,
  connected,
  activeTrades = [],
  completedTrades = [],
  selectedDuration = 60,
  chartType = 'candles',
  chartInterval = '1m',
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const priceLineRef = useRef<IPriceLine | null>(null);
  const tradePriceLinesRef = useRef<Map<string, IPriceLine>>(new Map());
  const [utcTime, setUtcTime] = useState(nowUTC());

  const decimals = useMemo(() => detectDecimals(currentPrice || candles.at(-1)?.close || 1), [currentPrice, candles]);

  /* ─────────── chart init ─────────── */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.bg },
        textColor: COLORS.text,
        fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(255,255,255,0.18)', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#18dcb5' },
        horzLine: { color: 'rgba(255,255,255,0.18)', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#18dcb5' },
      },
      rightPriceScale: {
        borderColor: COLORS.border,
        scaleMargins: { top: 0.12, bottom: 0.08 },
        textColor: COLORS.text,
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: chartInterval === '1s',
        rightOffset: 12,
        barSpacing: 8,
        minBarSpacing: 2,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const candleOpts: CandlestickSeriesPartialOptions = {
      upColor: COLORS.up,
      downColor: COLORS.down,
      borderUpColor: COLORS.up,
      borderDownColor: COLORS.down,
      wickUpColor: COLORS.upWick,
      wickDownColor: COLORS.downWick,
      priceFormat: { type: 'price', precision: decimals, minMove: 1 / Math.pow(10, decimals) },
    };
    const candleSeries = chart.addCandlestickSeries(candleOpts);

    const lineOpts: LineSeriesPartialOptions = {
      color: COLORS.priceLine,
      lineWidth: 2,
      priceFormat: { type: 'price', precision: decimals, minMove: 1 / Math.pow(10, decimals) },
    };
    const lineSeries = chart.addLineSeries(lineOpts);

    const areaOpts: AreaSeriesPartialOptions = {
      lineColor: COLORS.priceLine,
      topColor: 'rgba(24, 220, 181, 0.25)',
      bottomColor: 'rgba(24, 220, 181, 0.0)',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: decimals, minMove: 1 / Math.pow(10, decimals) },
    };
    const areaSeries = chart.addAreaSeries(areaOpts);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;
    areaSeriesRef.current = areaSeries;

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
      areaSeriesRef.current = null;
      priceLineRef.current = null;
      tradePriceLinesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────── update precision when pair scale changes ─────────── */
  useEffect(() => {
    const fmt = { type: 'price' as const, precision: decimals, minMove: 1 / Math.pow(10, decimals) };
    candleSeriesRef.current?.applyOptions({ priceFormat: fmt });
    lineSeriesRef.current?.applyOptions({ priceFormat: fmt });
    areaSeriesRef.current?.applyOptions({ priceFormat: fmt });
  }, [decimals]);

  /* ─────────── show/hide series by chartType ─────────── */
  useEffect(() => {
    candleSeriesRef.current?.applyOptions({ visible: chartType === 'candles' });
    lineSeriesRef.current?.applyOptions({ visible: chartType === 'line' });
    areaSeriesRef.current?.applyOptions({ visible: chartType === 'area' });
  }, [chartType]);

  /* ─────────── secondsVisible toggle ─────────── */
  useEffect(() => {
    chartRef.current?.applyOptions({
      timeScale: { secondsVisible: chartInterval === '1s' },
    });
  }, [chartInterval]);

  /* ─────────── feed candles → series ─────────── */
  useEffect(() => {
    if (!candleSeriesRef.current || !lineSeriesRef.current || !areaSeriesRef.current) return;
    if (candles.length === 0) return;

    // Dedupe on time (engine produces aligned buckets, but be safe)
    const seen = new Set<number>();
    const candleData = [];
    const lineData = [];
    for (const c of candles) {
      const t = Math.floor(c.time / 1000) as UTCTimestamp;
      if (seen.has(t)) continue;
      seen.add(t);
      candleData.push({ time: t, open: c.open, high: c.high, low: c.low, close: c.close });
      lineData.push({ time: t, value: c.close });
    }

    candleSeriesRef.current.setData(candleData);
    lineSeriesRef.current.setData(lineData);
    areaSeriesRef.current.setData(lineData);
  }, [candles]);

  /* ─────────── live price line at current price ─────────── */
  useEffect(() => {
    if (!candleSeriesRef.current || !currentPrice) return;
    const series = candleSeriesRef.current;

    if (priceLineRef.current) {
      try { series.removePriceLine(priceLineRef.current); } catch { /* ignore */ }
    }

    const opts: PriceLineOptions = {
      price: currentPrice,
      color: COLORS.priceLine,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: '',
      lineVisible: true,
      axisLabelColor: COLORS.priceLine,
      axisLabelTextColor: '#0a0a10',
    };
    priceLineRef.current = series.createPriceLine(opts);
  }, [currentPrice]);

  /* ─────────── active trade price lines + markers ─────────── */
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;

    // Reconcile price lines: remove ones whose trade is gone, add new
    const liveIds = new Set(activeTrades.map((t) => t.id));
    for (const [id, line] of tradePriceLinesRef.current) {
      if (!liveIds.has(id)) {
        try { series.removePriceLine(line); } catch { /* ignore */ }
        tradePriceLinesRef.current.delete(id);
      }
    }
    for (const t of activeTrades) {
      if (tradePriceLinesRef.current.has(t.id)) continue;
      const color = t.direction === 'up' ? COLORS.entryUp : COLORS.entryDown;
      const line = series.createPriceLine({
        price: t.entryPrice,
        color,
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: t.direction === 'up' ? '▲' : '▼',
        lineVisible: true,
        axisLabelColor: color,
        axisLabelTextColor: '#0a0a10',
      });
      tradePriceLinesRef.current.set(t.id, line);
    }

    // Build markers: entry arrows + completed result icons
    const markers: SeriesMarker<Time>[] = [];
    for (const t of activeTrades) {
      markers.push({
        time: Math.floor(t.startTime / 1000) as UTCTimestamp,
        position: t.direction === 'up' ? 'belowBar' : 'aboveBar',
        color: t.direction === 'up' ? COLORS.entryUp : COLORS.entryDown,
        shape: t.direction === 'up' ? 'arrowUp' : 'arrowDown',
        text: `$${t.amount}`,
      });
    }
    for (const t of completedTrades.slice(0, 30)) {
      const won = t.result === 'win';
      markers.push({
        time: Math.floor(t.endTime / 1000) as UTCTimestamp,
        position: won ? 'aboveBar' : 'belowBar',
        color: won ? COLORS.up : COLORS.down,
        shape: won ? 'circle' : 'square',
        text: won ? 'W' : 'L',
      });
    }
    // Lightweight Charts requires markers sorted by time ascending
    markers.sort((a, b) => (a.time as number) - (b.time as number));
    series.setMarkers(markers);
  }, [activeTrades, completedTrades]);

  /* ─────────── UTC clock ─────────── */
  useEffect(() => {
    const id = setInterval(() => setUtcTime(nowUTC()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ─────────── render ─────────── */
  const lastClose = candles.at(-1)?.close ?? currentPrice;
  const firstOpen = candles[0]?.open ?? lastClose;
  const change = lastClose && firstOpen ? ((lastClose - firstOpen) / firstOpen) * 100 : 0;
  const high = candles.length ? Math.max(...candles.map((c) => c.high)) : currentPrice;
  const low = candles.length ? Math.min(...candles.map((c) => c.low)) : currentPrice;

  return (
    <div className="absolute inset-0 bg-[#111118]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* UTC time top-left */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#3dbc84]' : 'bg-[#c94545]'}`} />
        <span className="text-[11px] text-white/55 tabular-nums" style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif' }}>
          {utcTime}
        </span>
      </div>

      {/* OHLC + change top header (right of UTC time) */}
      <div
        className="absolute top-3 left-44 z-10 flex items-center gap-3 pointer-events-none text-[11px] tabular-nums"
        style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif' }}
      >
        <span className="text-white/40">O <span className="text-white">{firstOpen.toFixed(decimals)}</span></span>
        <span className="text-white/40">H <span className="text-white">{high.toFixed(decimals)}</span></span>
        <span className="text-white/40">L <span className="text-white">{low.toFixed(decimals)}</span></span>
        <span className="text-white/40">C <span className="text-white">{lastClose.toFixed(decimals)}</span></span>
        <span className={change >= 0 ? 'text-[#3dbc84]' : 'text-[#c94545]'}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
        {payout != null && (
          <span className="text-white/40 ml-1">PAYOUT <span className="text-[#18dcb5]">{payout}%</span></span>
        )}
      </div>
    </div>
  );
}
