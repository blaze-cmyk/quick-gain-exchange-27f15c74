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
    <div className="absolute top-2 left-2 right-[10px] z-10 flex items-center gap-1 overflow-x-auto scrollbar-hide">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenSelector}
        className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
      >
        <Plus size={16} />
      </motion.button>

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
            className="relative flex-shrink-0"
          >
            <button
              onClick={() => onSelect(pair)}
              className={`flex items-center gap-2 pl-3 pr-7 py-1.5 rounded-md transition-all duration-200 min-w-[100px] ${
                isActive
                  ? 'glass border border-primary/30'
                  : 'bg-card/40 backdrop-blur-sm hover:bg-secondary border border-transparent'
              }`}
            >
              <div className="flex items-center -space-x-1.5">
                <CryptoIcon symbol={base} size={20} />
                <CryptoIcon symbol="USD" size={12} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold text-foreground">{pair.displayName}</span>
                  {isActive && <ChevronDown size={10} className="text-muted-foreground" />}
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
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-muted hover:bg-destructive flex items-center justify-center transition-colors"
              >
                <X size={9} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
