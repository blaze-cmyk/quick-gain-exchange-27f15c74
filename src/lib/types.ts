export interface TradingPair {
  symbol: string;
  displayName: string;
  binanceSymbol: string;
  tiingoSymbol?: string;
  icon: string;
  payout: number;
  price: number;
  change24h: number;
  category: 'crypto' | 'forex';
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
  { symbol: 'BTCUSDT', displayName: 'BTC/USDT', binanceSymbol: 'btcusdt', icon: '₿', payout: 90, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'ETHUSDT', displayName: 'ETH/USDT', binanceSymbol: 'ethusdt', icon: 'Ξ', payout: 90, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'SOLUSDT', displayName: 'SOL/USDT', binanceSymbol: 'solusdt', icon: '◎', payout: 90, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'BNBUSDT', displayName: 'BNB/USDT', binanceSymbol: 'bnbusdt', icon: '◆', payout: 90, price: 0, change24h: 0, category: 'crypto' },
  // Alt-L1s
  { symbol: 'ADAUSDT', displayName: 'ADA/USDT', binanceSymbol: 'adausdt', icon: '₳', payout: 88, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'AVAXUSDT', displayName: 'AVAX/USDT', binanceSymbol: 'avaxusdt', icon: '🔺', payout: 88, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'DOTUSDT', displayName: 'DOT/USDT', binanceSymbol: 'dotusdt', icon: '●', payout: 88, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'MATICUSDT', displayName: 'MATIC/USDT', binanceSymbol: 'maticusdt', icon: '⬡', payout: 88, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'NEARUSDT', displayName: 'NEAR/USDT', binanceSymbol: 'nearusdt', icon: 'Ⓝ', payout: 88, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'SUIUSDT', displayName: 'SUI/USDT', binanceSymbol: 'suiusdt', icon: '💧', payout: 87, price: 0, change24h: 0, category: 'crypto' },
  // DeFi / DEX tokens
  { symbol: 'UNIUSDT', displayName: 'UNI/USDT', binanceSymbol: 'uniusdt', icon: '🦄', payout: 86, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'AAVEUSDT', displayName: 'AAVE/USDT', binanceSymbol: 'aaveusdt', icon: '👻', payout: 86, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'LINKUSDT', displayName: 'LINK/USDT', binanceSymbol: 'linkusdt', icon: '⬡', payout: 88, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'MKRUSDT', displayName: 'MKR/USDT', binanceSymbol: 'mkrusdt', icon: 'Ⓜ', payout: 85, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'CRVUSDT', displayName: 'CRV/USDT', binanceSymbol: 'crvusdt', icon: '〰', payout: 85, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'SUSHIUSDT', displayName: 'SUSHI/USDT', binanceSymbol: 'sushiusdt', icon: '🍣', payout: 85, price: 0, change24h: 0, category: 'crypto' },
  { symbol: '1INCHUSDT', displayName: '1INCH/USDT', binanceSymbol: '1inchusdt', icon: '🐴', payout: 85, price: 0, change24h: 0, category: 'crypto' },
  // Meme / trending
  { symbol: 'DOGEUSDT', displayName: 'DOGE/USDT', binanceSymbol: 'dogeusdt', icon: '🐕', payout: 87, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'SHIBUSDT', displayName: 'SHIB/USDT', binanceSymbol: 'shibusdt', icon: '🐶', payout: 85, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'PEPEUSDT', displayName: 'PEPE/USDT', binanceSymbol: 'pepeusdt', icon: '🐸', payout: 84, price: 0, change24h: 0, category: 'crypto' },
  // More majors
  { symbol: 'XRPUSDT', displayName: 'XRP/USDT', binanceSymbol: 'xrpusdt', icon: '✕', payout: 89, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'LTCUSDT', displayName: 'LTC/USDT', binanceSymbol: 'ltcusdt', icon: 'Ł', payout: 89, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'TRXUSDT', displayName: 'TRX/USDT', binanceSymbol: 'trxusdt', icon: '⟐', payout: 88, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'ATOMUSDT', displayName: 'ATOM/USDT', binanceSymbol: 'atomusdt', icon: '⚛', payout: 87, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'APTUSDT', displayName: 'APT/USDT', binanceSymbol: 'aptusdt', icon: '🅰', payout: 86, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'ARBUSDT', displayName: 'ARB/USDT', binanceSymbol: 'arbusdt', icon: '🔵', payout: 86, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'OPUSDT', displayName: 'OP/USDT', binanceSymbol: 'opusdt', icon: '🔴', payout: 86, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'FILUSDT', displayName: 'FIL/USDT', binanceSymbol: 'filusdt', icon: '📁', payout: 85, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'INJUSDT', displayName: 'INJ/USDT', binanceSymbol: 'injusdt', icon: '💉', payout: 85, price: 0, change24h: 0, category: 'crypto' },
  { symbol: 'RENDERUSDT', displayName: 'RENDER/USDT', binanceSymbol: 'renderusdt', icon: '🎨', payout: 85, price: 0, change24h: 0, category: 'crypto' },

  // ── Forex pairs (Tiingo) ──
  { symbol: 'EURUSD', displayName: 'EUR/USD', binanceSymbol: '', tiingoSymbol: 'eurusd', icon: '🇪🇺', payout: 85, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPUSD', displayName: 'GBP/USD', binanceSymbol: '', tiingoSymbol: 'gbpusd', icon: '🇬🇧', payout: 85, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDJPY', displayName: 'USD/JPY', binanceSymbol: '', tiingoSymbol: 'usdjpy', icon: '🇯🇵', payout: 85, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'AUDUSD', displayName: 'AUD/USD', binanceSymbol: '', tiingoSymbol: 'audusd', icon: '🇦🇺', payout: 84, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDCAD', displayName: 'USD/CAD', binanceSymbol: '', tiingoSymbol: 'usdcad', icon: '🇨🇦', payout: 84, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDCHF', displayName: 'USD/CHF', binanceSymbol: '', tiingoSymbol: 'usdchf', icon: '🇨🇭', payout: 84, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'NZDUSD', displayName: 'NZD/USD', binanceSymbol: '', tiingoSymbol: 'nzdusd', icon: '🇳🇿', payout: 83, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURGBP', displayName: 'EUR/GBP', binanceSymbol: '', tiingoSymbol: 'eurgbp', icon: '🇪🇺', payout: 83, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURJPY', displayName: 'EUR/JPY', binanceSymbol: '', tiingoSymbol: 'eurjpy', icon: '🇪🇺', payout: 83, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPJPY', displayName: 'GBP/JPY', binanceSymbol: '', tiingoSymbol: 'gbpjpy', icon: '🇬🇧', payout: 83, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'AUDJPY', displayName: 'AUD/JPY', binanceSymbol: '', tiingoSymbol: 'audjpy', icon: '🇦🇺', payout: 82, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURAUD', displayName: 'EUR/AUD', binanceSymbol: '', tiingoSymbol: 'euraud', icon: '🇪🇺', payout: 82, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURCHF', displayName: 'EUR/CHF', binanceSymbol: '', tiingoSymbol: 'eurchf', icon: '🇪🇺', payout: 82, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPAUD', displayName: 'GBP/AUD', binanceSymbol: '', tiingoSymbol: 'gbpaud', icon: '🇬🇧', payout: 82, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPCHF', displayName: 'GBP/CHF', binanceSymbol: '', tiingoSymbol: 'gbpchf', icon: '🇬🇧', payout: 82, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'CADJPY', displayName: 'CAD/JPY', binanceSymbol: '', tiingoSymbol: 'cadjpy', icon: '🇨🇦', payout: 82, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'CHFJPY', displayName: 'CHF/JPY', binanceSymbol: '', tiingoSymbol: 'chfjpy', icon: '🇨🇭', payout: 82, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURCAD', displayName: 'EUR/CAD', binanceSymbol: '', tiingoSymbol: 'eurcad', icon: '🇪🇺', payout: 81, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURNZD', displayName: 'EUR/NZD', binanceSymbol: '', tiingoSymbol: 'eurnzd', icon: '🇪🇺', payout: 81, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPCAD', displayName: 'GBP/CAD', binanceSymbol: '', tiingoSymbol: 'gbpcad', icon: '🇬🇧', payout: 81, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPNZD', displayName: 'GBP/NZD', binanceSymbol: '', tiingoSymbol: 'gbpnzd', icon: '🇬🇧', payout: 81, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'AUDCAD', displayName: 'AUD/CAD', binanceSymbol: '', tiingoSymbol: 'audcad', icon: '🇦🇺', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'AUDCHF', displayName: 'AUD/CHF', binanceSymbol: '', tiingoSymbol: 'audchf', icon: '🇦🇺', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'AUDNZD', displayName: 'AUD/NZD', binanceSymbol: '', tiingoSymbol: 'audnzd', icon: '🇦🇺', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'NZDJPY', displayName: 'NZD/JPY', binanceSymbol: '', tiingoSymbol: 'nzdjpy', icon: '🇳🇿', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'NZDCAD', displayName: 'NZD/CAD', binanceSymbol: '', tiingoSymbol: 'nzdcad', icon: '🇳🇿', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'NZDCHF', displayName: 'NZD/CHF', binanceSymbol: '', tiingoSymbol: 'nzdchf', icon: '🇳🇿', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'CADCHF', displayName: 'CAD/CHF', binanceSymbol: '', tiingoSymbol: 'cadchf', icon: '🇨🇦', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDSGD', displayName: 'USD/SGD', binanceSymbol: '', tiingoSymbol: 'usdsgd', icon: '🇸🇬', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDHKD', displayName: 'USD/HKD', binanceSymbol: '', tiingoSymbol: 'usdhkd', icon: '🇭🇰', payout: 80, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDMXN', displayName: 'USD/MXN', binanceSymbol: '', tiingoSymbol: 'usdmxn', icon: '🇲🇽', payout: 79, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDZAR', displayName: 'USD/ZAR', binanceSymbol: '', tiingoSymbol: 'usdzar', icon: '🇿🇦', payout: 79, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDTRY', displayName: 'USD/TRY', binanceSymbol: '', tiingoSymbol: 'usdtry', icon: '🇹🇷', payout: 79, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDSEK', displayName: 'USD/SEK', binanceSymbol: '', tiingoSymbol: 'usdsek', icon: '🇸🇪', payout: 79, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDNOK', displayName: 'USD/NOK', binanceSymbol: '', tiingoSymbol: 'usdnok', icon: '🇳🇴', payout: 79, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDPLN', displayName: 'USD/PLN', binanceSymbol: '', tiingoSymbol: 'usdpln', icon: '🇵🇱', payout: 78, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDINR', displayName: 'USD/INR', binanceSymbol: '', tiingoSymbol: 'usdinr', icon: '🇮🇳', payout: 78, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDCNH', displayName: 'USD/CNH', binanceSymbol: '', tiingoSymbol: 'usdcnh', icon: '🇨🇳', payout: 78, price: 0, change24h: 0, category: 'forex' },
];

export const TIMEFRAMES = [
  { label: '0:05', seconds: 5 },
  { label: '0:10', seconds: 10 },
  { label: '0:15', seconds: 15 },
  { label: '0:30', seconds: 30 },
  { label: '1:00', seconds: 60 },
  { label: '2:00', seconds: 120 },
  { label: '5:00', seconds: 300 },
  { label: '10:00', seconds: 600 },
  { label: '15:00', seconds: 900 },
  { label: '30:00', seconds: 1800 },
  { label: '1:00:00', seconds: 3600 },
  { label: '2:00:00', seconds: 7200 },
  { label: '4:00:00', seconds: 14400 },
];
