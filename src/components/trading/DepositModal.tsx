import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronDown, Copy, Check, Info, QrCode } from 'lucide-react';

// ─── Types ───
type DepositView = 'main' | 'transfer' | 'exchange';

interface Token {
  symbol: string;
  name: string;
  color: string;
  icon: string;
}

interface Chain {
  name: string;
  min: string;
  color: string;
  icon: string;
  available?: boolean;
}

interface Exchange {
  name: string;
  color: string;
  icon: string;
  comingSoon?: boolean;
}

// ─── Data ───
const TOKENS: Token[] = [
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA', icon: 'https://sdk-cdn.fun.xyz/images/usdc.svg' },
  { symbol: 'USDT', name: 'Tether', color: '#26A17B', icon: 'https://sdk-cdn.fun.xyz/images/usdt.svg' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', icon: 'https://sdk-cdn.fun.xyz/images/eth.svg' },
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', icon: 'https://sdk-cdn.fun.xyz/images/btc.svg' },
  { symbol: 'BUSD', name: 'Binance USD', color: '#F3BA2F', icon: 'https://sdk-cdn.fun.xyz/images/busd.svg' },
  { symbol: 'SOL', name: 'Solana', color: '#9945FF', icon: 'https://sdk-cdn.fun.xyz/images/sol.svg' },
];

const CHAINS: Chain[] = [
  { name: 'Ethereum', min: '$10', color: '#627EEA', icon: '◆' },
  { name: 'Solana', min: '$3', color: '#9945FF', icon: '◎' },
  { name: 'BSC', min: '$3', color: '#F3BA2F', icon: '⬡' },
  { name: 'Base', min: '$3', color: '#0052FF', icon: '🔵' },
  { name: 'Polygon', min: '$3', color: '#8247E5', icon: '⬟' },
  { name: 'Arbitrum', min: '$3', color: '#28A0F0', icon: '🔷' },
  { name: 'Tron', min: '$10', color: '#FF0013', icon: '◬' },
  { name: 'Bitcoin', min: '$10', color: '#F7931A', icon: '₿' },
  { name: 'Optimism', min: '$3', color: '#FF0420', icon: '🔴' },
  { name: 'Avalanche', min: '$3', color: '#E84142', icon: '🔺' },
];

const EXCHANGES: Exchange[] = [
  { name: 'Coinbase', color: '#0052FF', icon: '🟦' },
  { name: 'Binance', color: '#F3BA2F', icon: '🟨', comingSoon: true },
  { name: 'Kraken', color: '#5741D9', icon: '🟪', comingSoon: true },
  { name: 'Bybit', color: '#F7A600', icon: '🟧', comingSoon: true },
  { name: 'KuCoin', color: '#23AF91', icon: '🟩', comingSoon: true },
];

// Demo deposit address
const DEMO_ADDRESS = '0x7a3F...c82aEE80c140D';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

const slideIn = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, damping: 28, stiffness: 350 } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.12 } },
};

// ─── Smooth scroll helper ───
function useSmoothScroll() {
  const listRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);

  const animate = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    currentRef.current += (targetRef.current - currentRef.current) * 0.12;
    if (Math.abs(targetRef.current - currentRef.current) > 0.5) {
      el.scrollTop = currentRef.current;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      el.scrollTop = targetRef.current;
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const el = listRef.current;
    if (!el) return;
    currentRef.current = el.scrollTop;
    targetRef.current = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, currentRef.current + e.deltaY));
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  return { listRef, onWheel };
}

// ─── Token Icon ───
function TokenIcon({ token, size = 24 }: { token: Token; size?: number }) {
  const isUrl = token.icon.startsWith('http');
  return isUrl ? (
    <img src={token.icon} alt={token.symbol} className="rounded-full flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: token.color, fontSize: size * 0.5 }}
    >
      {token.icon}
    </div>
  );
}

function ChainIcon({ chain, size = 24 }: { chain: Chain; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: chain.color, fontSize: size * 0.5 }}
    >
      {chain.icon}
    </div>
  );
}

