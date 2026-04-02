import { BarChart3, HelpCircle, User, Trophy, Store, MoreHorizontal } from 'lucide-react';

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
  return (
    <div className="w-16 bg-card flex flex-col items-center py-4 border-r border-border">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg mb-1 transition-all duration-200 ${
              isActive
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Icon size={20} />
            <span className="text-[9px] mt-1 font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
