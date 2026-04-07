import { useEffect, useRef, useCallback } from 'react';
import { CandleData, Trade } from '@/lib/types';
import type { ChartType, ChartInterval } from './ChartToolbar';

interface CustomChartProps {
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

interface ChartState {
  offsetX: number;
  targetOffsetX: number;
  scaleX: number;
  targetScaleX: number;
  scaleY: number;
  targetScaleY: number;
  isDragging: boolean;
  isDraggingPriceScale: boolean;
  isDraggingTimeScale: boolean;
  dragStartX: number;
  dragStartY: number;
  dragStartOffsetX: number;
  dragStartScaleY: number;
  dragStartScaleX: number;
  crosshair: { x: number; y: number } | null;
  smoothPrice: number;
  velocityX: number;
  lastDragX: number;
  lastDragTime: number;
}

const COLORS = {
  bg: '#0f1113',
  gridLine: 'rgba(255, 255, 255, 0.10)',
  priceScaleBg: '#0f1113',
  priceScaleBorder: '#1a1c24',
  timeScaleBg: '#0f1113',
  candleGreen: '#22c55e',
  candleRed: '#ef4444',
  wickGreen: '#22c55e88',
  wickRed: '#ef444488',
  priceLine: '#2dd4bf',
  priceLabel: '#14b8a6',
  textMuted: '#3a3f50',
  textLight: '#6b7280',
  crosshairLine: '#252830',
  crosshairLabel: '#1a1c24',
  crosshairText: '#d1d5db',
  tooltipGreen: '#22c55e',
  tooltipRed: '#ef4444',
  tradeGreen: '#22c55e',
  tradeRed: '#ef4444',
  tradeGreenBg: 'rgba(34, 197, 94, 0.12)',
  tradeRedBg: 'rgba(239, 68, 68, 0.12)',
};

const CANDLE_WIDTH_BASE = 7;
const CANDLE_GAP = 3;
const PRICE_SCALE_WIDTH = 75;
const TIME_SCALE_HEIGHT = 26;
const PADDING_TOP = 50;
const PADDING_BOTTOM = 10;
const LERP_SPEED = 0.12;
const RESULT_MARKER_LIFETIME_MS = 4000;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function formatTimeLabel(date: Date, interval: ChartInterval): string {
  switch (interval) {
    case '1s':
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    case '1m':
    case '3m':
    case '5m':
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    case '15m':
    case '30m':
    case '1h':
    case '2h':
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    case '4h':
      return `${date.getDate()}/${date.getMonth() + 1} ${String(date.getHours()).padStart(2, '0')}:00`;
    case '1d':
      return `${date.getDate()} ${date.toLocaleString('en', { month: 'short' })}`;
    default:
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}

export default function CustomChart({ candles, currentPrice, payout = 90, connected = true, activeTrades = [], completedTrades = [], selectedDuration = 60, chartType = 'candles', chartInterval = '1m' }: CustomChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ChartState>({
    offsetX: 0,
    targetOffsetX: 0,
    scaleX: 1,
    targetScaleX: 1,
    scaleY: 1,
    targetScaleY: 1,
    isDragging: false,
    isDraggingPriceScale: false,
    isDraggingTimeScale: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartOffsetX: 0,
    dragStartScaleY: 1,
    dragStartScaleX: 1,
    crosshair: null,
    smoothPrice: 0,
    velocityX: 0,
    lastDragX: 0,
    lastDragTime: 0,
  });
  const animFrameRef = useRef<number>(0);

  const getCandleWidth = () => CANDLE_WIDTH_BASE * stateRef.current.scaleX;
  const getCandleStep = () => (CANDLE_WIDTH_BASE + CANDLE_GAP) * stateRef.current.scaleX;

  const getVisibleRange = useCallback((width: number) => {
    const step = getCandleStep();
    const chartWidth = width - PRICE_SCALE_WIDTH;
    const totalWidth = candles.length * step;
    const offset = stateRef.current.offsetX;
    const baseOffset = totalWidth - chartWidth + step * 8;
    const effectiveOffset = baseOffset - offset;
    const startIdx = Math.max(0, Math.floor(effectiveOffset / step) - 2);
    const endIdx = Math.min(candles.length - 1, Math.ceil((effectiveOffset + chartWidth) / step) + 2);
    return { startIdx, endIdx, effectiveOffset };
  }, [candles.length]);

  const getPriceRange = useCallback((startIdx: number, endIdx: number) => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 1 };
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (let i = startIdx; i <= endIdx && i < candles.length; i++) {
      if (candles[i].low < minPrice) minPrice = candles[i].low;
      if (candles[i].high > maxPrice) maxPrice = candles[i].high;
    }
    if (currentPrice > 0) {
      if (currentPrice < minPrice) minPrice = currentPrice;
      if (currentPrice > maxPrice) maxPrice = currentPrice;
    }
    const liveCandle = candles[endIdx] ?? candles[candles.length - 1];
    const candleRange = liveCandle ? Math.max(liveCandle.high - liveCandle.low, liveCandle.open * 0.00035) : 1;
    const basePadding = (maxPrice - minPrice) * 0.035;
    const livePadding = candleRange * 3.2;
    const padding = Math.max(basePadding, livePadding, currentPrice * 0.00008);
    const rawMin = minPrice - padding;
    const rawMax = maxPrice + padding;
    
    // Apply vertical scale (scaleY) — zoom around center
    const center = (rawMin + rawMax) / 2;
    const halfRange = (rawMax - rawMin) / 2;
    const sy = stateRef.current.scaleY || 1;
    const scaledHalf = halfRange / sy;
    if (!isFinite(center) || !isFinite(scaledHalf) || scaledHalf === 0) {
      return { minPrice: rawMin, maxPrice: rawMax };
    }
    return { minPrice: center - scaledHalf, maxPrice: center + scaledHalf };
  }, [candles, currentPrice]);

