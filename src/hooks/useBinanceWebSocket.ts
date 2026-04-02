import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';

interface TickData {
  price: number;
  time: number;
}

export function useBinanceWebSocket(symbol: string) {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const candleWsRef = useRef<WebSocket | null>(null);

  // Fetch historical klines
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
      setCandles(historical);
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  }, []);

  // Fetch 24h ticker for change
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

    // Price ticker WebSocket
    const tickerWs = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    tickerWs.onopen = () => setConnected(true);
    tickerWs.onclose = () => setConnected(false);
    tickerWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.p));
    };
    wsRef.current = tickerWs;

    // Kline WebSocket for live candles
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
      setCandles(prev => {
        const updated = [...prev];
        const lastIndex = updated.findIndex(c => c.time === candle.time);
        if (lastIndex >= 0) {
          updated[lastIndex] = candle;
        } else {
          updated.push(candle);
        }
        return updated;
      });
    };
    candleWsRef.current = klineWs;

    return () => {
      tickerWs.close();
      klineWs.close();
    };
  }, [symbol, fetchHistoricalData, fetch24hChange]);

  return { currentPrice, priceChange, candles, connected };
}
