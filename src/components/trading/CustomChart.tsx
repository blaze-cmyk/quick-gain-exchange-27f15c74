import { useEffect, useRef, useCallback, useState } from 'react';
import { CandleData } from '@/lib/types';

interface CustomChartProps {
  candles: CandleData[];
  currentPrice: number;
}

interface ChartState {
  offsetX: number;
  scaleX: number;
  scaleY: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartOffsetX: number;
  crosshair: { x: number; y: number } | null;
}

const CANDLE_WIDTH_BASE = 8;
const CANDLE_GAP = 2;
const PRICE_SCALE_WIDTH = 80;
const TIME_SCALE_HEIGHT = 28;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 10;

export default function CustomChart({ candles, currentPrice }: CustomChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ChartState>({
    offsetX: 0,
    scaleX: 1,
    scaleY: 1,
    isDragging: false,
    dragStartX: 0,
    dragStartOffsetX: 0,
    crosshair: null,
  });
  const animFrameRef = useRef<number>(0);
  const [, forceUpdate] = useState(0);

  const getCandleWidth = () => CANDLE_WIDTH_BASE * stateRef.current.scaleX;
  const getCandleStep = () => (CANDLE_WIDTH_BASE + CANDLE_GAP) * stateRef.current.scaleX;

  const getVisibleRange = useCallback((width: number) => {
    const step = getCandleStep();
    const chartWidth = width - PRICE_SCALE_WIDTH;
    const totalWidth = candles.length * step;
    const offset = stateRef.current.offsetX;
    
    // Default: right-align candles with some padding
    const baseOffset = totalWidth - chartWidth + step * 5;
    const effectiveOffset = baseOffset - offset;
    
    const startIdx = Math.max(0, Math.floor(effectiveOffset / step) - 1);
    const endIdx = Math.min(candles.length - 1, Math.ceil((effectiveOffset + chartWidth) / step) + 1);
    
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
    
    const padding = (maxPrice - minPrice) * 0.1 || 1;
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
    
    // Background
    ctx.fillStyle = '#0b0e13';
    ctx.fillRect(0, 0, width, height);
    
    if (candles.length === 0) return;
    
    const step = getCandleStep();
    const candleW = getCandleWidth();
    const chartWidth = width - PRICE_SCALE_WIDTH;
    const chartHeight = height - TIME_SCALE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    
    const { startIdx, endIdx, effectiveOffset } = getVisibleRange(width);
    const { minPrice, maxPrice } = getPriceRange(startIdx, endIdx);
    
    // Grid lines (horizontal)
    const priceRange = maxPrice - minPrice;
    const priceStep = calculatePriceStep(priceRange);
    const firstPrice = Math.ceil(minPrice / priceStep) * priceStep;
    
    ctx.strokeStyle = '#1a1f2e';
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
    
    // Vertical grid lines (time)
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
    
    // Draw candles
    for (let i = startIdx; i <= endIdx && i < candles.length; i++) {
      const candle = candles[i];
      const x = (i * step) - effectiveOffset;
      const centerX = x + step / 2;
      
      if (centerX < -candleW || centerX > chartWidth + candleW) continue;
      
      const isGreen = candle.close >= candle.open;
      const bodyColor = isGreen ? '#26a69a' : '#ef5350';
      const wickColor = isGreen ? '#26a69a' : '#ef5350';
      
      const openY = priceToY(candle.open, minPrice, maxPrice, height);
      const closeY = priceToY(candle.close, minPrice, maxPrice, height);
      const highY = priceToY(candle.high, minPrice, maxPrice, height);
      const lowY = priceToY(candle.low, minPrice, maxPrice, height);
      
      // Wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, highY);
      ctx.lineTo(centerX, lowY);
      ctx.stroke();
      
      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      ctx.fillStyle = bodyColor;
      ctx.fillRect(centerX - candleW / 2, bodyTop, candleW, bodyHeight);
    }
    
    // Current price dashed line
    if (currentPrice > 0) {
      const priceY = priceToY(currentPrice, minPrice, maxPrice, height);
      
      ctx.strokeStyle = '#2962ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(0, priceY);
      ctx.lineTo(chartWidth, priceY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label on right
      const labelText = formatPrice(currentPrice);
      ctx.font = '11px Inter, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      const labelW = textWidth + 12;
      const labelH = 20;
      const labelX = chartWidth;
      const labelY = priceY - labelH / 2;
      
      ctx.fillStyle = '#2962ff';
      roundRect(ctx, labelX, labelY, PRICE_SCALE_WIDTH, labelH, 3);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, labelX + PRICE_SCALE_WIDTH / 2, priceY);
    }
    
    // Price scale (right side)
    ctx.fillStyle = '#0f1219';
    ctx.fillRect(chartWidth, 0, PRICE_SCALE_WIDTH, height);
    
    // Price scale border
    ctx.strokeStyle = '#1a1f2e';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, height);
    ctx.stroke();
    
    // Price labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let p = firstPrice; p <= maxPrice; p += priceStep) {
      const y = priceToY(p, minPrice, maxPrice, height);
      if (y < PADDING_TOP || y > height - TIME_SCALE_HEIGHT) continue;
      ctx.fillText(formatPrice(p), width - 6, y);
    }
    
    // Current price label (over price scale)
    if (currentPrice > 0) {
      const priceY = priceToY(currentPrice, minPrice, maxPrice, height);
      const labelText = formatPrice(currentPrice);
      const labelH = 20;
      
      ctx.fillStyle = '#2962ff';
      roundRect(ctx, chartWidth, priceY - labelH / 2, PRICE_SCALE_WIDTH, labelH, 3);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, chartWidth + PRICE_SCALE_WIDTH / 2, priceY);
    }
    
    // Time scale (bottom)
    ctx.fillStyle = '#0f1219';
    ctx.fillRect(0, height - TIME_SCALE_HEIGHT, width, TIME_SCALE_HEIGHT);
    
    // Time scale border
    ctx.strokeStyle = '#1a1f2e';
    ctx.beginPath();
    ctx.moveTo(0, height - TIME_SCALE_HEIGHT);
    ctx.lineTo(width, height - TIME_SCALE_HEIGHT);
    ctx.stroke();
    
    // Time labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = startIdx; i <= endIdx; i++) {
      if (i % timeStep !== 0) continue;
      const x = (i * step) - effectiveOffset + step / 2;
      if (x < 0 || x > chartWidth) continue;
      
      const date = new Date(candles[i].time * 1000);
      const label = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      ctx.fillText(label, x, height - TIME_SCALE_HEIGHT / 2);
    }
    
    // Crosshair
    const ch = stateRef.current.crosshair;
    if (ch && ch.x < chartWidth && ch.y < height - TIME_SCALE_HEIGHT && ch.y > PADDING_TOP) {
      ctx.strokeStyle = '#4f5b6e';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(ch.x, PADDING_TOP);
      ctx.lineTo(ch.x, height - TIME_SCALE_HEIGHT);
      ctx.stroke();
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, ch.y);
      ctx.lineTo(chartWidth, ch.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price at crosshair
      const crossPrice = yToPrice(ch.y, minPrice, maxPrice, height);
      const crossLabel = formatPrice(crossPrice);
      const crossLabelH = 18;
      
      ctx.fillStyle = '#2d3748';
      roundRect(ctx, chartWidth, ch.y - crossLabelH / 2, PRICE_SCALE_WIDTH, crossLabelH, 3);
      ctx.fill();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px Inter, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(crossLabel, chartWidth + PRICE_SCALE_WIDTH / 2, ch.y);
      
      // Time at crosshair
      const candleIdx = Math.round((ch.x + effectiveOffset) / step);
      if (candleIdx >= 0 && candleIdx < candles.length) {
        const date = new Date(candles[candleIdx].time * 1000);
        const timeLabel = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const timeLabelW = 50;
        const timeLabelH = 18;
        
        ctx.fillStyle = '#2d3748';
        roundRect(ctx, ch.x - timeLabelW / 2, height - TIME_SCALE_HEIGHT, timeLabelW, timeLabelH, 3);
        ctx.fill();
        
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(timeLabel, ch.x, height - TIME_SCALE_HEIGHT + timeLabelH / 2);
      }
      
      // Tooltip with OHLC
      const hoverIdx = Math.round((ch.x + effectiveOffset) / step);
      if (hoverIdx >= 0 && hoverIdx < candles.length) {
        const c = candles[hoverIdx];
        drawOHLCTooltip(ctx, c, 8, PADDING_TOP + 4);
      }
    }
  }, [candles, currentPrice, getVisibleRange, getPriceRange]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartOffsetX = stateRef.current.offsetX;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (stateRef.current.isDragging) {
      const dx = e.clientX - stateRef.current.dragStartX;
      stateRef.current.offsetX = stateRef.current.dragStartOffsetX + dx;
      stateRef.current.crosshair = null;
    } else {
      stateRef.current.crosshair = { x, y };
    }
    
    forceUpdate(n => n + 1);
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.crosshair = null;
    forceUpdate(n => n + 1);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    stateRef.current.scaleX = Math.max(0.3, Math.min(5, stateRef.current.scaleX + delta));
    forceUpdate(n => n + 1);
  }, []);

  // Animation loop
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
      className="w-full h-full cursor-crosshair"
      style={{ display: 'block' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    />
  );
}

// Helpers
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
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label + ':', xPos, y);
    xPos += ctx.measureText(label + ':').width + 3;
    
    ctx.fillStyle = isGreen ? '#26a69a' : '#ef5350';
    ctx.fillText(value, xPos, y);
    xPos += ctx.measureText(value).width + 10;
  });
}
