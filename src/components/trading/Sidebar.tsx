import { BarChart3, HelpCircle, User, Trophy, Store, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navigate = useNavigate();
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
            onClick={() => {
              if (item.id === 'support') {
                navigate('/support');
              } else if (item.id === 'account') {
                navigate('/account');
              } else {
                onTabChange(item.id);
              }
            }}
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
