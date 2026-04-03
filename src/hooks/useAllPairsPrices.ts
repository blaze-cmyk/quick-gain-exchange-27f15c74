import { useEffect, useRef, useState } from 'react';
import { TRADING_PAIRS } from '@/lib/types';

/**
 * Single combined WebSocket stream tracking live prices + 24h changes
 * for ALL trading pairs simultaneously via Binance combined streams.
 * No API key required.
 */
export function useAllPairsPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const pricesRef = useRef<Record<string, number>>({});
  const changesRef = useRef<Record<string, number>>({});
  const rafRef = useRef<number>(0);
  const pendingRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  useEffect(() => {
    let destroyed = false;

    const flush = () => {
      pendingRef.current = false;
      if (!destroyed) {
        setPrices({ ...pricesRef.current });
      }
    };

    const scheduleFlush = () => {
      if (!pendingRef.current) {
        pendingRef.current = true;
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    // Fetch initial 24h ticker for all pairs in one call
    const fetchAll24h = async () => {
      try {
        const cryptoPairs = TRADING_PAIRS.filter(p => p.category === 'crypto');
        const symbols = cryptoPairs.map(p => p.binanceSymbol.toUpperCase());
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const newPrices: Record<string, number> = {};
          const newChanges: Record<string, number> = {};
          for (const t of data) {
            const sym = t.symbol;
            newPrices[sym] = parseFloat(t.lastPrice);
            newChanges[sym] = parseFloat(t.priceChangePercent);
          }
          pricesRef.current = { ...pricesRef.current, ...newPrices };
          changesRef.current = { ...changesRef.current, ...newChanges };
          if (!destroyed) {
            setPrices({ ...pricesRef.current });
            setChanges({ ...changesRef.current });
          }
        }
      } catch (err) {
        console.error('Failed to fetch 24h tickers:', err);
      }
    };

    // Combined stream for all pairs using miniTicker (lightweight, ~1s updates)
    const connectCombinedStream = () => {
      if (reconnectRef.current !== null) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      const streams = TRADING_PAIRS.map(p => `${p.binanceSymbol}@miniTicker`).join('/');
      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (destroyed) return;
        const msg = JSON.parse(event.data);
        const data = msg.data;
        if (!data || !data.s) return;

        const sym = data.s; // e.g. BTCUSDT
        const price = parseFloat(data.c); // close price
        if (Number.isFinite(price)) {
          pricesRef.current[sym] = price;
          // Calculate 24h change from open
          const openPrice = parseFloat(data.o);
          if (Number.isFinite(openPrice) && openPrice > 0) {
            changesRef.current[sym] = ((price - openPrice) / openPrice) * 100;
          }
          scheduleFlush();
        }
      };

      ws.onerror = () => {
        if (!destroyed) ws.close();
      };

      ws.onclose = () => {
        if (!destroyed) {
          reconnectRef.current = window.setTimeout(connectCombinedStream, 2000);
        }
      };
    };

    fetchAll24h();
    connectCombinedStream();

    return () => {
      destroyed = true;
      if (reconnectRef.current !== null) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { prices, changes };
}
