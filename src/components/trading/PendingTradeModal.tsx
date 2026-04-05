import { X, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingTradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PendingTradeModal({ open, onClose }: PendingTradeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="absolute right-full top-0 mr-3 z-50 w-[340px] bg-card border border-border rounded-xl shadow-2xl"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {/* Arrow pointing right */}
          <div className="absolute top-6 -right-[6px] w-3 h-3 bg-card border-r border-t border-border rotate-45" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Timer size={16} className="text-primary" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Pending trade
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-5 border-b border-dashed border-border" />

          {/* Content */}
          <div className="px-5 py-4 space-y-3 max-h-[400px] overflow-y-auto">
            <p className="text-xs text-muted-foreground leading-relaxed">
              A pending trade is an order that is activated in the future under pre-set conditions, such as a price level (quote) or a certain time. In the drop-down window you can switch the type of the pending trade, as well as set the necessary parameters.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As with a regular trade, you determine its duration and the size of the investment. This provides full control over your trades, allowing you to fine-tune the parameters according to your strategy and market forecasts.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Important!</span> When the required parameters are reached, the trade is opened at the next price update. It means that if you set the opening at the price of 100.00, the platform realizes that the condition has been reached, and the trade will be opened at the next update of the asset price (for example, at 101.00 or 98.00).
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
