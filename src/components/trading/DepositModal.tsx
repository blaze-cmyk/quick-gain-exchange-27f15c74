import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronDown, Copy, Check, Info, QrCode, CreditCard,
  Loader2, AlertTriangle, ShieldAlert, Globe, RefreshCw, MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeposit, type DepositRecord, type DepositFailureCategory } from '@/hooks/useDeposit';

// ─── Types ───
type DepositView = 'main' | 'transfer' | 'exchange' | 'onramper';

// Onramper publishable test API key (safe to ship in frontend)
const ONRAMPER_API_KEY = 'pk_test_01KPD2B41QXJJG0PBK2QQTPVW4';

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
  { name: 'Ethereum', min: '$10', color: '#627EEA', icon: 'https://sdk-cdn.fun.xyz/images/ethereum.svg' },
  { name: 'Solana', min: '$3', color: '#9945FF', icon: 'https://sdk-cdn.fun.xyz/images/sol.svg' },
  { name: 'Tron', min: '$10', color: '#FF0013', icon: 'https://sdk-cdn.fun.xyz/images/tron.svg' },
  { name: 'Bitcoin', min: '$10', color: '#F7931A', icon: 'https://sdk-cdn.fun.xyz/images/btc.svg' },
];

const EXCHANGES: Exchange[] = [
  { name: 'Coinbase', color: '#2C5FF6', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="4" fill="#2C5FF6"></rect><path d="M9.99 13.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c1.76 0 3.22 1.305 3.46 3h3.52A7.005 7.005 0 0 0 9.99 3c-3.86 0-7 3.14-7 7s3.14 7 7 7c3.69 0 6.725-2.87 6.98-6.5h-3.52c-.24 1.695-1.7 3-3.46 3Z" fill="#fff"></path></svg>', comingSoon: true },
  { name: 'Binance', color: '#F3BA2F', icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="4" fill="#F3BA2F"></rect><path d="M7.67 9.04 10 6.71l2.33 2.34 1.36-1.36L10 4 6.31 7.69zM4 10l1.36-1.36L6.7 10l-1.35 1.36zm3.67.96L10 13.29l2.33-2.33 1.36 1.35-3.69 3.7-3.69-3.7zm5.62-.96 1.35-1.35L16 10l-1.36 1.36z" fill="#fff"></path><path d="M11.38 10 10 8.62 8.98 9.64l-.11.12-.25.24L10 11.38z" fill="#fff"></path></svg>', comingSoon: true },
  { name: 'Kraken', color: '#5741D9', icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0H4a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4" fill="#5741D9"></path><path d="M4 11.78v-.67a6.4 6.4 0 0 1 .83-3.26 6 6 0 0 1 2.64-2.3A6 6 0 0 1 9.89 5q1.84-.02 3.4.96a5.6 5.6 0 0 1 2.64 4.18q.1.9.07 1.82l-.01.98q0 .22-.05.43c-.15.54-.8.8-1.27.49a.8.8 0 0 1-.35-.57l-.04-.48v-1.98q0-.4-.26-.68a.83.83 0 0 0-1.17-.04 1 1 0 0 0-.32.65v.28l-.01 2.19c0 .41-.33.73-.76.76a1 1 0 0 1-.56-.17.8.8 0 0 1-.3-.48l-.03-.33v-2.2a1 1 0 0 0-.26-.65.84.84 0 0 0-1.25.02 1 1 0 0 0-.24.64V13q0 .28-.1.54a1 1 0 0 1-.32.34.8.8 0 0 1-1.17-.4 1 1 0 0 1-.07-.38V11q.01-.24-.05-.47a.9.9 0 0 0-.72-.62c-.37-.06-.65.11-.85.4q-.14.22-.14.46v2q.02.3-.04.59a.84.84 0 0 1-.87.63.9.9 0 0 1-.74-.63A1 1 0 0 1 4 13z" fill="#fff"></path></svg>', comingSoon: true },
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
  const isUrl = chain.icon.startsWith('http');
  return isUrl ? (
    <img src={chain.icon} alt={chain.name} className="rounded-full flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
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
  const [selectedToken, setSelectedToken] = useState(TOKENS[1]);
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
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  {view === 'main'
                    ? 'Deposit'
                    : view === 'transfer'
                    ? 'Transfer Crypto'
                    : view === 'exchange'
                    ? 'Select an exchange'
                    : 'Buy with Card'}
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
                      onBuyCard={() => setView('onramper')}
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
                {view === 'onramper' && (
                  <motion.div key="onramper" variants={slideIn} initial="hidden" animate="visible" exit="exit">
                    <OnramperView />
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
  onBuyCard,
}: {
  tab: 'crypto' | 'cash';
  setTab: (t: 'crypto' | 'cash') => void;
  onTransfer: () => void;
  onExchange: () => void;
  onBuyCard: () => void;
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
            t.icon.startsWith('http') ? (
              <img
                key={i}
                src={t.icon}
                alt={t.symbol}
                className="w-5 h-5 rounded-full border border-card flex-shrink-0"
                style={{ zIndex: previewTokens.length - i }}
              />
            ) : (
              <div
                key={i}
                className="w-5 h-5 rounded-full border border-card flex items-center justify-center text-[8px] text-white"
                style={{ backgroundColor: t.color, zIndex: previewTokens.length - i }}
              >
                {t.icon}
              </div>
            )
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
          {EXCHANGES.slice(0, 3).map((ex, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-card flex items-center justify-center overflow-hidden"
              style={{ zIndex: 5 - i }}
              dangerouslySetInnerHTML={{ __html: ex.icon }}
            />
          ))}
        </div>
      </button>

      {/* Buy with Card (Onramper) */}
      <button
        onClick={onBuyCard}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <CreditCard size={20} className="text-primary" />
        </div>
        <div className="text-left flex-1">
          <div className="font-bold text-sm text-foreground">Buy with Card</div>
          <div className="text-xs text-muted-foreground">Visa, Mastercard, Apple Pay • Instant</div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-primary/10 text-primary">
          Onramper
        </span>
      </button>
    </div>
  );
}

// ─── Onramper Buy with Card View ───
//
// Three-step flow:
//   1. prefill  – user picks fiat amount + crypto + fiat currency
//   2. widget   – iframe is shown; status pill at top reflects DB state
//   3. result   – success / failure / KYC / region / payment-method screen

type OnramperStep = 'prefill' | 'widget' | 'result';

const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const;
const TARGET_CRYPTOS = [
  { code: 'usdc', label: 'USDC', sub: 'USD Coin' },
  { code: 'usdt', label: 'USDT', sub: 'Tether' },
  { code: 'btc',  label: 'BTC',  sub: 'Bitcoin' },
  { code: 'eth',  label: 'ETH',  sub: 'Ethereum' },
  { code: 'sol',  label: 'SOL',  sub: 'Solana' },
] as const;

const QUICK_AMOUNTS = [50, 100, 250, 500];

function OnramperView() {
  const { activeDeposit, createPendingDeposit, reset } = useDeposit();
  const [step, setStep] = useState<OnramperStep>('prefill');

  // Prefill form state
  const [fiatAmount, setFiatAmount] = useState<number>(50);
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [crypto, setCrypto] = useState<typeof TARGET_CRYPTOS[number]>(TARGET_CRYPTOS[0]);
  const [creating, setCreating] = useState(false);

  // Drive step changes from realtime deposit status
  useEffect(() => {
    if (!activeDeposit) return;
    if (
      activeDeposit.status === 'completed' ||
      activeDeposit.status === 'failed' ||
      activeDeposit.status === 'expired'
    ) {
      setStep('result');
    } else if (step === 'prefill') {
      setStep('widget');
    }
  }, [activeDeposit, step]);

  // Listen for postMessage from the Onramper iframe so the UI feels alive
  // even before the webhook fires. Onramper emits string events like
  // 'transactionCompleted', 'transactionFailed', etc.
  useEffect(() => {
    if (step !== 'widget') return;
    const onMsg = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;
      const type =
        typeof data === 'string'
          ? data
          : data.type ?? data.event ?? data.eventType;
      if (typeof type !== 'string') return;
      const t = type.toLowerCase();
      if (t.includes('completed') || t.includes('success')) {
        toast.success('Payment submitted — waiting for confirmation');
      } else if (t.includes('failed') || t.includes('declined')) {
        toast.error('Payment was declined');
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [step]);

  const handleStart = async () => {
    if (fiatAmount < 5) {
      toast.error('Minimum deposit is 5');
      return;
    }
    setCreating(true);
    try {
      await createPendingDeposit({
        fiat_amount: fiatAmount,
        fiat_currency: fiatCurrency,
        crypto_currency: crypto.code,
      });
      setStep('widget');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start deposit');
    } finally {
      setCreating(false);
    }
  };

  const handleRetry = () => {
    reset();
    setStep('prefill');
  };

  if (step === 'prefill') {
    return (
      <PrefillStep
        fiatAmount={fiatAmount}
        setFiatAmount={setFiatAmount}
        fiatCurrency={fiatCurrency}
        setFiatCurrency={setFiatCurrency}
        crypto={crypto}
        setCrypto={setCrypto}
        onContinue={handleStart}
        creating={creating}
      />
    );
  }

  if (step === 'widget' && activeDeposit) {
    return <WidgetStep deposit={activeDeposit} />;
  }

  if (step === 'result' && activeDeposit) {
    return <ResultStep deposit={activeDeposit} onRetry={handleRetry} />;
  }

  return null;
}

// ─── Step 1: Prefill ───
function PrefillStep({
  fiatAmount, setFiatAmount, fiatCurrency, setFiatCurrency,
  crypto, setCrypto, onContinue, creating,
}: {
  fiatAmount: number;
  setFiatAmount: (n: number) => void;
  fiatCurrency: string;
  setFiatCurrency: (c: string) => void;
  crypto: typeof TARGET_CRYPTOS[number];
  setCrypto: (c: typeof TARGET_CRYPTOS[number]) => void;
  onContinue: () => void;
  creating: boolean;
}) {
  const symbol = fiatCurrency === 'EUR' ? '€' : fiatCurrency === 'GBP' ? '£' : '$';
  return (
    <div className="space-y-4">
      {/* Amount */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Amount
        </label>
        <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-secondary/40 focus-within:border-primary/50">
          <span className="text-lg font-bold text-muted-foreground">{symbol}</span>
          <input
            type="number"
            min={5}
            step="any"
            value={fiatAmount}
            onChange={(e) => setFiatAmount(Number(e.target.value))}
            className="bg-transparent flex-1 text-2xl font-bold text-foreground outline-none tabular-nums"
          />
          <select
            value={fiatCurrency}
            onChange={(e) => setFiatCurrency(e.target.value)}
            className="bg-secondary text-xs font-bold text-foreground rounded-md px-2 py-1 border border-border outline-none"
          >
            {FIAT_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setFiatAmount(a)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                fiatAmount === a
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {symbol}{a}
            </button>
          ))}
        </div>
      </div>

      {/* Crypto */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          You receive
        </label>
        <div className="mt-1 grid grid-cols-5 gap-2">
          {TARGET_CRYPTOS.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCrypto(c)}
              className={`px-2 py-2.5 rounded-xl border text-center transition-colors ${
                crypto.code === c.code
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-secondary/40 border-border text-foreground hover:border-primary/30'
              }`}
            >
              <div className="text-xs font-bold">{c.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{c.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2 flex gap-2">
        <Info size={14} className="text-primary mt-0.5 shrink-0" />
        <span>You'll be guided through KYC and payment in the next step. Funds are credited to your USD balance once the purchase is confirmed.</span>
      </div>

      <button
        onClick={onContinue}
        disabled={creating || fiatAmount < 5}
        className="w-full py-3 rounded-xl bg-gradient-accent text-primary-foreground font-bold text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {creating ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {creating ? 'Preparing…' : `Continue with ${symbol}${fiatAmount.toLocaleString()}`}
      </button>
    </div>
  );
}

// ─── Step 2: Widget + status pill ───
function WidgetStep({ deposit }: { deposit: DepositRecord }) {
  // Build widget URL with prefill params and the deposit id in partnerContext
  // so the webhook can resolve the row. See:
  // https://docs.onramper.com/docs/widget-customization
  const params = new URLSearchParams({
    apiKey: ONRAMPER_API_KEY,
    mode: 'buy',
    themeName: 'dark',
    borderRadius: '0.75rem',
    containerColor: '0b0d12',
    primaryColor: '22c55e',
    secondaryColor: '141821',
    primaryTextColor: 'ffffff',
    secondaryTextColor: '9ca3af',
    cardColor: '141821',
    defaultFiat: deposit.fiat_currency.toLowerCase(),
    defaultAmount: String(deposit.fiat_amount),
    defaultCrypto: (deposit.crypto_currency ?? 'usdc').toLowerCase(),
    partnerContext: JSON.stringify({ depositId: deposit.id }),
  });
  const src = `https://buy.onramper.com/?${params.toString()}`;

  const statusUi = STATUS_UI[deposit.status] ?? STATUS_UI.pending;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusUi.cls}`}>
        <statusUi.icon size={14} className={statusUi.iconCls} />
        <span className="text-xs font-bold">{statusUi.label}</span>
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
          #{deposit.id.slice(0, 8)}
        </span>
      </div>
      <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
        <iframe
          title="Onramper Widget"
          src={src}
          height="640"
          width="100%"
          allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
          style={{ border: 'none', display: 'block' }}
        />
        <p className="text-[10px] text-muted-foreground text-center py-2 px-3 border-t border-border">
          Powered by Onramper • Test mode — no real charges
        </p>
      </div>
    </div>
  );
}

const STATUS_UI = {
  pending: {
    label: 'Awaiting payment',
    icon: Loader2,
    iconCls: 'text-primary animate-spin',
    cls: 'border-primary/30 bg-primary/5 text-foreground',
  },
  processing: {
    label: 'Processing payment',
    icon: Loader2,
    iconCls: 'text-primary animate-spin',
    cls: 'border-primary/30 bg-primary/5 text-foreground',
  },
  completed: {
    label: 'Completed',
    icon: Check,
    iconCls: 'text-success',
    cls: 'border-success/30 bg-success/5 text-foreground',
  },
  failed: {
    label: 'Failed',
    icon: AlertTriangle,
    iconCls: 'text-destructive',
    cls: 'border-destructive/30 bg-destructive/5 text-foreground',
  },
  expired: {
    label: 'Expired',
    icon: AlertTriangle,
    iconCls: 'text-muted-foreground',
    cls: 'border-border bg-secondary/40 text-foreground',
  },
} as const;

// ─── Step 3: Result screens ───
function ResultStep({ deposit, onRetry }: { deposit: DepositRecord; onRetry: () => void }) {
  if (deposit.status === 'completed') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
          <Check size={28} className="text-success" strokeWidth={2.8} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Deposit successful</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ${Number(deposit.credited_amount_usd ?? deposit.fiat_amount).toFixed(2)} has been added to your balance.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-secondary hover:bg-accent border border-border text-foreground font-bold text-sm transition-colors"
        >
          Make another deposit
        </button>
      </div>
    );
  }

  // Failed / expired — pick guidance based on category
  const cat: DepositFailureCategory = deposit.failure_category ?? 'other';
  const guidance = FAILURE_GUIDANCE[cat];

  return (
    <div className="text-center py-4 space-y-4">
      <div className={`mx-auto w-14 h-14 rounded-full ${guidance.iconBg} flex items-center justify-center`}>
        <guidance.Icon size={26} className={guidance.iconColor} strokeWidth={2.4} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">{guidance.title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5 px-2">
          {deposit.failure_reason ?? guidance.description}
        </p>
      </div>

      <ul className="text-left text-xs text-muted-foreground space-y-1.5 px-2">
        {guidance.steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary font-bold">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl bg-gradient-accent text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} /> Try again
        </button>
        <a
          href="mailto:support@onramper.com"
          className="flex-1 py-3 rounded-xl bg-secondary hover:bg-accent border border-border text-foreground font-bold text-sm flex items-center justify-center"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}

const FAILURE_GUIDANCE: Record<DepositFailureCategory, {
  title: string;
  description: string;
  steps: string[];
  Icon: typeof ShieldAlert;
  iconBg: string;
  iconColor: string;
}> = {
  kyc: {
    title: 'Identity verification needed',
    description: 'The provider needs to verify your identity before completing the purchase.',
    steps: [
      'Open the widget again and complete the KYC step.',
      'Have a government-issued photo ID ready (passport, driver\'s license).',
      'Make sure your name and address match your card details.',
    ],
    Icon: ShieldAlert,
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  region: {
    title: 'Not available in your region',
    description: 'This payment method is not currently supported in your country.',
    steps: [
      'Try a different payment provider (we route through 30+ providers).',
      'Use the Transfer Crypto option to deposit from an exchange or wallet.',
      'Contact support for help with alternative on-ramps.',
    ],
    Icon: Globe,
    iconBg: 'bg-secondary',
    iconColor: 'text-muted-foreground',
  },
  payment_method: {
    title: 'Card payment declined',
    description: 'Your card issuer declined the transaction.',
    steps: [
      'Check your card details and available balance.',
      'Some banks block crypto purchases — try a different card or contact your bank.',
      'You can also try Apple Pay, Google Pay, or a bank transfer.',
    ],
    Icon: CreditCard,
    iconBg: 'bg-destructive/15',
    iconColor: 'text-destructive',
  },
  limit: {
    title: 'Limit exceeded',
    description: 'The amount is outside the provider\'s limits for your account.',
    steps: [
      'Try a smaller amount that fits within your daily/monthly limit.',
      'Complete additional verification to raise your limits.',
      'Use a different provider with higher limits.',
    ],
    Icon: AlertTriangle,
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  other: {
    title: 'Deposit could not be completed',
    description: 'Something went wrong with the purchase. No funds were charged.',
    steps: [
      'Try the deposit again — most issues are temporary.',
      'If it keeps failing, switch to a different payment method.',
      'Contact support and include the reference shown above.',
    ],
    Icon: AlertTriangle,
    iconBg: 'bg-destructive/15',
    iconColor: 'text-destructive',
  },
};


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
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: ex.icon }}
          />
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
