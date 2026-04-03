import { Bell, ChevronDown, GraduationCap, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
        className="flex items-center justify-between px-3 py-2 border-b border-[#2B3040] bg-[#1B1F2D]"
      >
        {/* Left: Demo badge + balance */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#2B3040] rounded-lg px-2.5 py-1.5 border border-[#3A4255]">
            <GraduationCap size={13} className="text-[#6B7280]" />
            <div>
              <div className="text-[8px] text-[#0EB85B] font-bold uppercase tracking-wider">DEMO</div>
              <div className="text-xs font-bold font-mono text-[#E0E2E7]">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <ChevronDown size={12} className="text-[#6B7280]" />
          </div>
        </div>

        {/* Right: Bell + Deposit */}
        <div className="flex items-center gap-2">
          <button className="relative text-[#6B7280] hover:text-[#E0E2E7] transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF3F2C] rounded-full text-[8px] font-bold flex items-center justify-center text-white">5</span>
          </button>
          <button
            onClick={() => navigate('/deposit')}
            className="bg-[#0EB85B] hover:bg-[#0EB85B]/90 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
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
      className="flex items-center gap-3 px-4 py-2 border-b border-[#2B3040] justify-end bg-[#1B1F2D]"
    >
      <button className="relative text-[#6B7280] hover:text-[#E0E2E7] transition-colors">
        <Bell size={20} />
        <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#FF3F2C] rounded-full text-[9px] font-bold flex items-center justify-center text-white min-w-[18px] min-h-[18px]">5</span>
      </button>
      <div className="flex items-center gap-2.5 bg-[#2B3040] rounded-lg px-3.5 py-2 cursor-pointer hover:bg-[#343A4D] transition-colors border border-[#3A4255]">
        <div className="w-7 h-7 rounded-full bg-[#3A4255] flex items-center justify-center">
          <GraduationCap size={15} className="text-[#6B7280]" />
        </div>
        <div className="text-left">
          <div className="text-[9px] text-[#0EB85B] font-bold uppercase tracking-wider">DEMO ACCOUNT</div>
          <div className="text-sm font-bold font-mono text-[#E0E2E7]">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <ChevronDown size={14} className="text-[#6B7280]" />
      </div>
      <button
        onClick={() => navigate('/deposit')}
        className="flex items-center gap-1.5 bg-[#0EB85B] hover:bg-[#0EB85B]/90 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={15} strokeWidth={3} />
        <span>Deposit</span>
      </button>
      <button onClick={() => navigate('/withdrawal')} className="text-[#E0E2E7] font-medium text-sm px-4 py-2.5 rounded-lg border border-[#3A4255] bg-transparent hover:bg-[#2B3040] transition-colors">
        Withdrawal
      </button>
    </motion.div>
  );
}
