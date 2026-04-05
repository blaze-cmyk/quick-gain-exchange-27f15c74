import { useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ProbabilityBarProps {
  candles: CandleData[];
  currentPrice: number;
}

export default function ProbabilityBar({ candles, currentPrice }: ProbabilityBarProps) {
  const prevPriceRef = useRef(currentPrice);
  const momentumRef = useRef(0);

  const computeBullPct = useCallback(() => {
    if (candles.length < 2 || currentPrice <= 0) return 50;

    // 1. Recent candle color ratio (last 14 candles)
    const count = Math.min(14, candles.length);
    const recent = candles.slice(-count);
    let greenCount = 0;
    for (const c of recent) {
      if (c.close >= c.open) greenCount++;
    }
    const colorRatio = greenCount / count; // 0–1

    // 2. Current candle direction (live)
    const lastCandle = candles[candles.length - 1];
    const liveDir = currentPrice >= lastCandle.open ? 1 : 0;

    // 3. Price momentum (tick-by-tick direction)
    const priceDelta = currentPrice - prevPriceRef.current;
    prevPriceRef.current = currentPrice;
    // Smooth momentum with decay
    momentumRef.current = momentumRef.current * 0.85 + (priceDelta > 0 ? 1 : priceDelta < 0 ? -1 : 0) * 0.15;
    const momentumSignal = (momentumRef.current + 1) / 2; // normalize to 0–1

    // 4. Candle body strength (bigger green body = more bullish)
    const bodyRatio = lastCandle.open !== 0
      ? (lastCandle.close - lastCandle.open) / lastCandle.open
      : 0;
    const bodySignal = Math.max(0, Math.min(1, 0.5 + bodyRatio * 500));

    // Weighted blend
    const raw = colorRatio * 0.3 + liveDir * 0.25 + momentumSignal * 0.25 + bodySignal * 0.2;
    return Math.max(1, Math.min(99, Math.round(raw * 100)));
  }, [candles, currentPrice]);

  // Spring-animated value for smooth transitions
  const bullSpring = useSpring(50, { damping: 20, stiffness: 120, mass: 0.8 });
  const bearSpring = useTransform(bullSpring, (v) => 100 - v);

  // Update spring target on every price/candle tick
  useEffect(() => {
    const pct = computeBullPct();
    bullSpring.set(pct);
  }, [candles, currentPrice, computeBullPct, bullSpring]);

  // Formatted display strings
  const bullText = useTransform(bullSpring, (v) => `${Math.round(v)}%`);
  const bearText = useTransform(bearSpring, (v) => `${Math.round(v)}%`);
  const bullBasis = useTransform(bullSpring, (v) => `${Math.round(v)}%`);
  const bearBasis = useTransform(bearSpring, (v) => `${Math.round(v)}%`);

  if (candles.length < 2) return null;

  return (
    <div
      className="flex flex-col items-center justify-between h-full py-2 w-5 flex-shrink-0"
      style={{ background: '#0f1113' }}
    >
      {/* Bear % on top (opposite/down probability) */}
      <motion.span
        className="text-[10px] font-bold"
        style={{ color: '#ef4444', fontFamily: 'Montserrat, sans-serif' }}
      >
        {bearText}
      </motion.span>

      {/* Vertical probability bar */}
      <div className="flex-1 w-[4px] rounded-full overflow-hidden flex flex-col my-1">
        <motion.div
          style={{
            background: '#ef4444',
            flexBasis: bearBasis,
          }}
        />
        <motion.div
          style={{
            background: '#22c55e',
            flexBasis: bullBasis,
          }}
        />
      </div>

      {/* Bull % on bottom */}
      <motion.span
        className="text-[10px] font-bold"
        style={{ color: '#22c55e', fontFamily: 'Montserrat, sans-serif' }}
      >
        {bullText}
      </motion.span>
    </div>
  );
}
