import { TradingPair, Trade } from '@/lib/types';
import { Plus, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import CryptoIcon from './CryptoIcons';

interface AssetTabsProps {
  pairs: TradingPair[];
  activePair: TradingPair;
  onSelect: (pair: TradingPair) => void;
  onOpenSelector: () => void;
  prices: Record<string, number>;
  activeTrade?: Trade | null;
  currentPrice?: number;
}

export default function AssetTabs({ pairs, activePair, onSelect, onOpenSelector, prices, activeTrade, currentPrice = 0 }: AssetTabsProps) {
  // Calculate live P&L for active trade on this pair
  const getTabPnL = (pair: TradingPair) => {
    if (!activeTrade || activeTrade.pair.symbol !== pair.symbol || currentPrice <= 0) return null;
    const isUp = activeTrade.direction === 'up';
    const priceDiff = currentPrice - activeTrade.entryPrice;
    const isWinning = isUp ? priceDiff > 0 : priceDiff < 0;
    const fee = activeTrade.amount * 0.10;
    const netPool = activeTrade.amount - fee;
    return isWinning ? netPool : -activeTrade.amount;
  };

  return (
    <div className="absolute top-2 left-2 right-[10px] z-10 flex items-center gap-1.5 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenSelector}
        className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
      >
        <Plus size={18} />
      </motion.button>

      {pairs.map((pair, index) => {
        const isActive = pair.symbol === activePair.symbol;
        const base = pair.symbol.replace('USDT', '');
        const pnl = getTabPnL(pair);

        return (
          <motion.button
            key={pair.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(pair)}
            className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-200 min-w-[110px] ${
              isActive
                ? 'bg-card border border-border shadow-lg'
                : 'bg-card/50 backdrop-blur-sm hover:bg-card/70 border border-transparent'
            }`}
          >
            <div className="flex items-center -space-x-1.5">
              <CryptoIcon symbol={base} size={22} />
              <CryptoIcon symbol="USD" size={14} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-foreground">{pair.displayName}</span>
                {isActive && <ChevronDown size={10} className="text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold ${pair.payout >= 90 ? 'text-success' : 'text-muted-foreground'}`}>
                  {pair.payout}%
                </span>
                {pnl !== null && (
                  <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                    pnl >= 0 ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
                  }`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)} $
                  </span>
                )}
              </div>
            </div>
            {isActive && (
              <X size={11} className="ml-auto text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
