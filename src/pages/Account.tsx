import { useState, useRef, useEffect } from 'react';
import { Camera, Globe, Clock, ChevronDown, AlertCircle, CheckCircle2, Lock, X, Pencil, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from '@/components/trading/Sidebar';

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' }, { code: 'AL', name: 'Albania', flag: '🇦🇱' }, { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' }, { code: 'AO', name: 'Angola', flag: '🇦🇴' }, { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' }, { code: 'AM', name: 'Armenia', flag: '🇦🇲' }, { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' }, { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' }, { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' }, { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' }, { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' }, { code: 'BE', name: 'Belgium', flag: '🇧🇪' }, { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' }, { code: 'BT', name: 'Bhutan', flag: '🇧🇹' }, { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' }, { code: 'BW', name: 'Botswana', flag: '🇧🇼' }, { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' }, { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' }, { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' }, { code: 'KH', name: 'Cambodia', flag: '🇰🇭' }, { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' }, { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' }, { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' }, { code: 'CL', name: 'Chile', flag: '🇨🇱' }, { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' }, { code: 'KM', name: 'Comoros', flag: '🇰🇲' }, { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' }, { code: 'HR', name: 'Croatia', flag: '🇭🇷' }, { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' }, { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' }, { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' }, { code: 'DM', name: 'Dominica', flag: '🇩🇲' }, { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' }, { code: 'EG', name: 'Egypt', flag: '🇪🇬' }, { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' }, { code: 'ER', name: 'Eritrea', flag: '🇪🇷' }, { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' }, { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' }, { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' }, { code: 'FR', name: 'France', flag: '🇫🇷' }, { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' }, { code: 'GE', name: 'Georgia', flag: '🇬🇪' }, { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' }, { code: 'GR', name: 'Greece', flag: '🇬🇷' }, { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' }, { code: 'GN', name: 'Guinea', flag: '🇬🇳' }, { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' }, { code: 'HT', name: 'Haiti', flag: '🇭🇹' }, { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' }, { code: 'IS', name: 'Iceland', flag: '🇮🇸' }, { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' }, { code: 'IR', name: 'Iran', flag: '🇮🇷' }, { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' }, { code: 'IL', name: 'Israel', flag: '🇮🇱' }, { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' }, { code: 'JP', name: 'Japan', flag: '🇯🇵' }, { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' }, { code: 'KE', name: 'Kenya', flag: '🇰🇪' }, { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' }, { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' }, { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' }, { code: 'LB', name: 'Lebanon', flag: '🇱🇧' }, { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' }, { code: 'LY', name: 'Libya', flag: '🇱🇾' }, { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' }, { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' }, { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' }, { code: 'MY', name: 'Malaysia', flag: '🇲🇾' }, { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' }, { code: 'MT', name: 'Malta', flag: '🇲🇹' }, { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' }, { code: 'MU', name: 'Mauritius', flag: '🇲🇺' }, { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' }, { code: 'MD', name: 'Moldova', flag: '🇲🇩' }, { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' }, { code: 'ME', name: 'Montenegro', flag: '🇲🇪' }, { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' }, { code: 'MM', name: 'Myanmar', flag: '🇲🇲' }, { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' }, { code: 'NP', name: 'Nepal', flag: '🇳🇵' }, { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' }, { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' }, { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' }, { code: 'KP', name: 'North Korea', flag: '🇰🇵' }, { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' }, { code: 'OM', name: 'Oman', flag: '🇴🇲' }, { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' }, { code: 'PS', name: 'Palestine', flag: '🇵🇸' }, { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' }, { code: 'PY', name: 'Paraguay', flag: '🇵🇾' }, { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' }, { code: 'PL', name: 'Poland', flag: '🇵🇱' }, { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' }, { code: 'RO', name: 'Romania', flag: '🇷🇴' }, { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' }, { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' }, { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent', flag: '🇻🇨' }, { code: 'WS', name: 'Samoa', flag: '🇼🇸' }, { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' }, { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' }, { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' }, { code: 'SC', name: 'Seychelles', flag: '🇸🇨' }, { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' }, { code: 'SK', name: 'Slovakia', flag: '🇸🇰' }, { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' }, { code: 'SO', name: 'Somalia', flag: '🇸🇴' }, { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' }, { code: 'SS', name: 'South Sudan', flag: '🇸🇸' }, { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' }, { code: 'SD', name: 'Sudan', flag: '🇸🇩' }, { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' }, { code: 'CH', name: 'Switzerland', flag: '🇨🇭' }, { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' }, { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' }, { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' }, { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' }, { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' }, { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' }, { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' }, { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' }, { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' }, { code: 'UA', name: 'Ukraine', flag: '🇺🇦' }, { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' }, { code: 'US', name: 'United States', flag: '🇺🇸' }, { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' }, { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' }, { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' }, { code: 'VN', name: 'Vietnam', flag: '🇻🇳' }, { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' }, { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
];

