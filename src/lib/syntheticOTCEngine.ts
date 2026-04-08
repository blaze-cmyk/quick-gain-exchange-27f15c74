/**
 * SyntheticOTCFeed — 24/7 real-time synthetic OTC price engine
 *
 * Generates realistic candlestick data using a smoothed random-walk
 * with momentum, mean-reversion, and a configurable house-edge bias
 * driven by the current open-trade imbalance.
 *
 * The engine runs entirely client-side on a 1-second tick.
 * Each asset pair gets its own independent state & RNG stream.
 */

import { CandleData } from './types';

/* ────────────────────────── configuration ────────────────────────── */

export interface OTCPairConfig {
  /** Starting / anchor price */
  basePrice: number;
  /** Per-tick volatility σ  (e.g. 0.0003 for BTC-like) */
  volatility: number;
  /** Mean-reversion strength toward basePrice (0–1, typically 0.0001) */
  meanReversion: number;
  /** Momentum carry-over (0–1, e.g. 0.6) */
  momentum: number;
  /** EMA smoothing factor for the close price (0–1, lower = smoother) */
  smoothing: number;
  /** Price decimal precision */
  decimals: number;
}

/** Tunable house-edge factor (0 = no bias, 0.3 = moderate, 1 = very aggressive) */
export const DEFAULT_HOUSE_EDGE_FACTOR = 0.25;

/* ────────────────────────── preset configs ────────────────────────── */

export const OTC_PAIR_CONFIGS: Record<string, OTCPairConfig> = {
  // ── Crypto ──
  BTCUSDT_OTC:   { basePrice: 84500,  volatility: 0.00025, meanReversion: 0.00008, momentum: 0.55, smoothing: 0.35, decimals: 2 },
  ETHUSDT_OTC:   { basePrice: 1820,   volatility: 0.00030, meanReversion: 0.00010, momentum: 0.50, smoothing: 0.35, decimals: 2 },
  SOLUSDT_OTC:   { basePrice: 130,    volatility: 0.00035, meanReversion: 0.00012, momentum: 0.50, smoothing: 0.35, decimals: 3 },
  // ── Commodities ──
  XAUUSD_OTC:    { basePrice: 3020,   volatility: 0.00015, meanReversion: 0.00005, momentum: 0.60, smoothing: 0.40, decimals: 2 },
  USOIL_OTC:     { basePrice: 72.50,  volatility: 0.00020, meanReversion: 0.00008, momentum: 0.55, smoothing: 0.38, decimals: 3 },
  // ── US Stocks ──
  AAPL_OTC:      { basePrice: 218,    volatility: 0.00018, meanReversion: 0.00006, momentum: 0.58, smoothing: 0.38, decimals: 2 },
  TSLA_OTC:      { basePrice: 265,    volatility: 0.00040, meanReversion: 0.00010, momentum: 0.52, smoothing: 0.32, decimals: 2 },
  NVDA_OTC:      { basePrice: 112,    volatility: 0.00035, meanReversion: 0.00009, momentum: 0.54, smoothing: 0.34, decimals: 2 },
};

/* ────────────────────────── internal state ────────────────────────── */

interface PairState {
  price: number;
  smoothedPrice: number;
  velocity: number;        // running momentum
  candles: CandleData[];
  currentCandle: CandleData | null;
  candleBucket: number;    // which candle-bucket we're in (epoch-aligned)
  regime: 'sideways' | 'trending_up' | 'trending_down' | 'accumulation';
  regimeTicksLeft: number;
  regimeBias: number;
}

const states = new Map<string, PairState>();

/* ────────────────────────── helpers ────────────────────────── */

