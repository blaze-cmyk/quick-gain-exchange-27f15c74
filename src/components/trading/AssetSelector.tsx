import { TradingPair, TRADING_PAIRS } from '@/lib/types';
import { X, Search, Star } from 'lucide-react';
import { useState } from 'react';

interface AssetSelectorProps {
  onSelect: (pair: TradingPair) => void;
  onClose: () => void;
  prices: Record<string, number>;
  changes: Record<string, number>;
}

export default function AssetSelector({ onSelect, onClose, prices, changes }: AssetSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'crypto' | 'forex'>('crypto');

  const categories: { key: 'crypto' | 'forex'; label: string }[] = [
    { key: 'crypto', label: 'CRYPTO' },
    { key: 'forex', label: 'FOREX' },
  ];

  const filtered = TRADING_PAIRS.filter(p => {
    if (p.category !== activeCategory) return false;
    const q = search.toLowerCase();
    return p.displayName.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q) || (p.tiingoSymbol || '').toLowerCase().includes(q) || p.binanceSymbol.toLowerCase().includes(q);
  });

  const priceLabel = activeCategory === 'crypto' ? 'Price (USDT)' : 'Price';

  return (
    <div className="absolute top-0 left-0 z-50 w-[480px] h-full bg-card border-r border-border shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Select trade pair</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-1 px-4 py-2 border-b border-border">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
              activeCategory === cat.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            className="bg-transparent text-sm text-foreground outline-none flex-1 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border">
        <span className="flex-1">Name</span>
        <span className="w-24 text-right">{priceLabel}</span>
        <span className="w-20 text-right">24h</span>
        <span className="w-12 text-right">Payout</span>
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto"
        data-lenis-prevent
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#3A4255 #242833', overscrollBehavior: 'contain' }}
        onWheel={(e) => e.stopPropagation()}
      >
        {filtered.map(pair => {
          const change = changes[pair.symbol] || 0;
          const price = prices[pair.symbol];
          return (
            <button
              key={pair.symbol}
              onClick={() => { onSelect(pair); onClose(); }}
              className="w-full flex items-center px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/30"
            >
              <Star size={14} className="text-muted-foreground mr-3 flex-shrink-0" />
              <span className="text-lg mr-2">{pair.icon}</span>
              <span className="text-sm font-medium text-foreground flex-1 text-left">{pair.displayName}</span>
              <span className="w-24 text-right text-xs font-mono text-foreground">
                {price ? (price < 1 ? price.toPrecision(4) : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: price < 100 ? 4 : 2 })) : '—'}
              </span>
              <span className={`w-20 text-right text-xs font-medium ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
              <span className="w-12 text-right text-xs font-semibold text-success">{pair.payout}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
