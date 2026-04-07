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
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA', icon: '💲' },
  { symbol: 'USDT', name: 'Tether', color: '#26A17B', icon: '💵' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', icon: '◆' },
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', icon: '₿' },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F', icon: '⬡' },
  { symbol: 'SOL', name: 'Solana', color: '#9945FF', icon: '◎' },
  { symbol: 'ARB', name: 'Arbitrum', color: '#28A0F0', icon: '🔷' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5', icon: '⬟' },
  { symbol: 'DAI', name: 'Dai', color: '#F5AC37', icon: '◈' },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633', icon: 'Ð' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD', icon: '₳' },
  { symbol: 'DOT', name: 'Polkadot', color: '#E6007A', icon: '●' },
  { symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA', icon: '⬡' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142', icon: '🔺' },
  { symbol: 'XRP', name: 'Ripple', color: '#23292F', icon: '✕' },
  { symbol: 'TRX', name: 'Tron', color: '#FF0013', icon: '◬' },
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
  return (
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
      {/* Tabs */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setTab('crypto')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
            tab === 'crypto' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.9168 11.8737C12.9168 12.449 12.4505 12.9154 11.8752 12.9154H8.75016V10.832H11.8752C12.4505 10.832 12.9168 11.2984 12.9168 11.8737Z" fill="currentColor"/><path d="M11.4585 7.08203H8.75016V9.16536H11.4585C12.0338 9.16536 12.5002 8.69899 12.5002 8.1237C12.5002 7.5484 12.0338 7.08203 11.4585 7.08203Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M10.0002 0.832031C4.93755 0.832031 0.833496 4.93609 0.833496 9.9987C0.833496 15.0613 4.93755 19.1654 10.0002 19.1654C15.0628 19.1654 19.1668 15.0613 19.1668 9.9987C19.1668 4.93609 15.0628 0.832031 10.0002 0.832031ZM8.3335 4.16536C8.79373 4.16536 9.16683 4.53846 9.16683 4.9987V5.41536H10.0002V4.9987C10.0002 4.53846 10.3733 4.16536 10.8335 4.16536C11.2937 4.16536 11.6668 4.53846 11.6668 4.9987V5.42326C13.0653 5.52964 14.1668 6.69803 14.1668 8.1237C14.1668 8.74941 13.9546 9.32557 13.5983 9.78413C14.2 10.2809 14.5835 11.0325 14.5835 11.8737C14.5835 13.3695 13.3709 14.582 11.8752 14.582H11.6668V14.9987C11.6668 15.4589 11.2937 15.832 10.8335 15.832C10.3733 15.832 10.0002 15.4589 10.0002 14.9987V14.582H9.16683V14.9987C9.16683 15.4589 8.79373 15.832 8.3335 15.832C7.87326 15.832 7.50016 15.4589 7.50016 14.9987V14.582H6.66683C6.20659 14.582 5.8335 14.2089 5.8335 13.7487C5.8335 13.2885 6.20659 12.9154 6.66683 12.9154H7.0835V7.08203H6.66683C6.20659 7.08203 5.8335 6.70894 5.8335 6.2487C5.8335 5.78846 6.20659 5.41536 6.66683 5.41536H7.50016V4.9987C7.50016 4.53846 7.87326 4.16536 8.3335 4.16536Z" fill="currentColor"/></svg>
          Use Crypto
        </button>
        <button
          onClick={() => setTab('cash')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
            tab === 'cash' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-lg">💵</span>
          Use Cash
        </button>
      </div>

      {tab === 'crypto' ? (
        <>
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
              <span className="text-lg">🏦</span>
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
        </>
      ) : (
        <div className="py-8 text-center text-muted-foreground text-sm">
          <p className="font-semibold text-foreground mb-2">Cash deposits coming soon</p>
          <p>Bank transfers and card payments will be available shortly.</p>
        </div>
      )}
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

      {/* Price impact */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/30 border border-border text-sm text-muted-foreground">
        <span className="text-primary">💲</span>
        Price impact: 0.00% <Info size={12} />
        <ChevronDown size={14} className="ml-auto" />
      </div>
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
