import { useState, useCallback, useEffect, useRef } from 'react';
import { TradingPair, Trade, TRADING_PAIRS } from '@/lib/types';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import Sidebar from '@/components/trading/Sidebar';
import AssetTabs from '@/components/trading/AssetTabs';
import TradingChart from '@/components/trading/TradingChart';
import TradePanel from '@/components/trading/TradePanel';
import TradeHistory from '@/components/trading/TradeHistory';
import AssetSelector from '@/components/trading/AssetSelector';
import WinLossOverlay from '@/components/trading/WinLossOverlay';
import BalanceHeader from '@/components/trading/BalanceHeader';
import { Info } from 'lucide-react';

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

  const { currentPrice, priceChange, candles, connected } = useBinanceWebSocket(activePair.binanceSymbol);

  // Update prices map
  useEffect(() => {
    if (currentPrice > 0) {
      setPrices(prev => ({ ...prev, [activePair.symbol]: currentPrice }));
    }
    if (priceChange !== 0) {
      setChanges(prev => ({ ...prev, [activePair.symbol]: priceChange }));
    }
  }, [currentPrice, priceChange, activePair.symbol]);

  // Trade settlement
  useEffect(() => {
    if (!activeTrade) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= activeTrade.endTime) {
        clearInterval(interval);
        // Settle trade
        const exitPrice = currentPrice;
        const won = activeTrade.direction === 'up'
          ? exitPrice > activeTrade.entryPrice
          : exitPrice < activeTrade.entryPrice;

        const fee = activeTrade.amount * 0.10;
        const netPool = activeTrade.amount - fee;
        const payout = won ? activeTrade.amount + netPool : 0;

        const settled: Trade = {
          ...activeTrade,
          exitPrice,
          result: won ? 'win' : 'loss',
          payout,
        };

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
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <BalanceHeader balance={balance} />

        {/* Asset tabs */}
        <AssetTabs
          pairs={TRADING_PAIRS}
          activePair={activePair}
          onSelect={setActivePair}
          onOpenSelector={() => setShowSelector(true)}
          prices={prices}
        />

        {/* Chart info bar */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-card border-b border-border">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success' : 'bg-danger'}`} />
            <span className="text-[10px] text-muted-foreground font-mono">
              {new Date().toLocaleTimeString()} UTC
            </span>
          </div>
          <button className="flex items-center gap-1 text-primary text-[11px] font-medium hover:underline">
            <Info size={12} />
            PAIR INFORMATION
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex min-h-0">
          {/* Chart + history */}
          <div className="flex-1 flex flex-col relative min-w-0">
            <div className="flex-1 min-h-0">
              <TradingChart candles={candles} currentPrice={currentPrice} />
            </div>

            {/* Asset selector overlay */}
            {showSelector && (
              <AssetSelector
                onSelect={setActivePair}
                onClose={() => setShowSelector(false)}
                prices={prices}
                changes={changes}
              />
            )}
          </div>

          {/* Trade panel with integrated history */}
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

      {/* Win/Loss overlay */}
      <WinLossOverlay
        result={tradeResult?.result || null}
        amount={tradeResult?.amount || 0}
        onDismiss={() => setTradeResult(null)}
      />
    </div>
  );
}
