import { useState } from 'react';
import { TradingPair, TIMEFRAMES } from '@/lib/types';
import { ArrowUp, ArrowDown, Minus, Plus } from 'lucide-react';
import CryptoIcon from './CryptoIcons';

interface MobileTradePanelProps {
  pair: TradingPair;
  currentPrice: number;
  balance: number;
  onTrade: (direction: 'up' | 'down', amount: number, duration: number) => void;
}

export default function MobileTradePanel({ pair, currentPrice, balance, onTrade }: MobileTradePanelProps) {
  const [amount, setAmount] = useState(100);
  const [investMode, setInvestMode] = useState<'dollar' | 'percent'>('dollar');
  const [percentValue, setPercentValue] = useState(1);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);

  const actualAmount = investMode === 'percent'
    ? Math.max(1, Math.round((percentValue / 100) * balance * 100) / 100)
    : amount;

  const fee = actualAmount * 0.10;
  const potentialPayout = actualAmount + (actualAmount - fee);

  const adjustAmount = (delta: number) => {
    if (investMode === 'percent') {
      setPercentValue(prev => Math.min(100, Math.max(1, prev + delta)));
    } else {
      setAmount(prev => Math.max(1, prev + delta));
    }
  };

  const formatTime = (tf: typeof TIMEFRAMES[0]) => {
    const m = Math.floor(tf.seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${String(h).padStart(2, '0')}:00:00`;
    return `00:${String(m).padStart(2, '0')}:00`;
  };

  const base = pair.symbol.replace('USDT', '').replace('USD', '');

  return (
    <div className="bg-card border-t border-border px-3 py-2 pb-[70px]">
      {/* Pair info row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CryptoIcon symbol={base} size={20} />
          <span className="font-semibold text-foreground text-xs">{pair.displayName}</span>
          <span className="text-primary text-xs font-bold">{pair.payout}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] text-primary font-semibold tracking-wide">PENDING TRADE</span>
        </div>
      </div>

      {/* Timer + Investment row */}
      <div className="flex gap-2 mb-2">
        <fieldset className="flex-1 border border-border rounded-md px-2 pb-1.5 pt-0">
          <legend className="text-[9px] text-muted-foreground px-1">Timer</legend>
          <div className="text-center text-sm font-semibold text-foreground tabular-nums">
            {formatTime(selectedTimeframe)}
          </div>
        </fieldset>

        <fieldset className="flex-1 border border-border rounded-md px-2 pb-1.5 pt-0">
          <legend className="text-[9px] text-muted-foreground px-1">Investment</legend>
          <div className="flex items-center gap-1">
            <button onClick={() => adjustAmount(investMode === 'percent' ? -1 : -10)} className="text-muted-foreground">
              <Minus size={12} />
            </button>
            <div className="flex-1 text-center text-sm font-semibold text-foreground tabular-nums">
              {investMode === 'dollar' ? `${amount} $` : `${percentValue} %`}
            </div>
            <button onClick={() => adjustAmount(investMode === 'percent' ? 1 : 10)} className="text-muted-foreground">
              <Plus size={12} />
            </button>
          </div>
        </fieldset>
      </div>

      <button
        onClick={() => {
          if (investMode === 'dollar') {
            setPercentValue(Math.max(1, Math.round((amount / balance) * 100)));
            setInvestMode('percent');
          } else {
            setAmount(Math.max(1, Math.round((percentValue / 100) * balance)));
            setInvestMode('dollar');
          }
        }}
        className="w-full text-center text-[9px] text-primary font-bold mb-1.5 tracking-wide"
      >
        SWITCH
      </button>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-muted-foreground">Your payout:</span>
        <div className="flex-1 mx-2 border-b border-dotted border-border" />
        <span className="text-[11px] font-bold text-foreground" >{potentialPayout.toFixed(0)} $</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onTrade('up', actualAmount, selectedTimeframe.seconds)}
          className="flex-1 py-3 rounded-lg flex items-center justify-between px-4 bg-success hover:bg-success/90 text-success-foreground font-semibold transition-all"
        >
          <span className="text-sm font-bold">Up</span>
          <ArrowUp size={18} />
        </button>
        <button
          onClick={() => onTrade('down', actualAmount, selectedTimeframe.seconds)}
          className="flex-1 py-3 rounded-lg flex items-center justify-between px-4 bg-danger hover:bg-danger/90 text-danger-foreground font-semibold transition-all"
        >
          <span className="text-sm font-bold">Down</span>
          <ArrowDown size={18} />
        </button>
      </div>
    </div>
  );
}
