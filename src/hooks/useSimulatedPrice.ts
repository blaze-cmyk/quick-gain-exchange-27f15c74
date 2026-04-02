import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';

const HISTORY_CANDLES = 2880; // 2 days of 1-min candles
const TICK_INTERVAL = 200; // ms between price ticks
const BASE_PRICE = 67500; // Starting BTC price

// Seeded pseudo-random for reproducible but chaotic history
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate volatile regime-switching price history
function generateHistory(): { candles: CandleData[]; lastPrice: number } {
  const rand = mulberry32(Date.now() % 100000);
  const candles: CandleData[] = [];
  let price = BASE_PRICE;
  const now = Date.now();
  const startTime = now - HISTORY_CANDLES * 60 * 1000;

  // Market regime state
  let regime: 'volatile' | 'sideways' | 'trending_up' | 'trending_down' | 'explosion' = 'volatile';
  let regimeCountdown = 0;

  for (let i = 0; i < HISTORY_CANDLES; i++) {
    // Switch regime randomly
    if (regimeCountdown <= 0) {
      const r = rand();
      if (r < 0.25) regime = 'volatile';
      else if (r < 0.45) regime = 'sideways';
      else if (r < 0.6) regime = 'trending_up';
      else if (r < 0.75) regime = 'trending_down';
      else regime = 'explosion';
      regimeCountdown = Math.floor(rand() * 30) + 5;
    }
    regimeCountdown--;

    // Base volatility per regime
    let volatility: number;
    let drift: number;
    switch (regime) {
      case 'sideways':
        volatility = 0.0003;
        drift = (rand() - 0.5) * 0.00005;
        break;
      case 'trending_up':
        volatility = 0.001;
        drift = 0.0004 + rand() * 0.0003;
        break;
      case 'trending_down':
        volatility = 0.001;
        drift = -0.0004 - rand() * 0.0003;
        break;
      case 'explosion':
        volatility = 0.004 + rand() * 0.004;
        drift = (rand() - 0.5) * 0.003;
        break;
      default: // volatile
        volatility = 0.0015 + rand() * 0.001;
        drift = (rand() - 0.5) * 0.0005;
        break;
    }

    // Random spikes
    if (rand() < 0.03) {
      volatility *= 3 + rand() * 5;
      drift += (rand() - 0.5) * 0.005;
    }

    const open = price;
    // Generate 10-20 sub-ticks within the candle for realistic wicks
    const subTicks = 10 + Math.floor(rand() * 10);
    let high = open;
    let low = open;
    let close = open;

    for (let t = 0; t < subTicks; t++) {
      const move = close * (drift / subTicks + volatility * (rand() - 0.5) * 2);
      close += move;
      if (close > high) high = close;
      if (close < low) low = close;
    }

    // Ensure price stays positive and reasonable
    close = Math.max(close, price * 0.95);
    close = Math.min(close, price * 1.05);
    high = Math.max(high, Math.max(open, close));
    low = Math.min(low, Math.min(open, close));

    const candleTime = Math.floor((startTime + i * 60000) / 1000);
    candles.push({
      time: candleTime,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });

    price = close;
  }

  return { candles, lastPrice: price };
}

// Live price engine with regime switching
class LivePriceEngine {
  price: number;
  regime: 'volatile' | 'sideways' | 'trending_up' | 'trending_down' | 'explosion' = 'volatile';
  regimeCountdown = 0;
  momentum = 0;

  constructor(startPrice: number) {
    this.price = startPrice;
    this.switchRegime();
  }

  switchRegime() {
    const r = Math.random();
    if (r < 0.2) this.regime = 'volatile';
    else if (r < 0.4) this.regime = 'sideways';
    else if (r < 0.55) this.regime = 'trending_up';
    else if (r < 0.7) this.regime = 'trending_down';
    else this.regime = 'explosion';
    this.regimeCountdown = Math.floor(Math.random() * 200) + 30; // ticks
    this.momentum = (Math.random() - 0.5) * 0.001;
  }

  tick(): number {
    if (this.regimeCountdown <= 0) this.switchRegime();
    this.regimeCountdown--;

    let volatility: number;
    let drift: number;

    switch (this.regime) {
      case 'sideways':
        volatility = 0.00008;
        drift = this.momentum * 0.1;
        break;
      case 'trending_up':
        volatility = 0.00025;
        drift = 0.00008 + Math.abs(this.momentum) * 0.5;
        break;
      case 'trending_down':
        volatility = 0.00025;
        drift = -0.00008 - Math.abs(this.momentum) * 0.5;
        break;
      case 'explosion':
        volatility = 0.001 + Math.random() * 0.002;
        drift = this.momentum * 2;
        break;
      default:
        volatility = 0.0004;
        drift = this.momentum * 0.3;
        break;
    }

    // Random micro-spikes
    if (Math.random() < 0.01) {
      volatility *= 5;
      this.momentum = (Math.random() - 0.5) * 0.002;
    }

    // Mean reversion toward base
    const meanRevert = (BASE_PRICE - this.price) / BASE_PRICE * 0.00001;

    const move = this.price * (drift + meanRevert + volatility * (Math.random() - 0.5) * 2);
    this.momentum = this.momentum * 0.995 + (move / this.price) * 0.3;
    this.price += move;
    this.price = Math.max(this.price * 0.9999, Math.min(this.price * 1.0001, this.price)); // clamp sanity

    return Math.round(this.price * 100) / 100;
  }
}

export function useSimulatedPrice() {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const candlesRef = useRef<CandleData[]>([]);
  const engineRef = useRef<LivePriceEngine | null>(null);

  useEffect(() => {
    // Generate history
    const { candles: history, lastPrice } = generateHistory();
    candlesRef.current = history;
    setCandles([...history]);
    setCurrentPrice(lastPrice);
    setConnected(true);

    // Start live engine
    const engine = new LivePriceEngine(lastPrice);
    engineRef.current = engine;

    const interval = setInterval(() => {
      const price = engine.tick();
      setCurrentPrice(price);

      // Update or create current candle
      const nowMs = Date.now();
      const nowSec = Math.floor(nowMs / 1000);
      const candleTime = nowSec - (nowSec % 60);
      const arr = candlesRef.current;

      if (arr.length === 0) return;

      const last = arr[arr.length - 1];
      if (last.time === candleTime) {
        last.close = price;
        if (price > last.high) last.high = price;
        if (price < last.low) last.low = price;
      } else if (candleTime > last.time) {
        arr.push({
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
        });
        // Keep max candles
        if (arr.length > 5000) arr.splice(0, arr.length - 5000);
      }

      setCandles([...arr]);
    }, TICK_INTERVAL);

    return () => {
      clearInterval(interval);
      setConnected(false);
    };
  }, []);

  return { currentPrice, priceChange: 0, candles, connected };
}
