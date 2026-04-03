import { useEffect, useRef, useState } from 'react';
import { TRADING_PAIRS } from '@/lib/types';

/**
 * Fetches forex prices from Tiingo via edge function.
 * Polls every 10 seconds for live updates.
 */
export function useForexPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const intervalRef = useRef<number | null>(null);
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const forexPairs = TRADING_PAIRS.filter(p => p.category === 'forex');
    if (forexPairs.length === 0) return;

    const tickers = forexPairs.map(p => p.tiingoSymbol).join(',');
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const fetchPrices = async () => {
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/tiingo-prices?type=forex&tickers=${tickers}`,
          {
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
            },
          }
        );

        const json = await res.json();
        if (Array.isArray(json)) {
          const newPrices: Record<string, number> = {};
          const newChanges: Record<string, number> = {};

          for (const item of json) {
            const ticker = (item.ticker || '').toUpperCase();
            const midPrice = item.midPrice || ((item.bidPrice || 0) + (item.askPrice || 0)) / 2;
            if (midPrice > 0) {
              newPrices[ticker] = midPrice;
              const prev = prevPricesRef.current[ticker];
              if (prev && prev > 0) {
                newChanges[ticker] = ((midPrice - prev) / prev) * 100;
              } else {
                newChanges[ticker] = 0;
              }
            }
          }

          if (Object.keys(prevPricesRef.current).length === 0) {
            prevPricesRef.current = { ...newPrices };
          }

          setPrices(newPrices);
          setChanges(newChanges);
        }
      } catch (err) {
        console.error('Failed to fetch forex prices:', err);
      }
    };

    fetchPrices();
    intervalRef.current = window.setInterval(fetchPrices, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { prices, changes };
}