const TABS = ['Withdrawal', 'Transactions', 'Trades', 'My account', 'Market', 'Tournaments', 'Analytics'];

const WITHDRAWAL_METHODS = [
  { name: 'UPI', category: 'E-payments' },
  { name: 'PayTM', category: 'E-payments' },
  { name: 'PhonePe', category: 'E-payments' },
  { name: 'USDT (TRC-20)', category: 'Cryptocurrencies' },
  { name: 'Binance Pay', category: 'Cryptocurrencies' },
  { name: 'Litecoin (LTC)', category: 'Cryptocurrencies' },
  { name: 'USDT (ERC-20)', category: 'Cryptocurrencies' },
  { name: 'USDT (BEP-20)', category: 'Cryptocurrencies' },
  { name: 'Bitcoin (BTC)', category: 'Cryptocurrencies' },
  { name: 'Ethereum (ETH)', category: 'Cryptocurrencies' },
  { name: 'Bitcoin Cash', category: 'Cryptocurrencies' },
  { name: 'Tron (TRX)', category: 'Cryptocurrencies' },
];

const FAQ_ITEMS = [
  { q: 'How to withdraw money from the account?', a: 'You can withdraw funds using the same payment method you used for depositing.' },
  { q: 'How long does it take to withdraw funds?', a: 'Withdrawal requests are typically processed within 1-3 business days.' },
  { q: 'What is the minimum withdrawal amount?', a: 'The minimum withdrawal amount is $10.' },
  { q: 'Is there any fee for depositing or withdrawing funds?', a: 'We do not charge any commission for deposits or withdrawals.' },
  { q: 'What is account verification?', a: 'Account verification is a process to confirm your identity for security purposes.' },
  { q: 'How long does the verification process take?', a: 'Verification is usually completed within 24 hours.' },
];

export default function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const tabFromUrl = searchParams.get('tab');
  const initialTab = TABS.find(t => t.toLowerCase().replace(/\s+/g, '-') === tabFromUrl) || 'My account';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab: tab.toLowerCase().replace(/\s+/g, '-') });
  };

  const balance = parseFloat(localStorage.getItem('demo_balance') || '10000');

  const handleSidebarNav = (id: string) => {
    if (id === 'trade') navigate('/trade');
    else if (id === 'support') navigate('/support');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {!isMobile && <Sidebar activeTab="account" onTabChange={handleSidebarNav} />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top tabs bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border bg-card px-3 md:px-6 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="accountTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm py-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-bold text-foreground flex items-center gap-1">
                $ USD
                <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded ml-1">CHANGE</span>
              </span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">Available for withdrawal</div>
              <div className="font-bold text-foreground">{balance.toFixed(2)}$</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">In the account</div>
              <div className="font-bold text-foreground">{balance.toFixed(2)}$</div>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'My account' && <MyAccountContent balance={balance} />}
              {activeTab === 'Withdrawal' && <WithdrawalContent balance={balance} />}
              {activeTab === 'Transactions' && <PlaceholderSection title="Transactions" description="View your deposit and withdrawal transaction history." />}
              {activeTab === 'Trades' && <PlaceholderSection title="Trades" description="Review your past trades and performance history." />}
              {activeTab === 'Market' && <PlaceholderSection title="Market" description="Explore market insights and asset information." />}
              {activeTab === 'Tournaments' && <PlaceholderSection title="Tournaments" description="Compete in trading tournaments and win prizes." />}
              {activeTab === 'Analytics' && <PlaceholderSection title="Analytics" description="Analyze your trading performance with detailed statistics." />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {isMobile && <Sidebar activeTab="account" onTabChange={handleSidebarNav} />}
    </div>
  );
}

/* ==================== PLACEHOLDER SECTION ==================== */
function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-10">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-primary text-2xl font-bold">{title[0]}</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">{description}</p>
        <div className="mt-6 px-4 py-2 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground">
          Coming soon
        </div>
      </div>
    </div>
  );
}

