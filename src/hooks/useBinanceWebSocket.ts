import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';

const HISTORY_LIMIT = 1000;
const RECONNECT_DELAY_MS = 1200;

export function useBinanceWebSocket(symbol: string) {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const candlesRef = useRef<CandleData[]>([]);
  const rafRef = useRef<number>(0);
  const pendingRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const fetchHistoricalData = useCallback(async (sym: string) => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${sym.toUpperCase()}&interval=1m&limit=${HISTORY_LIMIT}`
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
      const tradeTimeSec = Math.floor(tradeTimeMs / 1000);
      const candleTime = tradeTimeSec - (tradeTimeSec % 60);
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

    const connectTradeStream = () => {
      clearReconnect();

      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!destroyed) {
          setConnected(true);
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

    fetchHistoricalData(sym);
    fetch24hChange(sym);
    connectTradeStream();

    return () => {
      destroyed = true;
      setConnected(false);
      clearReconnect();
      wsRef.current?.close();
      cancelAnimationFrame(rafRef.current);
    };
  }, [symbol, fetchHistoricalData, fetch24hChange]);

  return { currentPrice, priceChange, candles, connected };
}
