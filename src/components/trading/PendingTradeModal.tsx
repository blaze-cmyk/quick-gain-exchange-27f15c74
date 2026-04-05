import { X, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingTradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PendingTradeModal({ open, onClose }: PendingTradeModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card border border-border rounded-xl max-w-lg w-full mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <Timer size={18} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Pending trade
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-6 border-b border-dashed border-border" />

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                A pending trade is an order that is activated in the future under pre-set conditions, such as a price level (quote) or a certain time. In the drop-down window you can switch the type of the pending trade, as well as set the necessary parameters.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                As with a regular trade, you determine its duration and the size of the investment. This provides full control over your trades, allowing you to fine-tune the parameters according to your strategy and market forecasts. It is important to choose the time and price levels wisely to maximize the efficiency of your trading and achieve the desired results.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <span className="text-foreground font-semibold">Important!</span> When the required parameters are reached, the trade is opened at the next price update. It means that if you set the opening at the price of 100.00, the platform realizes that the condition has been reached, and at the trade will be opened at the next update of the asset price (for example, at 101.00 or 98.00).
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