/* ==================== WITHDRAWAL CONTENT ==================== */
function WithdrawalContent({ balance }: { balance: number }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const navigate = useNavigate();

  const hasBalance = balance > 0;
  const epaymentMethods = WITHDRAWAL_METHODS.filter(m => m.category === 'E-payments');
  const cryptoMethods = WITHDRAWAL_METHODS.filter(m => m.category === 'Cryptocurrencies');

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 md:py-8">
      {hasBalance ? (
        selectedMethod ? (
          <div className="max-w-[600px]">
            <button onClick={() => setSelectedMethod(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
              <ArrowLeft size={16} /> Back to methods
            </button>
            <h2 className="text-xl font-bold text-foreground mb-6">Withdraw via {selectedMethod}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Amount ($)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="Min: $10"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
                <div className="text-xs text-muted-foreground mt-1">Available: ${balance.toFixed(2)}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {selectedMethod.includes('UPI') || selectedMethod === 'PayTM' || selectedMethod === 'PhonePe' ? 'UPI ID / Phone Number' : 'Wallet Address'}
                </label>
                <input
                  type="text"
                  placeholder={selectedMethod.includes('UPI') || selectedMethod === 'PayTM' || selectedMethod === 'PhonePe' ? 'Enter your UPI ID or phone number' : 'Enter your wallet address'}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
              </div>
              <button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-colors mt-4"
                onClick={() => { setSelectedMethod(null); setWithdrawAmount(''); }}
              >
                Request Withdrawal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <AlertCircle size={18} className="text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Withdraw money from your balance to your bank card or electronic purse. Requests are processed in 3 business days.
                </p>
              </div>

              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><span>💳</span> E-payments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {epaymentMethods.map(m => (
                  <button key={m.name} onClick={() => setSelectedMethod(m.name)}
                    className="flex items-center gap-3 px-5 py-4 bg-muted rounded-lg border border-border hover:border-primary/30 hover:bg-accent transition-colors text-left">
                    <span className="font-semibold text-sm text-foreground">{m.name}</span>
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><span>⚙️</span> Cryptocurrencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {cryptoMethods.map(m => (
                  <button key={m.name} onClick={() => setSelectedMethod(m.name)}
                    className="flex items-center gap-3 px-5 py-4 bg-muted rounded-lg border border-border hover:border-primary/30 hover:bg-accent transition-colors text-left">
                    <span className="font-semibold text-sm text-foreground">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-[280px] shrink-0">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Available:</span><span className="text-foreground font-bold">${balance.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Minimum:</span><span className="text-foreground font-bold">$10.00</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Commission:</span><span className="text-success font-bold">0%</span></div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="w-full md:w-[200px]">
            <h3 className="font-bold text-sm text-foreground mb-4">Account:</h3>
            <div className="mb-6">
              <div className="text-xs text-muted-foreground mb-1">In the account:</div>
              <div className="text-2xl font-bold text-foreground">0.00 $</div>
            </div>
            <div className="border-t border-dashed border-border pt-4">
              <div className="text-xs text-muted-foreground mb-1">Available for withdrawal:</div>
              <div className="text-2xl font-bold text-foreground">0.00 $</div>
            </div>
          </div>
          <div className="flex-1 max-w-[500px]">
            <h3 className="font-bold text-sm text-foreground mb-4">Withdrawal:</h3>
            <div className="bg-muted border border-danger/30 rounded-lg p-5">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    You can withdraw money from your balance to your bank card or electronic purse you used for depositing.
                  </p>
                  <button onClick={() => navigate('/deposit')} className="text-primary text-sm font-medium mt-3 hover:underline">Make a deposit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest requests */}
      <div className="mt-8 pt-6 border-t border-dashed border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-foreground">Some of your latest requests:</h3>
          <button className="flex items-center gap-2 text-primary text-sm font-medium hover:underline">
            All financial history
            <ArrowRight size={16} className="bg-primary text-primary-foreground rounded-full p-0.5" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground py-4">No withdrawal requests yet.</div>
      </div>

      {/* FAQ */}
      <div className="mt-8 pt-6 border-t border-dashed border-border">
        <h3 className="font-bold text-sm text-foreground mb-6">FAQ:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q} className="border-b border-border">
              <button onClick={() => setExpandedFaq(expandedFaq === q ? null : q)}
                className="flex items-center gap-2 w-full py-3 text-left text-sm font-medium text-foreground hover:text-primary transition-colors">
                <ChevronDown size={14} className={`text-muted-foreground transition-transform shrink-0 ${expandedFaq === q ? 'rotate-180' : ''}`} />
                {q}
              </button>
              {expandedFaq === q && <div className="pb-3 pl-6 text-sm text-muted-foreground leading-relaxed">{a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== MY ACCOUNT CONTENT ==================== */
function MyAccountContent({ balance }: { balance: number }) {
  const [nickname, setNickname] = useState('#85396662');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [email] = useState('user@arcanine.com');
  const [country, setCountry] = useState('India');
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [address, setAddress] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);
  const [enterPlatform, setEnterPlatform] = useState(true);
  const [withdrawFunds, setWithdrawFunds] = useState(true);
  const [language] = useState('English');
  const [timezone] = useState('(UTC+05:30)');

  const selectedCountryObj = COUNTRIES.find(c => c.name === country);
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-3 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_280px] gap-6 md:gap-8">
        {/* Column 1: Personal data */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Personal data:</h3>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">A</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center hover:bg-accent/80">
                <Camera size={10} className="text-muted-foreground" />
              </button>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{email}</div>
              <div className="text-xs text-muted-foreground">ID: 85396662</div>
              <span className="bg-danger/20 text-danger text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit mt-0.5">
                <X size={8} /> Not verified
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <FloatingInput label="Nickname" value={nickname} onChange={setNickname} />
            <FloatingInput label="First Name" value={firstName} onChange={setFirstName} placeholder="Empty" />
            <FloatingInput label="Last Name" value={lastName} onChange={setLastName} placeholder="Empty" />
            <FloatingInput label="Date of birth" value={dob} onChange={setDob} placeholder="mm/dd/yyyy" />
            <FloatingInput label="Aadhaar" value={aadhaar} onChange={setAadhaar} placeholder="Empty" />

            <div className="relative">
              <div className="border border-border rounded-lg bg-input px-3 pt-4 pb-2">
                <label className="absolute top-1.5 left-3 text-[10px] text-muted-foreground">Email</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-orange-400">Unverified</span>
                    <button className="bg-danger text-danger-foreground text-[9px] font-bold px-2 py-0.5 rounded hover:bg-danger/90">RESEND</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative" ref={countryRef}>
              <button type="button" onClick={() => { setCountryOpen(!countryOpen); setCountrySearch(''); }}
                className="w-full border border-border rounded-lg bg-input px-3 pt-4 pb-2 text-left">
                <label className="absolute top-1.5 left-3 text-[10px] text-muted-foreground">Country</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground flex items-center gap-2">
                    {selectedCountryObj && <span className="text-base">{selectedCountryObj.flag}</span>}
                    {country}
                  </span>
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {countryOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center gap-2 bg-background rounded-md px-3 py-2">
                        <Search size={14} className="text-muted-foreground" />
                        <input type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search country..." autoFocus
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" />
                      </div>
                    </div>
                    <div data-lenis-prevent className="max-h-[280px] overflow-y-auto">
                      {filteredCountries.length === 0 && <div className="px-3 py-4 text-center text-sm text-muted-foreground">No countries found</div>}
                      {filteredCountries.map(c => (
                        <button key={c.code} onClick={() => { setCountry(c.name); setCountryOpen(false); setCountrySearch(''); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left ${country === c.name ? 'bg-accent text-primary' : 'text-foreground'}`}>
                          <span className="text-base">{c.flag}</span><span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FloatingInput label="Address" value={address} onChange={setAddress} placeholder="Empty" />
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-colors text-sm">Save</button>
          </div>
        </motion.div>

        {/* Column 2: Documents */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Documents verification:</h3>
          <div className="bg-muted border border-border rounded-lg p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle size={14} className="text-danger" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">You need fill identity information before verification your account.</p>
          </div>
        </motion.div>

        {/* Column 3: Security */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Security:</h3>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-foreground">Two-step verification</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">Receiving codes via Email <Pencil size={10} className="text-primary cursor-pointer" /></div>
              </div>
            </div>
            <div className="flex items-center gap-3"><ToggleSwitch enabled={enterPlatform} onChange={setEnterPlatform} /><span className="text-sm text-foreground">To enter the platform</span></div>
            <div className="flex items-center gap-3"><ToggleSwitch enabled={withdrawFunds} onChange={setWithdrawFunds} /><span className="text-sm text-foreground">To withdraw funds</span></div>
            <div className="flex items-start gap-3 mt-4 pt-4 border-t border-border">
              <Lock size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-foreground">Password</div>
                <div className="text-xs text-muted-foreground">Change your account password</div>
                <button className="text-xs text-primary hover:underline mt-1">Change</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Column 4: Settings */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="space-y-4">
          <div className="relative">
            <div className="border border-border rounded-lg bg-input px-3 pt-4 pb-2">
              <label className="absolute top-1.5 left-3 text-[10px] text-muted-foreground">Language</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Globe size={14} className="text-muted-foreground" /><span className="text-sm text-foreground">{language}</span></div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="border border-border rounded-lg bg-input px-3 pt-4 pb-2">
              <label className="absolute top-1.5 left-3 text-[10px] text-muted-foreground">Timezone</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Clock size={14} className="text-muted-foreground" /><span className="text-sm text-foreground">{timezone}</span></div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-danger hover:text-danger/80 text-sm mt-4 transition-colors"><X size={14} />Delete My account</button>
        </motion.div>
      </div>
    </div>
  );
}

/* ==================== HELPERS ==================== */
function FloatingInput({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <div className="border border-border rounded-lg bg-input px-3 pt-4 pb-2">
        <label className="absolute top-1.5 left-3 text-[10px] text-muted-foreground">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" />
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)} className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
