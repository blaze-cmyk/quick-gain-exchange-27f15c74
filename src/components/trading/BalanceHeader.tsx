import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, GraduationCap, Plus, Send, Eye, Pencil, RefreshCw, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import arcanineLogo from '@/assets/arcanine-logo.png';
import CurrencyExchangeModal from './CurrencyExchangeModal';
import DepositModal from './DepositModal';

interface BalanceHeaderProps {
  balance: number;
}

type AccountType = 'demo' | 'live';

const CURRENCY_INFO: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.88 },
  GBP: { symbol: '£', rate: 0.76 },
  BRL: { symbol: 'R$', rate: 5.18 },
  IDR: { symbol: 'Rp', rate: 16200 },
  MYR: { symbol: 'RM', rate: 4.55 },
  INR: { symbol: '₹', rate: 85.2 },
  KZT: { symbol: '₸', rate: 465 },
  RUB: { symbol: '₽', rate: 94.5 },
  THB: { symbol: '฿', rate: 36.2 },
  UAH: { symbol: '₴', rate: 41.8 },
  VND: { symbol: '₫', rate: 25800 },
  NGN: { symbol: '₦', rate: 1620 },
  EGP: { symbol: 'E£', rate: 50.5 },
  MXN: { symbol: 'Mex$', rate: 17.8 },
  JPY: { symbol: '¥', rate: 154 },
  BDT: { symbol: '৳', rate: 118 },
  PKR: { symbol: '₨', rate: 286 },
  PHP: { symbol: '₱', rate: 58.5 },
  TRY: { symbol: '₺', rate: 34.2 },
  KRW: { symbol: '₩', rate: 1385 },
};

