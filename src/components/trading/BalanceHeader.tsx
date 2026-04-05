import { Bell, ChevronDown, GraduationCap, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import arcanineLogo from '@/assets/arcanine-logo.png';

interface BalanceHeaderProps {
  balance: number;
}

export default function BalanceHeader({ balance }: BalanceHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-3 py-2 border-b border-border bg-card"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 border border-border">
            <GraduationCap size={13} className="text-muted-foreground" />
            <div>
              <div className="text-[8px] text-primary font-bold uppercase tracking-wider">DEMO</div>
              <div className="text-xs font-bold font-sans text-foreground">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <ChevronDown size={12} className="text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[8px] font-bold flex items-center justify-center text-destructive-foreground">5</span>
          </button>
          <button
            onClick={() => navigate('/deposit')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Deposit
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card"
    >
      {/* Logo + Brand */}
      <div className="flex items-center gap-2.5 mr-auto">
        <img src={arcanineLogo} alt="Arcanine" className="w-12 h-12 rounded-lg" />
        <span className="text-foreground font-bold text-lg tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, letterSpacing: '0.08em' }}>ARCANINE</span>
      </div>

      <button className="relative text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={20} />
        <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-destructive rounded-full text-[9px] font-bold flex items-center justify-center text-destructive-foreground min-w-[18px] min-h-[18px]">5</span>
      </button>
      <div className="flex items-center gap-2.5 bg-secondary rounded-lg px-3.5 py-2 cursor-pointer hover:bg-accent transition-colors border border-border">
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
          <GraduationCap size={15} className="text-muted-foreground" />
        </div>
        <div className="text-left">
          <div className="text-[9px] text-primary font-bold uppercase tracking-wider">DEMO ACCOUNT</div>
          <div className="text-sm font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <ChevronDown size={14} className="text-muted-foreground" />
      </div>
      <button
        onClick={() => navigate('/deposit')}
        className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={15} strokeWidth={3} />
        <span>Deposit</span>
      </button>
      <button onClick={() => navigate('/withdrawal')} className="text-foreground font-medium text-sm px-4 py-2.5 rounded-lg border border-border bg-transparent hover:bg-secondary transition-colors">
        Withdrawal
      </button>
    </motion.div>
  );
}
