import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleData } from '@/lib/types';

const HISTORY_LIMIT = 1000;
const RECONNECT_DELAY_MS = 1200;

/**
 * Fetches forex candle data + live price from Tiingo via edge function.
 * Polls every 5 seconds for "live" updates since Tiingo free tier doesn't have WS for forex.
 */
export function useTiingoForex(tiingoSymbol: string) {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [connected, setConnected] = useState(false);
  const candlesRef = useRef<CandleData[]>([]);
  const intervalRef = useRef<number | null>(null);
  const openPriceRef = useRef<number>(0);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
  };

  const fetchCandles = useCallback(async (sym: string) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/tiingo-prices?endpoint=candles&ticker=${sym}&resampleFreq=1min`,
        { headers }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const historical: CandleData[] = data.map((item: any) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        candlesRef.current = historical;
        setCandles(historical);
        setConnected(true);

        const lastClose = historical[historical.length - 1]?.close ?? 0;
        if (lastClose > 0) setCurrentPrice(lastClose);

        // Store open price for 24h change calc
        if (openPriceRef.current === 0 && historical.length > 0) {
          openPriceRef.current = historical[0].open;
        }
      }
    } catch (err) {
      console.error('Failed to fetch forex candles:', err);
      setConnected(false);
    }
  }, [projectId, anonKey]);

  const fetchTopPrice = useCallback(async (sym: string) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/tiingo-prices?type=forex&tickers=${sym}`,
        { headers }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const midPrice = item.midPrice || ((item.bidPrice || 0) + (item.askPrice || 0)) / 2;
        if (midPrice > 0) {
          setCurrentPrice(midPrice);
          setConnected(true);

          // Update last candle with live price
          const arr = candlesRef.current;
          if (arr.length > 0) {
            const now = Math.floor(Date.now() / 1000);
            const candleTime = now - (now % 60);
            const last = arr[arr.length - 1];

            if (last.time === candleTime) {
              last.close = midPrice;
              if (midPrice > last.high) last.high = midPrice;
              if (midPrice < last.low) last.low = midPrice;
            } else if (candleTime > last.time) {
              arr.push({
                time: candleTime,
                open: midPrice,
                high: midPrice,
                low: midPrice,
                close: midPrice,
              });
              if (arr.length > HISTORY_LIMIT) arr.splice(0, arr.length - HISTORY_LIMIT);
            }
            setCandles([...arr]);
          }

          // Calculate 24h change
          if (openPriceRef.current > 0) {
            setPriceChange(((midPrice - openPriceRef.current) / openPriceRef.current) * 100);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch forex top price:', err);
    }
  }, [projectId, anonKey]);

  useEffect(() => {
    if (!tiingoSymbol) return;
    let destroyed = false;
    const sym = tiingoSymbol.toLowerCase();
    openPriceRef.current = 0;

    // Fetch historical candles first, then start polling live price
    fetchCandles(sym).then(() => {
      if (!destroyed) fetchTopPrice(sym);
    });

    intervalRef.current = window.setInterval(() => {
      if (!destroyed) fetchTopPrice(sym);
    }, 5000);

    return () => {
      destroyed = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tiingoSymbol, fetchCandles, fetchTopPrice]);

  return { currentPrice, priceChange, candles, connected };
}
