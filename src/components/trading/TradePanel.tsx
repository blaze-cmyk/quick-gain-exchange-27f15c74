import { useState, useEffect, useMemo } from 'react';
import { TradingPair, TIMEFRAMES, Trade } from '@/lib/types';
import { ArrowUp, ArrowDown, Minus, Plus, Clock, ChevronDown, Package, X, Timer } from 'lucide-react';
import CryptoIcon from './CryptoIcons';
import PendingTradeModal from './PendingTradeModal';

interface TradePanelProps {
  pair: TradingPair;
  currentPrice: number;
  balance: number;
  onTrade: (direction: 'up' | 'down', amount: number, duration: number) => void;
  activeTrades: Trade[];
  trades: Trade[];
  onDurationChange?: (seconds: number) => void;
}

export default function TradePanel({ pair, currentPrice, balance, onTrade, activeTrades, trades, onDurationChange }: TradePanelProps) {
  const [amount, setAmount] = useState(100);
  const [investMode, setInvestMode] = useState<'dollar' | 'percent'>('dollar');
  const [percentValue, setPercentValue] = useState(1);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[4]); // default 1:00
  const [timeMode, setTimeMode] = useState<'duration' | 'clock'>('duration');
  const [showTimeframes, setShowTimeframes] = useState(false);
  const [pendingTradeEnabled, setPendingTradeEnabled] = useState(false);
  const [pendingMode, setPendingMode] = useState<'quote' | 'time'>('quote');
  const [pendingQuote, setPendingQuote] = useState('');
  const [pendingTime, setPendingTime] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'trades' | 'orders'>('trades');
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onDurationChange?.(selectedTimeframe.seconds);
  }, [selectedTimeframe, onDurationChange]);

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

  const completedTrades = trades.filter(t => t.result);

  const getActivePnLs = () => {
    if (activeTrades.length === 0 || currentPrice <= 0) return [];
    return activeTrades.map(trade => {
      const isUp = trade.direction === 'up';
      const priceDiff = currentPrice - trade.entryPrice;
      const isWinning = isUp ? priceDiff > 0 : priceDiff < 0;
      const tradeFee = trade.amount * 0.10;
      const netPool = trade.amount - tradeFee;
      return { trade, pnl: isWinning ? netPool : -trade.amount, timeLeft: Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000)) };
    });
  };

  const formatTime = (tf: typeof TIMEFRAMES[0]) => {
    const s = tf.seconds;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Generate clock-time options in UTC, recalculated when dropdown opens
  const clockOptions = useMemo(() => {
    const toEST = (date: Date) => new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const nowEST = toEST(new Date());
    const baseMs = new Date().getTime();
    const startMin = nowEST.getMinutes() + 1;
    const offsets = [0, 1, 2, 3, 4, 8, 14, 29, 44, 59, 119, 179, 299];
    return offsets.map(off => {
      const futureMs = baseMs + (off + (startMin - nowEST.getMinutes())) * 60000 - nowEST.getSeconds() * 1000;
      const d = toEST(new Date(futureMs));
      return {
        label: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        seconds: Math.max(5, Math.floor((futureMs - Date.now()) / 1000)),
      };
    }).filter(o => o.seconds >= 5);
  }, [showTimeframes]);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const groupedTrades = completedTrades.reduce((acc, trade) => {
    const date = new Date(trade.startTime);
    const key = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);

  const activePnLs = getActivePnLs();

  return (
    <div className="w-[260px] bg-card border-l border-border flex flex-col h-full overflow-y-auto">
      {/* Pair info */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1.5">
              <CryptoIcon symbol={pair.symbol.replace('USDT', '').replace('USD', '')} size={20} />
              <CryptoIcon symbol="USD" size={12} />
            </div>
            <span className="font-semibold text-foreground text-sm">{pair.displayName}</span>
          </div>
          <span className="text-primary text-sm font-bold">{pair.payout}%</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${pendingTradeEnabled ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
          <span className={`text-[10px] font-bold tracking-wide ${pendingTradeEnabled ? 'text-primary' : 'text-secondary-foreground'}`}>PENDING TRADE</span>
          <button
            onClick={() => setPendingTradeEnabled(!pendingTradeEnabled)}
            className={`ml-auto w-8 h-4 rounded-full flex items-center cursor-pointer transition-colors duration-200 ${
              pendingTradeEnabled ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <div className={`w-3 h-3 bg-white rounded-full transition-all duration-200 ${
              pendingTradeEnabled ? 'ml-[18px]' : 'ml-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Pending trade config — shown when enabled */}
      {pendingTradeEnabled && (
        <div className="px-3 py-2.5 border-b border-border">
          {/* QUOTE / TIME tabs */}
          <div className="flex rounded-md overflow-hidden border border-border mb-2.5">
            <button
              onClick={() => setPendingMode('quote')}
              className={`flex-1 py-1.5 text-[10px] font-bold tracking-wide transition-colors ${
                pendingMode === 'quote'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              QUOTE
            </button>
            <button
              onClick={() => setPendingMode('time')}
              className={`flex-1 py-1.5 text-[10px] font-bold tracking-wide transition-colors ${
                pendingMode === 'time'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              TIME
            </button>
          </div>

          {pendingMode === 'quote' ? (
            <>
              <fieldset className="border border-border rounded-md px-2 pb-2 pt-0">
                <legend className="text-[11px] text-secondary-foreground font-medium px-1">Quote:</legend>
                <input
                  type="text"
                  value={pendingQuote || (currentPrice > 0 ? currentPrice.toFixed(2) : '')}
                  onChange={e => setPendingQuote(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-foreground outline-none text-center py-1"
                  
                />
              </fieldset>
              <p className="text-xs text-secondary-foreground/70 mt-1">
                Current quote: {currentPrice > 0 ? currentPrice.toFixed(2) : '—'}
              </p>
            </>
          ) : (
            <>
              <fieldset className="border border-border rounded-md px-2 pb-2 pt-0">
                <legend className="text-[11px] text-secondary-foreground font-medium px-1">Time:</legend>
                <input
                  type="text"
                  value={pendingTime || (() => {
                    const d = new Date(new Date(Date.now() + 120000).toLocaleString('en-US', { timeZone: 'America/New_York' }));
                    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
                  })()}
                  onChange={e => setPendingTime(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-foreground outline-none text-center py-1"
                  
                />
              </fieldset>
              <p className="text-xs text-secondary-foreground/70 mt-1">
                Current time: {(() => {
                  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
                  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                })()}
              </p>
            </>
          )}

          {/* Period */}
          <fieldset className="border border-border rounded-md px-2 pb-2 pt-0 mt-2">
            <legend className="text-[11px] text-secondary-foreground font-medium px-1">Period:</legend>
            <div className="text-sm font-semibold text-foreground text-center py-1" >
              M{Math.floor(selectedTimeframe.seconds / 60) || 1}
            </div>
          </fieldset>

          <button
            onClick={() => setShowPendingModal(true)}
            className="w-full text-center text-[10px] text-primary font-bold mt-2 hover:underline tracking-wide"
          >
            HOW IT WORKS?
          </button>
        </div>
      )}

      {/* Time selector */}
      <div className="px-3 py-2.5 border-b border-border">
        <fieldset className="border border-border rounded-md px-2 pb-2 pt-0">
          <legend className="text-[11px] text-secondary-foreground font-medium px-1">Time</legend>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (timeMode === 'duration') {
                  const idx = TIMEFRAMES.indexOf(selectedTimeframe);
                  if (idx > 0) setSelectedTimeframe(TIMEFRAMES[idx - 1]);
                }
              }}
              className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => setShowTimeframes(!showTimeframes)}
              className="flex-1 text-center text-sm font-bold text-foreground tracking-wide"
              
            >
              {timeMode === 'duration'
                ? formatTime(selectedTimeframe)
                : (() => {
                    const d = new Date(new Date(Date.now() + selectedTimeframe.seconds * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' }));
                    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                  })()
              }
            </button>
            <button
              onClick={() => {
                if (timeMode === 'duration') {
                  const idx = TIMEFRAMES.indexOf(selectedTimeframe);
                  if (idx < TIMEFRAMES.length - 1) setSelectedTimeframe(TIMEFRAMES[idx + 1]);
                }
              }}
              className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>
        </fieldset>
        <button
          onClick={() => {
            setTimeMode(prev => prev === 'duration' ? 'clock' : 'duration');
            setShowTimeframes(false);
          }}
          className="w-full text-center text-[10px] text-primary font-bold mt-1.5 hover:underline tracking-widest uppercase"
        >
          SWITCH TIME
        </button>

        {showTimeframes && (
          <div className="mt-2 bg-card border border-border rounded-lg p-2 shadow-xl">
            {timeMode === 'duration' ? (
              <div className="grid grid-cols-3 gap-1">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf.seconds}
                    onClick={() => { setSelectedTimeframe(tf); setShowTimeframes(false); }}
                    className={`px-1.5 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                      tf.seconds === selectedTimeframe.seconds
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                    
                  >
                    {formatTime(tf)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {clockOptions.slice(0, 12).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      // Find closest TIMEFRAME or use custom
                      const closest = TIMEFRAMES.reduce((prev, curr) =>
                        Math.abs(curr.seconds - opt.seconds) < Math.abs(prev.seconds - opt.seconds) ? curr : prev
                      );
                      setSelectedTimeframe({ ...closest, seconds: opt.seconds, label: opt.label });
                      setShowTimeframes(false);
                    }}
                    className="px-1.5 py-1.5 rounded-md text-[10px] font-semibold bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {/* Red bottom accent line like Quotex */}
            <div className="mt-2 h-[2px] rounded-full bg-danger/60" />
          </div>
        )}
      </div>

      {/* Investment amount */}
      <div className="px-3 py-2.5 border-b border-border">
        <fieldset className="border border-border rounded-md px-2 pb-2 pt-0">
          <legend className="text-[11px] text-secondary-foreground font-medium px-1">Investment</legend>
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
                    className="w-16 text-center bg-transparent text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    
                  />
                  <span className="text-muted-foreground text-xs">$</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={percentValue}
                    onChange={e => setPercentValue(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center bg-transparent text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    
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
              const pct = Math.max(1, Math.round((amount / balance) * 100));
              setPercentValue(pct);
              setInvestMode('percent');
            } else {
              const dollarVal = Math.max(1, Math.round((percentValue / 100) * balance));
              setAmount(dollarVal);
              setInvestMode('dollar');
            }
          }}
          className="w-full text-center text-[10px] text-primary font-bold mt-1 hover:underline tracking-wide"
        >
          SWITCH
        </button>
      </div>

      {/* Investment + Payout info (shown in % mode) */}
      {investMode === 'percent' && (
        <div className="px-3 py-1.5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary-foreground font-medium">Investment:</span>
            <div className="flex-1 mx-2 border-b border-dotted border-border" />
            <span className="text-xs font-bold text-foreground tabular-nums">{actualAmount.toFixed(2)} $</span>
          </div>
        </div>
      )}

      {/* Payout — the money shot */}
      <div className="px-3 py-3.5 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-secondary-foreground font-medium" >Your payout</span>
          <span className="text-xs text-primary font-bold" >{pair.payout}% return</span>
        </div>
        <div className="flex items-center justify-center py-1.5">
          <span
            className="text-2xl font-extrabold tracking-tight text-foreground font-display"
          >
            {potentialPayout.toFixed(investMode === 'percent' ? 2 : 0)}
          </span>
          <span className="text-lg font-bold text-primary ml-1.5" >$</span>
        </div>
      </div>

      {/* Trade buttons */}
      <div className="px-3 py-2.5 space-y-2 border-b border-border">
        <button
          onClick={() => onTrade('up', actualAmount, selectedTimeframe.seconds)}
          className="w-full py-3 rounded-lg flex items-center justify-between px-4 bg-success hover:bg-success/90 text-success-foreground font-semibold transition-all duration-200"
        >
          <span className="text-sm font-bold">Up</span>
          <ArrowUp size={18} />
        </button>
        <button
          onClick={() => onTrade('down', actualAmount, selectedTimeframe.seconds)}
          className="w-full py-3 rounded-lg flex items-center justify-between px-4 bg-danger hover:bg-danger/90 text-danger-foreground font-semibold transition-all duration-200"
        >
          <span className="text-sm font-bold">Down</span>
          <ArrowDown size={18} />
        </button>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-primary/40" />

      {/* Trade History Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'trades'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-secondary-foreground hover:text-foreground'
          }`}
        >
          Trades
          <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-semibold text-foreground">{completedTrades.length + activeTrades.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-secondary-foreground hover:text-foreground'
          }`}
        >
          <Clock size={13} />
          <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-semibold text-foreground">0</span>
        </button>
      </div>

      {/* Trade History Content */}
      <div className="flex-1 overflow-y-auto bg-card">
        {activeTab === 'trades' && completedTrades.length === 0 && activeTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package size={28} className="mb-2 opacity-40" />
            <p className="text-sm font-medium text-secondary-foreground">No trades yet.</p>
            <p className="text-xs text-secondary-foreground/70 mt-0.5">Place your first trade above.</p>
          </div>
        )}

        {activeTab === 'trades' && (
          <>
            {activePnLs.map(({ trade: at, pnl, timeLeft: tl }) => (
              <div key={at.id} className="px-3 py-2.5 border-b border-border bg-accent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ChevronDown size={12} className="text-muted-foreground" />
                    <div className="flex items-center -space-x-1">
                      <CryptoIcon symbol={at.pair.symbol.replace('USDT', '')} size={16} />
                      <CryptoIcon symbol="USD" size={10} />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{at.pair.displayName}</span>
                  </div>
                  <span className="text-xs text-secondary-foreground font-medium tabular-nums">
                    {String(Math.floor(tl / 60)).padStart(2, '0')}:{String(tl % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 pl-6">
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white font-bold ${
                      at.direction === 'up' ? 'bg-success' : 'bg-danger'
                    }`}>
                      {at.direction === 'up' ? '↑' : '↓'}
                    </div>
                    <span className={`text-xs font-semibold tabular-nums ${
                      at.direction === 'up' ? 'text-success' : 'text-danger'
                    }`}>
                      {at.amount} $
                    </span>
                  </div>
                  <span className={`text-xs font-bold tabular-nums ${
                    pnl >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} $
                  </span>
                </div>
                <button className="w-full mt-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-between px-4">
                  <span>Sell now</span>
                  <span>{Math.max(0, pnl >= 0 ? Math.floor(pnl * 0.1) : 0)} $</span>
                </button>
              </div>
            ))}

            {Object.entries(groupedTrades).map(([dateKey, dateTrades]) => (
              <div key={dateKey}>
                <div className="px-3 py-1.5 flex items-center justify-center gap-1.5">
                  <span className="text-xs text-secondary-foreground font-semibold">{dateKey}</span>
                  <span className="bg-secondary text-[10px] px-1.5 py-0.5 rounded font-semibold text-foreground">
                    {dateTrades.length}
                  </span>
                </div>
                {dateTrades.map(trade => (
                  <div key={trade.id} className="px-3 py-2 border-b border-border/50 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ChevronDown size={12} className="text-muted-foreground" />
                        <div className="flex items-center -space-x-1">
                          <CryptoIcon symbol={trade.pair.symbol.replace('USDT', '')} size={16} />
                          <CryptoIcon symbol="USD" size={10} />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{trade.pair.displayName}</span>
                      </div>
                      <span className="text-xs text-secondary-foreground font-medium tabular-nums">
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
                        <span className={`text-xs font-semibold tabular-nums ${
                          trade.direction === 'up' ? 'text-success' : 'text-danger'
                        }`}>
                          {trade.amount} $
                        </span>
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${
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
            <Package size={28} className="mb-2 opacity-40" />
            <p className="text-sm font-medium text-secondary-foreground">Order list is empty.</p>
            <p className="text-xs text-secondary-foreground/70 mt-0.5">Create a pending trade using the form above.</p>
          </div>
        )}
      </div>
      <PendingTradeModal open={showPendingModal} onClose={() => setShowPendingModal(false)} />
    </div>
  );
}
