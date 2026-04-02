import { useEffect, useState } from 'react';
import { Trade } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TradeNotificationProps {
  trade: Trade | null;
}

export default function TradeNotification({ trade }: TradeNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);

  useEffect(() => {
    if (trade) {
      setCurrentTrade(trade);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [trade?.id]);

  if (!currentTrade) return null;

  const formatPrice = (p: number) => p >= 1000 ? p.toFixed(2) : p.toFixed(5);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute top-[90px] left-3 z-30"
        >
          <div className="bg-success text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-success/20">
            <span className="text-sm font-medium">
              Trade opened with price: {formatPrice(currentTrade.entryPrice)} {currentTrade.pair.displayName}
            </span>
            <button
              onClick={() => setVisible(false)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
