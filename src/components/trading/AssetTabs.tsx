import { TradingPair } from '@/lib/types';
import { Plus, X, ChevronDown } from 'lucide-react';

interface AssetTabsProps {
  pairs: TradingPair[];
  activePair: TradingPair;
  onSelect: (pair: TradingPair) => void;
  onOpenSelector: () => void;
  prices: Record<string, number>;
}

export default function AssetTabs({ pairs, activePair, onSelect, onOpenSelector, prices }: AssetTabsProps) {
  return (
    <div className="absolute top-0 left-0 z-10 flex items-center gap-1 px-2 py-2">
      <button
        onClick={onOpenSelector}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors shadow-lg"
      >
        <Plus size={18} />
      </button>

      {pairs.map((pair) => {
        const isActive = pair.symbol === activePair.symbol;
        return (
          <button
            key={pair.symbol}
            onClick={() => onSelect(pair)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 min-w-[120px] backdrop-blur-md ${
              isActive
                ? 'bg-card/95 border border-border shadow-lg'
                : 'bg-card/60 hover:bg-card/80'
            }`}
          >
            <span className="text-lg">{pair.icon}</span>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground">{pair.displayName}</span>
                {isActive && <ChevronDown size={10} className="text-muted-foreground" />}
              </div>
              <div className={`text-[10px] font-medium ${pair.payout >= 90 ? 'text-success' : 'text-muted-foreground'}`}>
                {pair.payout}%
              </div>
            </div>
            {isActive && (
              <X size={12} className="ml-1 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}
