import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from '@/components/trading/Sidebar';

interface FaqItem { question: string; answer: string; }
interface FaqSection { title: string; items: FaqItem[]; }

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'GENERAL',
    items: [
      { question: 'What is Arcanine?', answer: 'Arcanine is a digital options trading platform where you can trade on the price movements of assets including crypto, forex, commodities, and indices.' },
      { question: 'Who is Arcanine for?', answer: 'Arcanine is built for traders of all levels. Whether you are placing your first trade or have years of experience the platform is designed to be fast, simple, and powerful.' },
      { question: 'Is Arcanine available in my country?', answer: 'Arcanine is available in over 150 countries. Availability may vary depending on local regulations.' },
      { question: 'Is Arcanine safe to use?', answer: 'Yes. Arcanine uses SSL encryption, secure payment gateways, and advanced security protocols to protect your personal and financial information.' },
    ],
  },
  {
    title: 'DIGITAL OPTIONS',
    items: [
      { question: 'What is a Digital Option?', answer: 'A digital option is a non-standard option used to make a profit on price movements of assets for a certain period of time.' },
      { question: 'What is the gist of digital options trading?', answer: 'You predict whether the price of an asset will increase or decrease by the time the contract is executed. If your prediction is correct, you get a fixed income.' },
      { question: 'What is the expiration period of a trade?', answer: 'The expiration period is the time after which the trade will be considered completed. You independently determine the time (1 minute, 2 hours, etc.).' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { question: 'How do I create an account?', answer: 'Visit arcanine.com and click Sign Up. Enter your email address, create a password, and verify your email.' },
      { question: 'Do I need to verify my identity to trade?', answer: 'You can start trading immediately. Identity verification may be required for larger withdrawals.' },
      { question: 'Can I have more than one account?', answer: 'No. Each user is permitted one account only.' },
    ],
  },
  {
    title: 'TRADING',
    items: [
      { question: 'How does trading on Arcanine work?', answer: 'Select an asset, choose your trade amount and timeframe, predict UP or DOWN. If correct at expiry you receive a fixed payout.' },
      { question: 'What assets can I trade?', answer: 'Crypto pairs (BTC/USD, ETH/USD, SOL/USD), forex pairs (EUR/USD, GBP/USD), commodities (gold, oil), and major indices.' },
      { question: 'What is the minimum trade amount?', answer: 'The minimum trade amount is $1.' },
    ],
  },
  {
    title: 'DEPOSITS',
    items: [
      { question: 'What is the minimum deposit?', answer: 'The minimum deposit is $10.' },
      { question: 'What payment methods are accepted?', answer: 'USDT TRC20, USDT BEP20, USDC, Bitcoin, Ethereum, Visa, Mastercard, and local payment methods.' },
      { question: 'How long do deposits take?', answer: 'Crypto deposits are credited instantly once confirmed on the blockchain. Card deposits are credited within minutes.' },
    ],
  },
  {
    title: 'WITHDRAWALS',
    items: [
      { question: 'What is the minimum withdrawal?', answer: 'The minimum withdrawal is $10.' },
      { question: 'How long do withdrawals take?', answer: 'Crypto withdrawals are processed instantly. Other methods may take up to 24 hours.' },
      { question: 'Are there withdrawal fees?', answer: 'Arcanine does not charge withdrawal fees. Network or provider fees may apply.' },
    ],
  },
  {
    title: 'SECURITY',
    items: [
      { question: 'How does Arcanine protect my funds?', answer: 'Arcanine uses industry standard encryption and secure payment infrastructure to protect all transactions.' },
      { question: 'What should I do if I suspect unauthorized access?', answer: 'Contact support immediately via live chat. Change your password and enable two factor authentication.' },
    ],
  },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('ALL');

  const sections = activeSection === 'ALL' ? FAQ_SECTIONS : FAQ_SECTIONS.filter(s => s.title === activeSection);
  const allItems = sections.flatMap(s => s.items);

  const handleSidebarNav = (id: string) => {
    if (id === 'trade') navigate('/trade');
    else if (id === 'account') navigate('/account');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {!isMobile && <Sidebar activeTab="support" onTabChange={handleSidebarNav} />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center px-3 md:px-6 py-4 bg-card border-b border-border shrink-0">
          <h1 className="text-lg font-bold text-foreground">FAQ</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[900px] mx-auto px-3 md:px-6 pt-6 md:pt-8 pb-10">
            {/* Section filter tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['ALL', ...FAQ_SECTIONS.map(s => s.title)].map((tab, i) => (
                <motion.button
                  key={tab}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.03 * i }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    activeSection === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </motion.button>
              ))}
            </div>

            {/* FAQ Items */}
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
                      className="bg-card rounded-xl border border-border overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenItem(isOpen ? null : item.question)}
                        className="flex items-center justify-between w-full px-4 md:px-6 py-4 md:py-5 text-left"
                      >
                        <span className="font-semibold text-sm text-foreground pr-4">{item.question}</span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                          <ChevronDown size={18} className="text-muted-foreground shrink-0" />
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
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
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
      </div>

      {isMobile && <Sidebar activeTab="support" onTabChange={handleSidebarNav} />}
    </div>
  );
}
