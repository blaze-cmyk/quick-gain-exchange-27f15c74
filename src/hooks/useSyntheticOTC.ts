/**
 * React hook that drives the SyntheticOTCFeed for a single pair.
 * Ticks every 1 second and returns the same shape as useBinanceWebSocket.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';
import {
  tick,
  bootstrapHistory,
  computeHouseBias,
  OTC_PAIR_CONFIGS,
  OTCPairConfig,
  DEFAULT_HOUSE_EDGE_FACTOR,
  OpenTrade,
} from '@/lib/syntheticOTCEngine';

const INTERVAL_SECONDS: Record<string, number> = {
  '1s': 1, '1m': 60, '3m': 180, '5m': 300, '15m': 900, '30m': 1800,
  '1h': 3600, '2h': 7200, '4h': 14400, '1d': 86400,
};

interface UseSyntheticOTCOptions {
  /** Candle interval string (e.g. '1m') */
  interval?: string;
  /** Active trades on this pair for house-bias calculation */
  activeTrades?: OpenTrade[];
  /** Override house edge factor (0–1) */
  edgeFactor?: number;
}

export function useSyntheticOTC(
  symbol: string,
  options: UseSyntheticOTCOptions = {},
) {
  const { interval = '1m', activeTrades = [], edgeFactor = DEFAULT_HOUSE_EDGE_FACTOR } = options;
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);

  const activeTradesRef = useRef(activeTrades);
  activeTradesRef.current = activeTrades;

  const intervalSecs = INTERVAL_SECONDS[interval] ?? 60;
  const cfg: OTCPairConfig | undefined = OTC_PAIR_CONFIGS[symbol];

  // Bootstrap history on mount / symbol change
  useEffect(() => {
    if (!cfg) return;
    bootstrapHistory(symbol, cfg, intervalSecs, 200);
    setConnected(true);
  }, [symbol, cfg, intervalSecs]);

  // Tick loop — 1 second
  useEffect(() => {
    if (!cfg) {
      setConnected(false);
      return;
    }

    const id = setInterval(() => {
      const bias = computeHouseBias(activeTradesRef.current);
      const result = tick(symbol, cfg, bias, edgeFactor, intervalSecs);
      setCurrentPrice(result.price);
      setCandles(result.candles);

      // Compute change from oldest visible candle
      if (result.candles.length >= 2) {
        const oldest = result.candles[0].open;
        const pct = ((result.price - oldest) / oldest) * 100;
        setPriceChange(Math.round(pct * 100) / 100);
      }
    }, 400);

    // Run one tick immediately
    const bias = computeHouseBias(activeTradesRef.current);
    const result = tick(symbol, cfg, bias, edgeFactor, intervalSecs);
    setCurrentPrice(result.price);
    setCandles(result.candles);

    return () => clearInterval(id);
  }, [symbol, cfg, edgeFactor, intervalSecs]);

  return { currentPrice, priceChange, candles, connected };
}
