import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, AlertCircle, ArrowRight } from 'lucide-react';

const TABS = ['WITHDRAWAL', 'TRANSACTIONS', 'TRADES', 'MY ACCOUNT', 'MARKET', 'TOURNAMENTS', 'ANALYTICS'];

const FAQ_LEFT = [
  'How to withdraw money from the account?',
  'How long does it take to withdraw funds?',
  'What is the minimum withdrawal amount?',
  'Is there any fee for depositing or withdrawing funds from the account?',
  'Do I need to provide any documents to make a withdrawal?',
];

const FAQ_RIGHT = [
  'What is account verification?',
  'How to understand that I need to go through account verification?',
  'How long does the verification process take?',
  'How do I know that I successfully passed verification?',
];

const FAQ_ANSWERS: Record<string, string> = {
  'How to withdraw money from the account?': 'You can withdraw funds using the same payment method you used for depositing. Go to the withdrawal section, select your preferred method, enter the amount, and confirm.',
  'How long does it take to withdraw funds?': 'Withdrawal requests are typically processed within 1-3 business days. Crypto withdrawals may be faster.',
  'What is the minimum withdrawal amount?': 'The minimum withdrawal amount is $10.',
  'Is there any fee for depositing or withdrawing funds from the account?': 'We do not charge any commission for deposits or withdrawals. However, your payment provider may apply their own fees.',
  'Do I need to provide any documents to make a withdrawal?': 'For security purposes, you may need to verify your identity before making a withdrawal. This includes providing a valid ID and proof of address.',
  'What is account verification?': 'Account verification is a process to confirm your identity. It helps protect your account and comply with regulations.',
  'How to understand that I need to go through account verification?': 'You will be notified when verification is required, typically before your first withdrawal.',
  'How long does the verification process take?': 'Verification is usually completed within 24 hours after submitting all required documents.',
  'How do I know that I successfully passed verification?': 'You will receive a notification confirming your verification status. You can also check it in your account settings.',
};

// Withdrawal methods available when user has balance
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
  { name: 'USDC (USDC ERC-20)', category: 'Cryptocurrencies' },
  { name: 'Dash', category: 'Cryptocurrencies' },
  { name: 'Polygon (MATIC)', category: 'Cryptocurrencies' },
  { name: 'Dai', category: 'Cryptocurrencies' },
  { name: 'Shiba Inu (ERC-20)', category: 'Cryptocurrencies' },
  { name: 'Dogecoin', category: 'Cryptocurrencies' },
  { name: 'Ripple', category: 'Cryptocurrencies' },
];

interface WithdrawalPageProps {
  balance?: number;
}