/** Seeded-ish gaussian via Box-Muller */
function gaussRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function round(n: number, d: number): number {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function pickRegime(): { regime: PairState['regime']; ticks: number; bias: number } {
  const r = Math.random();
  if (r < 0.35) return { regime: 'sideways',       ticks: 60 + Math.floor(Math.random() * 180), bias: 0 };
  if (r < 0.55) return { regime: 'trending_up',    ticks: 30 + Math.floor(Math.random() * 120), bias:  0.0001 + Math.random() * 0.0002 };
  if (r < 0.75) return { regime: 'trending_down',  ticks: 30 + Math.floor(Math.random() * 120), bias: -0.0001 - Math.random() * 0.0002 };
  return               { regime: 'accumulation',   ticks: 40 + Math.floor(Math.random() * 100), bias: (Math.random() - 0.5) * 0.00005 };
}

/* ────────────────────────── core engine ────────────────────────── */

const CANDLE_HISTORY_LIMIT = 500;

function getOrCreateState(symbol: string, cfg: OTCPairConfig): PairState {
  if (states.has(symbol)) return states.get(symbol)!;

  const { regime, ticks, bias } = pickRegime();
  const state: PairState = {
    price: cfg.basePrice * (1 + (Math.random() - 0.5) * 0.002),
    smoothedPrice: cfg.basePrice,
    velocity: 0,
    candles: [],
    currentCandle: null,
    candleBucket: 0,
    regime,
    regimeTicksLeft: ticks,
    regimeBias: bias,
  };
  state.smoothedPrice = state.price;
  states.set(symbol, state);
  return state;
}

/**
 * Advance the price by one tick (1 second).
 *
 * @param symbol       Pair key (e.g. "BTCUSDT_OTC")
 * @param cfg          Pair configuration
 * @param houseBias    Normalised bias in [-1, 1]. Negative = push price down, positive = push up.
 *                     Calculated externally from open-trade imbalance.
 * @param edgeFactor   Multiplier for the house bias strength (0–1).
 * @param intervalSecs Candle bucket width in seconds (default 60).
 * @returns            Updated current price and latest candle array.
 */
export function tick(
  symbol: string,
  cfg: OTCPairConfig,
  houseBias: number = 0,
  edgeFactor: number = DEFAULT_HOUSE_EDGE_FACTOR,
  intervalSecs: number = 60,
): { price: number; candles: CandleData[] } {
  const st = getOrCreateState(symbol, cfg);

  /* ── regime transitions ── */
  st.regimeTicksLeft--;
  if (st.regimeTicksLeft <= 0) {
    const next = pickRegime();
    st.regime = next.regime;
    st.regimeTicksLeft = next.ticks;
    st.regimeBias = next.bias;
  }

  /* ── random walk with momentum ── */
  const noise = gaussRandom() * cfg.volatility;
  const meanRev = (cfg.basePrice - st.price) / cfg.basePrice * cfg.meanReversion;

  // Regime directional drift
  const regimeDrift = st.regimeBias;

  // House bias: if users bet UP (houseBias > 0), we want price DOWN → negate
  const houseDrift = -houseBias * edgeFactor * cfg.volatility * 1.5;

  // Combine forces
  const rawDelta = noise + meanRev + regimeDrift + houseDrift;
  st.velocity = cfg.momentum * st.velocity + (1 - cfg.momentum) * rawDelta;
  const newRawPrice = st.price * (1 + st.velocity);

  // EMA smoothing
  st.smoothedPrice = cfg.smoothing * newRawPrice + (1 - cfg.smoothing) * st.smoothedPrice;
  st.price = newRawPrice;

  const finalPrice = round(st.smoothedPrice, cfg.decimals);

  /* ── candle bucketing (epoch-aligned) ── */
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / intervalSecs) * intervalSecs;

  if (st.candleBucket !== bucket) {
    // Close previous candle & start new one
    if (st.currentCandle) {
      st.candles.push({ ...st.currentCandle });
      if (st.candles.length > CANDLE_HISTORY_LIMIT) {
        st.candles = st.candles.slice(-CANDLE_HISTORY_LIMIT);
      }
    }
    st.currentCandle = {
      time: bucket * 1000,
      open: finalPrice,
      high: finalPrice,
      low: finalPrice,
      close: finalPrice,
    };
    st.candleBucket = bucket;
  } else if (st.currentCandle) {
    st.currentCandle.close = finalPrice;
    st.currentCandle.high = Math.max(st.currentCandle.high, finalPrice);
    st.currentCandle.low = Math.min(st.currentCandle.low, finalPrice);
  }

  return {
    price: finalPrice,
    candles: [...st.candles, ...(st.currentCandle ? [st.currentCandle] : [])],
  };
}

