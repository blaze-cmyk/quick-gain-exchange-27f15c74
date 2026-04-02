import { useEffect, useState } from 'react';

interface WinLossOverlayProps {
  result: 'win' | 'loss' | null;
  amount: number;
  onDismiss: () => void;
}

export default function WinLossOverlay({ result, amount, onDismiss }: WinLossOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [result, onDismiss]);

  if (!result || !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none ${
        result === 'win' ? 'animate-win-flash' : 'animate-loss-shake'
      }`}
    >
      <div className={`absolute inset-0 ${
        result === 'win'
          ? 'bg-success/10'
          : 'bg-danger/10'
      }`} />
      <div className={`relative text-center p-8 rounded-2xl backdrop-blur-md ${
        result === 'win'
          ? 'bg-success/20 border border-success/40'
          : 'bg-danger/20 border border-danger/40'
      }`}>
        <div className={`text-5xl font-bold mb-2 ${
          result === 'win' ? 'text-success' : 'text-danger'
        }`}>
          {result === 'win' ? '🎉 WIN!' : '✖ LOSS'}
        </div>
        <div className={`text-2xl font-mono font-semibold ${
          result === 'win' ? 'text-success' : 'text-danger'
        }`}>
          {result === 'win' ? `+$${amount.toFixed(2)}` : `-$${amount.toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}
