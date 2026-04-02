import { useState, useEffect } from 'react';
import { TradingPair, TIMEFRAMES, Trade } from '@/lib/types';
import { ArrowUp, ArrowDown, Minus, Plus, Clock, ChevronDown, Package } from 'lucide-react';
import CryptoIcon from './CryptoIcons';

interface TradePanelProps {
  pair: TradingPair;
  currentPrice: number;
  balance: number;
  onTrade: (direction: 'up' | 'down', amount: number, duration: number) => void;
  activeTrade: Trade | null;
  trades: Trade[];
}

export default function TradePanel({ pair, currentPrice, balance, onTrade, activeTrade, trades }: TradePanelProps) {
  const [amount, setAmount] = useState(100);
  const [investMode, setInvestMode] = useState<'dollar' | 'percent'>('dollar');
  const [percentValue, setPercentValue] = useState(1);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
  const [showTimeframes, setShowTimeframes] = useState(false);
  const [activeTab, setActiveTab] = useState<'trades' | 'orders'>('trades');
  const [, setTick] = useState(0);

  // Force re-render every 500ms for live P&L updates
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(interval);
  }, []);

  // Compute actual dollar amount based on mode
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

  const timeLeft = activeTrade
    ? Math.max(0, Math.ceil((activeTrade.endTime - Date.now()) / 1000))
    : 0;

  const completedTrades = trades.filter(t => t.result);

  // Calculate live P&L for active trade
  const getActivePnL = () => {
    if (!activeTrade || currentPrice <= 0) return null;
    const isUp = activeTrade.direction === 'up';
    const priceDiff = currentPrice - activeTrade.entryPrice;
    const isWinning = isUp ? priceDiff > 0 : priceDiff < 0;
    const tradeFee = activeTrade.amount * 0.10;
    const netPool = activeTrade.amount - tradeFee;
    return isWinning ? netPool : -activeTrade.amount;
  };

  const formatTime = (tf: typeof TIMEFRAMES[0]) => {
    const m = Math.floor(tf.seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${String(h).padStart(2, '0')}:00:00`;
    return `00:${String(m).padStart(2, '0')}:00`;
  };

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Group trades by date
  const groupedTrades = completedTrades.reduce((acc, trade) => {
    const date = new Date(trade.startTime);
    const key = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);

  const activePnL = getActivePnL();

  return (
    <div className="w-[260px] bg-card border-l border-border flex flex-col h-full overflow-y-auto">
      {/* Pair info */}
      <div className="px-3 py-2.5 border-b border-[#2b3040]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{pair.icon}</span>
            <span className="font-semibold text-foreground text-xs">{pair.displayName}</span>
          </div>
          <span className="text-foreground text-xs font-semibold">{pair.payout}%</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] text-primary font-semibold tracking-wide">PENDING TRADE</span>
          <div className="ml-auto w-7 h-3.5 bg-primary/30 rounded-full flex items-center cursor-pointer">
            <div className="w-2.5 h-2.5 bg-primary rounded-full ml-auto mr-0.5" />
          </div>
        </div>
      </div>

      {/* Time selector */}
      <div className="px-3 py-2.5 border-b border-[#2b3040]">
        <fieldset className="border border-border rounded-md px-2 pb-2 pt-0">
          <legend className="text-[9px] text-muted-foreground px-1">Time</legend>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const idx = TIMEFRAMES.indexOf(selectedTimeframe);
                if (idx > 0) setSelectedTimeframe(TIMEFRAMES[idx - 1]);
              }}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minus size={12} />
            </button>
            <button
              onClick={() => setShowTimeframes(!showTimeframes)}
              className="flex-1 text-center font-mono text-sm font-semibold text-foreground"
            >
              {formatTime(selectedTimeframe)}
            </button>
            <button
              onClick={() => {
                const idx = TIMEFRAMES.indexOf(selectedTimeframe);
                if (idx < TIMEFRAMES.length - 1) setSelectedTimeframe(TIMEFRAMES[idx + 1]);
              }}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </fieldset>
        <button className="w-full text-center text-[9px] text-primary font-bold mt-1 hover:underline tracking-wide">
          SWITCH TIME
        </button>

        {showTimeframes && (
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.label}
                onClick={() => { setSelectedTimeframe(tf); setShowTimeframes(false); }}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
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
      <div className="px-3 py-2.5 border-b border-border">
        <fieldset className="border border-border rounded-md px-2 pb-2 pt-0">
          <legend className="text-[9px] text-muted-foreground px-1">Investment</legend>
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustAmount(investMode === 'percent' ? -1 : -10)}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minus size={12} />
            </button>
            <div className="flex-1 flex items-center justify-center gap-1">
              {investMode === 'dollar' ? (
                <>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-transparent font-mono text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-muted-foreground text-xs">$</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={percentValue}
                    onChange={e => setPercentValue(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center bg-transparent font-mono text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-muted-foreground text-xs">%</span>
                </>
              )}
            </div>
            <button
              onClick={() => adjustAmount(investMode === 'percent' ? 1 : 10)}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </fieldset>
        <button
          onClick={() => {
            if (investMode === 'dollar') {
              // Switch to percent: convert current amount to % of balance
              const pct = Math.max(1, Math.round((amount / balance) * 100));
              setPercentValue(pct);
              setInvestMode('percent');
            } else {
              // Switch to dollar: convert current % to dollar amount
              const dollarVal = Math.max(1, Math.round((percentValue / 100) * balance));
              setAmount(dollarVal);
              setInvestMode('dollar');
            }
          }}
          className="w-full text-center text-[9px] text-primary font-bold mt-1 hover:underline tracking-wide"
        >
          SWITCH
        </button>
      </div>

      {/* Investment + Payout info (shown in % mode) */}
      {investMode === 'percent' && (
        <div className="px-3 py-1.5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Investment:</span>
            <div className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30" />
            <span className="text-[11px] font-bold text-foreground">{actualAmount.toFixed(2)} $</span>
          </div>
        </div>
      )}

      {/* Payout line */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Your payout:</span>
        <div className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30" />
        <span className="text-[11px] font-bold text-foreground">{potentialPayout.toFixed(investMode === 'percent' ? 2 : 0)} $</span>
      </div>


      {/* Trade buttons */}
      <div className="px-3 py-2.5 space-y-2 border-b border-border">
        <button
          onClick={() => onTrade('up', actualAmount, selectedTimeframe.seconds)}
          className="w-full py-3 rounded-lg flex items-center justify-between px-4 bg-[#0EB85B] hover:bg-[#0EB85B]/90 text-white font-semibold transition-all duration-200"
        >
          <span className="text-sm font-bold">Up</span>
          <ArrowUp size={18} />
        </button>
        <button
          onClick={() => onTrade('down', actualAmount, selectedTimeframe.seconds)}
          className="w-full py-3 rounded-lg flex items-center justify-between px-4 bg-[#FF3F2C] hover:bg-[#FF3F2C]/90 text-white font-semibold transition-all duration-200"
        >
          <span className="text-sm font-bold">Down</span>
          <ArrowDown size={18} />
        </button>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-primary/60" />

      {/* Trade History Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-2 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'trades'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Trades
          <span className="bg-secondary px-1.5 py-0.5 rounded-sm text-[9px]">{completedTrades.length + (activeTrade ? 1 : 0)}</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock size={11} />
          <span className="bg-secondary px-1.5 py-0.5 rounded-sm text-[9px]">0</span>
        </button>
      </div>

      {/* Trade History Content */}
      <div className="flex-1 overflow-y-auto bg-[#2b3040]">
        {activeTab === 'trades' && completedTrades.length === 0 && !activeTrade && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package size={28} className="mb-2 opacity-50" />
            <p className="text-[11px]">No trades yet.</p>
            <p className="text-[9px]">Place your first trade above.</p>
          </div>
        )}

        {activeTab === 'trades' && (
          <>
            {/* Active trade in history */}
            {activeTrade && (
              <div className="px-3 py-2.5 border-b border-border/50 bg-accent/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ChevronDown size={12} className="text-muted-foreground" />
                    <div className="flex items-center -space-x-1">
                      <CryptoIcon symbol={activeTrade.pair.symbol.replace('USDT', '')} size={16} />
                      <CryptoIcon symbol="USD" size={10} />
                    </div>
                    <span className="text-[11px] font-medium text-foreground">{activeTrade.pair.displayName}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 pl-6">
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white font-bold ${
                      activeTrade.direction === 'up' ? 'bg-success' : 'bg-danger'
                    }`}>
                      {activeTrade.direction === 'up' ? '↑' : '↓'}
                    </div>
                    <span className={`text-[10px] font-medium ${
                      activeTrade.direction === 'up' ? 'text-success' : 'text-danger'
                    }`}>
                      {activeTrade.amount} $
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    (activePnL || 0) >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {(activePnL || 0) >= 0 ? '+' : ''}{(activePnL || 0).toFixed(2)} $
                  </span>
                </div>
                {/* Sell now button — Quotex style */}
                <button className="w-full mt-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-between px-4">
                  <span>Sell now</span>
                  <span>{Math.max(0, activePnL ? Math.floor(activePnL * 0.1) : 0)} $</span>
                </button>
              </div>
            )}

            {/* Grouped completed trades */}
            {Object.entries(groupedTrades).map(([dateKey, dateTrades]) => (
              <div key={dateKey}>
                <div className="px-3 py-1.5 flex items-center justify-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">{dateKey}</span>
                  <span className="bg-secondary text-[9px] px-1.5 py-0.5 rounded-sm font-medium text-foreground">
                    {dateTrades.length}
                  </span>
                </div>
                {dateTrades.map(trade => (
                  <div key={trade.id} className="px-3 py-2 border-b border-border/30 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ChevronDown size={12} className="text-muted-foreground" />
                        <div className="flex items-center -space-x-1">
                          <CryptoIcon symbol={trade.pair.symbol.replace('USDT', '')} size={16} />
                          <CryptoIcon symbol="USD" size={10} />
                        </div>
                        <span className="text-[11px] font-medium text-foreground">{trade.pair.displayName}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatDuration(trade.duration)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5 pl-6">
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white font-bold ${
                          trade.direction === 'up' ? 'bg-success' : 'bg-danger'
                        }`}>
                          {trade.direction === 'up' ? '↑' : '↓'}
                        </div>
                        <span className={`text-[10px] font-medium ${
                          trade.direction === 'up' ? 'text-success' : 'text-danger'
                        }`}>
                          {trade.amount} $
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold ${
                        trade.result === 'win' ? 'text-success' : 'text-danger'
                      }`}>
                        {trade.result === 'win'
                          ? `+${((trade.payout || 0) - trade.amount).toFixed(2)}`
                          : `0.00`} $
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {activeTab === 'orders' && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package size={28} className="mb-2 opacity-50" />
            <p className="text-[11px]">Order list is empty.</p>
            <p className="text-[9px]">Create a pending trade using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
