import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'GENERAL',
    items: [
      {
        question: 'What is Arcanine?',
        answer: 'Arcanine is a digital options trading platform where you can trade on the price movements of assets including crypto, forex, commodities, and indices. You predict whether the price of an asset will go up or down within a selected timeframe. If your prediction is correct you receive a fixed return.',
      },
      {
        question: 'Who is Arcanine for?',
        answer: 'Arcanine is built for traders of all levels. Whether you are placing your first trade or have years of experience the platform is designed to be fast, simple, and powerful.',
      },
      {
        question: 'Is Arcanine available in my country?',
        answer: 'Arcanine is available in over 150 countries. Availability may vary depending on local regulations. Check the platform at signup to confirm your region is supported.',
      },
      {
        question: 'Is Arcanine safe to use?',
        answer: 'Yes. Arcanine uses SSL encryption, secure payment gateways, and advanced security protocols to protect your personal and financial information.',
      },
    ],
  },
  {
    title: 'DIGITAL OPTIONS',
    items: [
      {
        question: 'What is a Digital Option?',
        answer: 'Option is a derivative financial instrument based on any underlying asset, such as a stock, a currency pair, oil, etc. A digital option is a non-standard option that is used to make a profit on price movements of such assets for a certain period of time. A digital option, depending on the terms agreed upon by the parties to the transaction, at a time determined by the parties, brings a fixed income (the difference between the trade income and the price of the asset) or loss (in the amount of the value of the asset). Since the digital option is purchased in advance at a fixed price, the size of the profit, as well as the size of the potential loss, are known even before the trade. Another feature of these deals is the time limit. Any option has its own term (expiration time or conclusion time).',
      },
      {
        question: 'What are the varieties of digital options?',
        answer: 'Making an option trade, you must choose the underlying asset that will underlie the option. Your forecast will be carried out on this asset. Simply, buying a digital contract, you are actually betting on the price movement of such an underlying asset. An underlying asset is an "item" whose price is taken into account when concluding a trade. As the underlying asset of digital options, the most sought-after products on the markets usually act. There are four types of them: securities (shares of world companies), currency pairs (EUR/USD, GBP/USD, etc.), raw materials and precious metals (oil, gold, etc.), and indices (S&P 500, Dow, dollar index, etc.).',
      },
      {
        question: 'What is the gist of digital options trading?',
        answer: 'A digital option is the simplest type of derivative financial instrument. In order to make money in the digital options market, you do not need to predict the value of the market price of an asset that it can reach. The principle of the trading process is reduced only to the solution of one single task — the price of an asset will increase or decrease by the time the contract is executed. It does not matter that the price of the underlying asset will go one hundred points or only one. It is important for you to determine only the direction of movement of this price. If your prognosis is correct, in any case you get a fixed income.',
      },
      {
        question: 'How to learn quickly how to make money in the digital options market?',
        answer: 'To get a profit in the digital options market, you only need to correctly predict which way the price of the asset you have chosen will go (up or down). Therefore, for a stable income you need to: develop your own trading strategies, in which the number of correctly predicted trades will be maximum, and follow them; diversify your risks. In developing strategies, market monitoring, studying analytical and statistical information that can be obtained from various sources will help you.',
      },
      {
        question: 'What is the expiration period of a trade?',
        answer: 'The expiration period is the time after which the trade will be considered completed (closed) and the result is automatically summed up. When concluding a trade with digital options, you independently determine the time of execution of the transaction (1 minute, 2 hours, month, etc.).',
      },
      {
        question: 'What are the possible results of the placed trades?',
        answer: 'There are three possible outcomes in the digital options market: if your prognosis of determining the direction of the price movement of the underlying asset is correct, you receive income; if by the time the option was concluded your forecast turned out to be erroneous, you incur a loss limited by the size of the asset value; if the outcome of the trade is zero (the price of the underlying asset has not changed), you return your investment. The level of your risk is always limited only by the size of the asset value.',
      },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Visit arcanine.com and click Sign Up. Enter your email address and create a password. Verify your email and your account is ready. The entire process takes under two minutes.',
      },
      {
        question: 'Do I need to verify my identity to trade?',
        answer: 'You can start trading immediately after registration. Identity verification may be required for larger withdrawals or as required by applicable regulations in your region.',
      },
      {
        question: 'Can I have more than one account?',
        answer: 'No. Each user is permitted one account only. Multiple accounts from the same person may result in all accounts being suspended.',
      },
      {
        question: 'What happens if my account is inactive?',
        answer: 'Accounts with no login activity for an extended period may be closed. If your account has a zero balance it may be deleted and cannot be restored. You may register a new account provided you do not already have an active one.',
      },
      {
        question: 'Can I close my account? How to do it?',
        answer: 'You can delete an account in your Individual Account by clicking on the "Delete Account" button located at the bottom of My Account page.',
      },
      {
        question: 'In what currency is my account opened?',
        answer: 'By default, a trading account is opened in US dollars. But for your convenience, the currency can be switched at any time in your profile. A list of available currencies can be found on My Account page.',
      },
    ],
  },
  {
    title: 'DEMO ACCOUNT',
    items: [
      {
        question: 'Does Arcanine offer a demo account?',
        answer: 'Yes. Arcanine offers a free demo account loaded with $10,000 in virtual funds. You can practice trading all available assets with no risk to real money.',
      },
      {
        question: 'Do I need to register to use the demo?',
        answer: 'No. You can access the demo account without registration. Simply visit the platform and start practicing immediately.',
      },
      {
        question: 'Does the demo account expire?',
        answer: 'No. Your demo account remains available as long as you need it.',
      },
      {
        question: 'Is the demo account the same as the live platform?',
        answer: 'Yes. The demo account uses the same interface, charts, assets, and timeframes as the live trading platform. The only difference is that the funds are virtual.',
      },
    ],
  },
  {
    title: 'TRADING',
    items: [
      {
        question: 'How does trading on Arcanine work?',
        answer: 'Select an asset. Choose your trade amount. Choose your timeframe. Predict whether the price will go UP or DOWN. If your prediction is correct at expiry you receive a fixed payout. If incorrect you lose the amount placed on that trade.',
      },
      {
        question: 'What assets can I trade?',
        answer: 'Arcanine offers trading on crypto pairs including BTC/USD, ETH/USD, and SOL/USD. Forex pairs including EUR/USD, GBP/USD, and USD/JPY. Commodities including gold and oil. And major indices.',
      },
      {
        question: 'What timeframes are available?',
        answer: 'You can trade on timeframes from 60 seconds up to 1 hour. Available options include 60 seconds, 3 minutes, 5 minutes, 15 minutes, 30 minutes, and 1 hour.',
      },
      {
        question: 'What is the minimum trade amount?',
        answer: 'The minimum trade amount is $1.',
      },
      {
        question: 'What payout percentage can I expect?',
        answer: 'Payouts vary depending on the asset and market conditions. Maximum payouts of up to 80% are available on selected assets.',
      },
      {
        question: 'Can I cancel a trade after placing it?',
        answer: 'No. Once a trade is confirmed it cannot be cancelled or modified. Always review your trade details before confirming.',
      },
      {
        question: 'What is a trading platform and why is it needed?',
        answer: 'Trading platform is a software complex that allows the Client to conduct trades (operations) using different financial instruments. It has also access to various information such as the value of quotations, real-time market positions, actions of the Company, etc.',
      },
      {
        question: 'Is the download of the program required?',
        answer: 'No, it\'s not required. You just need to register on the website and open an individual account.',
      },
    ],
  },
  {
    title: 'DEPOSITS',
    items: [
      {
        question: 'What is the minimum deposit?',
        answer: 'The minimum deposit is $10.',
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'Arcanine accepts USDT TRC20, USDT BEP20, USDC, Bitcoin, Ethereum, Visa, Mastercard, and local payment methods depending on your region.',
      },
      {
        question: 'How long do deposits take?',
        answer: 'Crypto deposits are credited instantly once confirmed on the blockchain. Card deposits are credited within minutes.',
      },
      {
        question: 'Are there deposit fees?',
        answer: 'Arcanine does not charge deposit fees. Your payment provider or network may apply their own fees. Always check with your provider before depositing.',
      },
      {
        question: 'Is there a maximum deposit?',
        answer: 'There is no platform-imposed maximum deposit limit.',
      },
    ],
  },
  {
    title: 'WITHDRAWALS',
    items: [
      {
        question: 'What is the minimum withdrawal?',
        answer: 'The minimum withdrawal is $10.',
      },
      {
        question: 'How do I withdraw funds?',
        answer: 'Go to the withdrawal section in your dashboard. Select your preferred method. Enter the destination details and amount. Confirm the request. Funds are processed automatically.',
      },
      {
        question: 'How long do withdrawals take?',
        answer: 'Crypto withdrawals are processed instantly. Other methods may take up to 24 hours depending on the payment provider.',
      },
      {
        question: 'Are there withdrawal fees?',
        answer: 'Arcanine does not charge withdrawal fees. Network or provider fees may apply depending on your chosen method.',
      },
      {
        question: 'Can my withdrawal be delayed?',
        answer: 'Withdrawals are processed automatically. In rare cases a delay may occur due to verification requirements, payment provider issues, or security reviews.',
      },
    ],
  },
  {
    title: 'SECURITY',
    items: [
      {
        question: 'How does Arcanine protect my funds?',
        answer: 'Arcanine uses industry standard encryption and secure payment infrastructure to protect all transactions and account data.',
      },
      {
        question: 'How does Arcanine protect my personal data?',
        answer: 'Your personal data is stored securely and never sold or shared with third parties outside of regulatory requirements.',
      },
      {
        question: 'What should I do if I suspect unauthorized access?',
        answer: 'Contact support immediately via live chat or email. Change your password immediately and enable two factor authentication if not already active.',
      },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      {
        question: 'How do I contact support?',
        answer: 'Support is available 24/7 via live chat on the platform and via email. Response times are typically under 5 minutes on live chat.',
      },
      {
        question: 'What languages does support operate in?',
        answer: 'Support is available in English, Hindi, Spanish, Portuguese, Arabic, Indonesian, Vietnamese, Turkish, French, and Bengali.',
      },
      {
        question: 'Where can I learn more about trading?',
        answer: 'Arcanine offers a full educational section including guides, strategy articles, and video tutorials accessible from your dashboard.',
      },
      {
        question: 'At what expense does the Company pay profit?',
        answer: 'Company earns with customers. Therefore, it is interested in the share of profitable transactions significantly prevailing over the share of unprofitable ones, due to the fact that the Company has a percentage of payments for a successful trading strategy chosen by the Client. In addition, trades conducted by the Client together constitute the trading volume of the Company, which is transferred to a broker or exchange, which in turn are included in the pool of liquidity providers, which together leads to an increase in the liquidity of the market itself.',
      },
    ],
  },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('ALL');

  const toggleItem = (question: string) => {
    setOpenItem(openItem === question ? null : question);
  };

  const sections = activeSection === 'ALL'
    ? FAQ_SECTIONS
    : FAQ_SECTIONS.filter(s => s.title === activeSection);

  const allItems = sections.flatMap(s => s.items);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#1A1D29] text-[#E0E2E7]"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center px-3 md:px-6 py-4 bg-[#1B1F2D] border-b border-[#2B3040]"
      >
        <button
          onClick={() => navigate('/trade')}
          className="mr-3 md:mr-4 text-[#6B7280] hover:text-[#E0E2E7] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">FAQ</h1>
      </motion.div>

      {/* Section filter tabs */}
      <div className="max-w-[900px] mx-auto px-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {['ALL', ...FAQ_SECTIONS.map(s => s.title)].map((tab, i) => (
            <motion.button
              key={tab}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.05 * i }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                activeSection === tab
                  ? 'bg-[#0EB85B] text-white'
                  : 'bg-[#2B3040] text-[#6B7280] hover:text-[#E0E2E7]'
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {allItems.map((item, index) => {
                const isOpen = openItem === item.question;
                return (
                  <motion.div
                    key={item.question}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="bg-[#242833] rounded-xl border border-[#2B3040] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(item.question)}
                      className="flex items-center justify-between w-full px-6 py-5 text-left"
                    >
                      <span className="font-semibold text-sm text-[#E0E2E7] pr-4">
                        {item.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={18} className="text-[#6B7280] shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-0">
                            <p className="text-sm text-[#9CA3AF] leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
