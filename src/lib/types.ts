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
  // Major crypto
  { symbol: 'BTCUSDT', displayName: 'BTC/USD', binanceSymbol: 'btcusdt', icon: '₿', payout: 90, price: 0, change24h: 0 },
  { symbol: 'ETHUSDT', displayName: 'ETH/USD', binanceSymbol: 'ethusdt', icon: 'Ξ', payout: 90, price: 0, change24h: 0 },
  { symbol: 'SOLUSDT', displayName: 'SOL/USD', binanceSymbol: 'solusdt', icon: '◎', payout: 90, price: 0, change24h: 0 },
  { symbol: 'BNBUSDT', displayName: 'BNB/USD', binanceSymbol: 'bnbusdt', icon: '◆', payout: 90, price: 0, change24h: 0 },
  // Alt-L1s
  { symbol: 'ADAUSDT', displayName: 'ADA/USD', binanceSymbol: 'adausdt', icon: '₳', payout: 88, price: 0, change24h: 0 },
  { symbol: 'AVAXUSDT', displayName: 'AVAX/USD', binanceSymbol: 'avaxusdt', icon: '🔺', payout: 88, price: 0, change24h: 0 },
  { symbol: 'DOTUSDT', displayName: 'DOT/USD', binanceSymbol: 'dotusdt', icon: '●', payout: 88, price: 0, change24h: 0 },
  { symbol: 'MATICUSDT', displayName: 'MATIC/USD', binanceSymbol: 'maticusdt', icon: '⬡', payout: 88, price: 0, change24h: 0 },
  { symbol: 'NEARUSDT', displayName: 'NEAR/USD', binanceSymbol: 'nearusdt', icon: 'Ⓝ', payout: 88, price: 0, change24h: 0 },
  { symbol: 'SUIUSDT', displayName: 'SUI/USD', binanceSymbol: 'suiusdt', icon: '💧', payout: 87, price: 0, change24h: 0 },
  // DeFi / DEX tokens
  { symbol: 'UNIUSDT', displayName: 'UNI/USD', binanceSymbol: 'uniusdt', icon: '🦄', payout: 86, price: 0, change24h: 0 },
  { symbol: 'AAVEUSDT', displayName: 'AAVE/USD', binanceSymbol: 'aaveusdt', icon: '👻', payout: 86, price: 0, change24h: 0 },
  { symbol: 'LINKUSDT', displayName: 'LINK/USD', binanceSymbol: 'linkusdt', icon: '⬡', payout: 88, price: 0, change24h: 0 },
  { symbol: 'MKRUSDT', displayName: 'MKR/USD', binanceSymbol: 'mkrusdt', icon: 'Ⓜ', payout: 85, price: 0, change24h: 0 },
  { symbol: 'CRVUSDT', displayName: 'CRV/USD', binanceSymbol: 'crvusdt', icon: '〰', payout: 85, price: 0, change24h: 0 },
  { symbol: 'SUSHIUSDT', displayName: 'SUSHI/USD', binanceSymbol: 'sushiusdt', icon: '🍣', payout: 85, price: 0, change24h: 0 },
  { symbol: '1INCHUSDT', displayName: '1INCH/USD', binanceSymbol: '1inchusdt', icon: '🐴', payout: 85, price: 0, change24h: 0 },
  // Meme / trending
  { symbol: 'DOGEUSDT', displayName: 'DOGE/USD', binanceSymbol: 'dogeusdt', icon: '🐕', payout: 87, price: 0, change24h: 0 },
  { symbol: 'SHIBUSDT', displayName: 'SHIB/USD', binanceSymbol: 'shibusdt', icon: '🐶', payout: 85, price: 0, change24h: 0 },
  { symbol: 'PEPEUSDT', displayName: 'PEPE/USD', binanceSymbol: 'pepeusdt', icon: '🐸', payout: 84, price: 0, change24h: 0 },
  // More majors
  { symbol: 'XRPUSDT', displayName: 'XRP/USD', binanceSymbol: 'xrpusdt', icon: '✕', payout: 89, price: 0, change24h: 0 },
  { symbol: 'LTCUSDT', displayName: 'LTC/USD', binanceSymbol: 'ltcusdt', icon: 'Ł', payout: 89, price: 0, change24h: 0 },
  { symbol: 'TRXUSDT', displayName: 'TRX/USD', binanceSymbol: 'trxusdt', icon: '⟐', payout: 88, price: 0, change24h: 0 },
  { symbol: 'ATOMUSDT', displayName: 'ATOM/USD', binanceSymbol: 'atomusdt', icon: '⚛', payout: 87, price: 0, change24h: 0 },
  { symbol: 'APTUSDT', displayName: 'APT/USD', binanceSymbol: 'aptusdt', icon: '🅰', payout: 86, price: 0, change24h: 0 },
  { symbol: 'ARBUSDT', displayName: 'ARB/USD', binanceSymbol: 'arbusdt', icon: '🔵', payout: 86, price: 0, change24h: 0 },
  { symbol: 'OPUSDT', displayName: 'OP/USD', binanceSymbol: 'opusdt', icon: '🔴', payout: 86, price: 0, change24h: 0 },
  { symbol: 'FILUSDT', displayName: 'FIL/USD', binanceSymbol: 'filusdt', icon: '📁', payout: 85, price: 0, change24h: 0 },
  { symbol: 'INJUSDT', displayName: 'INJ/USD', binanceSymbol: 'injusdt', icon: '💉', payout: 85, price: 0, change24h: 0 },
  { symbol: 'RENDERUSDT', displayName: 'RENDER/USD', binanceSymbol: 'renderusdt', icon: '🎨', payout: 85, price: 0, change24h: 0 },
];

export const TIMEFRAMES = [
  { label: '1m', seconds: 60 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
];
