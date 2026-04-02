import { useState } from 'react';
import { TradingPair, TIMEFRAMES, Trade } from '@/lib/types';
import { ArrowUp, ArrowDown, Minus, Plus, Clock } from 'lucide-react';

interface TradePanelProps {
  pair: TradingPair;
  currentPrice: number;
  balance: number;
  onTrade: (direction: 'up' | 'down', amount: number, duration: number) => void;
  activeTrade: Trade | null;
}

export default function TradePanel({ pair, currentPrice, balance, onTrade, activeTrade }: TradePanelProps) {
  const [amount, setAmount] = useState(100);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
  const [showTimeframes, setShowTimeframes] = useState(false);

  const fee = amount * 0.10;
  const potentialPayout = amount + (amount - fee) ;

  const adjustAmount = (delta: number) => {
    setAmount(prev => Math.max(1, prev + delta));
  };

  const timeLeft = activeTrade
    ? Math.max(0, Math.ceil((activeTrade.endTime - Date.now()) / 1000))
    : 0;

  return (
    <div className="w-[280px] bg-card border-l border-border flex flex-col">
      {/* Pair info */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{pair.icon}</span>
            <span className="font-semibold text-foreground text-sm">{pair.displayName}</span>
          </div>
          <span className="text-success text-sm font-semibold">{pair.payout}%</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary font-medium">PENDING TRADE</span>
          <div className="ml-auto w-8 h-4 bg-primary/30 rounded-full flex items-center">
            <div className="w-3 h-3 bg-primary rounded-full ml-auto mr-0.5" />
          </div>
        </div>
      </div>

      {/* Time selector */}
      <div className="px-4 py-3 border-b border-border">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</label>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => {
              const idx = TIMEFRAMES.indexOf(selectedTimeframe);
              if (idx > 0) setSelectedTimeframe(TIMEFRAMES[idx - 1]);
            }}
            className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => setShowTimeframes(!showTimeframes)}
            className="flex-1 text-center font-mono text-lg font-semibold text-foreground"
          >
            {selectedTimeframe.label === '1m' ? '00:01:00' :
             selectedTimeframe.label === '3m' ? '00:03:00' :
             selectedTimeframe.label === '5m' ? '00:05:00' :
             selectedTimeframe.label === '15m' ? '00:15:00' :
             selectedTimeframe.label === '30m' ? '00:30:00' : '01:00:00'}
          </button>
          <button
            onClick={() => {
              const idx = TIMEFRAMES.indexOf(selectedTimeframe);
              if (idx < TIMEFRAMES.length - 1) setSelectedTimeframe(TIMEFRAMES[idx + 1]);
            }}
            className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <button className="w-full text-center text-[10px] text-primary font-semibold mt-1 hover:underline">
          SWITCH TIME
        </button>

        {showTimeframes && (
          <div className="mt-2 grid grid-cols-3 gap-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.label}
                onClick={() => { setSelectedTimeframe(tf); setShowTimeframes(false); }}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  tf.label === selectedTimeframe.label
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Investment amount */}
      <div className="px-4 py-3 border-b border-border">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Investment</label>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => adjustAmount(-10)}
            className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus size={14} />
          </button>
          <div className="flex-1 text-center">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center bg-transparent font-mono text-lg font-semibold text-foreground outline-none"
            />
          </div>
          <span className="text-muted-foreground text-sm">$</span>
          <button
            onClick={() => adjustAmount(10)}
            className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <button className="w-full text-center text-[10px] text-primary font-semibold mt-1 hover:underline">
          SWITCH
        </button>
      </div>

      {/* Payout */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Your payout:</span>
        <span className="text-sm font-semibold text-foreground">{potentialPayout.toFixed(0)} $</span>
      </div>

      {/* Active trade countdown */}
      {activeTrade && timeLeft > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-mono text-xl font-bold animate-countdown-pulse ${
              activeTrade.direction === 'up' ? 'border-success text-success' : 'border-danger text-danger'
            }`}>
              {timeLeft}s
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-muted-foreground">
            {activeTrade.direction === 'up' ? '↑ UP' : '↓ DOWN'} • ${activeTrade.amount}
          </div>
        </div>
      )}

      {/* Trade buttons */}
      <div className="px-4 py-3 space-y-2">
        <button
          onClick={() => onTrade('up', amount, selectedTimeframe.seconds)}
          disabled={!!activeTrade}
          className="w-full py-3.5 rounded-lg trade-btn-up flex items-center justify-between px-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base font-bold">Up</span>
          <ArrowUp size={20} />
        </button>
        <button
          onClick={() => onTrade('down', amount, selectedTimeframe.seconds)}
          disabled={!!activeTrade}
          className="w-full py-3.5 rounded-lg trade-btn-down flex items-center justify-between px-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base font-bold">Down</span>
          <ArrowDown size={20} />
        </button>
      </div>
    </div>
  );
}
