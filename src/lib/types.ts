export interface TradingPair {
  symbol: string;
  displayName: string;
  binanceSymbol: string;
  icon: string;
  payout: number;
  price: number;
  change24h: number;
}

export interface Trade {
  id: string;
  pair: TradingPair;
  direction: 'up' | 'down';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  duration: number; // seconds
  startTime: number;
  endTime: number;
  result?: 'win' | 'loss';
  payout?: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const TRADING_PAIRS: TradingPair[] = [
  { symbol: 'BTCUSDT', displayName: 'BTC/USD', binanceSymbol: 'btcusdt', icon: '₿', payout: 90, price: 0, change24h: 0 },
  { symbol: 'ETHUSDT', displayName: 'ETH/USD', binanceSymbol: 'ethusdt', icon: 'Ξ', payout: 90, price: 0, change24h: 0 },
  { symbol: 'SOLUSDT', displayName: 'SOL/USD', binanceSymbol: 'solusdt', icon: '◎', payout: 90, price: 0, change24h: 0 },
  { symbol: 'BNBUSDT', displayName: 'BNB/USD', binanceSymbol: 'bnbusdt', icon: '◆', payout: 90, price: 0, change24h: 0 },
];

export const TIMEFRAMES = [
  { label: '1m', seconds: 60 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
];
