import { useEffect, useRef, useCallback, useState } from 'react';
import { CandleData, Trade } from '@/lib/types';
import { TickPoint } from '@/hooks/useBinanceWebSocket';

interface CustomChartProps {
  candles: CandleData[];
  currentPrice: number;
  payout?: number;
  connected?: boolean;
  activeTrade?: Trade | null;
  ticks?: TickPoint[];
}

interface ChartState {
  offsetX: number;
  targetOffsetX: number;
  scaleX: number;
  targetScaleX: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartOffsetX: number;
  crosshair: { x: number; y: number } | null;
  smoothPrice: number;
}

// Quotex exact colors
const COLORS = {
  bg: '#0b0e11',
  gridLine: '#151a23',
  priceScaleBg: '#0d1117',
  priceScaleBorder: '#1b2130',
  timeScaleBg: '#0d1117',
  candleGreen: '#00c176',
  candleRed: '#ff4757',
  wickGreen: '#00c17688',
  wickRed: '#ff475788',
  priceLine: '#3b82f6',
  priceLabel: '#2962ff',
  textMuted: '#4a5568',
  textLight: '#8892a0',
  crosshairLine: '#3a4255',
  crosshairLabel: '#2d3748',
  crosshairText: '#e2e8f0',
  tooltipGreen: '#00c176',
  tooltipRed: '#ff4757',
};

