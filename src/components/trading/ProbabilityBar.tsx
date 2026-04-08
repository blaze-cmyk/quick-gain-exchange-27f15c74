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

  const bullGlow = useTransform(bullSpring, [20, 50, 80], [0, 0, 0.6]);
  const bearGlow = useTransform(bearSpring, [20, 50, 80], [0, 0, 0.6]);
  const bullShadow = useTransform(bullGlow, (v) => `0 0 ${v * 8}px hsl(160 45% 50% / ${v})`);
  const bearShadow = useTransform(bearGlow, (v) => `0 0 ${v * 8}px hsl(0 55% 55% / ${v})`);

  if (candles.length < 2) return null;

  return (
    <motion.div
      className="flex flex-col items-center justify-between h-full py-3 px-2 flex-shrink-0"
      style={{ background: '#0d0d14', width: 38 }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.span
        className="text-[9px] font-bold tabular-nums leading-none"
        style={{
          color: 'hsl(0 55% 55%)',
          textShadow: bearShadow,
        }}
      >
        {bearText}
      </motion.span>

      <div className="flex-1 w-[4px] rounded-full overflow-hidden flex flex-col my-2 relative">
        <motion.div
          style={{
            background: 'linear-gradient(to bottom, hsl(0 55% 55%), hsl(355 60% 48%))',
            flexBasis: bearBasis,
          }}
          layout
          transition={{ type: 'spring', damping: 35, stiffness: 90, mass: 1 }}
        />
        <motion.div
          style={{
            background: 'linear-gradient(to bottom, hsl(155 50% 42%), hsl(160 45% 50%))',
            flexBasis: bullBasis,
          }}
          layout
          transition={{ type: 'spring', damping: 35, stiffness: 90, mass: 1 }}
        />
      </div>

      <motion.span
        className="text-[9px] font-bold tabular-nums leading-none"
        style={{
          color: 'hsl(160 45% 50%)',
          textShadow: bullShadow,
        }}
      >
        {bullText}
      </motion.span>
    </motion.div>
  );
}
