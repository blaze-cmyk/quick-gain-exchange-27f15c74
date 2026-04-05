import { useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';
import { motion, useSpring, useTransform, useMotionValue, animate } from 'framer-motion';

interface ProbabilityBarProps {
  candles: CandleData[];
  currentPrice: number;
}

export default function ProbabilityBar({ candles, currentPrice }: ProbabilityBarProps) {
  const prevPriceRef = useRef(currentPrice);
  const momentumRef = useRef(0);

  const computeBullPct = useCallback(() => {
    if (candles.length < 2 || currentPrice <= 0) return 50;

    const count = Math.min(14, candles.length);
    const recent = candles.slice(-count);
    let greenCount = 0;
    for (const c of recent) {
      if (c.close >= c.open) greenCount++;
    }
    const colorRatio = greenCount / count;

    const lastCandle = candles[candles.length - 1];
    const liveDir = currentPrice >= lastCandle.open ? 1 : 0;

    const priceDelta = currentPrice - prevPriceRef.current;
    prevPriceRef.current = currentPrice;
    momentumRef.current = momentumRef.current * 0.85 + (priceDelta > 0 ? 1 : priceDelta < 0 ? -1 : 0) * 0.15;
    const momentumSignal = (momentumRef.current + 1) / 2;

    const bodyRatio = lastCandle.open !== 0
      ? (lastCandle.close - lastCandle.open) / lastCandle.open
      : 0;
    const bodySignal = Math.max(0, Math.min(1, 0.5 + bodyRatio * 500));

    const raw = colorRatio * 0.3 + liveDir * 0.25 + momentumSignal * 0.25 + bodySignal * 0.2;
    return Math.max(1, Math.min(99, Math.round(raw * 100)));
  }, [candles, currentPrice]);

  // Lenis-style smooth spring with ultra-fluid damping
  const bullMotion = useMotionValue(50);
  const bullSpring = useSpring(bullMotion, {
    damping: 30,
    stiffness: 80,
    mass: 1.2,
    restDelta: 0.01,
  });

  const bearSpring = useTransform(bullSpring, (v) => 100 - v);

  useEffect(() => {
    const pct = computeBullPct();
    // Animate with custom easing for Lenis-like smooth feel
    animate(bullMotion, pct, {
      type: 'spring',
      damping: 35,
      stiffness: 90,
      mass: 1,
      restDelta: 0.001,
    });
  }, [candles, currentPrice, computeBullPct, bullMotion]);

  const bullText = useTransform(bullSpring, (v) => `${Math.round(v)}%`);
  const bearText = useTransform(bearSpring, (v) => `${Math.round(v)}%`);
  const bullBasis = useTransform(bullSpring, (v) => `${v.toFixed(2)}%`);
  const bearBasis = useTransform(bearSpring, (v) => `${v.toFixed(2)}%`);

  // Glow intensity based on dominance
  const bullGlow = useTransform(bullSpring, [20, 50, 80], [0, 0, 0.6]);
  const bearGlow = useTransform(bearSpring, [20, 50, 80], [0, 0, 0.6]);
  const bullShadow = useTransform(bullGlow, (v) => `0 0 ${v * 8}px rgba(34, 197, 94, ${v})`);
  const bearShadow = useTransform(bearGlow, (v) => `0 0 ${v * 8}px rgba(239, 68, 68, ${v})`);

  if (candles.length < 2) return null;

  return (
    <motion.div
      className="flex flex-col items-center justify-between h-full py-2 w-5 flex-shrink-0"
      style={{ background: '#0f1113' }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Bear % on top */}
      <motion.span
        className="text-[10px] font-bold"
        style={{
          color: '#ef4444',
          fontFamily: 'Montserrat, sans-serif',
          textShadow: bearShadow,
        }}
      >
        {bearText}
      </motion.span>

      {/* Vertical probability bar */}
      <div className="flex-1 w-[4px] rounded-full overflow-hidden flex flex-col my-1 relative">
        <motion.div
          style={{
            background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
            flexBasis: bearBasis,
          }}
          layout
          transition={{ type: 'spring', damping: 35, stiffness: 90, mass: 1 }}
        />
        <motion.div
          style={{
            background: 'linear-gradient(to bottom, #16a34a, #22c55e)',
            flexBasis: bullBasis,
          }}
          layout
          transition={{ type: 'spring', damping: 35, stiffness: 90, mass: 1 }}
        />
      </div>

      {/* Bull % on bottom */}
      <motion.span
        className="text-[10px] font-bold"
        style={{
          color: '#22c55e',
          fontFamily: 'Montserrat, sans-serif',
          textShadow: bullShadow,
        }}
      >
        {bullText}
      </motion.span>
    </motion.div>
  );
}