/* ────────────────────────── trade imbalance helper ────────────────────────── */

export interface OpenTrade {
  direction: 'up' | 'down';
  amount: number;
}

/**
 * Compute a normalised house bias from open trades.
 * Returns a value in [-1, 1]:
 *   positive = majority betting UP  → we want price to drift DOWN
 *   negative = majority betting DOWN → drift UP
 *
 * Strength scales with imbalance ratio.
 */
export function computeHouseBias(trades: OpenTrade[]): number {
  if (trades.length === 0) return 0;
  let upVol = 0, downVol = 0;
  for (const t of trades) {
    if (t.direction === 'up') upVol += t.amount;
    else downVol += t.amount;
  }
  const total = upVol + downVol;
  if (total === 0) return 0;
  // Normalise to [-1, 1] — positive means UP-heavy
  const imbalance = (upVol - downVol) / total;
  // Non-linear scaling: amplify strong imbalances
  return Math.sign(imbalance) * Math.pow(Math.abs(imbalance), 0.7);
}

/* ────────────────────────── settlement ────────────────────────── */

/**
 * Get the current synthetic price for settlement.
 * The strike price should have been locked at trade open time.
 */
export function getSettlementPrice(symbol: string): number | null {
  const st = states.get(symbol);
  if (!st) return null;
  return round(st.smoothedPrice, OTC_PAIR_CONFIGS[symbol]?.decimals ?? 2);
}

/* ────────────────────────── reset ────────────────────────── */

export function resetPair(symbol: string) {
  states.delete(symbol);
}

export function resetAll() {
  states.clear();
}

/**
 * Bootstrap historical candles so the chart isn't empty on load.
 * Runs a fast simulation of `count` candle periods.
 */
export function bootstrapHistory(
  symbol: string,
  cfg: OTCPairConfig,
  intervalSecs: number = 60,
  count: number = 200,
) {
  const st = getOrCreateState(symbol, cfg);
  // Only bootstrap if no candles yet
  if (st.candles.length > 0) return;

  const now = Math.floor(Date.now() / 1000);
  const startBucket = (Math.floor(now / intervalSecs) - count) * intervalSecs;
  let lastClose = round(st.smoothedPrice, cfg.decimals);

  for (let i = 0; i < count; i++) {
    const bucket = startBucket + i * intervalSecs;
    // Simulate multiple ticks per candle for realism
    const ticksPerCandle = Math.min(intervalSecs, 30);
    let open = st.smoothedPrice;
    let high = open, low = open, close = open;

    for (let t = 0; t < ticksPerCandle; t++) {
      const noise = gaussRandom() * cfg.volatility;
      const meanRev = (cfg.basePrice - st.price) / cfg.basePrice * cfg.meanReversion;
      st.velocity = cfg.momentum * st.velocity + (1 - cfg.momentum) * (noise + meanRev + st.regimeBias);
      st.price *= (1 + st.velocity);
      st.smoothedPrice = cfg.smoothing * st.price + (1 - cfg.smoothing) * st.smoothedPrice;
      const p = round(st.smoothedPrice, cfg.decimals);
      if (t === 0) open = p;
      high = Math.max(high, p);
      low = Math.min(low, p);
      close = p;
    }

    // Regime transition check
    st.regimeTicksLeft -= ticksPerCandle;
    if (st.regimeTicksLeft <= 0) {
      const next = pickRegime();
      st.regime = next.regime;
      st.regimeTicksLeft = next.ticks;
      st.regimeBias = next.bias;
    }

    st.candles.push({ time: bucket * 1000, open, high, low, close });
  }

  // Set current bucket
  st.candleBucket = Math.floor(now / intervalSecs) * intervalSecs;
  st.currentCandle = {
    time: st.candleBucket * 1000,
    open: close ?? st.smoothedPrice,
    high: close ?? st.smoothedPrice,
    low: close ?? st.smoothedPrice,
    close: close ?? st.smoothedPrice,
  };
}
