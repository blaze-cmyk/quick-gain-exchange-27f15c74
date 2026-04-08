import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';

const HISTORY_LIMIT = 1000;
const RECONNECT_DELAY_MS = 1200;
const MICRO_TICK_MS = 50; // interpolate every 50ms for ultra-smooth feel

const INTERVAL_SECONDS: Record<string, number> = {
  '1s': 1, '1m': 60, '3m': 180, '5m': 300, '15m': 900, '30m': 1800,
  '1h': 3600, '2h': 7200, '4h': 14400, '1d': 86400,
};

/** Tiny gaussian noise for micro-interpolation */
function microNoise(price: number): number {
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random() || 0.0001;
  const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  // Scale noise relative to price — very subtle (0.001% – 0.003%)
  const magnitude = price * 0.000015;
  return g * magnitude;
}

export function useBinanceWebSocket(symbol: string, interval: string = '1m') {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const candlesRef = useRef<CandleData[]>([]);
  const rafRef = useRef<number>(0);
  const pendingRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const lastRealPriceRef = useRef<number>(0);
  const microTickRef = useRef<number | null>(null);

  const fetchHistoricalData = useCallback(async (sym: string, intv: string) => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${sym.toUpperCase()}&interval=${intv}&limit=${HISTORY_LIMIT}`
      );
      const data = await res.json();
      const historical: CandleData[] = Array.isArray(data)
        ? data.map((k: any) => ({
            time: Math.floor(k[0] / 1000),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
          }))
        : [];

      candlesRef.current = historical;
      setCandles(historical);

      const lastClose = historical[historical.length - 1]?.close ?? 0;
      if (lastClose > 0) {
        setCurrentPrice(lastClose);
        lastRealPriceRef.current = lastClose;
      }
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
    if (!symbol) return;
    const sym = symbol.toLowerCase();
    let destroyed = false;

    const flush = () => {
      pendingRef.current = false;
      if (!destroyed) {
        setCandles([...candlesRef.current]);
      }
    };

    const scheduleFlush = () => {
      if (!pendingRef.current) {
        pendingRef.current = true;
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    const clearReconnect = () => {
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const upsertLiveCandle = (price: number, tradeTimeMs: number) => {
      const bucketSec = INTERVAL_SECONDS[interval] || 60;
      const tradeTimeSec = Math.floor(tradeTimeMs / 1000);
      const candleTime = tradeTimeSec - (tradeTimeSec % bucketSec);
      const arr = candlesRef.current;

      if (arr.length === 0) {
        arr.push({
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
        });
        scheduleFlush();
        return;
      }

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

        if (arr.length > HISTORY_LIMIT) {
          arr.splice(0, arr.length - HISTORY_LIMIT);
        }
      }

      scheduleFlush();
    };

    // Micro-interpolation: inject tiny noise between real WS ticks
    const startMicroTick = () => {
      microTickRef.current = window.setInterval(() => {
        if (destroyed) return;
        const base = lastRealPriceRef.current;
        if (base <= 0) return;
        const jittered = base + microNoise(base);
        setCurrentPrice(jittered);
        // Also update the current candle with micro-movement
        upsertLiveCandle(jittered, Date.now());
      }, MICRO_TICK_MS);
    };

    const connectTradeStream = () => {
      clearReconnect();

      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@aggTrade`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!destroyed) {
          setConnected(true);
          startMicroTick();
        }
      };

      ws.onmessage = (event) => {
        if (destroyed) return;

        const data = JSON.parse(event.data);
        const price = Number.parseFloat(data.p);
        const tradeTimeMs = Number.parseInt(String(data.T), 10);

        if (!Number.isFinite(price) || !Number.isFinite(tradeTimeMs)) {
          return;
        }

        // Update the real anchor price for micro-interpolation
        lastRealPriceRef.current = price;
        setCurrentPrice(price);
        upsertLiveCandle(price, tradeTimeMs);
      };

      ws.onerror = () => {
        if (destroyed) return;
        setConnected(false);
        ws.close();
      };

      ws.onclose = () => {
        if (destroyed) return;
        setConnected(false);
        clearReconnect();
        reconnectTimeoutRef.current = window.setTimeout(connectTradeStream, RECONNECT_DELAY_MS);
      };
    };

    fetchHistoricalData(sym, interval);
    fetch24hChange(sym);
    connectTradeStream();

    return () => {
      destroyed = true;
      setConnected(false);
      clearReconnect();
      wsRef.current?.close();
      cancelAnimationFrame(rafRef.current);
      if (microTickRef.current !== null) {
        clearInterval(microTickRef.current);
        microTickRef.current = null;
      }
    };
  }, [symbol, interval, fetchHistoricalData, fetch24hChange]);

  return { currentPrice, priceChange, candles, connected };
}
