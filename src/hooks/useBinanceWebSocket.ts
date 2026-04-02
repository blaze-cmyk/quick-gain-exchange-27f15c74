import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';

export function useBinanceWebSocket(symbol: string) {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const candlesRef = useRef<CandleData[]>([]);

  // Keep ref in sync for mutation from trade ticks
  candlesRef.current = candles;

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

    fetchHistoricalData(sym);
    fetch24hChange(sym);

    // Single combined stream: trade ticks + kline
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${sym}@trade/${sym}@kline_1m`
    );

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    // Throttle candle state updates to ~60fps to avoid excessive re-renders
    let pendingUpdate = false;
    let rafId = 0;

    const flushCandles = () => {
      pendingUpdate = false;
      setCandles([...candlesRef.current]);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const stream = msg.stream as string;
      const data = msg.data;

      if (stream.endsWith('@trade')) {
        // Every single trade tick — update price + current candle immediately
        const price = parseFloat(data.p);
        const tradeTime = Math.floor(data.T / 1000);
        // Floor to current minute boundary
        const candleTime = tradeTime - (tradeTime % 60);

        setCurrentPrice(price);

        // Mutate the candles ref directly for speed
        const arr = candlesRef.current;
        if (arr.length > 0) {
          const last = arr[arr.length - 1];
          if (last.time === candleTime) {
            // Update existing candle in-place
            last.close = price;
            if (price > last.high) last.high = price;
            if (price < last.low) last.low = price;
          } else if (candleTime > last.time) {
            // New candle started
            arr.push({
              time: candleTime,
              open: price,
              high: price,
              low: price,
              close: price,
            });
          }
        }

        // Schedule a batched React state update
        if (!pendingUpdate) {
          pendingUpdate = true;
          rafId = requestAnimationFrame(flushCandles);
        }
      } else if (stream.endsWith('@kline_1m')) {
        // Kline provides authoritative OHLC — use it to correct any drift
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

        if (!pendingUpdate) {
          pendingUpdate = true;
          rafId = requestAnimationFrame(flushCandles);
        }
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      cancelAnimationFrame(rafId);
    };
  }, [symbol, fetchHistoricalData, fetch24hChange]);

  return { currentPrice, priceChange, candles, connected };
}
