import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';

export interface TickPoint {
  price: number;
  time: number; // ms timestamp
}

export function useBinanceWebSocket(symbol: string) {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const [ticks, setTicks] = useState<TickPoint[]>([]);
  const candlesRef = useRef<CandleData[]>([]);
  const ticksRef = useRef<TickPoint[]>([]);
  const rafRef = useRef<number>(0);
  const pendingRef = useRef(false);

  const MAX_TICKS = 300; // keep last 300 ticks for the real-time line

  const fetchHistoricalData = useCallback(async (sym: string) => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${sym.toUpperCase()}&interval=1m&limit=1000`
      );
      const data = await res.json();
      const historical: CandleData[] = data.map((k: any) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
      }));
      candlesRef.current = historical;
      setCandles(historical);
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  }, []);

  const fetch24hChange = useCallback(async (sym: string) => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${sym.toUpperCase()}`
      );
      const data = await res.json();
      setPriceChange(parseFloat(data.priceChangePercent));
    } catch (err) {
      console.error('Failed to fetch 24h change:', err);
    }
  }, []);

  useEffect(() => {
    const sym = symbol.toLowerCase();
    ticksRef.current = [];
    setTicks([]);

    fetchHistoricalData(sym);
    fetch24hChange(sym);

    const flush = () => {
      pendingRef.current = false;
      setCandles([...candlesRef.current]);
      setTicks([...ticksRef.current]);
    };

    const scheduleFlush = () => {
      if (!pendingRef.current) {
        pendingRef.current = true;
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    // Trade stream — every tick
    const tradeWs = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    tradeWs.onopen = () => setConnected(true);
    tradeWs.onclose = () => setConnected(false);
    tradeWs.onerror = () => setConnected(false);
    tradeWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      const tradeTimeMs = data.T;
      const tradeTimeSec = Math.floor(tradeTimeMs / 1000);
      const candleTime = tradeTimeSec - (tradeTimeSec % 60);

      setCurrentPrice(price);

      // Add to tick buffer
      ticksRef.current.push({ price, time: tradeTimeMs });
      if (ticksRef.current.length > MAX_TICKS) {
        ticksRef.current = ticksRef.current.slice(-MAX_TICKS);
      }

      // Update current candle
      const arr = candlesRef.current;
      if (arr.length > 0) {
        const last = arr[arr.length - 1];
        if (last.time === candleTime) {
          last.close = price;
          if (price > last.high) last.high = price;
          if (price < last.low) last.low = price;
        } else if (candleTime > last.time) {
          arr.push({ time: candleTime, open: price, high: price, low: price, close: price });
        }
      }
      scheduleFlush();
    };

    // Kline stream — authoritative OHLC
    const klineWs = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@kline_1m`);
    klineWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k;
      const candle: CandleData = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      };
      const arr = candlesRef.current;
      const idx = arr.findIndex(c => c.time === candle.time);
      if (idx >= 0) {
        arr[idx] = candle;
      } else {
        arr.push(candle);
      }
      scheduleFlush();
    };

    return () => {
      tradeWs.close();
      klineWs.close();
      cancelAnimationFrame(rafRef.current);
    };
  }, [symbol, fetchHistoricalData, fetch24hChange]);

  return { currentPrice, priceChange, candles, connected, ticks };
}
