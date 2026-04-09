import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3X3, List, ChevronDown, Gift, Shield, CircleDollarSign, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from '@/components/trading/Sidebar';

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

const TABS = ['Deposit', 'Withdrawal', 'History', 'Cashback', 'Promo codes', 'My safe'];

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
    name: 'Tether (USDT)', icon: tetherTrc20, available: 10,
    methods: [
      { name: 'Binance Pay', icon: binanceCryptoLogo, min: '$5', time: '~1 min.', category: 'crypto' as const },
      { name: 'ByBit Pay', icon: bybitLogo, min: '$5', time: '~5 min.', category: 'crypto' as const },
      { name: 'KuCoin Pay', icon: kucoinLogo, min: '$5', time: '~5 min.', category: 'crypto' as const },
    ],
  },
  {
    name: 'USD Coin (USDC)', icon: usdcLogo, available: 8,
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
  { name: 'opBNB BNB', icon: bnbLogo, min: '$5', time: '~5 min.', category: 'crypto' },
  { name: 'Polygon (MATIC)', icon: polygonLogo, min: '$5', time: '~5 min.', category: 'crypto' },
];

const EPAYMENT_METHODS: PaymentMethod[] = [
  { name: 'Volet.com (ex. Advcash)', icon: voletLogo, min: '$5', time: '~1 min.', category: 'epayments' },
  { name: 'Jetonbank', icon: jetonbankLogo, min: '$5', time: '~1 min.', category: 'epayments' },
  { name: 'MoneyGo', icon: moneygoLogo, min: '$5', time: '~5 min.', category: 'epayments' },
];

function isImageUrl(icon: string): boolean {
  return icon.startsWith('/') || icon.startsWith('data:') || icon.includes('/assets/');
}

function IconDisplay({ icon, size = 50 }: { icon: string; size?: number }) {
  if (isImageUrl(icon)) {
    return <img src={icon} alt="" className="object-contain" style={{ width: size, height: size }} />;
  }
  return <span style={{ fontSize: size * 0.75 }}>{icon}</span>;
}

