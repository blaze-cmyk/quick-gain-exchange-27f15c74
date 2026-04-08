import { Trade } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

interface TradeResultToastProps {
  trade: Trade | null;
  onDismiss: () => void;
}

export default function TradeResultToast({ trade, onDismiss }: TradeResultToastProps) {
  const [visible, setVisible] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (trade?.result) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismissRef.current();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [trade?.id]);

  if (!trade?.result) return null;

  const isWin = trade.result === 'win';
  const pnl = isWin ? ((trade.payout || 0) - trade.amount) : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-30"
        >
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-xl glass-strong border ${
            isWin ? 'border-profit/30 glow-green' : 'border-loss/30 glow-red'
          }`}>
            <span className="text-lg">{trade.pair.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{trade.pair.displayName}</span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {String(Math.floor(trade.duration / 60)).padStart(2, '0')}:{String(trade.duration % 60).padStart(2, '0')}
                </span>
              </div>
              <span className={`text-sm font-bold font-mono ${isWin ? 'text-profit' : 'text-loss'}`}>
                {pnl > 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2)} $
              </span>
            </div>
            <button
              onClick={() => { setVisible(false); onDismissRef.current(); }}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
