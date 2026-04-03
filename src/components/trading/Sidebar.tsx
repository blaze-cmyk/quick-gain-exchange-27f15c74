import { BarChart3, HelpCircle, User, Trophy, Store, MoreHorizontal, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'trade', icon: BarChart3, label: 'TRADE' },
  { id: 'support', icon: HelpCircle, label: 'SUPPORT' },
  { id: 'account', icon: User, label: 'ACCOUNT' },
  { id: 'tournaments', icon: Trophy, label: 'TOURNEYS' },
  { id: 'market', icon: Store, label: 'MARKET' },
  { id: 'more', icon: MoreHorizontal, label: 'MORE' },
];

const mobileNavItems = [
  { id: 'trade', icon: BarChart3, label: 'Trade' },
  { id: 'support', icon: HelpCircle, label: 'Help' },
  { id: 'account', icon: User, label: 'Account' },
  { id: 'chat', icon: MessageSquare, label: 'Chat', badge: 4 },
  { id: 'more', icon: MoreHorizontal, label: 'More' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNav = (id: string) => {
    if (id === 'support') navigate('/support');
    else if (id === 'account') navigate('/account');
    else onTabChange(id);
  };

  // Mobile: bottom tab bar
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1E2D] border-t border-[#2B3040] flex items-center justify-around px-1 py-1 safe-area-bottom">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
              <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-primary rounded-full text-[8px] font-bold flex items-center justify-center text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Desktop: left sidebar
  return (
    <div className="w-[52px] bg-[#1C1E2D] flex flex-col items-center py-3 border-r border-[#2B3040]">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleNav(item.id)}
            className={`flex flex-col items-center justify-center w-11 h-11 rounded-lg mb-0.5 transition-all duration-200 ${
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[8px] mt-0.5 font-medium tracking-wide">{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
