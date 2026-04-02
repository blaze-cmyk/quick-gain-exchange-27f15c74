import { useState, useCallback, useEffect } from 'react';
import { TradingPair, Trade, TRADING_PAIRS } from '@/lib/types';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/trading/Sidebar';
import AssetTabs from '@/components/trading/AssetTabs';
import CustomChart from '@/components/trading/CustomChart';
import TradePanel from '@/components/trading/TradePanel';
import AssetSelector from '@/components/trading/AssetSelector';
import WinLossOverlay from '@/components/trading/WinLossOverlay';
import BalanceHeader from '@/components/trading/BalanceHeader';
import { Info, Pencil } from 'lucide-react';

export default function TradePage() {
  const [activePair, setActivePair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [activeTab, setActiveTab] = useState('trade');
  const [showSelector, setShowSelector] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [tradeResult, setTradeResult] = useState<{ result: 'win' | 'loss'; amount: number } | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});

  const { currentPrice, priceChange, candles, connected, ticks } = useBinanceWebSocket(activePair.binanceSymbol);

  useEffect(() => {
    if (currentPrice > 0) {
      setPrices(prev => ({ ...prev, [activePair.symbol]: currentPrice }));
    }
    if (priceChange !== 0) {
      setChanges(prev => ({ ...prev, [activePair.symbol]: priceChange }));
    }
  }, [currentPrice, priceChange, activePair.symbol]);

  useEffect(() => {
    if (!activeTrade) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= activeTrade.endTime) {
        clearInterval(interval);
        const exitPrice = currentPrice;
        const won = activeTrade.direction === 'up'
          ? exitPrice > activeTrade.entryPrice
          : exitPrice < activeTrade.entryPrice;
        const fee = activeTrade.amount * 0.10;
        const netPool = activeTrade.amount - fee;
        const payout = won ? activeTrade.amount + netPool : 0;
        const settled: Trade = { ...activeTrade, exitPrice, result: won ? 'win' : 'loss', payout };
        setTrades(prev => [settled, ...prev]);
        setBalance(prev => prev + payout);
        setActiveTrade(null);
        setTradeResult({ result: won ? 'win' : 'loss', amount: won ? netPool : activeTrade.amount });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeTrade, currentPrice]);

  const handleTrade = useCallback((direction: 'up' | 'down', amount: number, duration: number) => {
    if (amount > balance || activeTrade) return;
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
    setActiveTrade(trade);
  }, [balance, activeTrade, activePair, currentPrice]);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <BalanceHeader balance={balance} />

        <div className="flex-1 flex min-h-0">
          {/* Chart area */}
          <div className="flex-1 relative min-w-0">
            {/* Payout % - left side overlay like Quotex */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-[52px] left-0 z-10"
            >
              <div className="bg-success text-success-foreground text-xs font-bold px-2 py-1 rounded-r-md">
                {activePair.payout}%
              </div>
            </motion.div>

            {/* Connection status + pair info - left overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-[80px] left-3 z-10 flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5">
                <div className={`w-[6px] h-[6px] rounded-full ${connected ? 'bg-success' : 'bg-danger'}`} />
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date().toLocaleTimeString()} UTC
                </span>
              </div>
              <button className="flex items-center gap-1 text-primary text-[11px] font-medium hover:underline w-fit">
                <Info size={12} />
                PAIR INFORMATION
              </button>
            </motion.div>

            {/* Drawing tool + Timeframe - bottom left overlay like Quotex */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-[60px] left-3 z-10 flex flex-col gap-2"
            >
              <button className="w-8 h-8 rounded-md bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Pencil size={14} />
              </button>
              <div className="bg-secondary/80 backdrop-blur-sm rounded-md px-2.5 py-1 text-xs font-medium text-foreground">
                1m
              </div>
            </motion.div>

            {/* Asset tabs overlaid on chart */}
            <AssetTabs
              pairs={TRADING_PAIRS}
              activePair={activePair}
              onSelect={setActivePair}
              onOpenSelector={() => setShowSelector(true)}
              prices={prices}
            />

            {/* Custom canvas chart */}
            <CustomChart
              candles={candles}
              currentPrice={currentPrice}
              payout={activePair.payout}
              connected={connected}
              activeTrade={activeTrade}
            />

            {/* Asset selector overlay */}
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
                    onSelect={(pair) => { setActivePair(pair); setShowSelector(false); }}
                    onClose={() => setShowSelector(false)}
                    prices={prices}
                    changes={changes}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trade panel */}
          <TradePanel
            pair={activePair}
            currentPrice={currentPrice}
            balance={balance}
            onTrade={handleTrade}
            activeTrade={activeTrade}
            trades={trades}
          />
        </div>
      </div>

      <WinLossOverlay
        result={tradeResult?.result || null}
        amount={tradeResult?.amount || 0}
        onDismiss={() => setTradeResult(null)}
      />
    </div>
  );
}