  const priceToY = (price: number, minPrice: number, maxPrice: number, height: number) => {
    const chartHeight = height - TIME_SCALE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    return PADDING_TOP + chartHeight * (1 - (price - minPrice) / (maxPrice - minPrice));
  };

  const yToPrice = (y: number, minPrice: number, maxPrice: number, height: number) => {
    const chartHeight = height - TIME_SCALE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    return minPrice + (1 - (y - PADDING_TOP) / chartHeight) * (maxPrice - minPrice);
  };

  const findXForTime = useCallback((timeSec: number, step: number, effectiveOffset: number) => {
    const candleTimeSec = timeSec - (timeSec % 60);
    const fractionalMinute = (timeSec % 60) / 60;
    for (let i = 0; i < candles.length; i++) {
      if (candles[i].time === candleTimeSec) {
        return (i * step + fractionalMinute * step) - effectiveOffset + step / 2;
      }
    }
    if (candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const diffMin = (candleTimeSec - lastCandle.time) / 60 + fractionalMinute;
      return ((candles.length - 1 + diffMin) * step) - effectiveOffset + step / 2;
    }
    return -1;
  }, [candles]);

  const drawTradeOnChart = useCallback((
    ctx: CanvasRenderingContext2D,
    trade: Trade,
    step: number,
    effectiveOffset: number,
    minPrice: number,
    maxPrice: number,
    height: number,
    chartWidth: number,
    isActive: boolean
  ) => {
    const startTimeSec = Math.floor(trade.startTime / 1000);
    const endTimeSec = Math.floor(trade.endTime / 1000);
    const now = Date.now();
    const timeLeft = Math.max(0, Math.ceil((trade.endTime - now) / 1000));

    const startX = findXForTime(startTimeSec, step, effectiveOffset);
    const endX = findXForTime(endTimeSec, step, effectiveOffset);
    const entryY = priceToY(trade.entryPrice, minPrice, maxPrice, height);

    const isUp = trade.direction === 'up';
    const tradeColor = isUp ? COLORS.tradeGreen : COLORS.tradeRed;
    const tradeBgColor = isUp ? COLORS.tradeGreenBg : COLORS.tradeRedBg;

    // "Beginning of trade" line - same color as price line
    if (startX > 0 && startX < chartWidth) {
      ctx.strokeStyle = COLORS.priceLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, PADDING_TOP);
      ctx.lineTo(startX, height - TIME_SCALE_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = COLORS.priceLine;
      ctx.font = '10px Montserrat, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Beginning of trade', startX - 6, PADDING_TOP - 4);

      ctx.fillStyle = COLORS.priceLine;
      ctx.beginPath();
      ctx.moveTo(startX - 4, PADDING_TOP - 18);
      ctx.lineTo(startX + 4, PADDING_TOP - 14);
      ctx.lineTo(startX - 4, PADDING_TOP - 10);
      ctx.closePath();
      ctx.fill();
    }

    // "End of trade" solid vertical line
    if (endX > 0 && endX < chartWidth) {
      ctx.strokeStyle = '#8892a0';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(endX, PADDING_TOP);
      ctx.lineTo(endX, height - TIME_SCALE_HEIGHT);
      ctx.stroke();

      ctx.fillStyle = '#8892a0';
      ctx.font = '10px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('End of trade', endX + 6, PADDING_TOP - 4);
    }

    // Entry price horizontal dashed line with color
    ctx.strokeStyle = tradeColor + '66';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const lineStartX = Math.max(0, startX);
    const lineEndX = isActive ? chartWidth : Math.min(chartWidth, endX + 50);
    ctx.moveTo(lineStartX, entryY);
    ctx.lineTo(lineEndX, entryY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate current P&L
    let currentPnL = 0;
    if (isActive) {
      const priceDiff = currentPrice - trade.entryPrice;
      const isWinning = isUp ? priceDiff > 0 : priceDiff < 0;
      const fee = trade.amount * 0.10;
      const netPool = trade.amount - fee;
      currentPnL = isWinning ? netPool : -trade.amount;
    } else if (trade.result) {
      currentPnL = trade.result === 'win' ? ((trade.payout || 0) - trade.amount) : -trade.amount;
    }

    // Trade badge on entry price line — Quotex style pill
    // Shows: ↑/↓ icon, amount $, countdown
    const badgeX = isActive 
      ? Math.min(chartWidth - 120, Math.max(startX + 20, (startX + endX) / 2 - 50))
      : Math.max(startX + 10, startX);
    
    if (badgeX > -100 && badgeX < chartWidth + 100) {
      const badgeW = 100;
      const badgeH = 24;
      const badgeYPos = entryY - badgeH / 2;

      // Badge background
      ctx.fillStyle = tradeColor;
      ctx.globalAlpha = 0.85;
      roundRect(ctx, badgeX, badgeYPos, badgeW, badgeH, 12);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Direction arrow circle
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(badgeX + 12, entryY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Arrow
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isUp ? '↑' : '↓', badgeX + 12, entryY);

      // Amount
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${trade.amount} $`, badgeX + 24, entryY);

      // Countdown or result time
      if (isActive && timeLeft > 0) {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const countdownText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Montserrat, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(countdownText, badgeX + badgeW - 8, entryY);
      }

      // Connecting dot from badge to line
      ctx.fillStyle = tradeColor;
      ctx.beginPath();
      ctx.arc(badgeX + badgeW + 4, entryY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(badgeX + badgeW + 4, entryY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Countdown badge on the current price line (Quotex style — timer follows live price)
    if (isActive && timeLeft > 0) {
      const currentPriceY = priceToY(currentPrice, minPrice, maxPrice, height);
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const countdownText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const countBadgeW = 44;
      const countBadgeH = 18;

      // Draw connecting line from entry to current price at endX
      if (endX > 0 && endX < chartWidth + 50) {
        ctx.strokeStyle = tradeColor + '44';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(endX, entryY);
        ctx.lineTo(endX, currentPriceY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Position timer above the price line
      const timerX = chartWidth - countBadgeW / 2 - 4;
      const timerY = currentPriceY - countBadgeH - 8;
      ctx.fillStyle = 'rgba(30, 35, 48, 0.95)';
      roundRect(ctx, timerX - countBadgeW / 2, timerY, countBadgeW, countBadgeH, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      roundRect(ctx, timerX - countBadgeW / 2, timerY, countBadgeW, countBadgeH, 4);
      ctx.stroke();

      ctx.fillStyle = '#d1d5db';
      ctx.font = '10px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(countdownText, timerX, timerY + countBadgeH / 2);

      // Small dot connector on the price line
      ctx.fillStyle = tradeColor;
      ctx.beginPath();
      ctx.arc(timerX - countBadgeW / 2 - 5, currentPriceY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(timerX - countBadgeW / 2 - 5, currentPriceY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Result badge for completed trades
    if (!isActive && trade.result) {
      const resultBadgeW = 110;
      const resultBadgeH = 38;
      const resultX = Math.min(chartWidth - resultBadgeW - 10, Math.max(10, endX - resultBadgeW / 2));
      const resultY = entryY - resultBadgeH - 8;
      
      if (resultX > -resultBadgeW && resultX < chartWidth + resultBadgeW) {
        ctx.fillStyle = trade.result === 'win' ? COLORS.tradeGreen + 'dd' : COLORS.tradeRed + 'dd';
        roundRect(ctx, resultX, resultY, resultBadgeW, resultBadgeH, 8);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Montserrat, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('RESULT (P/L)', resultX + 10, resultY + 6);

        ctx.font = 'bold 13px Montserrat, sans-serif';
        ctx.textBaseline = 'bottom';
        const pnlText = currentPnL >= 0 ? `+${currentPnL.toFixed(2)} $` : `${currentPnL.toFixed(2)} $`;
        ctx.fillText(pnlText, resultX + 10, resultY + resultBadgeH - 5);

        // X close icon
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', resultX + resultBadgeW - 14, resultY + 12);
      }
    }
  }, [candles, currentPrice, findXForTime]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const st = stateRef.current;
    if (!st.isDragging && !st.isDraggingPriceScale) {
      if (Math.abs(st.velocityX) > 0.3) {
        st.targetOffsetX += st.velocityX;
        st.velocityX *= 0.92;
      } else {
        st.velocityX = 0;
      }
      st.offsetX = lerp(st.offsetX, st.targetOffsetX, 0.18);
    }
    st.scaleX = lerp(st.scaleX, st.targetScaleX, LERP_SPEED);
    st.scaleY = lerp(st.scaleY, st.targetScaleY, LERP_SPEED);
    if (currentPrice > 0) {
      st.smoothPrice = st.smoothPrice === 0 ? currentPrice : lerp(st.smoothPrice, currentPrice, 0.45);
    }

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) {
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = '13px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Connecting to price feed...', width / 2, height / 2);
      return;
    }

    const step = getCandleStep();
    const candleW = getCandleWidth();
    const chartWidth = width - PRICE_SCALE_WIDTH;
    const { startIdx, endIdx, effectiveOffset } = getVisibleRange(width);
    const { minPrice, maxPrice } = getPriceRange(startIdx, endIdx);

    // Grid lines
    const priceRange = maxPrice - minPrice;
    const priceStep = calculatePriceStep(priceRange);
    const firstPrice = Math.ceil(minPrice / priceStep) * priceStep;

    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);

    for (let p = firstPrice; p <= maxPrice; p += priceStep) {
      const y = priceToY(p, minPrice, maxPrice, height);
      if (y < PADDING_TOP || y > height - TIME_SCALE_HEIGHT) continue;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
    }

    const timeStep = calculateTimeStep(step);
    for (let i = startIdx; i <= endIdx; i++) {
      if (i % timeStep !== 0) continue;
      const x = (i * step) - effectiveOffset + step / 2;
      if (x < 0 || x > chartWidth) continue;
      ctx.beginPath();
      ctx.moveTo(x, PADDING_TOP);
      ctx.lineTo(x, height - TIME_SCALE_HEIGHT);
      ctx.stroke();
    }

    // Compute Heiken Ashi candles if needed
    const getHeikenAshi = () => {
      const ha: CandleData[] = [];
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const haClose = (c.open + c.high + c.low + c.close) / 4;
        const haOpen = i === 0 ? (c.open + c.close) / 2 : (ha[i - 1].open + ha[i - 1].close) / 2;
        const haHigh = Math.max(c.high, haOpen, haClose);
        const haLow = Math.min(c.low, haOpen, haClose);
        ha.push({ time: c.time, open: haOpen, high: haHigh, low: haLow, close: haClose });
      }
      return ha;
    };

    const renderCandles = chartType === 'heiken' ? getHeikenAshi() : candles;

    if (chartType === 'area') {
      // ── Area chart ──
      ctx.beginPath();
      let firstPoint = true;
      for (let i = startIdx; i <= endIdx && i < candles.length; i++) {
        const x = (i * step) - effectiveOffset + step / 2;
        const y = priceToY(candles[i].close, minPrice, maxPrice, height);
        if (firstPoint) { ctx.moveTo(x, y); firstPoint = false; } else { ctx.lineTo(x, y); }
      }
      // Stroke the line
      ctx.strokeStyle = COLORS.priceLine;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fill area
      if (!firstPoint) {
        const lastVisibleIdx = Math.min(endIdx, candles.length - 1);
        const lastX = (lastVisibleIdx * step) - effectiveOffset + step / 2;
        const firstX = (startIdx * step) - effectiveOffset + step / 2;
        ctx.lineTo(lastX, height - TIME_SCALE_HEIGHT);
        ctx.lineTo(firstX, height - TIME_SCALE_HEIGHT);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, PADDING_TOP, 0, height - TIME_SCALE_HEIGHT);
        gradient.addColorStop(0, 'rgba(34, 211, 153, 0.25)');
        gradient.addColorStop(1, 'rgba(34, 211, 153, 0.02)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Live timer for last candle
      if (candles.length > 0 && activeTrades.length === 0) {
        const lastCandle = candles[candles.length - 1];
        const nowMs = Date.now();
        const candleEndMs = (lastCandle.time + 60) * 1000;
        const secsLeft = Math.max(0, Math.ceil((candleEndMs - nowMs) / 1000));
        const timerText = `00:${String(secsLeft).padStart(2, '0')}`;
        const livePriceY = priceToY(st.smoothPrice || currentPrice || lastCandle.close, minPrice, maxPrice, height);
        const badgeW2 = 40, badgeH2 = 16;
        const badgeX2 = chartWidth - badgeW2 - 6;
        const timerY2 = livePriceY - badgeH2 - 8;
        ctx.fillStyle = 'rgba(30, 35, 48, 0.95)';
        roundRect(ctx, badgeX2, timerY2, badgeW2, badgeH2, 4);
        ctx.fill();
        ctx.fillStyle = '#d1d5db';
        ctx.font = '9px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timerText, badgeX2 + badgeW2 / 2, timerY2 + badgeH2 / 2);
      }

    } else if (chartType === 'bars') {
      // ── OHLC Bars ──
      for (let i = startIdx; i <= endIdx && i < candles.length; i++) {
        const candle = candles[i];
        const x = (i * step) - effectiveOffset + step / 2;
        if (x < -20 || x > chartWidth + 20) continue;

        const isGreen = candle.close >= candle.open;
        const color = isGreen ? COLORS.candleGreen : COLORS.candleRed;
        const highY = priceToY(candle.high, minPrice, maxPrice, height);
        const lowY = priceToY(candle.low, minPrice, maxPrice, height);
        const openY = priceToY(candle.open, minPrice, maxPrice, height);
        const closeY = priceToY(candle.close, minPrice, maxPrice, height);
        const tickW = Math.max(3, candleW * 0.4);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();
        // Open tick (left)
        ctx.beginPath();
        ctx.moveTo(x - tickW, openY);
        ctx.lineTo(x, openY);
        ctx.stroke();
        // Close tick (right)
        ctx.beginPath();
        ctx.moveTo(x, closeY);
        ctx.lineTo(x + tickW, closeY);
        ctx.stroke();

        if (i === candles.length - 1 && activeTrades.length === 0) {
          const nowMs = Date.now();
          const candleEndMs = (candle.time + 60) * 1000;
          const secsLeft = Math.max(0, Math.ceil((candleEndMs - nowMs) / 1000));
          const timerText = `00:${String(secsLeft).padStart(2, '0')}`;
          const livePriceY = priceToY(st.smoothPrice || currentPrice || candle.close, minPrice, maxPrice, height);
          const badgeW2 = 40, badgeH2 = 16;
          const badgeX2 = chartWidth - badgeW2 - 6;
          const timerY2 = livePriceY - badgeH2 - 8;
          ctx.fillStyle = 'rgba(30, 35, 48, 0.95)';
          roundRect(ctx, badgeX2, timerY2, badgeW2, badgeH2, 4);
          ctx.fill();
          ctx.fillStyle = '#d1d5db';
          ctx.font = '9px Montserrat, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(timerText, badgeX2 + badgeW2 / 2, timerY2 + badgeH2 / 2);
        }
      }

    } else {
      // ── Candles & Heiken Ashi ──
      for (let i = startIdx; i <= endIdx && i < renderCandles.length; i++) {
        const candle = renderCandles[i];
        const x = (i * step) - effectiveOffset;
        const centerX = x + step / 2;
        if (centerX < -candleW * 2 || centerX > chartWidth + candleW * 2) continue;

        const isGreen = candle.close >= candle.open;
        const openY = priceToY(candle.open, minPrice, maxPrice, height);
        const closeY = priceToY(candle.close, minPrice, maxPrice, height);
        const highY = priceToY(candle.high, minPrice, maxPrice, height);
        const lowY = priceToY(candle.low, minPrice, maxPrice, height);

        ctx.strokeStyle = isGreen ? COLORS.wickGreen : COLORS.wickRed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, highY);
        ctx.lineTo(centerX, lowY);
        ctx.stroke();

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1, Math.abs(closeY - openY));
        ctx.fillStyle = isGreen ? COLORS.candleGreen : COLORS.candleRed;
        ctx.fillRect(Math.round(centerX - candleW / 2), Math.round(bodyTop), Math.round(candleW), Math.round(bodyHeight));

        if (i === renderCandles.length - 1 && activeTrades.length === 0) {
          const nowMs = Date.now();
          const candleEndMs = (candle.time + 60) * 1000;
          const secsLeft = Math.max(0, Math.ceil((candleEndMs - nowMs) / 1000));
          const timerText = `00:${String(secsLeft).padStart(2, '0')}`;
          const badgeW2 = 40;
          const badgeH2 = 16;
          const livePriceY = priceToY(st.smoothPrice || currentPrice || candle.close, minPrice, maxPrice, height);
          const badgeX2 = chartWidth - badgeW2 - 6;
          const timerY2 = livePriceY - badgeH2 - 8;
          ctx.fillStyle = 'rgba(30, 35, 48, 0.95)';
          roundRect(ctx, badgeX2, timerY2, badgeW2, badgeH2, 4);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.lineWidth = 0.5;
          roundRect(ctx, badgeX2, timerY2, badgeW2, badgeH2, 4);
          ctx.stroke();
          ctx.fillStyle = '#d1d5db';
          ctx.font = '9px Montserrat, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(timerText, badgeX2 + badgeW2 / 2, timerY2 + badgeH2 / 2);
        }
      }
    }

    // Current price line
    const smoothP = st.smoothPrice || currentPrice;
    if (smoothP > 0) {
      const priceY = priceToY(smoothP, minPrice, maxPrice, height);
      ctx.strokeStyle = COLORS.priceLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, priceY);
      ctx.lineTo(chartWidth, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = COLORS.priceLine;
      ctx.beginPath();
      ctx.moveTo(chartWidth - 6, priceY - 4);
      ctx.lineTo(chartWidth, priceY);
      ctx.lineTo(chartWidth - 6, priceY + 4);
      ctx.closePath();
      ctx.fill();
    }

    // Preview trade window lines (when no active trade)
    if (activeTrades.length === 0 && candles.length > 0) {
      const lastCandleTime = candles[candles.length - 1].time;
      const startTimeSec = lastCandleTime;
      const endTimeSec = lastCandleTime + selectedDuration;

      const startX = findXForTime(startTimeSec, step, effectiveOffset);
      const endX = findXForTime(endTimeSec, step, effectiveOffset);

      // "Beginning of trade" preview line - price line color
      if (startX > -20 && startX < chartWidth + 20) {
        ctx.strokeStyle = COLORS.priceLine;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(startX, PADDING_TOP);
        ctx.lineTo(startX, height - TIME_SCALE_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = COLORS.priceLine;
        ctx.font = '10px Montserrat, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Beginning of trade', startX - 6, PADDING_TOP - 4);

        ctx.fillStyle = COLORS.priceLine;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(startX - 4, PADDING_TOP - 18);
        ctx.lineTo(startX + 4, PADDING_TOP - 14);
        ctx.lineTo(startX - 4, PADDING_TOP - 10);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // "End of trade" preview line - solid
      if (endX > -20 && endX < chartWidth + 20) {
        ctx.strokeStyle = 'rgba(160, 170, 190, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(endX, PADDING_TOP);
        ctx.lineTo(endX, height - TIME_SCALE_HEIGHT);
        ctx.stroke();

        ctx.fillStyle = 'rgba(160, 170, 190, 0.5)';
        ctx.font = '10px Montserrat, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('End of trade', endX + 6, PADDING_TOP - 4);

        // Stop square
        ctx.fillStyle = 'rgba(160, 170, 190, 0.4)';
        ctx.fillRect(endX - 4, PADDING_TOP - 17, 8, 8);
      }
    }

    // Draw active trade markers
    for (const trade of activeTrades) {
      drawTradeOnChart(ctx, trade, step, effectiveOffset, minPrice, maxPrice, height, chartWidth, true);
    }

    // Draw only freshly settled trades on chart; full history stays in the trades panel
    const now = Date.now();
    const recentTrades = completedTrades
      .filter((trade) => now - trade.endTime <= RESULT_MARKER_LIFETIME_MS)
      .slice(0, 5);
    for (const trade of recentTrades) {
      drawTradeOnChart(ctx, trade, step, effectiveOffset, minPrice, maxPrice, height, chartWidth, false);
    }

    // Price scale
    ctx.fillStyle = COLORS.priceScaleBg;
    ctx.fillRect(chartWidth, 0, PRICE_SCALE_WIDTH, height);
    ctx.strokeStyle = COLORS.priceScaleBorder;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, height);
    ctx.stroke();

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '10px Montserrat, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let p = firstPrice; p <= maxPrice; p += priceStep) {
      const y = priceToY(p, minPrice, maxPrice, height);
      if (y < PADDING_TOP || y > height - TIME_SCALE_HEIGHT) continue;
      ctx.fillText(formatPrice(p), width - 8, y);
    }

    // Current price label
    if (smoothP > 0) {
      const priceY = priceToY(smoothP, minPrice, maxPrice, height);
      const labelText = formatPrice(smoothP);
      const labelH = 22;
      ctx.fillStyle = COLORS.priceLabel;
      roundRect(ctx, chartWidth + 1, priceY - labelH / 2, PRICE_SCALE_WIDTH - 2, labelH, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, chartWidth + PRICE_SCALE_WIDTH / 2, priceY);
    }

    // Time scale
    ctx.fillStyle = COLORS.timeScaleBg;
    ctx.fillRect(0, height - TIME_SCALE_HEIGHT, width, TIME_SCALE_HEIGHT);
    ctx.strokeStyle = COLORS.priceScaleBorder;
    ctx.beginPath();
    ctx.moveTo(0, height - TIME_SCALE_HEIGHT);
    ctx.lineTo(width, height - TIME_SCALE_HEIGHT);
    ctx.stroke();

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '10px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = startIdx; i <= endIdx; i++) {
      if (i % timeStep !== 0 || i >= candles.length) continue;
      const x = (i * step) - effectiveOffset + step / 2;
      if (x < 20 || x > chartWidth - 20) continue;
      const date = new Date(candles[i].time * 1000);
      const label = formatTimeLabel(date, chartInterval);
      ctx.fillText(label, x, height - TIME_SCALE_HEIGHT / 2);
    }


    // Crosshair
    const ch = stateRef.current.crosshair;
    if (ch && ch.x < chartWidth && ch.y < height - TIME_SCALE_HEIGHT && ch.y > PADDING_TOP) {
      ctx.strokeStyle = COLORS.crosshairLine;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ch.x, PADDING_TOP);
      ctx.lineTo(ch.x, height - TIME_SCALE_HEIGHT);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, ch.y);
      ctx.lineTo(chartWidth, ch.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const crossPrice = yToPrice(ch.y, minPrice, maxPrice, height);
      const crossLabel = formatPrice(crossPrice);
      const crossLabelH = 20;
      ctx.fillStyle = COLORS.crosshairLabel;
      roundRect(ctx, chartWidth + 1, ch.y - crossLabelH / 2, PRICE_SCALE_WIDTH - 2, crossLabelH, 3);
      ctx.fill();
      ctx.fillStyle = COLORS.crosshairText;
      ctx.font = '10px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(crossLabel, chartWidth + PRICE_SCALE_WIDTH / 2, ch.y);

      const candleIdx = Math.round((ch.x + effectiveOffset) / step);
      if (candleIdx >= 0 && candleIdx < candles.length) {
        const date = new Date(candles[candleIdx].time * 1000);
        const timeLabel = formatTimeLabel(date, chartInterval);
        const timeLabelW = chartInterval === '1s' ? 62 : chartInterval === '4h' || chartInterval === '1d' ? 64 : 48;
        const timeLabelH = 18;
        ctx.fillStyle = COLORS.crosshairLabel;
        roundRect(ctx, ch.x - timeLabelW / 2, height - TIME_SCALE_HEIGHT + 1, timeLabelW, timeLabelH, 3);
        ctx.fill();
        ctx.fillStyle = COLORS.crosshairText;
        ctx.font = '10px Montserrat, sans-serif';
        ctx.fillText(timeLabel, ch.x, height - TIME_SCALE_HEIGHT + 1 + timeLabelH / 2);
      }

      const hoverIdx = Math.round((ch.x + effectiveOffset) / step);
      if (hoverIdx >= 0 && hoverIdx < candles.length) {
        drawOHLCTooltip(ctx, candles[hoverIdx], 46, height - TIME_SCALE_HEIGHT - 22);
      }
    }
  }, [candles, currentPrice, activeTrades, completedTrades, selectedDuration, chartType, getVisibleRange, getPriceRange, drawTradeOnChart]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const chartWidth = rect.width - PRICE_SCALE_WIDTH;
    const st = stateRef.current;

    // Time scale drag (bottom area)
    if (y >= rect.height - TIME_SCALE_HEIGHT) {
      e.preventDefault();
      st.isDraggingTimeScale = true;
      st.dragStartX = e.clientX;
      st.dragStartScaleX = st.targetScaleX;
      st.crosshair = null;
      canvas.style.cursor = 'ew-resize';
      return;
    }

    if (x >= chartWidth - 12) {
      e.preventDefault();
      st.isDraggingPriceScale = true;
      st.dragStartY = e.clientY;
      st.dragStartScaleY = st.targetScaleY;
      st.crosshair = null;
      canvas.style.cursor = 'ns-resize';
      return;
    }

    st.isDragging = true;
    st.dragStartX = e.clientX;
    st.dragStartOffsetX = st.targetOffsetX;
    st.velocityX = 0;
    st.lastDragX = e.clientX;
    st.lastDragTime = performance.now();
    canvas.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const st = stateRef.current;
    const chartWidth = rect.width - PRICE_SCALE_WIDTH;

    if (st.isDraggingTimeScale) {
      const dx = e.clientX - st.dragStartX;
      const sensitivity = 0.005;
      st.targetScaleX = Math.max(0.3, Math.min(5, st.dragStartScaleX + dx * sensitivity));
      st.crosshair = null;
      canvas.style.cursor = 'ew-resize';
      return;
    }

    if (st.isDraggingPriceScale) {
      const dy = st.dragStartY - e.clientY;
      const sensitivity = 0.008;
      st.targetScaleY = Math.max(0.35, Math.min(8, st.dragStartScaleY + dy * sensitivity));
      st.crosshair = null;
      canvas.style.cursor = 'ns-resize';
      return;
    }

    if (st.isDragging) {
      const dx = e.clientX - st.dragStartX;
      st.targetOffsetX = st.dragStartOffsetX + dx;
      st.offsetX = st.targetOffsetX;
      st.crosshair = null;
      const now = performance.now();
      const dt = now - st.lastDragTime;
      if (dt > 0) {
        const instantV = (e.clientX - st.lastDragX) / Math.max(dt, 1) * 16;
        st.velocityX = lerp(st.velocityX, instantV, 0.4);
      }
      st.lastDragX = e.clientX;
      st.lastDragTime = now;
      return;
    }

    const cursorY = y >= rect.height - TIME_SCALE_HEIGHT ? 'ew-resize' : (x >= chartWidth - 12 ? 'ns-resize' : 'crosshair');
    canvas.style.cursor = cursorY;
    st.crosshair = x < chartWidth && y < rect.height - TIME_SCALE_HEIGHT ? { x, y } : null;
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.isDraggingPriceScale = false;
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.crosshair = null;
    if (!stateRef.current.isDraggingPriceScale && canvasRef.current) {
      canvasRef.current.style.cursor = 'crosshair';
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    stateRef.current.targetScaleX = Math.max(0.3, Math.min(5, stateRef.current.targetScaleX + delta));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartX = e.touches[0].clientX;
      stateRef.current.dragStartOffsetX = stateRef.current.targetOffsetX;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && stateRef.current.isDragging) {
      const dx = e.touches[0].clientX - stateRef.current.dragStartX;
      stateRef.current.targetOffsetX = stateRef.current.dragStartOffsetX + dx;
      stateRef.current.offsetX = stateRef.current.targetOffsetX;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  useEffect(() => {
    const stopInteractions = () => {
      stateRef.current.isDragging = false;
      stateRef.current.isDraggingPriceScale = false;
      if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
    };

    window.addEventListener('mouseup', stopInteractions);
    window.addEventListener('blur', stopInteractions);

    return () => {
      window.removeEventListener('mouseup', stopInteractions);
      window.removeEventListener('blur', stopInteractions);
    };
  }, []);

  useEffect(() => {
    const loop = () => {
      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}

// --- Helpers ---
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function calculatePriceStep(range: number): number {
  const raw = range / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / mag;
  if (normalized <= 1) return mag;
  if (normalized <= 2) return 2 * mag;
  if (normalized <= 5) return 5 * mag;
  return 10 * mag;
}

function calculateTimeStep(candleStep: number): number {
  const pixelsPerLabel = 80;
  return Math.max(1, Math.round(pixelsPerLabel / candleStep));
}

function drawOHLCTooltip(ctx: CanvasRenderingContext2D, c: CandleData, x: number, y: number) {
  const isGreen = c.close >= c.open;
  const labels = [
    { label: 'Open:', value: formatPrice(c.open) },
    { label: 'Close:', value: formatPrice(c.close) },
    { label: 'High:', value: formatPrice(c.high) },
    { label: 'Low:', value: formatPrice(c.low) },
  ];
  const lineH = 15;
  const boxH = labels.length * lineH + 10;
  const boxW = 140;
  const boxY = y - boxH;

  // Background
  ctx.fillStyle = 'rgba(15, 17, 19, 0.92)';
  roundRect(ctx, x, boxY, boxW, boxH, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 0.5;
  roundRect(ctx, x, boxY, boxW, boxH, 5);
  ctx.stroke();

  labels.forEach(({ label, value }, i) => {
    const ly = boxY + 8 + i * lineH;
    ctx.font = '10px Montserrat, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(label, x + 8, ly);
    ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444';
    ctx.font = '10px Montserrat, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(value, x + boxW - 8, ly);
  });
}
