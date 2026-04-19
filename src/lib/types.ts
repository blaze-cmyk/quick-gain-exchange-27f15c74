export interface TradingPair {
  symbol: string;
  displayName: string;
  binanceSymbol: string;
  tiingoSymbol?: string;
  /** Key into OTC_PAIR_CONFIGS for synthetic feed pairs */
  otcSymbol?: string;
  icon: string;
  payout: number;
  price: number;
  change24h: number;
  category: 'crypto' | 'forex' | 'otc_crypto' | 'commodity' | 'stock';
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

  // ── OTC Crypto ──
  { symbol: 'BTCUSDT_OTC', displayName: 'BTC/USDT OTC', binanceSymbol: '', otcSymbol: 'BTCUSDT_OTC', icon: '₿', payout: 92, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'ETHUSDT_OTC', displayName: 'ETH/USDT OTC', binanceSymbol: '', otcSymbol: 'ETHUSDT_OTC', icon: 'Ξ', payout: 92, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'SOLUSDT_OTC', displayName: 'SOL/USDT OTC', binanceSymbol: '', otcSymbol: 'SOLUSDT_OTC', icon: '◎', payout: 91, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'BNBUSDT_OTC', displayName: 'BNB/USDT OTC', binanceSymbol: '', otcSymbol: 'BNBUSDT_OTC', icon: '◆', payout: 91, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'XRPUSDT_OTC', displayName: 'XRP/USDT OTC', binanceSymbol: '', otcSymbol: 'XRPUSDT_OTC', icon: '✕', payout: 91, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'DOGEUSDT_OTC', displayName: 'DOGE/USDT OTC', binanceSymbol: '', otcSymbol: 'DOGEUSDT_OTC', icon: '🐕', payout: 90, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'ADAUSDT_OTC', displayName: 'ADA/USDT OTC', binanceSymbol: '', otcSymbol: 'ADAUSDT_OTC', icon: '₳', payout: 90, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'AVAXUSDT_OTC', displayName: 'AVAX/USDT OTC', binanceSymbol: '', otcSymbol: 'AVAXUSDT_OTC', icon: '🔺', payout: 90, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'LTCUSDT_OTC', displayName: 'LTC/USDT OTC', binanceSymbol: '', otcSymbol: 'LTCUSDT_OTC', icon: 'Ł', payout: 90, price: 0, change24h: 0, category: 'otc_crypto' },
  { symbol: 'LINKUSDT_OTC', displayName: 'LINK/USDT OTC', binanceSymbol: '', otcSymbol: 'LINKUSDT_OTC', icon: '⬡', payout: 90, price: 0, change24h: 0, category: 'otc_crypto' },

  // ── Forex OTC (Majors) ──
  { symbol: 'EURUSD_OTC', displayName: 'EUR/USD OTC', binanceSymbol: '', otcSymbol: 'EURUSD_OTC', icon: '🇪🇺', payout: 92, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPUSD_OTC', displayName: 'GBP/USD OTC', binanceSymbol: '', otcSymbol: 'GBPUSD_OTC', icon: '🇬🇧', payout: 92, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDJPY_OTC', displayName: 'USD/JPY OTC', binanceSymbol: '', otcSymbol: 'USDJPY_OTC', icon: '🇯🇵', payout: 92, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDCHF_OTC', displayName: 'USD/CHF OTC', binanceSymbol: '', otcSymbol: 'USDCHF_OTC', icon: '🇨🇭', payout: 91, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'AUDUSD_OTC', displayName: 'AUD/USD OTC', binanceSymbol: '', otcSymbol: 'AUDUSD_OTC', icon: '🇦🇺', payout: 91, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDCAD_OTC', displayName: 'USD/CAD OTC', binanceSymbol: '', otcSymbol: 'USDCAD_OTC', icon: '🇨🇦', payout: 91, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'NZDUSD_OTC', displayName: 'NZD/USD OTC', binanceSymbol: '', otcSymbol: 'NZDUSD_OTC', icon: '🇳🇿', payout: 90, price: 0, change24h: 0, category: 'forex' },
  // ── Forex OTC (Crosses) ──
  { symbol: 'EURGBP_OTC', displayName: 'EUR/GBP OTC', binanceSymbol: '', otcSymbol: 'EURGBP_OTC', icon: '🇪🇺', payout: 90, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURJPY_OTC', displayName: 'EUR/JPY OTC', binanceSymbol: '', otcSymbol: 'EURJPY_OTC', icon: '🇪🇺', payout: 90, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'GBPJPY_OTC', displayName: 'GBP/JPY OTC', binanceSymbol: '', otcSymbol: 'GBPJPY_OTC', icon: '🇬🇧', payout: 90, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'AUDJPY_OTC', displayName: 'AUD/JPY OTC', binanceSymbol: '', otcSymbol: 'AUDJPY_OTC', icon: '🇦🇺', payout: 89, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'EURAUD_OTC', displayName: 'EUR/AUD OTC', binanceSymbol: '', otcSymbol: 'EURAUD_OTC', icon: '🇪🇺', payout: 89, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'CHFJPY_OTC', displayName: 'CHF/JPY OTC', binanceSymbol: '', otcSymbol: 'CHFJPY_OTC', icon: '🇨🇭', payout: 89, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'CADJPY_OTC', displayName: 'CAD/JPY OTC', binanceSymbol: '', otcSymbol: 'CADJPY_OTC', icon: '🇨🇦', payout: 89, price: 0, change24h: 0, category: 'forex' },
  // ── Forex OTC (Exotics) ──
  { symbol: 'USDTRY_OTC', displayName: 'USD/TRY OTC', binanceSymbol: '', otcSymbol: 'USDTRY_OTC', icon: '🇹🇷', payout: 87, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDZAR_OTC', displayName: 'USD/ZAR OTC', binanceSymbol: '', otcSymbol: 'USDZAR_OTC', icon: '🇿🇦', payout: 87, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDMXN_OTC', displayName: 'USD/MXN OTC', binanceSymbol: '', otcSymbol: 'USDMXN_OTC', icon: '🇲🇽', payout: 87, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDINR_OTC', displayName: 'USD/INR OTC', binanceSymbol: '', otcSymbol: 'USDINR_OTC', icon: '🇮🇳', payout: 87, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDSGD_OTC', displayName: 'USD/SGD OTC', binanceSymbol: '', otcSymbol: 'USDSGD_OTC', icon: '🇸🇬', payout: 88, price: 0, change24h: 0, category: 'forex' },
  { symbol: 'USDHKD_OTC', displayName: 'USD/HKD OTC', binanceSymbol: '', otcSymbol: 'USDHKD_OTC', icon: '🇭🇰', payout: 88, price: 0, change24h: 0, category: 'forex' },

  // ── Commodities OTC ──
  { symbol: 'XAUUSD_OTC', displayName: 'XAU/USD OTC', binanceSymbol: '', otcSymbol: 'XAUUSD_OTC', icon: '🥇', payout: 90, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'XAGUSD_OTC', displayName: 'XAG/USD OTC', binanceSymbol: '', otcSymbol: 'XAGUSD_OTC', icon: '🥈', payout: 89, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'USOIL_OTC', displayName: 'USOIL OTC', binanceSymbol: '', otcSymbol: 'USOIL_OTC', icon: '🛢️', payout: 88, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'UKOIL_OTC', displayName: 'UKOIL OTC', binanceSymbol: '', otcSymbol: 'UKOIL_OTC', icon: '🛢️', payout: 88, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'NATGAS_OTC', displayName: 'NATGAS OTC', binanceSymbol: '', otcSymbol: 'NATGAS_OTC', icon: '🔥', payout: 86, price: 0, change24h: 0, category: 'commodity' },

  // ── US Stocks OTC ──
  { symbol: 'AAPL_OTC', displayName: 'AAPL OTC', binanceSymbol: '', otcSymbol: 'AAPL_OTC', icon: '🍎', payout: 89, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'TSLA_OTC', displayName: 'TSLA OTC', binanceSymbol: '', otcSymbol: 'TSLA_OTC', icon: '⚡', payout: 88, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'NVDA_OTC', displayName: 'NVDA OTC', binanceSymbol: '', otcSymbol: 'NVDA_OTC', icon: '💚', payout: 88, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'MSFT_OTC', displayName: 'MSFT OTC', binanceSymbol: '', otcSymbol: 'MSFT_OTC', icon: '🪟', payout: 89, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'GOOGL_OTC', displayName: 'GOOGL OTC', binanceSymbol: '', otcSymbol: 'GOOGL_OTC', icon: '🔍', payout: 89, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'AMZN_OTC', displayName: 'AMZN OTC', binanceSymbol: '', otcSymbol: 'AMZN_OTC', icon: '📦', payout: 89, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'META_OTC', displayName: 'META OTC', binanceSymbol: '', otcSymbol: 'META_OTC', icon: 'ⓜ', payout: 88, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'NFLX_OTC', displayName: 'NFLX OTC', binanceSymbol: '', otcSymbol: 'NFLX_OTC', icon: '🎬', payout: 88, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'AMD_OTC', displayName: 'AMD OTC', binanceSymbol: '', otcSymbol: 'AMD_OTC', icon: '🔴', payout: 88, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'INTC_OTC', displayName: 'INTC OTC', binanceSymbol: '', otcSymbol: 'INTC_OTC', icon: '🔷', payout: 87, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'COIN_OTC', displayName: 'COIN OTC', binanceSymbol: '', otcSymbol: 'COIN_OTC', icon: '🪙', payout: 87, price: 0, change24h: 0, category: 'stock' },
  { symbol: 'BABA_OTC', displayName: 'BABA OTC', binanceSymbol: '', otcSymbol: 'BABA_OTC', icon: '🛒', payout: 87, price: 0, change24h: 0, category: 'stock' },

  // ── Indices OTC ──
  { symbol: 'SPX500_OTC', displayName: 'SPX500 OTC', binanceSymbol: '', otcSymbol: 'SPX500_OTC', icon: '📈', payout: 90, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'NAS100_OTC', displayName: 'NAS100 OTC', binanceSymbol: '', otcSymbol: 'NAS100_OTC', icon: '💹', payout: 90, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'US30_OTC', displayName: 'US30 OTC', binanceSymbol: '', otcSymbol: 'US30_OTC', icon: '🏛️', payout: 90, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'GER40_OTC', displayName: 'GER40 OTC', binanceSymbol: '', otcSymbol: 'GER40_OTC', icon: '🇩🇪', payout: 89, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'UK100_OTC', displayName: 'UK100 OTC', binanceSymbol: '', otcSymbol: 'UK100_OTC', icon: '🇬🇧', payout: 89, price: 0, change24h: 0, category: 'commodity' },
  { symbol: 'JPN225_OTC', displayName: 'JPN225 OTC', binanceSymbol: '', otcSymbol: 'JPN225_OTC', icon: '🇯🇵', payout: 89, price: 0, change24h: 0, category: 'commodity' },
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
