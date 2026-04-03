import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3X3, List, ChevronDown, ArrowLeft, Gift, Shield, CircleDollarSign, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

import tetherTrc20 from '@/assets/payment/tether-trc20.png';
import upiLogo from '@/assets/payment/upi.png';
import phonepeLogo from '@/assets/payment/phonepe.png';
import paytmLogo from '@/assets/payment/paytm.png';
import gpayLogo from '@/assets/payment/gpay.png';
import binanceLogo from '@/assets/payment/binance.png';
import bybitLogo from '@/assets/payment/bybit-pay.png';
import kucoinLogo from '@/assets/payment/kucoin-pay.png';
import usdcLogo from '@/assets/payment/usdc.png';
import binanceCryptoLogo from '@/assets/payment/binance-crypto.png';
import tronLogo from '@/assets/payment/tron.png';
import bitcoinLogo from '@/assets/payment/bitcoin.png';
import litecoinLogo from '@/assets/payment/litecoin.png';
import ethereumLogo from '@/assets/payment/ethereum.png';
import rippleLogo from '@/assets/payment/ripple.png';
import dashLogo from '@/assets/payment/dash.png';
import solanaLogo from '@/assets/payment/solana.png';
import avalancheLogo from '@/assets/payment/avalanche.png';
import shibLogo from '@/assets/payment/shib.png';
import bnbLogo from '@/assets/payment/bnb.png';
import cardanoLogo from '@/assets/payment/cardano.png';
import dogecoinLogo from '@/assets/payment/dogecoin.png';
import algorandLogo from '@/assets/payment/algorand.png';
import polkadotLogo from '@/assets/payment/polkadot.png';
import uniswapLogo from '@/assets/payment/uniswap.png';
import chainlinkLogo from '@/assets/payment/chainlink.png';
import cosmosLogo from '@/assets/payment/cosmos.png';
import daiLogo from '@/assets/payment/dai.png';
import etcLogo from '@/assets/payment/etc.png';
import baseEthLogo from '@/assets/payment/base-eth.png';
import bchLogo from '@/assets/payment/bch.png';
import toncoinLogo from '@/assets/payment/toncoin.png';
import stellarLogo from '@/assets/payment/stellar.png';
import polygonLogo from '@/assets/payment/polygon.png';
import voletLogo from '@/assets/payment/volet.png';
import jetonbankLogo from '@/assets/payment/jetonbank.png';
import moneygoLogo from '@/assets/payment/moneygo.png';

const TABS = ['DEPOSIT', 'WITHDRAWAL', 'HISTORY', 'CASHBACK', 'PROMO CODES', 'MY SAFE'];

interface PaymentMethod {
  name: string;
  icon: string;
  min: string;
  time: string;
  category: 'popular' | 'bank' | 'crypto' | 'epayments';
}

const POPULAR_METHODS: PaymentMethod[] = [
  { name: 'Tether (USDT) TRC-20', icon: tetherTrc20, min: '$30', time: 'instantly', category: 'popular' },
  { name: 'UPI', icon: upiLogo, min: '$5.40', time: '~5 min.', category: 'popular' },
  { name: 'PhonePe', icon: phonepeLogo, min: '$7.60', time: '~5 min.', category: 'popular' },
  { name: 'GPay', icon: gpayLogo, min: '$7.60', time: '~5 min.', category: 'popular' },
  { name: 'Binance Pay', icon: binanceLogo, min: '$5', time: '~1 min.', category: 'popular' },
  { name: 'Paytm', icon: paytmLogo, min: '$7.60', time: '~5 min.', category: 'popular' },
];

const BANK_METHODS: PaymentMethod[] = [
  { name: 'UPI', icon: upiLogo, min: '$5.40', time: '~5 min.', category: 'bank' },
  { name: 'PhonePe', icon: phonepeLogo, min: '$7.60', time: '~5 min.', category: 'bank' },
  { name: 'GPay', icon: gpayLogo, min: '$7.60', time: '~5 min.', category: 'bank' },
  { name: 'Paytm', icon: paytmLogo, min: '$7.60', time: '~5 min.', category: 'bank' },
];

