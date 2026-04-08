import { TradingPair } from '@/lib/types';
import { useBinanceWebSocket } from './useBinanceWebSocket';
import { useTiingoForex } from './useTiingoForex';
import { useSyntheticOTC } from './useSyntheticOTC';
import { OpenTrade } from '@/lib/syntheticOTCEngine';

const INTERVAL_MAP: Record<string, string> = {
  '1s': '1s', '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '2h': '2h', '4h': '4h', '1d': '1d',
};

/**
 * Unified hook that routes to the correct data source
 * based on the trading pair's category.
 */
export function usePairData(
  pair: TradingPair,
  interval: string = '1m',
  activeTrades?: { direction: 'up' | 'down'; amount: number }[],
) {
  const isOTC = !!pair.otcSymbol;
  const isCrypto = pair.category === 'crypto';
  const isForex = pair.category === 'forex';

  const binance = useBinanceWebSocket(isCrypto ? pair.binanceSymbol : '', interval);
  const tiingo = useTiingoForex(isForex ? (pair.tiingoSymbol || '') : '');

  // Build OTC trades list for house bias
  const otcTrades: OpenTrade[] = isOTC && activeTrades
    ? activeTrades.map(t => ({ direction: t.direction, amount: t.amount }))
    : [];

  const otc = useSyntheticOTC(
    isOTC ? (pair.otcSymbol || '') : '',
    { interval, activeTrades: otcTrades },
  );

  if (isOTC) {
    return {
      currentPrice: otc.currentPrice,
      priceChange: otc.priceChange,
      candles: otc.candles,
      connected: otc.connected,
    };
  }

  if (isCrypto) {
    return {
      currentPrice: binance.currentPrice,
      priceChange: binance.priceChange,
      candles: binance.candles,
      connected: binance.connected,
    };
  }

  return {
    currentPrice: tiingo.currentPrice,
    priceChange: tiingo.priceChange,
    candles: tiingo.candles,
    connected: tiingo.connected,
  };
}