export default function DepositPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('Deposit');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCrypto, setExpandedCrypto] = useState<string | null>('Tether (USDT)');

  const filterMethods = (methods: PaymentMethod[]) =>
    methods.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleSidebarNav = (id: string) => {
    if (id === 'trade') navigate('/trade');
    else if (id === 'account') navigate('/account');
    else if (id === 'support') navigate('/support');
  };

  const handleTabClick = (tab: string) => {
    if (tab === 'Withdrawal') navigate('/account?tab=withdrawal');
    else setActiveTab(tab);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {!isMobile && <Sidebar activeTab="trade" onTabChange={handleSidebarNav} />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top tabs bar */}
        <div className="flex items-center gap-1 px-3 md:px-6 py-3 bg-card border-b border-border overflow-x-auto scrollbar-hide shrink-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-3 md:px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'Deposit' ? (
            <div className="max-w-[1200px] mx-auto px-3 md:px-6 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-6">Account top-up</h1>

                {/* Steps */}
                <div className="flex items-center gap-0 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
                  {['Deposit method', 'Payment details', 'Payment process', 'Payment execution'].map((step, i) => (
                    <div key={step} className="flex items-center flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>{i + 1}</span>
                        <span className={`text-xs font-medium ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                      </div>
                      {i < 3 && <div className="flex-1 h-px bg-border mx-3" />}
                    </div>
                  ))}
                </div>

                {/* Search bar */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5 border border-border">
                    <Search size={16} className="text-muted-foreground" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
                      className="bg-transparent text-sm text-foreground outline-none flex-1 placeholder:text-muted-foreground font-medium" />
                  </div>
                  <button onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg border transition-colors ${viewMode === 'grid' ? 'bg-accent border-border text-foreground' : 'bg-muted border-border text-muted-foreground'}`}>
                    <Grid3X3 size={16} />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg border transition-colors ${viewMode === 'list' ? 'bg-accent border-border text-foreground' : 'bg-muted border-border text-muted-foreground'}`}>
                    <List size={16} />
                  </button>
                </div>

                <SectionHeader icon="⭐" title="Popular" />
                <MethodGrid methods={filterMethods(POPULAR_METHODS)} viewMode={viewMode} />

                <SectionHeader icon="🏦" title="Bank" />
                <MethodGrid methods={filterMethods(BANK_METHODS)} viewMode={viewMode} />

                <SectionHeader icon="⚙️" title="Crypto currency" />
                {CRYPTO_NETWORKS.map(network => (
                  <div key={network.name} className="mb-3">
                    <button onClick={() => setExpandedCrypto(expandedCrypto === network.name ? null : network.name)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-muted rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <IconDisplay icon={network.icon} size={36} />
                        <span className="font-semibold text-sm text-foreground">{network.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground text-xs">
                        <span>Select a network</span>
                        <span>Available: {network.available}</span>
                        <ChevronDown size={16} className={`transition-transform ${expandedCrypto === network.name ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {expandedCrypto === network.name && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                        <MethodGrid methods={network.methods} viewMode={viewMode} />
                      </motion.div>
                    )}
                  </div>
                ))}
                <MethodGrid methods={filterMethods(CRYPTO_DIRECT)} viewMode={viewMode} />

                <SectionHeader icon="💲" title="E-payments" />
                <MethodGrid methods={filterMethods(EPAYMENT_METHODS)} viewMode={viewMode} />
              </div>

              {/* Right sidebar info */}
              <div className="w-full md:w-[280px] shrink-0 md:mt-24">
                <div className="space-y-4">
                  <InfoItem icon={<CircleDollarSign size={18} className="text-success" />} text="Minimum deposit amount: $5" />
                  <InfoItem icon={<Gift size={18} className="text-primary" />} text="Gifts for deposit" />
                  <InfoItem icon={<Shield size={18} className="text-success" />} text="Quick and easy withdrawal" />
                  <InfoItem icon={<CircleDollarSign size={18} className="text-primary" />} text="Minimum withdrawal amount: $10" />
                  <InfoItem icon={<Ban size={18} className="text-muted-foreground" />} text="No commission" />
                </div>
                <div className="mt-8 text-sm text-muted-foreground space-y-3">
                  <p>Do you have questions or need help with account top-up?</p>
                  <a href="#" className="block text-primary hover:underline font-medium">View our User Guide</a>
                  <a href="#" className="block text-primary hover:underline font-medium">Contact Support Service</a>
                </div>
              </div>
            </div>
          ) : (
            <PlaceholderTab title={activeTab} />
          )}
        </div>
      </div>

      {isMobile && <Sidebar activeTab="trade" onTabChange={handleSidebarNav} />}
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <span className="text-primary text-2xl font-bold">{title[0]}</span>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm">Content coming soon.</p>
      <div className="mt-6 px-4 py-2 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground">Coming soon</div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="text-base">{icon}</span>
      <span className="font-bold text-sm text-foreground">{title}</span>
      <div className="flex-1 border-t border-dashed border-border" />
    </div>
  );
}

function MethodGrid({ methods, viewMode }: { methods: PaymentMethod[]; viewMode: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2 mb-4">
        {methods.map((method, i) => (
          <button key={i} className="w-full flex items-center gap-4 px-5 py-3.5 bg-muted rounded-lg border border-border hover:border-primary/30 hover:bg-accent transition-colors">
            <IconDisplay icon={method.icon} size={32} />
            <span className="font-semibold text-sm text-foreground flex-1 text-left">{method.name}</span>
            <span className="text-xs text-muted-foreground">Min: {method.min}</span>
            <span className="text-xs text-muted-foreground">{method.time}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
      {methods.map((method, i) => (
        <button key={i} className="flex flex-col items-center bg-muted rounded-lg border border-border hover:border-primary/30 hover:bg-accent transition-colors overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 w-full">
            <IconDisplay icon={method.icon} size={32} />
            <span className="font-semibold text-xs text-foreground text-left leading-tight">{method.name}</span>
          </div>
          <div className="flex w-full border-t border-border">
            <span className="flex-1 text-center text-[10px] text-muted-foreground py-1.5 border-r border-border">Min: {method.min}</span>
            <span className="flex-1 text-center text-[10px] text-muted-foreground py-1.5">{method.time}</span>
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
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}
