import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Currency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  rate: number; // rate vs USD (how many units per 1 USD)
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€', rate: 0.84 },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£', rate: 0.72 },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', symbol: 'R$', rate: 5.05 },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', symbol: 'Rp', rate: 15700 },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', symbol: 'RM', rate: 4.47 },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', symbol: '₹', rate: 83.5 },
  { code: 'KZT', name: 'Kazakhstani Tenge', flag: '🇰🇿', symbol: '₸', rate: 450 },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', symbol: '₽', rate: 92 },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', symbol: '฿', rate: 35.5 },
  { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦', symbol: '₴', rate: 37.5 },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', symbol: '₫', rate: 24500 },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦', rate: 1550 },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', symbol: 'E£', rate: 48.5 },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', symbol: 'Mex$', rate: 17.2 },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥', rate: 150 },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', symbol: '৳', rate: 110 },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', symbol: '₨', rate: 278 },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', symbol: '₱', rate: 56 },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', symbol: '₺', rate: 32 },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', symbol: '₩', rate: 1340 },
];

const FEE_PERCENT = 3;

interface CurrencyExchangeModalProps {
  open: boolean;
  onClose: () => void;
  currentCurrency: string;
  balance: number;
  onExchange: (newCurrency: string) => void;
}

export default function CurrencyExchangeModal({ open, onClose, currentCurrency, balance, onExchange }: CurrencyExchangeModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedCurrency(currentCurrency === 'USD' ? 'EUR' : 'USD');
      setShowDropdown(false);
    }
  }, [open, currentCurrency]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const fromCurrency = CURRENCIES.find(c => c.code === currentCurrency) || CURRENCIES[0];
  const toCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[1];

  const exchangeRate = toCurrency.rate / fromCurrency.rate;
  const fee = balance * (FEE_PERCENT / 100);
  const netAmount = balance - fee;
  const receivedAmount = netAmount * exchangeRate;

  const availableCurrencies = CURRENCIES.filter(c => c.code !== currentCurrency);

  // Colors for the currency circles
  const getCurrencyColor = (code: string) => {
    const colors: Record<string, string> = {
      USD: '#DC2626', EUR: '#2563EB', GBP: '#7C3AED', BRL: '#16A34A',
      IDR: '#DC2626', MYR: '#EAB308', INR: '#F97316', KZT: '#0EA5E9',
      RUB: '#DC2626', THB: '#2563EB', UAH: '#EAB308', VND: '#DC2626',
      NGN: '#16A34A', EGP: '#DC2626', MXN: '#16A34A', JPY: '#DC2626',
      BDT: '#DC2626', PKR: '#16A34A', PHP: '#DC2626', TRY: '#DC2626',
      KRW: '#1D4ED8',
    };
    return colors[code] || '#6B7280';
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="bg-card border border-border rounded-2xl w-full max-w-[520px] shadow-2xl overflow-visible"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Exchange Form
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Currency selectors */}
            <div className="px-6 pb-4">
              <div className="flex gap-3">
                {/* My Currency - fixed */}
                <fieldset className="flex-1 border border-border rounded-lg px-3 pb-2.5 pt-0">
                  <legend className="text-[10px] text-muted-foreground px-1">My Currency:</legend>
                  <div className="flex items-center gap-2 py-1.5">
                    <span className="text-lg">{fromCurrency.flag}</span>
                    <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {fromCurrency.code}
                    </span>
                  </div>
                </fieldset>

                {/* New Currency - dropdown */}
                <div className="flex-1 relative" ref={dropdownRef}>
                  <fieldset className="border border-border rounded-lg px-3 pb-2.5 pt-0">
                    <legend className="text-[10px] text-muted-foreground px-1">New Currency:</legend>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{toCurrency.flag}</span>
                        <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {toCurrency.code}
                        </span>
                      </div>
                      {showDropdown ? (
                        <ChevronUp size={14} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={14} className="text-muted-foreground" />
                      )}
                    </button>
                  </fieldset>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden origin-top"
                      >
                        <div
                          ref={listRef}
                          className="max-h-[200px] overflow-y-auto"
                          style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--muted)) transparent' }}
                        >
                          {availableCurrencies.map((currency, i) => (
                            <motion.button
                              key={currency.code}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.02 }}
                              onClick={() => {
                                setSelectedCurrency(currency.code);
                                setShowDropdown(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent transition-colors ${
                                currency.code === selectedCurrency ? 'bg-accent' : ''
                              }`}
                            >
                              <span className="text-base">{currency.flag}</span>
                              <span className="text-xs font-semibold text-foreground">{currency.code}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Exchange preview */}
              <div className="flex items-center justify-center gap-3 mt-5">
                {/* From */}
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">You are exchanging:</div>
                  <div className="text-lg font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fromCurrency.code}
                  </div>
                </div>

                {/* Currency icons + arrow */}
                <div className="flex items-center gap-2 mx-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: getCurrencyColor(fromCurrency.code) }}
                  >
                    {fromCurrency.symbol}
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground" />
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: getCurrencyColor(toCurrency.code) }}
                  >
                    {toCurrency.symbol}
                  </div>
                </div>

                {/* To */}
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">You will receive:</div>
                  <div className="text-lg font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {receivedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency.code}
                  </div>
                </div>
              </div>

              {/* Fee info */}
              <div className="text-center mt-3">
                <span className="text-[10px] text-muted-foreground">
                  Exchange Fee: {FEE_PERCENT}%. {exchangeRate < 1
                    ? `${(1 / exchangeRate).toFixed(2)} ${toCurrency.code} = 1 ${fromCurrency.code}`
                    : `${exchangeRate.toFixed(2)} ${fromCurrency.code} = 1 ${toCurrency.code}`
                  }
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 px-6 pb-5 pt-2">
              <button
                onClick={() => {
                  onExchange(selectedCurrency);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Check size={16} />
                Yes, proceed
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-secondary hover:bg-accent text-foreground font-bold text-sm transition-colors border border-border"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                No, go back
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
