import { Bell, ChevronDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface BalanceHeaderProps {
  balance: number;
}

export default function BalanceHeader({ balance }: BalanceHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-2 border-b border-border justify-end bg-[#2B3040]"
    >
      <button className="relative text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={18} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[9px] font-bold flex items-center justify-center text-danger-foreground">
          4
        </span>
      </button>

      <div className="flex items-center gap-2.5 bg-secondary rounded-lg px-3.5 py-2 cursor-pointer hover:bg-accent transition-colors">
        <Wallet size={16} className="text-primary" />
        <div className="text-right">
          <div className="text-[9px] text-success font-bold uppercase tracking-wider">Demo Account</div>
          <div className="text-sm font-bold font-mono text-foreground">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <ChevronDown size={14} className="text-muted-foreground" />
      </div>
    </motion.div>
  );
}
