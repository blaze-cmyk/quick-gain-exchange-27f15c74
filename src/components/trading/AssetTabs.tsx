import { TradingPair, Trade } from '@/lib/types';
import { Plus, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import CryptoIcon from './CryptoIcons';

interface AssetTabsProps {
  pairs: TradingPair[];
  activePair: TradingPair;
  onSelect: (pair: TradingPair) => void;
  onRemove: (pair: TradingPair) => void;
  onOpenSelector: () => void;
  prices: Record<string, number>;
  activeTrades?: Trade[];
  currentPrice?: number;
}

export default function AssetTabs({ pairs, activePair, onSelect, onRemove, onOpenSelector, prices, activeTrades = [], currentPrice = 0 }: AssetTabsProps) {
  const getTabPnL = (pair: TradingPair) => {
    const pairTrades = activeTrades.filter(t => t.pair.symbol === pair.symbol);
    if (pairTrades.length === 0 || currentPrice <= 0) return null;
    let totalPnL = 0;
    for (const trade of pairTrades) {
      const isUp = trade.direction === 'up';
      const priceDiff = currentPrice - trade.entryPrice;
      const isWinning = isUp ? priceDiff > 0 : priceDiff < 0;
      const fee = trade.amount * 0.10;
      const netPool = trade.amount - fee;
      totalPnL += isWinning ? netPool : -trade.amount;
    }
    return totalPnL;
  };

  return (
    <div className="absolute top-2 left-3 right-[10px] z-10 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
      <button
        onClick={onOpenSelector}
        className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/20"
      >
        <Plus size={16} />
      </button>

      {pairs.map((pair, index) => {
        const isActive = pair.symbol === activePair.symbol;
        const base = pair.symbol.replace('USDT', '');
        const pnl = getTabPnL(pair);

        return (
          <motion.div
            key={pair.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            className="relative flex-shrink-0 mt-1"
          >
            <button
              onClick={() => onSelect(pair)}
              className={`flex items-center gap-2 pl-3 pr-7 py-1.5 rounded-md transition-all duration-200 min-w-[100px] border border-white/[0.07] backdrop-blur-sm ${
                isActive
                  ? 'bg-white/[0.12] shadow-[0_0_12px_rgba(255,106,0,0.15)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center -space-x-1.5">
                <CryptoIcon symbol={base} size={20} />
                <CryptoIcon symbol="USD" size={12} />
              </div>
              <div className="text-left">
                <div className="flex items-center">
                  <span className="text-[11px] font-semibold text-foreground">{pair.displayName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold ${pair.payout >= 90 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {pair.payout}%
                  </span>
                  {pnl !== null && (
                    <span className={`text-[10px] font-bold tabular-nums px-1 py-0.5 rounded ${
                      pnl >= 0 ? 'text-profit bg-profit/10' : 'text-loss bg-loss/10'
                    }`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)} $
                    </span>
                  )}
                </div>
              </div>
            </button>
            {pairs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(pair);
                }}
                className="group absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted/80 hover:bg-destructive flex items-center justify-center transition-colors"
              >
                <X size={8} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