const CRYPTO_NETWORKS = [
  {
    name: 'Tether (USDT)',
    icon: tetherTrc20,
    available: 10,
    methods: [
      { name: 'Binance Pay', icon: binanceCryptoLogo, min: '$5', time: '~1 min.', category: 'crypto' as const },
      { name: 'ByBit Pay', icon: bybitLogo, min: '$5', time: '~5 min.', category: 'crypto' as const },
      { name: 'KuCoin Pay', icon: kucoinLogo, min: '$5', time: '~5 min.', category: 'crypto' as const },
    ],
  },
  {
    name: 'USD Coin (USDC)',
    icon: usdcLogo,
    available: 8,
    methods: [
      { name: 'Binance Pay', icon: binanceCryptoLogo, min: '$5', time: '~1 min.', category: 'crypto' as const },
    ],
  },
];

const CRYPTO_DIRECT: PaymentMethod[] = [
  { name: 'Tron (TRX)', icon: tronLogo, min: '$10', time: 'instantly', category: 'crypto' },
  { name: 'Bitcoin (BTC)', icon: bitcoinLogo, min: '$5', time: '~10 min.', category: 'crypto' },
  { name: 'Litecoin (LTC)', icon: litecoinLogo, min: '$5', time: '~5 min.', category: 'crypto' },
  { name: 'Ethereum (ETH) ERC-20', icon: ethereumLogo, min: '$10', time: '~10 min.', category: 'crypto' },
  { name: 'Ripple (XRP)', icon: rippleLogo, min: '$30', time: '~56 min.', category: 'crypto' },
  { name: 'Dash (DASH)', icon: dashLogo, min: '$25', time: '~15 min.', category: 'crypto' },
  { name: 'Solana (SOL)', icon: solanaLogo, min: '$20', time: '~15 min.', category: 'crypto' },
  { name: 'Avalanche (AVAX)', icon: avalancheLogo, min: '$15', time: '~22 min.', category: 'crypto' },
  { name: 'Shiba Inu (SHIB)', icon: shibLogo, min: '$40', time: '~23 min.', category: 'crypto' },
  { name: 'Cardano (ADA)', icon: cardanoLogo, min: '$50', time: '~29 min.', category: 'crypto' },
  { name: 'Dogecoin (DOGE)', icon: dogecoinLogo, min: '$50', time: '~19 min.', category: 'crypto' },
  { name: 'Algorand (ALGO)', icon: algorandLogo, min: '$50', time: '~22 min.', category: 'crypto' },
  { name: 'Polkadot (DOT)', icon: polkadotLogo, min: '$50', time: '~16 min.', category: 'crypto' },
  { name: 'Uniswap (UNI)', icon: uniswapLogo, min: '$50', time: '3-5 min.', category: 'crypto' },
  { name: 'Chainlink (LINK)', icon: chainlinkLogo, min: '$50', time: '3-5 min.', category: 'crypto' },
  { name: 'Cosmos (ATOM)', icon: cosmosLogo, min: '$50', time: '3-5 min.', category: 'crypto' },
  { name: 'Dai (DAI)', icon: daiLogo, min: '$50', time: '~2 hours', category: 'crypto' },
  { name: 'Ethereum Classic (ETC)', icon: etcLogo, min: '$10', time: '~20 min.', category: 'crypto' },
  { name: 'Binance Coin (BNBBSC)', icon: bnbLogo, min: '$10', time: '3-5 min.', category: 'crypto' },
  { name: 'Base Network Ethereum (ETH)', icon: baseEthLogo, min: '$10', time: '~10 min.', category: 'crypto' },
  { name: 'Bitcoin Cash (BCH)', icon: bchLogo, min: '$10', time: '~10 min.', category: 'crypto' },
  { name: 'Toncoin (TON)', icon: toncoinLogo, min: '$5', time: '3-5 min.', category: 'crypto' },
  { name: 'Stellar (XLM)', icon: stellarLogo, min: '$10', time: '~5 min.', category: 'crypto' },
  { name: 'Polygon (MATIC)', icon: polygonLogo, min: '$5', time: '~5 min.', category: 'crypto' },
];

