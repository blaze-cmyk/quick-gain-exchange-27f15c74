import { TradingPair } from '@/lib/types';
import { useBinanceWebSocket } from './useBinanceWebSocket';
import { useTiingoForex } from './useTiingoForex';

/**
 * Unified hook that routes to the correct data source
 * based on the trading pair's category.
 */
export function usePairData(pair: TradingPair) {
  const isCrypto = pair.category === 'crypto';

  const binance = useBinanceWebSocket(isCrypto ? pair.binanceSymbol : '');
  const tiingo = useTiingoForex(!isCrypto ? (pair.tiingoSymbol || '') : '');

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