export default function WithdrawalPage({ balance: propBalance }: WithdrawalPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('WITHDRAWAL');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Get balance from localStorage (shared with Trade page)
  const storedBalance = localStorage.getItem('demo_balance');
  const balance = propBalance ?? (storedBalance ? parseFloat(storedBalance) : 10000);
  const availableForWithdrawal = balance;

  const hasBalance = balance > 0;

  const epaymentMethods = WITHDRAWAL_METHODS.filter(m => m.category === 'E-payments');
  const cryptoMethods = WITHDRAWAL_METHODS.filter(m => m.category === 'Cryptocurrencies');

  return (
    <div className="min-h-screen bg-[#1A1D29] text-[#E0E2E7]">
      {/* Top tabs bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-6 py-3 bg-[#1B1F2D] border-b border-[#2B3040]">
        <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => navigate('/trade')}
            className="mr-2 md:mr-4 text-[#6B7280] hover:text-[#E0E2E7] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-[#2B3040] text-[#E0E2E7]'
                  : 'text-[#6B7280] hover:text-[#E0E2E7]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-xs mt-2 md:mt-0 px-2 md:px-0">
          <div className="text-right">
            <div className="text-[#6B7280]">Available for withdrawal</div>
            <div className="font-bold text-base">{balance.toFixed(2)} $</div>
          </div>
          <div className="text-right">
            <div className="text-[#6B7280]">In the account</div>
            <div className="font-bold text-base">{balance.toFixed(2)} $</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {hasBalance ? (
          /* === HAS BALANCE: Show withdrawal methods === */
          <div>
            {selectedMethod ? (
              /* Withdrawal form */
              <div className="max-w-[600px]">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="flex items-center gap-2 text-[#6B7280] hover:text-[#E0E2E7] mb-6 text-sm"
                >
                  <ArrowLeft size={16} /> Back to methods
                </button>
                <h2 className="text-xl font-bold mb-6">Withdraw via {selectedMethod}</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#6B7280] mb-1.5 block">Amount ($)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      placeholder="Min: $10"
                      className="w-full bg-[#2B3040] border border-[#3A4255] rounded-lg px-4 py-3 text-sm text-[#E0E2E7] outline-none focus:border-[#0EB85B] transition-colors placeholder:text-[#6B7280]"
                    />
                    <div className="text-xs text-[#6B7280] mt-1">
                      Available: ${availableForWithdrawal.toFixed(2)}
                    </div>
                  </div>

                  {selectedMethod.includes('UPI') || selectedMethod === 'PayTM' || selectedMethod === 'PhonePe' ? (
                    <div>
                      <label className="text-xs text-[#6B7280] mb-1.5 block">UPI ID / Phone Number</label>
                      <input
                        type="text"
                        placeholder="Enter your UPI ID or phone number"
                        className="w-full bg-[#2B3040] border border-[#3A4255] rounded-lg px-4 py-3 text-sm text-[#E0E2E7] outline-none focus:border-[#0EB85B] transition-colors placeholder:text-[#6B7280]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-[#6B7280] mb-1.5 block">Wallet Address</label>
                      <input
                        type="text"
                        placeholder="Enter your wallet address"
                        className="w-full bg-[#2B3040] border border-[#3A4255] rounded-lg px-4 py-3 text-sm text-[#E0E2E7] outline-none focus:border-[#0EB85B] transition-colors placeholder:text-[#6B7280]"
                      />
                    </div>
                  )}

                  <button
                    className="w-full bg-[#0EB85B] hover:bg-[#0EB85B]/90 text-white font-bold py-3 rounded-lg transition-colors mt-4"
                    onClick={() => {
                      alert('Withdrawal request submitted! Processing takes 1-3 business days.');
                      setSelectedMethod(null);
                      setWithdrawAmount('');
                    }}
                  >
                    Request Withdrawal
                  </button>
                </div>
              </div>
            ) : (
              /* Method selection */
              <div className="flex gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <AlertCircle size={18} className="text-[#3B82F6]" />
                    <p className="text-sm text-[#6B7280]">
                      You can withdraw money from your balance to your bank card or electronic purse you used for depositing. 
                      Withdrawal requests are processed in 3 business days.
                    </p>
                  </div>

                  {/* E-payments */}
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <span>💳</span> E-payments
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {epaymentMethods.map(m => (
                      <button
                        key={m.name}
                        onClick={() => setSelectedMethod(m.name)}
                        className="flex items-center gap-3 px-5 py-4 bg-[#2B3040] rounded-lg border border-[#3A4255] hover:border-[#4A5268] hover:bg-[#323848] transition-colors text-left"
                      >
                        <span className="font-semibold text-sm">{m.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Cryptocurrencies */}
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <span>⚙️</span> Cryptocurrencies
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {cryptoMethods.map(m => (
                      <button
                        key={m.name}
                        onClick={() => setSelectedMethod(m.name)}
                        className="flex items-center gap-3 px-5 py-4 bg-[#2B3040] rounded-lg border border-[#3A4255] hover:border-[#4A5268] hover:bg-[#323848] transition-colors text-left"
                      >
                        <span className="font-semibold text-sm">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side - selected method panel */}
                <div className="w-[280px] shrink-0">
                  <div className="space-y-3 text-sm text-[#6B7280]">
                    <div className="flex items-center justify-between">
                      <span>Available for withdrawal:</span>
                      <span className="text-[#E0E2E7] font-bold">${availableForWithdrawal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Minimum withdrawal:</span>
                      <span className="text-[#E0E2E7] font-bold">$10.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Commission:</span>
                      <span className="text-[#0EB85B] font-bold">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* === NO BALANCE: Show empty state === */
          <div className="flex gap-8">
            {/* Account info */}
            <div className="w-[200px]">
              <h3 className="font-bold text-sm mb-4">Account:</h3>
              <div className="mb-6">
                <div className="text-xs text-[#6B7280] mb-1">In the account:</div>
                <div className="text-2xl font-bold">0.00 $</div>
              </div>
              <div className="border-t border-dashed border-[#3A4255] pt-4">
                <div className="text-xs text-[#6B7280] mb-1">Available for withdrawal:</div>
                <div className="text-2xl font-bold">0.00 $</div>
              </div>
            </div>

            {/* Withdrawal notice */}
            <div className="flex-1 max-w-[500px]">
              <h3 className="font-bold text-sm mb-4">Withdrawal:</h3>
              <div className="bg-[#2B3040] border border-[#FF3F2C]/30 rounded-lg p-5">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-[#FF3F2C] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#E0E2E7] leading-relaxed">
                      You can withdraw money from your balance to your bank card or electronic purse you used for depositing. You can request withdrawal any time. Your withdrawal requests are processed in 3 business days.
                    </p>
                    <button
                      onClick={() => navigate('/deposit')}
                      className="text-[#0EB85B] text-sm font-medium mt-3 hover:underline"
                    >
                      Make a deposit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Latest requests */}
        <div className="mt-8 pt-6 border-t border-dashed border-[#3A4255]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Some of your latest requests:</h3>
            <button className="flex items-center gap-2 text-[#3B82F6] text-sm font-medium hover:underline">
              All financial history
              <ArrowRight size={16} className="bg-[#3B82F6] text-white rounded-full p-0.5" />
            </button>
          </div>
          <div className="text-sm text-[#6B7280] py-4">No withdrawal requests yet.</div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 pt-6 border-t border-dashed border-[#3A4255]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm">FAQ:</h3>
            <button className="flex items-center gap-2 text-[#3B82F6] text-sm font-medium hover:underline">
              Check out full FAQ
              <ArrowRight size={16} className="bg-[#3B82F6] text-white rounded-full p-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-1">
            {[...FAQ_LEFT, ...FAQ_RIGHT].map(q => (
              <div key={q} className="border-b border-[#2B3040]">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === q ? null : q)}
                  className="flex items-center gap-2 w-full py-3 text-left text-sm font-medium hover:text-[#0EB85B] transition-colors"
                >
                  <ChevronDown
                    size={14}
                    className={`text-[#6B7280] transition-transform shrink-0 ${expandedFaq === q ? 'rotate-180' : ''}`}
                  />
                  {q}
                </button>
                {expandedFaq === q && (
                  <div className="pb-3 pl-6 text-sm text-[#6B7280] leading-relaxed">
                    {FAQ_ANSWERS[q]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