const CANDLE_WIDTH_BASE = 7;
const CANDLE_GAP = 3;
const PRICE_SCALE_WIDTH = 75;
const TIME_SCALE_HEIGHT = 26;
const PADDING_TOP = 50;
const PADDING_BOTTOM = 10;
const LERP_SPEED = 0.12;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function CustomChart({ candles, currentPrice, payout = 90, connected = true, activeTrade = null }: CustomChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ChartState>({
    offsetX: 0,
    targetOffsetX: 0,
    scaleX: 1,
    targetScaleX: 1,
    isDragging: false,
    dragStartX: 0,
    dragStartOffsetX: 0,
    crosshair: null,
    smoothPrice: 0,
  });
  const animFrameRef = useRef<number>(0);
  const prevCandleCountRef = useRef(0);

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

    const padding = (maxPrice - minPrice) * 0.12 || 1;
    return { minPrice: minPrice - padding, maxPrice: maxPrice + padding };
  }, [candles, currentPrice]);

  const priceToY = (price: number, minPrice: number, maxPrice: number, height: number) => {
    const chartHeight = height - TIME_SCALE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    return PADDING_TOP + chartHeight * (1 - (price - minPrice) / (maxPrice - minPrice));
  };

  const yToPrice = (y: number, minPrice: number, maxPrice: number, height: number) => {
    const chartHeight = height - TIME_SCALE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    return minPrice + (1 - (y - PADDING_TOP) / chartHeight) * (maxPrice - minPrice);
  };

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

    // Smooth interpolation
    const st = stateRef.current;
    if (!st.isDragging) {
      st.offsetX = lerp(st.offsetX, st.targetOffsetX, LERP_SPEED);
    }
    st.scaleX = lerp(st.scaleX, st.targetScaleX, LERP_SPEED);
    if (currentPrice > 0) {
      st.smoothPrice = st.smoothPrice === 0 ? currentPrice : lerp(st.smoothPrice, currentPrice, 0.15);
    }

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) {
      // Loading state
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = '13px Inter, sans-serif';
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

    // Grid lines (horizontal) - very subtle like Quotex
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

    // Vertical grid lines
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

    // Draw candles with smooth rendering
    for (let i = startIdx; i <= endIdx && i < candles.length; i++) {
      const candle = candles[i];
      const x = (i * step) - effectiveOffset;
      const centerX = x + step / 2;

      if (centerX < -candleW * 2 || centerX > chartWidth + candleW * 2) continue;

      const isGreen = candle.close >= candle.open;

      const openY = priceToY(candle.open, minPrice, maxPrice, height);
      const closeY = priceToY(candle.close, minPrice, maxPrice, height);
      const highY = priceToY(candle.high, minPrice, maxPrice, height);
      const lowY = priceToY(candle.low, minPrice, maxPrice, height);

      // Wick - slightly transparent
      ctx.strokeStyle = isGreen ? COLORS.wickGreen : COLORS.wickRed;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, highY);
      ctx.lineTo(centerX, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));

      ctx.fillStyle = isGreen ? COLORS.candleGreen : COLORS.candleRed;
      ctx.fillRect(Math.round(centerX - candleW / 2), Math.round(bodyTop), Math.round(candleW), Math.round(bodyHeight));
    }

    // Current price horizontal dashed line
    const smoothP = st.smoothPrice || currentPrice;
    if (smoothP > 0) {
      const priceY = priceToY(smoothP, minPrice, maxPrice, height);

      // Dashed line across chart
      ctx.strokeStyle = COLORS.priceLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, priceY);
      ctx.lineTo(chartWidth, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small triangle/arrow at the right edge
      ctx.fillStyle = COLORS.priceLine;
      ctx.beginPath();
      ctx.moveTo(chartWidth - 6, priceY - 4);
      ctx.lineTo(chartWidth, priceY);
      ctx.lineTo(chartWidth - 6, priceY + 4);
      ctx.closePath();
      ctx.fill();

      // Floating price tooltip near last candle
      if (candles.length > 0) {
        const lastCandle = candles[candles.length - 1];
        const lastX = ((candles.length - 1) * step) - effectiveOffset + step / 2;
        if (lastX > 0 && lastX < chartWidth) {
          const tooltipY = priceToY(lastCandle.high, minPrice, maxPrice, height) - 18;
          const priceText = formatPrice(lastCandle.high);
          ctx.font = '10px Inter, sans-serif';
          const tw = ctx.measureText(priceText).width + 8;
          
          ctx.fillStyle = 'rgba(45, 55, 72, 0.85)';
          roundRect(ctx, lastX - tw / 2, tooltipY - 8, tw, 16, 3);
          ctx.fill();
          
          ctx.fillStyle = COLORS.crosshairText;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(priceText, lastX, tooltipY);
        }
      }
    }

    // Price scale (right side)
    ctx.fillStyle = COLORS.priceScaleBg;
    ctx.fillRect(chartWidth, 0, PRICE_SCALE_WIDTH, height);

    ctx.strokeStyle = COLORS.priceScaleBorder;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, height);
    ctx.stroke();

    // Price labels
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let p = firstPrice; p <= maxPrice; p += priceStep) {
      const y = priceToY(p, minPrice, maxPrice, height);
      if (y < PADDING_TOP || y > height - TIME_SCALE_HEIGHT) continue;
      ctx.fillText(formatPrice(p), width - 8, y);
    }

    // Current price label on scale - Quotex blue badge
    if (smoothP > 0) {
      const priceY = priceToY(smoothP, minPrice, maxPrice, height);
      const labelText = formatPrice(smoothP);
      const labelH = 22;

      // Gradient-like blue label
      ctx.fillStyle = COLORS.priceLabel;
      roundRect(ctx, chartWidth + 1, priceY - labelH / 2, PRICE_SCALE_WIDTH - 2, labelH, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, chartWidth + PRICE_SCALE_WIDTH / 2, priceY);
    }

    // Time scale (bottom)
    ctx.fillStyle = COLORS.timeScaleBg;
    ctx.fillRect(0, height - TIME_SCALE_HEIGHT, width, TIME_SCALE_HEIGHT);

    ctx.strokeStyle = COLORS.priceScaleBorder;
    ctx.beginPath();
    ctx.moveTo(0, height - TIME_SCALE_HEIGHT);
    ctx.lineTo(width, height - TIME_SCALE_HEIGHT);
    ctx.stroke();

    // Time labels
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = startIdx; i <= endIdx; i++) {
      if (i % timeStep !== 0 || i >= candles.length) continue;
      const x = (i * step) - effectiveOffset + step / 2;
      if (x < 20 || x > chartWidth - 20) continue;

      const date = new Date(candles[i].time * 1000);
      const label = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      ctx.fillText(label, x, height - TIME_SCALE_HEIGHT / 2);
    }

    // Zoom buttons (bottom center) - subtle like Quotex
    const zoomY = height - TIME_SCALE_HEIGHT - 30;
    const zoomCenterX = chartWidth / 2;
    
    ctx.fillStyle = 'rgba(21, 26, 35, 0.8)';
    roundRect(ctx, zoomCenterX - 30, zoomY, 24, 20, 4);
    ctx.fill();
    roundRect(ctx, zoomCenterX + 6, zoomY, 24, 20, 4);
    ctx.fill();

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('−', zoomCenterX - 18, zoomY + 10);
    ctx.fillText('+', zoomCenterX + 18, zoomY + 10);

    // Active trade markers — "Beginning of trade" / "End of trade"
    if (activeTrade) {
      const startTimeSec = Math.floor(activeTrade.startTime / 1000);
      const endTimeSec = Math.floor(activeTrade.endTime / 1000);
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((activeTrade.endTime - now) / 1000));

      // Find x positions based on candle times
      const findXForTime = (timeSec: number) => {
        const candleTimeSec = timeSec - (timeSec % 60);
        const fractionalMinute = (timeSec % 60) / 60;
        for (let i = 0; i < candles.length; i++) {
          if (candles[i].time === candleTimeSec) {
            return (i * step + fractionalMinute * step) - effectiveOffset + step / 2;
          }
        }
        // Extrapolate from last candle
        if (candles.length > 0) {
          const lastCandle = candles[candles.length - 1];
          const diffMin = (candleTimeSec - lastCandle.time) / 60 + fractionalMinute;
          return ((candles.length - 1 + diffMin) * step) - effectiveOffset + step / 2;
        }
        return -1;
      };

      const startX = findXForTime(startTimeSec);
      const endX = findXForTime(endTimeSec);

      // Draw "Beginning of trade" line
      if (startX > 0 && startX < chartWidth) {
        ctx.strokeStyle = '#8892a0';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(startX, PADDING_TOP);
        ctx.lineTo(startX, height - TIME_SCALE_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#8892a0';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Beginning of trade', startX, PADDING_TOP - 4);

        // Small play arrow
        ctx.fillStyle = '#8892a0';
        ctx.beginPath();
        ctx.moveTo(startX - 4, PADDING_TOP - 18);
        ctx.lineTo(startX + 4, PADDING_TOP - 14);
        ctx.lineTo(startX - 4, PADDING_TOP - 10);
        ctx.closePath();
        ctx.fill();
      }

      // Draw "End of trade" line
      if (endX > 0 && endX < chartWidth) {
        ctx.strokeStyle = '#8892a0';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(endX, PADDING_TOP);
        ctx.lineTo(endX, height - TIME_SCALE_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#8892a0';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('End of trade', endX, PADDING_TOP - 4);
      }

      // Entry price dashed line
      const entryY = priceToY(activeTrade.entryPrice, minPrice, maxPrice, height);
      ctx.strokeStyle = '#8892a066';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(Math.max(0, startX), entryY);
      ctx.lineTo(Math.min(chartWidth, endX), entryY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Countdown timer badge between the lines
      const midX = (Math.max(0, startX) + Math.min(chartWidth, endX)) / 2;
      if (timeLeft > 0) {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const countdownText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const badgeW = 44;
        const badgeH = 18;

        ctx.fillStyle = 'rgba(45, 55, 72, 0.9)';
        roundRect(ctx, midX - badgeW / 2, entryY - badgeH / 2, badgeW, badgeH, 4);
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdownText, midX, entryY);
      }
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

      // Price at crosshair
      const crossPrice = yToPrice(ch.y, minPrice, maxPrice, height);
      const crossLabel = formatPrice(crossPrice);
      const crossLabelH = 20;

      ctx.fillStyle = COLORS.crosshairLabel;
      roundRect(ctx, chartWidth + 1, ch.y - crossLabelH / 2, PRICE_SCALE_WIDTH - 2, crossLabelH, 3);
      ctx.fill();

      ctx.fillStyle = COLORS.crosshairText;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(crossLabel, chartWidth + PRICE_SCALE_WIDTH / 2, ch.y);

      // Time at crosshair
      const candleIdx = Math.round((ch.x + effectiveOffset) / step);
      if (candleIdx >= 0 && candleIdx < candles.length) {
        const date = new Date(candles[candleIdx].time * 1000);
        const timeLabel = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const timeLabelW = 48;
        const timeLabelH = 18;

        ctx.fillStyle = COLORS.crosshairLabel;
        roundRect(ctx, ch.x - timeLabelW / 2, height - TIME_SCALE_HEIGHT + 1, timeLabelW, timeLabelH, 3);
        ctx.fill();

        ctx.fillStyle = COLORS.crosshairText;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(timeLabel, ch.x, height - TIME_SCALE_HEIGHT + 1 + timeLabelH / 2);
      }

      // OHLC tooltip top-left
      const hoverIdx = Math.round((ch.x + effectiveOffset) / step);
      if (hoverIdx >= 0 && hoverIdx < candles.length) {
        drawOHLCTooltip(ctx, candles[hoverIdx], 80, PADDING_TOP + 8);
      }
    }
  }, [candles, currentPrice, activeTrade, getVisibleRange, getPriceRange]);

  // Mouse handlers with smooth feel
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartOffsetX = stateRef.current.targetOffsetX;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (stateRef.current.isDragging) {
      const dx = e.clientX - stateRef.current.dragStartX;
      stateRef.current.targetOffsetX = stateRef.current.dragStartOffsetX + dx;
      stateRef.current.offsetX = stateRef.current.targetOffsetX;
      stateRef.current.crosshair = null;
    } else {
      stateRef.current.crosshair = { x, y };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.crosshair = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    stateRef.current.targetScaleX = Math.max(0.3, Math.min(5, stateRef.current.targetScaleX + delta));
  }, []);

  // Touch support
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

  // Animation loop - always running for smooth interpolation
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

  ctx.font = '10px Inter, sans-serif';
  const labels = [
    { label: 'O', value: formatPrice(c.open) },
    { label: 'H', value: formatPrice(c.high) },
    { label: 'L', value: formatPrice(c.low) },
    { label: 'C', value: formatPrice(c.close) },
  ];

  let xPos = x;
  labels.forEach(({ label, value }) => {
    ctx.fillStyle = COLORS.textMuted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label + ' ', xPos, y);
    xPos += ctx.measureText(label + ' ').width;

    ctx.fillStyle = isGreen ? COLORS.tooltipGreen : COLORS.tooltipRed;
    ctx.fillText(value, xPos, y);
    xPos += ctx.measureText(value).width + 12;
  });
}
