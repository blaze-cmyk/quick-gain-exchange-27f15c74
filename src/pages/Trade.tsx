import { useState, useCallback, useEffect, useRef } from 'react';
import { TradingPair, Trade, TRADING_PAIRS, TIMEFRAMES } from '@/lib/types';
import { usePairData } from '@/hooks/usePairData';
import { useAllPairsPrices } from '@/hooks/useAllPairsPrices';
import { useForexPrices } from '@/hooks/useForexPrices';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/trading/Sidebar';
import AssetTabs from '@/components/trading/AssetTabs';
import CustomChart from '@/components/trading/CustomChart';
import TradePanel from '@/components/trading/TradePanel';
import MobileTradePanel from '@/components/trading/MobileTradePanel';
import AssetSelector from '@/components/trading/AssetSelector';
import WinLossOverlay from '@/components/trading/WinLossOverlay';
import TradeNotification from '@/components/trading/TradeNotification';
import TradeResultToast from '@/components/trading/TradeResultToast';
import BalanceHeader from '@/components/trading/BalanceHeader';
import ChartToolbar from '@/components/trading/ChartToolbar';
import ProbabilityBar from '@/components/trading/ProbabilityBar';
import { Info } from 'lucide-react';

export default function TradePage() {
  const [activePair, setActivePair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [pinnedPairs, setPinnedPairs] = useState<TradingPair[]>(TRADING_PAIRS.slice(0, 3));
  const [activeTab, setActiveTab] = useState('trade');
  const [showSelector, setShowSelector] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [tradeResult, setTradeResult] = useState<{ result: 'win' | 'loss'; amount: number } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(TIMEFRAMES[0].seconds);
  const [lastSettledTrade, setLastSettledTrade] = useState<Trade | null>(null);
  const [lastOpenedTrade, setLastOpenedTrade] = useState<Trade | null>(null);
  const { currentPrice, priceChange, candles, connected } = usePairData(activePair);
  const { prices: allPrices, changes: allChanges } = useAllPairsPrices();
  const { prices: forexPrices, changes: forexChanges } = useForexPrices();
  const isMobile = useIsMobile();

  const prices = { ...allPrices, ...forexPrices, ...(currentPrice > 0 ? { [activePair.symbol]: currentPrice } : {}) };
  const changes = { ...allChanges, ...forexChanges, ...(priceChange !== 0 ? { [activePair.symbol]: priceChange } : {}) };

  // Settle active trades
  useEffect(() => {
    if (activeTrades.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const settled: Trade[] = [];
      const remaining: Trade[] = [];

      for (const trade of activeTrades) {
        if (now >= trade.endTime) {
          const exitPrice = currentPrice;
          const won = trade.direction === 'up'
            ? exitPrice > trade.entryPrice
            : exitPrice < trade.entryPrice;
          const fee = trade.amount * 0.10;
          const netPool = trade.amount - fee;
          const payout = won ? trade.amount + netPool : 0;
          settled.push({ ...trade, exitPrice, result: won ? 'win' : 'loss', payout });
        } else {
          remaining.push(trade);
        }
      }

      if (settled.length > 0) {
        setTrades(prev => [...settled, ...prev]);
        settled.forEach(s => setBalance(prev => prev + (s.payout || 0)));
        setActiveTrades(remaining);
        // Show result for last settled trade
        const last = settled[settled.length - 1];
        setLastSettledTrade(last);
        const fee = last.amount * 0.10;
        const netPool = last.amount - fee;
        setTradeResult({
          result: last.result as 'win' | 'loss',
          amount: last.result === 'win' ? netPool : last.amount,
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeTrades, currentPrice]);

  const handleTrade = useCallback((direction: 'up' | 'down', amount: number, duration: number) => {
    if (amount > balance) return;
    const now = Date.now();
    const trade: Trade = {
      id: crypto.randomUUID(),
      pair: activePair,
      direction,
      amount,
      entryPrice: currentPrice,
      duration,
      startTime: now,
      endTime: now + duration * 1000,
    };
    setBalance(prev => prev - amount);
    setActiveTrades(prev => [...prev, trade]);
    setLastOpenedTrade(trade);
  }, [balance, activePair, currentPrice]);

  const selectPair = (pair: TradingPair) => {
    setActivePair(pair);
    if (!pinnedPairs.find(p => p.symbol === pair.symbol)) {
      setPinnedPairs(prev => [...prev, pair]);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {!isMobile && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}

      <div className="flex-1 flex flex-col min-w-0">
        <BalanceHeader balance={balance} />

        <div className={`flex-1 flex ${isMobile ? 'flex-col' : ''} min-h-0`}>
          {!isMobile && <ProbabilityBar candles={candles} currentPrice={currentPrice} />}

          <div className="flex-1 relative min-w-0 min-h-0">
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-[80px] left-3 z-10 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5">
                  <div className={`w-[6px] h-[6px] rounded-full ${connected ? 'bg-success' : 'bg-danger'}`} />
                  <span className="text-[10px] text-muted-foreground font-sans">
                    {new Date().toLocaleTimeString()} UTC
                  </span>
                </div>
                <button className="flex items-center gap-1 text-primary text-[11px] font-medium hover:underline w-fit">
                  <Info size={12} />
                  PAIR INFORMATION
                </button>
              </motion.div>
            )}

            <TradeNotification trade={lastOpenedTrade} />

            <AssetTabs
              pairs={pinnedPairs}
              activePair={activePair}
              onSelect={selectPair}
              onRemove={(pair) => {
                setPinnedPairs(prev => prev.filter(p => p.symbol !== pair.symbol));
                if (activePair.symbol === pair.symbol && pinnedPairs.length > 1) {
                  const remaining = pinnedPairs.filter(p => p.symbol !== pair.symbol);
                  setActivePair(remaining[0]);
                }
              }}
              onOpenSelector={() => setShowSelector(true)}
              prices={prices}
              activeTrades={activeTrades}
              currentPrice={currentPrice}
            />

            <CustomChart
              candles={candles}
              currentPrice={currentPrice}
              payout={activePair.payout}
              connected={connected}
              activeTrades={activeTrades}
              completedTrades={trades}
              selectedDuration={selectedDuration}
            />

            {!isMobile && <ChartToolbar selectedTimeframe="1m" />}

            <TradeResultToast
              trade={lastSettledTrade}
              onDismiss={() => setLastSettledTrade(null)}
            />

            <AnimatePresence>
              {showSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-20"
                >
                  <AssetSelector
                    onSelect={(pair) => {
                      selectPair(pair);
                      setShowSelector(false);
                    }}
                    onClose={() => setShowSelector(false)}
                    prices={prices}
                    changes={changes}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isMobile ? (
            <MobileTradePanel
              pair={activePair}
              currentPrice={currentPrice}
              balance={balance}
              onTrade={handleTrade}
            />
          ) : (
            <TradePanel
              pair={activePair}
              currentPrice={currentPrice}
              balance={balance}
              onTrade={handleTrade}
              activeTrades={activeTrades}
              trades={trades}
              onDurationChange={setSelectedDuration}
            />
          )}
        </div>
      </div>

      {isMobile && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}

      <WinLossOverlay
        result={tradeResult?.result || null}
        amount={tradeResult?.amount || 0}
        onDismiss={() => setTradeResult(null)}
      />
    </div>
  );
}