const EPAYMENT_METHODS: PaymentMethod[] = [
  { name: 'Volet.com (ex. Advcash)', icon: voletLogo, min: '$5', time: '~5 min.', category: 'epayments' },
  { name: 'Jetonbank', icon: jetonbankLogo, min: '$5', time: '~5 min.', category: 'epayments' },
  { name: 'MoneyGo', icon: moneygoLogo, min: '$5', time: '~5 min.', category: 'epayments' },
];

function isImageUrl(icon: string): boolean {
  return icon.startsWith('/') || icon.startsWith('data:') || icon.includes('/assets/');
}

function IconDisplay({ icon, size = 32 }: { icon: string; size?: number }) {
  if (isImageUrl(icon)) {
    return <img src={icon} alt="" className="object-contain" style={{ width: size, height: size }} />;
  }
  return <span style={{ fontSize: size * 0.75 }}>{icon}</span>;
}

export default function DepositPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('DEPOSIT');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCrypto, setExpandedCrypto] = useState<string | null>(null);

  const filterMethods = (methods: PaymentMethod[]) =>
    methods.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#1A1D29] text-[#E0E2E7]">
      {/* Top tabs bar */}
      <div className="flex items-center gap-1 px-6 py-3 bg-[#1B1F2D] border-b border-[#2B3040]">
        <button
          onClick={() => navigate('/trade')}
          className="mr-4 text-[#6B7280] hover:text-[#E0E2E7] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors ${
              activeTab === tab
                ? 'bg-[#2B3040] text-[#E0E2E7]'
                : 'text-[#6B7280] hover:text-[#E0E2E7]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex gap-8">
        {/* Left content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6">Account top-up</h1>

          {/* Steps */}
          <div className="flex items-center gap-0 mb-8">
            {['Deposit method', 'Payment details', 'Payment process', 'Payment execution'].map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-[#0EB85B] text-white' : 'bg-[#2B3040] text-[#6B7280]'
                  }`}>
                    {i + 1}
                  </span>
                  <span className={`text-xs font-medium ${i === 0 ? 'text-[#E0E2E7]' : 'text-[#6B7280]'}`}>
                    {step}
                  </span>
                </div>
                {i < 3 && <div className="flex-1 h-px bg-[#2B3040] mx-3" />}
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 flex items-center gap-2 bg-[#2B3040] rounded-lg px-4 py-2.5 border border-[#3A4255]">
              <Search size={16} className="text-[#6B7280]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search"
                className="bg-transparent text-sm text-[#E0E2E7] outline-none flex-1 placeholder:text-[#6B7280] font-medium"
              />
            </div>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg border transition-colors ${
                viewMode === 'grid' ? 'bg-[#3A4255] border-[#4A5268] text-[#E0E2E7]' : 'bg-[#2B3040] border-[#3A4255] text-[#6B7280]'
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg border transition-colors ${
                viewMode === 'list' ? 'bg-[#3A4255] border-[#4A5268] text-[#E0E2E7]' : 'bg-[#2B3040] border-[#3A4255] text-[#6B7280]'
              }`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Popular section */}
          <SectionHeader icon="⭐" title="Popular" />
          <MethodGrid methods={filterMethods(POPULAR_METHODS)} viewMode={viewMode} />

          {/* Bank section */}
          <SectionHeader icon="🏦" title="Bank" />
          <MethodGrid methods={filterMethods(BANK_METHODS)} viewMode={viewMode} />

          {/* Crypto currency section */}
          <SectionHeader icon="⚙️" title="Crypto currency" />

          {/* Expandable crypto networks */}
          {CRYPTO_NETWORKS.map(network => (
            <div key={network.name} className="mb-3">
              <button
                onClick={() => setExpandedCrypto(expandedCrypto === network.name ? null : network.name)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#2B3040] rounded-lg border border-[#3A4255] hover:border-[#4A5268] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <IconDisplay icon={network.icon} size={36} />
                  <span className="font-semibold text-sm">{network.name}</span>
                </div>
                <div className="flex items-center gap-4 text-[#6B7280] text-xs">
                  <span>Select a network</span>
                  <span>Available: {network.available}</span>
                  <ChevronDown size={16} className={`transition-transform ${expandedCrypto === network.name ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {expandedCrypto === network.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <MethodGrid methods={network.methods} viewMode={viewMode} />
                </motion.div>
              )}
            </div>
          ))}

          {/* Direct crypto methods */}
          <MethodGrid methods={filterMethods(CRYPTO_DIRECT)} viewMode={viewMode} />

          {/* E-payments section */}
          <SectionHeader icon="💲" title="E-payments" />
          <MethodGrid methods={filterMethods(EPAYMENT_METHODS)} viewMode={viewMode} />
        </div>

        {/* Right sidebar info */}
        <div className="w-[280px] shrink-0 mt-24">
          <div className="space-y-4">
            <InfoItem icon={<CircleDollarSign size={18} className="text-[#0EB85B]" />} text="Minimum deposit amount: $5" />
            <InfoItem icon={<Gift size={18} className="text-[#3B82F6]" />} text="Gifts for deposit" />
            <InfoItem icon={<Shield size={18} className="text-[#0EB85B]" />} text="Quick and easy withdrawal" />
            <InfoItem icon={<CircleDollarSign size={18} className="text-[#3B82F6]" />} text="Minimum withdrawal amount: $10" />
            <InfoItem icon={<Ban size={18} className="text-[#6B7280]" />} text="No commission" />
          </div>

          <div className="mt-8 text-sm text-[#6B7280] space-y-3">
            <p>Do you have questions or need help with account top-up?</p>
            <a href="#" className="block text-[#0EB85B] hover:underline font-medium">View our User Guide</a>
            <a href="#" className="block text-[#0EB85B] hover:underline font-medium">Contact Support Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="text-base">{icon}</span>
      <span className="font-bold text-sm text-[#E0E2E7]">{title}</span>
      <div className="flex-1 border-t border-dashed border-[#3A4255]" />
    </div>
  );
}

function MethodGrid({ methods, viewMode }: { methods: PaymentMethod[]; viewMode: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2 mb-4">
        {methods.map((method, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-4 px-5 py-3.5 bg-[#2B3040] rounded-lg border border-[#3A4255] hover:border-[#4A5268] hover:bg-[#323848] transition-colors"
          >
            <IconDisplay icon={method.icon} size={32} />
            <span className="font-semibold text-sm flex-1 text-left">{method.name}</span>
            <span className="text-xs text-[#6B7280]">Min: {method.min}</span>
            <span className="text-xs text-[#6B7280]">{method.time}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {methods.map((method, i) => (
        <button
          key={i}
          className="flex flex-col items-center bg-[#2B3040] rounded-lg border border-[#3A4255] hover:border-[#4A5268] hover:bg-[#323848] transition-colors overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-4 w-full">
            <IconDisplay icon={method.icon} size={32} />
            <span className="font-semibold text-xs text-left leading-tight">{method.name}</span>
          </div>
          <div className="flex w-full border-t border-[#3A4255]">
            <span className="flex-1 text-center text-[10px] text-[#6B7280] py-1.5 border-r border-[#3A4255]">Min: {method.min}</span>
            <span className="flex-1 text-center text-[10px] text-[#6B7280] py-1.5">{method.time}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm text-[#E0E2E7]">{text}</span>
    </div>
  );
}
