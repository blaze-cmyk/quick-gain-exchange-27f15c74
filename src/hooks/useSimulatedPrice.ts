import { useState, useEffect, useRef } from 'react';
import { CandleData } from '@/lib/types';

const HISTORY_CANDLES = 2880;
const MAX_CANDLES = 5000;
const TICK_INTERVAL = 350;
const BASE_PRICE = 67500;

type MarketRegime = 'quiet' | 'range' | 'trend_up' | 'trend_down' | 'volatile';

type RegimeSettings = {
  volatility: number;
  drift: number;
  pull: number;
  spikeChance: number;
  spikeScale: number;
  candleLimit: number;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function pickRegime(rand: () => number): MarketRegime {
  const r = rand();
  if (r < 0.24) return 'quiet';
  if (r < 0.58) return 'range';
  if (r < 0.75) return 'trend_up';
  if (r < 0.92) return 'trend_down';
  return 'volatile';
}

function getHistorySettings(regime: MarketRegime, rand: () => number): RegimeSettings {
  switch (regime) {
    case 'quiet':
      return {
        volatility: 0.00035,
        drift: (rand() - 0.5) * 0.00003,
        pull: 0.00008,
        spikeChance: 0.001,
        spikeScale: 0.00045,
        candleLimit: 0.0035,
      };
    case 'range':
      return {
        volatility: 0.00055,
        drift: (rand() - 0.5) * 0.00005,
        pull: 0.00012,
        spikeChance: 0.0015,
        spikeScale: 0.0007,
        candleLimit: 0.005,
      };
    case 'trend_up':
      return {
        volatility: 0.00065,
        drift: 0.00008 + rand() * 0.00005,
        pull: 0.00006,
        spikeChance: 0.0018,
        spikeScale: 0.00085,
        candleLimit: 0.006,
      };
    case 'trend_down':
      return {
        volatility: 0.00065,
        drift: -0.00008 - rand() * 0.00005,
        pull: 0.00006,
        spikeChance: 0.0018,
        spikeScale: 0.00085,
        candleLimit: 0.006,
      };
    case 'volatile':
    default:
      return {
        volatility: 0.00095,
        drift: (rand() - 0.5) * 0.00008,
        pull: 0.00004,
        spikeChance: 0.0025,
        spikeScale: 0.0012,
        candleLimit: 0.008,
      };
  }
}

function getLiveSettings(regime: MarketRegime): RegimeSettings {
  switch (regime) {
    case 'quiet':
      return {
        volatility: 0.00004,
        drift: 0,
        pull: 0.00002,
        spikeChance: 0.0005,
        spikeScale: 0.00018,
        candleLimit: 0.00045,
      };
    case 'range':
      return {
        volatility: 0.00007,
        drift: 0,
        pull: 0.00003,
        spikeChance: 0.0008,
        spikeScale: 0.00024,
        candleLimit: 0.00065,
      };
    case 'trend_up':
      return {
        volatility: 0.00008,
        drift: 0.000015,
        pull: 0.000015,
        spikeChance: 0.001,
        spikeScale: 0.0003,
        candleLimit: 0.00085,
      };
    case 'trend_down':
      return {
        volatility: 0.00008,
        drift: -0.000015,
        pull: 0.000015,
        spikeChance: 0.001,
        spikeScale: 0.0003,
        candleLimit: 0.00085,
      };
    case 'volatile':
    default:
      return {
        volatility: 0.00014,
        drift: 0,
        pull: 0.00001,
        spikeChance: 0.0016,
        spikeScale: 0.00045,
        candleLimit: 0.0012,
      };
  }
}

function generateHistory(): { candles: CandleData[]; lastPrice: number } {
  const rand = mulberry32(Date.now() % 100000);
  const candles: CandleData[] = [];
  const now = Date.now();
  const startTime = now - HISTORY_CANDLES * 60 * 1000;
  let price = BASE_PRICE;
  let anchorPrice = BASE_PRICE;
  let regime = pickRegime(rand);
  let regimeCountdown = Math.floor(rand() * 180) + 60;
  let trendBias = 0;

  for (let i = 0; i < HISTORY_CANDLES; i++) {
    if (regimeCountdown <= 0) {
      regime = pickRegime(rand);
      regimeCountdown = Math.floor(rand() * 180) + 60;
      anchorPrice = price;
      trendBias = (rand() - 0.5) * 0.00006;
    }
    regimeCountdown--;

    const settings = getHistorySettings(regime, rand);
    const open = price;
    let close = open;
    let high = open;
    let low = open;
    const subTicks = 10 + Math.floor(rand() * 6);

    for (let tick = 0; tick < subTicks; tick++) {
      const meanRevert = ((anchorPrice - close) / anchorPrice) * settings.pull;
      let movePct = settings.drift + trendBias + meanRevert + settings.volatility * (rand() - 0.5) * 2;

      if (rand() < settings.spikeChance) {
        movePct += (rand() - 0.5) * settings.spikeScale;
      }

      close *= 1 + movePct;
      high = Math.max(high, close);
      low = Math.min(low, close);
    }

    close = clamp(close, open * (1 - settings.candleLimit), open * (1 + settings.candleLimit));
    price = clamp(close, BASE_PRICE * 0.88, BASE_PRICE * 1.12);
    high = clamp(Math.max(high, open, price), open * 0.992, open * 1.012);
    low = clamp(Math.min(low, open, price), open * 0.988, open * 1.008);

    const candleTime = Math.floor((startTime + i * 60000) / 1000);
    candles.push({
      time: candleTime,
      open: roundPrice(open),
      high: roundPrice(Math.max(high, open, price)),
      low: roundPrice(Math.min(low, open, price)),
      close: roundPrice(price),
    });
  }

  return { candles, lastPrice: price };
}

class LivePriceEngine {
  price: number;
  anchorPrice: number;
  regime: MarketRegime = 'range';
  regimeCountdown = 0;
  momentum = 0;
  volatilityState = 0.00005;

  constructor(startPrice: number) {
    this.price = startPrice;
    this.anchorPrice = startPrice;
    this.switchRegime();
  }

  switchRegime() {
    const regime = pickRegime(Math.random);
    this.regime = regime;
    this.regimeCountdown = Math.floor(Math.random() * 600) + 220;
    this.anchorPrice = this.price;
    this.momentum = (Math.random() - 0.5) * 0.00004;
  }

  tick(): number {
    if (this.regimeCountdown <= 0) {
      this.switchRegime();
    }
    this.regimeCountdown--;

    const settings = getLiveSettings(this.regime);
    const targetVolatility = settings.volatility * (0.7 + Math.random() * 0.6);
    this.volatilityState = this.volatilityState * 0.92 + targetVolatility * 0.08;

    const noise = this.volatilityState * (Math.random() - 0.5) * 2;
    const meanRevert = ((this.anchorPrice - this.price) / this.anchorPrice) * settings.pull;
    let movePct = settings.drift + this.momentum + meanRevert + noise;

    if (Math.random() < settings.spikeChance) {
      movePct += (Math.random() - 0.5) * settings.spikeScale;
    }

    movePct = clamp(movePct, -settings.candleLimit, settings.candleLimit);
    this.price *= 1 + movePct;
    this.price = clamp(this.price, BASE_PRICE * 0.9, BASE_PRICE * 1.1);
    this.momentum = clamp(this.momentum * 0.94 + noise * 0.2 + settings.drift * 0.2, -0.00018, 0.00018);

    return roundPrice(this.price);
  }
}

export function useSimulatedPrice() {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const candlesRef = useRef<CandleData[]>([]);

  useEffect(() => {
    const { candles: history, lastPrice } = generateHistory();
    candlesRef.current = history;
    setCandles(history);
    setCurrentPrice(lastPrice);
    setConnected(true);

    const engine = new LivePriceEngine(lastPrice);

    const interval = setInterval(() => {
      const price = engine.tick();
      setCurrentPrice(price);

      const nowSec = Math.floor(Date.now() / 1000);
      const candleTime = nowSec - (nowSec % 60);
      const nextCandles = [...candlesRef.current];
      const last = nextCandles[nextCandles.length - 1];

      if (!last) return;

      if (last.time === candleTime) {
        nextCandles[nextCandles.length - 1] = {
          ...last,
          close: price,
          high: Math.max(last.high, price),
          low: Math.min(last.low, price),
        };
      } else if (candleTime > last.time) {
        nextCandles.push({
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
        });
      }

      if (nextCandles.length > MAX_CANDLES) {
        nextCandles.splice(0, nextCandles.length - MAX_CANDLES);
      }

      candlesRef.current = nextCandles;
      setCandles(nextCandles);
    }, TICK_INTERVAL);

    return () => {
      clearInterval(interval);
      setConnected(false);
    };
  }, []);

  return { currentPrice, priceChange: 0, candles, connected };
}
