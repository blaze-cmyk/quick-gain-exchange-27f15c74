import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WinLossOverlayProps {
  result: 'win' | 'loss' | null;
  amount: number;
  onDismiss: () => void;
}

export default function WinLossOverlay({ result, amount, onDismiss }: WinLossOverlayProps) {
  const [visible, setVisible] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (result) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismissRef.current();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [result]);

  if (!result || !visible) return null;

  const isWin = result === 'win';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      >
        <div className={`absolute inset-0 ${isWin ? 'bg-profit/5' : 'bg-loss/5'}`} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`relative text-center p-8 rounded-2xl glass-strong ${
            isWin ? 'glow-green border border-profit/30' : 'glow-red border border-loss/30'
          }`}
        >
          <div className={`text-5xl font-bold font-display mb-2 ${isWin ? 'text-profit' : 'text-loss'}`}>
            {isWin ? '🎉 WIN!' : '✖ LOSS'}
          </div>
          <div className={`text-2xl font-bold font-mono ${isWin ? 'text-profit' : 'text-loss'}`}>
            {isWin ? `+$${amount.toFixed(2)}` : `-$${amount.toFixed(2)}`}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
