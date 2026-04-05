import { useState } from 'react';
import { Pencil, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ChartType = 'area' | 'candles' | 'bars' | 'heiken';

// Binance-supported kline intervals
export type ChartInterval = '1s' | '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d';

interface ChartToolbarProps {
  selectedTimeframe?: ChartInterval;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  onTimeframeChange?: (tf: ChartInterval) => void;
}

const CHART_TYPES: { id: ChartType; label: string; icon: React.FC }[] = [
  { id: 'area', label: 'Area', icon: AreaIcon },
  { id: 'candles', label: 'Candles', icon: CandleIcon },
  { id: 'bars', label: 'Bars', icon: BarsIcon },
  { id: 'heiken', label: 'Heiken Ashi', icon: HeikenIcon },
];

const TF_OPTIONS: ChartInterval[][] = [
  ['1s', '1m', '3m', '5m'],
  ['15m', '30m', '1h', '2h'],
  ['4h', '1d'],
];

export default function ChartToolbar({ selectedTimeframe = '1m', chartType = 'candles', onChartTypeChange, onTimeframeChange }: ChartToolbarProps) {
  const [showChartTypes, setShowChartTypes] = useState(false);
  const [showTimeframes, setShowTimeframes] = useState(false);

  const activeIcon = CHART_TYPES.find(ct => ct.id === chartType)?.icon || CandleIcon;
  const ActiveIcon = activeIcon;

  return (
    <div className="absolute bottom-[34px] left-2 z-10 flex flex-col gap-1">
      <ToolButton>
        <Pencil size={14} />
      </ToolButton>

      <div className="relative">
        <ToolButton onClick={() => { setShowTimeframes(!showTimeframes); setShowChartTypes(false); }}>
          <span className="text-[10px] font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {selectedTimeframe}
          </span>
        </ToolButton>
        <AnimatePresence>
          {showTimeframes && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute left-[calc(100%+6px)] bottom-0 bg-card border border-border rounded-md p-2 min-w-[180px] shadow-xl"
            >
              {TF_OPTIONS.map((row, ri) => (
                <div key={ri} className="flex gap-1 mb-1 last:mb-0">
                  {row.map(tf => (
                    <button
                      key={tf}
                      onClick={() => {
                        onTimeframeChange?.(tf);
                        setShowTimeframes(false);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        tf === selectedTimeframe
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <ToolButton onClick={() => { setShowChartTypes(!showChartTypes); setShowTimeframes(false); }}>
          <ActiveIcon />
        </ToolButton>
        <AnimatePresence>
          {showChartTypes && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute left-[calc(100%+6px)] bottom-0 bg-card border border-border rounded-md py-1 min-w-[150px] shadow-xl"
            >
              {CHART_TYPES.map(ct => {
                const Icon = ct.icon;
                return (
                  <button
                    key={ct.id}
                    onClick={() => {
                      onChartTypeChange?.(ct.id);
                      setShowChartTypes(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium transition-colors ${
                      ct.id === chartType
                        ? 'text-foreground bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Icon />
                    <span>{ct.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToolButton>
        <Scissors size={14} className="rotate-90" />
      </ToolButton>
    </div>
  );
}

function ToolButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-md bg-card/90 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  );
}

function CandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="4" width="2.5" height="5" rx="0.3" fill="currentColor" opacity="0.9" />
      <line x1="3.25" y1="2" x2="3.25" y2="11" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <rect x="5.75" y="3" width="2.5" height="6" rx="0.3" fill="currentColor" opacity="0.9" />
      <line x1="7" y1="1" x2="7" y2="12" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <rect x="9.5" y="5" width="2.5" height="4" rx="0.3" fill="currentColor" opacity="0.9" />
      <line x1="10.75" y1="3" x2="10.75" y2="11" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 10 L3.5 6 L6 8 L9 3 L13 7 L13 12 L1 12 Z" fill="currentColor" opacity="0.2" />
      <path d="M1 10 L3.5 6 L6 8 L9 3 L13 7" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="3" y1="2" x2="3" y2="11" stroke="currentColor" strokeWidth="1" />
      <line x1="3" y1="4" x2="1" y2="4" stroke="currentColor" strokeWidth="1" />
      <line x1="3" y1="9" x2="5" y2="9" stroke="currentColor" strokeWidth="1" />
      <line x1="7" y1="3" x2="7" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="7" y1="5" x2="5" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="7" y1="10" x2="9" y2="10" stroke="currentColor" strokeWidth="1" />
      <line x1="11" y1="1" x2="11" y2="10" stroke="currentColor" strokeWidth="1" />
      <line x1="11" y1="3" x2="9" y2="3" stroke="currentColor" strokeWidth="1" />
      <line x1="11" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function HeikenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="4" width="3" height="5" rx="0.3" fill="currentColor" opacity="0.7" />
      <line x1="3" y1="2.5" x2="3" y2="10.5" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <rect x="5.5" y="2.5" width="3" height="7" rx="0.3" fill="currentColor" opacity="0.9" />
      <line x1="7" y1="1" x2="7" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <rect x="9.5" y="3.5" width="3" height="5.5" rx="0.3" fill="currentColor" opacity="0.8" />
      <line x1="11" y1="2" x2="11" y2="11" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}