// ─── Dropdown ───
function Dropdown<T extends { name?: string; symbol?: string }>({
  items,
  selected,
  onSelect,
  renderItem,
  renderSelected,
  label,
  rightLabel,
}: {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  renderSelected: (item: T) => React.ReactNode;
  label: string;
  rightLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useSmoothScroll();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="flex-1" ref={ref}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        {rightLabel && (
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            {rightLabel} <Info size={12} />
          </span>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors"
        >
          {renderSelected(selected)}
          <ChevronDown size={14} className={`text-muted-foreground ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              <div
                ref={scroll.listRef}
                onWheel={scroll.onWheel}
                className="max-h-[280px] overflow-y-auto py-1"
                style={{ scrollbarWidth: 'thin' }}
              >
                {items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { onSelect(item); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/80 transition-colors"
                  >
                    {renderItem(item, (item as any).symbol === (selected as any).symbol || (item as any).name === (selected as any).name)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── QR Code (placeholder SVG pattern) ───
function QRCodeDisplay({ chain }: { chain: Chain }) {
  return (
    <div className="relative mx-auto w-48 h-48 md:w-56 md:h-56 rounded-2xl border border-border bg-white p-3 my-6">
      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxNTAiIHk9IjEwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTU1IiB5PSIxNSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjE2MCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMCIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTUiIHk9IjE1NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjIwIiB5PSIxNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI2MCIgeT0iMTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iNzYiIHk9IjEwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjkyIiB5PSIxMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI2MCIgeT0iMjYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iODQiIHk9IjI2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjEwOCIgeT0iMjYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iNjAiIHk9IjQyIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPjxyZWN0IHg9Ijc2IiB5PSI0MiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjQiIHk9IjQyIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjEwIiB5PSI2MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIyNiIgeT0iNjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iNDIiIHk9IjYwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPjxyZWN0IHg9Ijc2IiB5PSI2MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI5MiIgeT0iNjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTI0IiB5PSI2MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxNTAiIHk9IjYwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE4MiIgeT0iNjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+PC9zdmc+')] bg-contain bg-center bg-no-repeat" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: chain.color }}
      >
        <span className="text-white text-lg">{chain.icon}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───
interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
}

export default function DepositModal({ open, onClose, balance }: DepositModalProps) {
  const [view, setView] = useState<DepositView>('main');
  const [tab, setTab] = useState<'crypto' | 'cash'>('crypto');
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const [copied, setCopied] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setView('main');
      setTab('crypto');
      setCopied(false);
    }
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(DEMO_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => setView('main');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              {view !== 'main' ? (
                <button onClick={handleBack} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <ChevronLeft size={20} className="text-muted-foreground" />
                </button>
              ) : <div className="w-7" />}
              <div className="text-center flex-1">
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {view === 'main' ? 'Deposit' : view === 'transfer' ? 'Transfer Crypto' : 'Select an exchange'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Arcanine Balance: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 pb-5">
              <AnimatePresence mode="wait">
                {view === 'main' && (
                  <motion.div key="main" variants={slideIn} initial="hidden" animate="visible" exit="exit">
                    <MainView
                      tab={tab}
                      setTab={setTab}
                      onTransfer={() => setView('transfer')}
                      onExchange={() => setView('exchange')}
                    />
                  </motion.div>
                )}
                {view === 'transfer' && (
                  <motion.div key="transfer" variants={slideIn} initial="hidden" animate="visible" exit="exit">
                    <TransferView
                      selectedToken={selectedToken}
                      setSelectedToken={setSelectedToken}
                      selectedChain={selectedChain}
                      setSelectedChain={setSelectedChain}
                      copied={copied}
                      onCopy={handleCopy}
                    />
                  </motion.div>
                )}
                {view === 'exchange' && (
                  <motion.div key="exchange" variants={slideIn} initial="hidden" animate="visible" exit="exit">
                    <ExchangeView />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main View ───
function MainView({
  tab,
  setTab,
  onTransfer,
  onExchange,
}: {
  tab: 'crypto' | 'cash';
  setTab: (t: 'crypto' | 'cash') => void;
  onTransfer: () => void;
  onExchange: () => void;
}) {
  // Crypto network icons preview
  const previewTokens = TOKENS.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Transfer Crypto */}
      <button
        onClick={onTransfer}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <QrCode size={20} className="text-primary" />
        </div>
        <div className="text-left flex-1">
          <div className="font-bold text-sm text-foreground">Transfer Crypto</div>
          <div className="text-xs text-muted-foreground">No limit • Instant</div>
        </div>
        <div className="flex -space-x-1.5">
          {previewTokens.map((t, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-card flex items-center justify-center text-[8px] text-white"
              style={{ backgroundColor: t.color, zIndex: previewTokens.length - i }}
            >
              {t.icon}
            </div>
          ))}
        </div>
      </button>

      {/* Connect Exchange */}
      <button
        onClick={onExchange}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 17.5V13C12.5 12.5333 12.5 12.2999 12.4092 12.1217C12.3293 11.9649 12.2018 11.8374 12.045 11.7575C11.8667 11.6667 11.6334 11.6667 11.1667 11.6667H8.83333C8.36662 11.6667 8.13327 11.6667 7.95501 11.7575C7.79821 11.8374 7.67072 11.9649 7.59083 12.1217C7.5 12.2999 7.5 12.5333 7.5 13V17.5M2.5 5.83333C2.5 7.21405 3.61929 8.33333 5 8.33333C6.38071 8.33333 7.5 7.21405 7.5 5.83333C7.5 7.21405 8.61929 8.33333 10 8.33333C11.3807 8.33333 12.5 7.21405 12.5 5.83333C12.5 7.21405 13.6193 8.33333 15 8.33333C16.3807 8.33333 17.5 7.21405 17.5 5.83333M5.16667 17.5H14.8333C15.7668 17.5 16.2335 17.5 16.59 17.3183C16.9036 17.1586 17.1586 16.9036 17.3183 16.59C17.5 16.2335 17.5 15.7668 17.5 14.8333V5.16667C17.5 4.23325 17.5 3.76654 17.3183 3.41002C17.1586 3.09641 16.9036 2.84144 16.59 2.68166C16.2335 2.5 15.7668 2.5 14.8333 2.5H5.16667C4.23325 2.5 3.76654 2.5 3.41002 2.68166C3.09641 2.84144 2.84144 3.09641 2.68166 3.41002C2.5 3.76654 2.5 4.23325 2.5 5.16667V14.8333C2.5 15.7668 2.5 16.2335 2.68166 16.59C2.84144 16.9036 3.09641 17.1586 3.41002 17.3183C3.76654 17.5 4.23325 17.5 5.16667 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-left flex-1">
          <div className="font-bold text-sm text-foreground">Connect Exchange</div>
          <div className="text-xs text-muted-foreground">No limit • 2 min</div>
        </div>
        <div className="flex -space-x-1.5">
          {EXCHANGES.slice(0, 5).map((ex, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-card flex items-center justify-center text-[8px] text-white"
              style={{ backgroundColor: ex.color, zIndex: 5 - i }}
            >
              {ex.icon}
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}

// ─── Transfer View ───
function TransferView({
  selectedToken,
  setSelectedToken,
  selectedChain,
  setSelectedChain,
  copied,
  onCopy,
}: {
  selectedToken: Token;
  setSelectedToken: (t: Token) => void;
  selectedChain: Chain;
  setSelectedChain: (c: Chain) => void;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div>
      {/* Selectors */}
      <div className="flex gap-3 mb-2">
        <Dropdown
          items={TOKENS}
          selected={selectedToken}
          onSelect={setSelectedToken}
          label="Supported token"
          renderSelected={(t) => (
            <>
              <TokenIcon token={t} size={22} />
              <span className="font-bold text-sm text-foreground">{t.symbol}</span>
            </>
          )}
          renderItem={(t, sel) => (
            <>
              <TokenIcon token={t} size={22} />
              <span className="font-semibold text-sm text-foreground flex-1 text-left">{t.symbol}</span>
              {sel && <Check size={16} className="text-primary" />}
            </>
          )}
        />
        <Dropdown
          items={CHAINS}
          selected={selectedChain}
          onSelect={setSelectedChain}
          label="Supported chain"
          rightLabel={`Min ${selectedChain.min}`}
          renderSelected={(c) => (
            <>
              <ChainIcon chain={c} size={22} />
              <span className="font-bold text-sm text-foreground">{c.name}</span>
            </>
          )}
          renderItem={(c, sel) => (
            <>
              <ChainIcon chain={c} size={22} />
              <span className="font-semibold text-sm text-foreground flex-1 text-left">{c.name}</span>
              <span className="text-xs text-muted-foreground">Min {c.min}</span>
              {sel && <Check size={16} className="text-primary ml-1" />}
            </>
          )}
        />
      </div>

      {/* Info banner */}
      <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 mb-1">
        Send any accepted token to this address and it will auto swap to {selectedToken.symbol} in your account
      </div>

      {/* QR Code */}
      <QRCodeDisplay chain={selectedChain} />

      {/* Deposit address */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            Your deposit address <Info size={12} />
          </span>
          <a href="#" className="text-xs text-primary hover:underline font-medium">Terms apply</a>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 text-sm text-foreground font-mono break-all bg-secondary/30">
            {DEMO_ADDRESS}
          </div>
          <button
            onClick={onCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-border hover:bg-secondary/50 transition-colors text-sm font-semibold text-foreground"
          >
            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy address'}
          </button>
        </div>
      </div>

      {/* Price impact expandable */}
      <PriceImpactSection />
    </div>
  );
}

// ─── Price Impact Section ───
function PriceImpactSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-secondary/30 border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
      >
        <img src="https://sdk-cdn.fun.xyz/images/usdc.svg" alt="USDC" className="w-4 h-4 rounded-full" />
        Price impact: <span className="font-semibold text-foreground">0.00%</span> <Info size={12} />
        <ChevronDown size={14} className={`ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2.5 border-t border-border pt-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">🔄</span>
                Max slippage: <span className="font-semibold text-foreground">Auto • 0.05%</span> <Info size={12} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">⚡</span>
                Processing time: <span className="font-semibold text-foreground">&lt; 1 min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">📋</span>
                Have questions? <a href="#" className="text-foreground underline hover:text-primary transition-colors">Get help</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exchange View ───
function ExchangeView() {
  return (
    <div className="space-y-2 py-2">
      {EXCHANGES.map((ex, i) => (
        <motion.button
          key={ex.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          disabled={ex.comingSoon}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
            ex.comingSoon
              ? 'border-border/50 opacity-60 cursor-not-allowed'
              : 'border-border hover:border-primary/40 hover:bg-secondary/50 cursor-pointer'
          }`}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: ex.color + '22' }}
          >
            {ex.icon}
          </div>
          <span className="font-bold text-sm text-foreground flex-1 text-left">{ex.name}</span>
          {ex.comingSoon && (
            <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground font-medium">
              Coming Soon
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
