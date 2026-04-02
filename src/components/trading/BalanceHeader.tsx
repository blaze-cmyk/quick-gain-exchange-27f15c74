import { Bell, ChevronDown, Wallet } from 'lucide-react';

interface BalanceHeaderProps {
  balance: number;
}

export default function BalanceHeader({ balance }: BalanceHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border justify-end">
      <button className="relative text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={18} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[9px] font-bold flex items-center justify-center text-danger-foreground">
          4
        </span>
      </button>

      <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors">
        <Wallet size={16} className="text-primary" />
        <div className="text-right">
          <div className="text-[9px] text-primary font-semibold uppercase">Demo Account</div>
          <div className="text-sm font-bold font-mono text-foreground">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <ChevronDown size={14} className="text-muted-foreground" />
      </div>

      <button className="px-4 py-2 bg-success rounded-lg text-success-foreground text-xs font-bold hover:bg-success/80 transition-colors">
        + Deposit
      </button>
      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
        Withdrawal
      </button>
    </div>
  );
}
