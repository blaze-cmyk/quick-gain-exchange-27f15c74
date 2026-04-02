import { TradingPair } from '@/lib/types';
import { Plus, X } from 'lucide-react';

interface AssetTabsProps {
  pairs: TradingPair[];
  activePair: TradingPair;
  onSelect: (pair: TradingPair) => void;
  onOpenSelector: () => void;
  prices: Record<string, number>;
}

export default function AssetTabs({ pairs, activePair, onSelect, onOpenSelector, prices }: AssetTabsProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-2 bg-card border-b border-border overflow-x-auto">
      <button
        onClick={onOpenSelector}
        className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors"
      >
        <Plus size={18} />
      </button>

      {pairs.map((pair) => {
        const isActive = pair.symbol === activePair.symbol;
        const price = prices[pair.symbol] || pair.price;
        return (
          <button
            key={pair.symbol}
            onClick={() => onSelect(pair)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 min-w-[140px] ${
              isActive
                ? 'bg-accent border border-primary/30'
                : 'hover:bg-accent/50'
            }`}
          >
            <span className="text-lg">{pair.icon}</span>
            <div className="text-left">
              <div className="text-xs font-semibold text-foreground">{pair.displayName}</div>
              <div className={`text-[10px] font-medium ${pair.payout >= 90 ? 'text-success' : 'text-muted-foreground'}`}>
                {pair.payout}%
              </div>
            </div>
            {isActive && (
              <X size={14} className="ml-auto text-muted-foreground hover:text-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}