export default function BalanceHeader({ balance }: BalanceHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showDropdown, setShowDropdown] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('demo');
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingSwitchTo, setPendingSwitchTo] = useState<AccountType | null>(null);
  const [liveBalance] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleSwitch = (type: AccountType) => {
    if (type === accountType) return;
    setPendingSwitchTo(type);
    setShowDropdown(false);
    setShowSwitchModal(true);
  };

  const confirmSwitch = () => {
    if (pendingSwitchTo) setAccountType(pendingSwitchTo);
    setShowSwitchModal(false);
    setPendingSwitchTo(null);
  };

  const currentBalance = accountType === 'demo' ? balance : liveBalance;
  const currencyInfo = CURRENCY_INFO[currency] || CURRENCY_INFO['USD'];
  const displayBalance = currentBalance * currencyInfo.rate;
  const currSymbol = currencyInfo.symbol;
  const isDemo = accountType === 'demo';

  // Dropdown content
  const dropdownContent = (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-full right-0 mt-2 w-[340px] bg-card border border-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
    >
      {/* Top section - user info */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Send size={14} className="text-primary" />
            </div>
            <div>
              <div className="text-[9px] text-primary font-bold uppercase tracking-wider">STANDARD:</div>
              <div className="text-[10px] text-muted-foreground">+0% profit</div>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Eye size={16} />
          </button>
        </div>
        <div className="text-xs text-muted-foreground mt-2 truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          trader@arcanine.com
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">ID: 85396662</div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-muted-foreground">Currency:</span>
          <span className="text-[10px] font-bold text-foreground">{currency}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowExchangeModal(true); setShowDropdown(false); }}
            className="text-[8px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/80 transition-colors"
          >
            CHANGE
          </button>
        </div>
      </div>

      {/* Account options */}
      <div className="px-3 py-2">
        {/* Live Account */}
        <button
          onClick={() => handleSwitch('live')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
            accountType === 'live' ? 'bg-accent border border-primary/30' : 'hover:bg-accent'
          }`}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            accountType === 'live' ? 'border-primary bg-primary' : 'border-muted-foreground'
          }`}>
            {accountType === 'live' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <div className="text-left flex-1">
            <div className="text-xs font-semibold text-foreground">Live Account</div>
            <div className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {currSymbol}{(liveBalance * currencyInfo.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">The daily limit is not set</div>
            <button className="text-[9px] text-primary font-bold mt-0.5 hover:underline">SET LIMIT</button>
          </div>
        </button>

        {/* Demo Account */}
        <button
          onClick={() => handleSwitch('demo')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            accountType === 'demo' ? 'bg-accent border border-primary/30' : 'hover:bg-accent'
          }`}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            accountType === 'demo' ? 'border-primary bg-primary' : 'border-muted-foreground'
          }`}>
            {accountType === 'demo' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <div className="text-left flex-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              Demo Account
              <Pencil size={10} className="text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {currSymbol}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <RefreshCw size={10} className="text-muted-foreground" />
            </div>
          </div>
        </button>
      </div>

      {/* Navigation links */}
      <div className="border-t border-border px-3 py-2">
        {[
          { label: 'Deposit', path: '/deposit' },
          { label: 'Withdrawal', path: '/withdrawal' },
          { label: 'Transactions', path: '/account' },
          { label: 'Trades', path: '/trade' },
          { label: 'My account', path: '/account' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => { navigate(item.path); setShowDropdown(false); }}
            className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent rounded-md transition-colors"
          >
            {item.label}
          </button>
        ))}
        <button className="w-full text-left px-3 py-1.5 text-xs text-primary hover:bg-accent rounded-md transition-colors flex items-center gap-1.5 mt-1">
          <LogOut size={12} />
          Logout
        </button>
      </div>
    </motion.div>
  );

  // Switch modal
  const switchModal = (
    <AnimatePresence>
      {showSwitchModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSwitchModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card border border-border rounded-2xl w-[420px] shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Account type changed
              </h2>
              <button onClick={() => setShowSwitchModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-1">
              <div className="border-t border-dashed border-border my-2" />
              <p className="text-sm text-muted-foreground text-center">
                You are now trading on a {pendingSwitchTo === 'live' ? 'Live' : 'Demo'} Account
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 py-6 px-6">
              {/* From account */}
              <div className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl ${
                pendingSwitchTo === 'live' ? '' : 'border border-primary/30'
              }`}>
                <GraduationCap size={24} className="text-muted-foreground" />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  accountType === 'demo' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  DEMO ACCOUNT
                </span>
                <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  ${(accountType === 'demo' ? balance : liveBalance).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>

              {/* Arrow */}
              <div className="text-primary text-lg font-bold">→</div>

              {/* To account */}
              <div className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl ${
                pendingSwitchTo === 'live' ? 'border border-primary/30' : ''
              }`}>
                {pendingSwitchTo === 'live' ? (
                  <Send size={24} className="text-primary" />
                ) : (
                  <GraduationCap size={24} className="text-muted-foreground" />
                )}
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  pendingSwitchTo === 'live' ? 'text-primary' : 'text-primary'
                }`}>
                  {pendingSwitchTo === 'live' ? 'LIVE ACCOUNT' : 'DEMO ACCOUNT'}
                </span>
                <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  ${(pendingSwitchTo === 'live' ? liveBalance : balance).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={confirmSwitch}
                className="w-full py-3 rounded-xl bg-secondary hover:bg-accent text-foreground font-bold text-sm transition-colors border border-border"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isMobile) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-3 py-2 border-b border-border bg-card"
        >
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 border border-border cursor-pointer"
            >
              {isDemo ? (
                <GraduationCap size={13} className="text-muted-foreground" />
              ) : (
                <Send size={13} className="text-primary" />
              )}
              <div>
                <div className="text-[8px] text-primary font-bold uppercase tracking-wider">
                  {isDemo ? 'DEMO' : 'LIVE'}
                </div>
                <div className="text-xs font-bold font-sans text-foreground">
                  {currSymbol}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <ChevronDown size={12} className="text-muted-foreground" />
            </div>
            <AnimatePresence>{showDropdown && dropdownContent}</AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[8px] font-bold flex items-center justify-center text-destructive-foreground">5</span>
            </button>
            <button
              onClick={() => navigate('/deposit')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 py-2 rounded-lg transition-colors"
            >
              Deposit
            </button>
          </div>
        </motion.div>
        {switchModal}
        <CurrencyExchangeModal
          open={showExchangeModal}
          onClose={() => setShowExchangeModal(false)}
          currentCurrency={currency}
          balance={currentBalance}
          onExchange={(newCurrency) => setCurrency(newCurrency)}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card"
      >
        <div className="flex items-center gap-2.5 mr-auto">
          <img src={arcanineLogo} alt="Arcanine" className="w-12 h-12 rounded-lg" />
          <span className="text-foreground font-bold text-lg tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, letterSpacing: '0.08em' }}>ARCANINE</span>
        </div>

        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-destructive rounded-full text-[9px] font-bold flex items-center justify-center text-destructive-foreground min-w-[18px] min-h-[18px]">5</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 bg-secondary rounded-lg px-3.5 py-2 cursor-pointer hover:bg-accent transition-colors border border-border"
          >
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
              {isDemo ? (
                <GraduationCap size={15} className="text-muted-foreground" />
              ) : (
                <Send size={15} className="text-primary" />
              )}
            </div>
            <div className="text-left">
              <div className="text-[9px] text-primary font-bold uppercase tracking-wider">
                {isDemo ? 'DEMO ACCOUNT' : 'LIVE ACCOUNT'}
              </div>
              <div className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {currSymbol}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
          <AnimatePresence>{showDropdown && dropdownContent}</AnimatePresence>
        </div>

        <button
          onClick={() => setShowDepositModal(true)}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={15} strokeWidth={3} />
          <span>Deposit</span>
        </button>
        <button onClick={() => navigate('/withdrawal')} className="text-foreground font-medium text-sm px-4 py-2.5 rounded-lg border border-border bg-transparent hover:bg-secondary transition-colors">
          Withdrawal
        </button>
      </motion.div>
      {switchModal}
      <CurrencyExchangeModal
        open={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        currentCurrency={currency}
        balance={currentBalance}
        onExchange={(newCurrency) => setCurrency(newCurrency)}
      />
      <DepositModal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        balance={currentBalance}
      />
    </>
  );
}
