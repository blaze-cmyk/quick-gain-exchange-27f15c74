import { CandleData } from '@/lib/types';

interface ProbabilityBarProps {
  candles: CandleData[];
  currentPrice: number;
}

export default function ProbabilityBar({ candles, currentPrice }: ProbabilityBarProps) {
  if (candles.length < 2) return null;

  const recentCount = Math.min(20, candles.length);
  const recentCandles = candles.slice(-recentCount);
  let bullish = 0;
  for (const rc of recentCandles) {
    if (rc.close >= rc.open) bullish++;
  }
  const lastCandle = candles[candles.length - 1];
  const priceDir = currentPrice >= lastCandle.open ? 1 : 0;
  const rawBull = (bullish / recentCount) * 0.6 + priceDir * 0.4;
  const bullPct = Math.max(1, Math.min(99, Math.round(rawBull * 100)));
  const bearPct = 100 - bullPct;

  return (
    <div className="flex flex-col items-center justify-between h-full py-2 w-5 flex-shrink-0"
      style={{ background: '#0f1113' }}
    >
      {/* Bear % */}
      <span className="text-[10px] font-bold" style={{ color: '#ef4444', fontFamily: 'Montserrat, sans-serif' }}>
        {bearPct}%
      </span>

      {/* Bar */}
      <div className="flex-1 w-[4px] rounded-full overflow-hidden flex flex-col my-1">
        <div
          className="transition-all duration-500 ease-out"
          style={{ background: '#ef4444', flexBasis: `${bearPct}%` }}
        />
        <div
          className="transition-all duration-500 ease-out"
          style={{ background: '#22c55e', flexBasis: `${bullPct}%` }}
        />
      </div>

      {/* Bull % */}
      <span className="text-[10px] font-bold" style={{ color: '#22c55e', fontFamily: 'Montserrat, sans-serif' }}>
        {bullPct}%
      </span>
    </div>
  );
}
