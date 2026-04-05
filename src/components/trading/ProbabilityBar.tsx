import { useEffect, useState, useRef } from 'react';
import { CandleData } from '@/lib/types';

interface ProbabilityBarProps {
  candles: CandleData[];
  currentPrice: number;
}

export default function ProbabilityBar({ candles, currentPrice }: ProbabilityBarProps) {
  const [displayBull, setDisplayBull] = useState(50);
  const targetRef = useRef(50);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (candles.length < 2 || currentPrice <= 0) return;

    const recentCount = Math.min(20, candles.length);
    const recentCandles = candles.slice(-recentCount);
    let bullish = 0;
    for (const rc of recentCandles) {
      if (rc.close >= rc.open) bullish++;
    }
    const lastCandle = candles[candles.length - 1];
    const priceDir = currentPrice >= lastCandle.open ? 1 : 0;
    const rawBull = (bullish / recentCount) * 0.6 + priceDir * 0.4;
    targetRef.current = Math.max(1, Math.min(99, Math.round(rawBull * 100)));
  }, [candles, currentPrice]);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      setDisplayBull(prev => {
        const diff = targetRef.current - prev;
        if (Math.abs(diff) < 0.5) return targetRef.current;
        return prev + diff * 0.15;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  if (candles.length < 2) return null;

  const bullPct = Math.round(displayBull);
  const bearPct = 100 - bullPct;

  return (
    <div className="flex flex-col items-center justify-between h-full py-2 w-5 flex-shrink-0"
      style={{ background: '#0f1113' }}
    >
      <span className="text-[10px] font-bold" style={{ color: '#ef4444', fontFamily: 'Montserrat, sans-serif' }}>
        {bearPct}%
      </span>
      <div className="flex-1 w-[4px] rounded-full overflow-hidden flex flex-col my-1">
        <div style={{ background: '#ef4444', flexBasis: `${bearPct}%`, transition: 'flex-basis 0.1s linear' }} />
        <div style={{ background: '#22c55e', flexBasis: `${bullPct}%`, transition: 'flex-basis 0.1s linear' }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color: '#22c55e', fontFamily: 'Montserrat, sans-serif' }}>
        {bullPct}%
      </span>
    </div>
  );
}
