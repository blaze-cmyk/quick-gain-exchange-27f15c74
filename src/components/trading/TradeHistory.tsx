import { Trade } from '@/lib/types';
import { ChevronDown, Clock, Package } from 'lucide-react';
import { useState } from 'react';

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  const [activeTab, setActiveTab] = useState<'trades' | 'orders'>('trades');

  const completedTrades = trades.filter(t => t.result);
  const wins = completedTrades.filter(t => t.result === 'win').length;

  return (
    <div className="border-t border-border bg-card">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'trades'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Trades
          <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">{completedTrades.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock size={12} />
          <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">0</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[240px] overflow-y-auto">
        {activeTab === 'trades' && completedTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package size={32} className="mb-2 opacity-50" />
            <p className="text-xs">No trades yet.</p>
            <p className="text-[10px]">Place your first trade above.</p>
          </div>
        )}

        {activeTab === 'trades' && completedTrades.map(trade => (
          <div key={trade.id} className="px-4 py-2.5 border-b border-border/50 hover:bg-accent/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronDown size={14} className="text-muted-foreground" />
                <span className="text-sm">{trade.pair.icon}</span>
                <span className="text-xs font-medium text-foreground">{trade.pair.displayName}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-sans">
                00:{String(Math.floor(trade.duration / 60)).padStart(2, '0')}:00
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 pl-7">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${trade.direction === 'up' ? 'bg-success' : 'bg-danger'}`} />
                <span className="text-xs text-muted-foreground">{trade.amount} $</span>
              </div>
              <span className={`text-xs font-semibold ${
                trade.result === 'win' ? 'text-success' : 'text-danger'
              }`}>
                {trade.result === 'win' ? `+${((trade.payout || 0) - trade.amount).toFixed(2)}` : `-${trade.amount.toFixed(2)}`} $
              </span>
            </div>
          </div>
        ))}

        {activeTab === 'orders' && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package size={32} className="mb-2 opacity-50" />
            <p className="text-xs">Order list is empty.</p>
            <p className="text-[10px]">Create a pending trade using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
