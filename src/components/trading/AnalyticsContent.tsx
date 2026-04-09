import { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

type TimeFilter = 'today' | 'yesterday' | 'week' | 'month';

function generateDemoData(filter: TimeFilter) {
  const multiplier = filter === 'today' ? 0.3 : filter === 'yesterday' ? 0.4 : filter === 'week' ? 1 : 3;
  const totalTrades = Math.round(48 * multiplier);
  const wins = Math.round(totalTrades * 0.62);
  const losses = totalTrades - wins;
  const profitablePercent = ((wins / totalTrades) * 100).toFixed(0);
  const tradesProfit = parseFloat((totalTrades * 3.2 * multiplier).toFixed(2));
  const avgProfit = parseFloat((tradesProfit / totalTrades).toFixed(2));
  const netTurnover = parseFloat((totalTrades * 12.5 * multiplier).toFixed(2));
  const hedgedTrades = parseFloat((totalTrades * 1.1).toFixed(2));
  const minTradeAmount = 1;
  const maxTradeAmount = parseFloat((50 * multiplier).toFixed(2));
  const maxTradeProfit = parseFloat((maxTradeAmount * 0.87).toFixed(2));

  return { totalTrades, wins, losses, profitablePercent, tradesProfit, avgProfit, netTurnover, hedgedTrades, minTradeAmount, maxTradeAmount, maxTradeProfit };
}

function generateProfitableTradesChart(filter: TimeFilter) {
  const days = filter === 'today' ? 24 : filter === 'yesterday' ? 24 : filter === 'week' ? 7 : 30;
  const labels = filter === 'today' || filter === 'yesterday'
    ? Array.from({ length: days }, (_, i) => `${i}:00`)
    : filter === 'week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - days + i + 1);
        return `${d.getDate()}. ${d.toLocaleString('en', { month: 'short' })}`;
      });

  let cumulative = 0;
  return labels.map((label) => {
    const change = Math.floor(Math.random() * 5) - 1;
    cumulative += change;
    return { name: label, value: Math.max(0, cumulative) };
  });
}

function generatePercentChart(filter: TimeFilter) {
  const days = filter === 'today' ? 24 : filter === 'yesterday' ? 24 : filter === 'week' ? 7 : 30;
  const labels = filter === 'today' || filter === 'yesterday'
    ? Array.from({ length: days }, (_, i) => `${i}:00`)
    : filter === 'week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - days + i + 1);
        return `${d.getDate()}. ${d.toLocaleString('en', { month: 'short' })}`;
      });

  return labels.map((label) => ({
    name: label,
    value: parseFloat((Math.random() * 40 + 40).toFixed(1)),
  }));
}

const TOP_INSTRUMENTS = [
  { name: 'BRLUSD_otc', pct: 36, color: 'hsl(150, 68%, 45%)' },
  { name: 'USDBDT_otc', pct: 18, color: 'hsl(220, 80%, 55%)' },
  { name: 'CADCHF_otc', pct: 16, color: 'hsl(0, 72%, 51%)' },
  { name: 'USDPKR_otc', pct: 16, color: 'hsl(30, 80%, 50%)' },
  { name: 'AUDNZD_otc', pct: 14, color: 'hsl(45, 90%, 50%)' },
];

const DISTRIBUTION_COLORS = ['hsl(0, 72%, 45%)', 'hsl(20, 80%, 50%)', 'hsl(45, 90%, 50%)', 'hsl(80, 60%, 45%)', 'hsl(150, 68%, 45%)'];

export default function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const stats = useMemo(() => generateDemoData(timeFilter), [timeFilter]);
  const profitableChart = useMemo(() => generateProfitableTradesChart(timeFilter), [timeFilter]);
  const percentChart = useMemo(() => generatePercentChart(timeFilter), [timeFilter]);

  const filters: { label: string; value: TimeFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  return (
    <div className="w-full px-3 md:px-5 py-4 md:py-5">
      {/* Time filters - top right */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-all ${
                timeFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">

        {/* === LEFT COLUMN === */}
        <div className="space-y-4">

          {/* General Data */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">General data</h3>

            {/* Row 1: Trades count, Trades profit, Profitable trades */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {/* Trades count - circle */}
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center mb-1.5">
                  <span className="text-base font-bold text-foreground">{stats.totalTrades}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Trades count</span>
              </div>

              {/* Trades profit */}
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground">{stats.tradesProfit} $</span>
                <div className="flex gap-0.5 my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-3 h-1 rounded-full bg-primary/40" />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">Trades profit</span>
              </div>

              {/* Profitable trades - circle */}
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-full border-2 border-primary/50 flex items-center justify-center mb-1.5 relative">
                  <span className="text-base font-bold text-foreground">{stats.wins}</span>
                  <span className="absolute -bottom-0.5 right-0 text-[8px] text-primary font-medium">{stats.profitablePercent}%</span>
                </div>
                <span className="text-[10px] text-primary">Profitable trades</span>
              </div>
            </div>

            {/* Row 2: Average profit, Net turnover, Hedged trades */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
              <StatItem label="Average profit" value={`${stats.avgProfit} $`} />
              <StatItem label="Net turnover" value={`${stats.netTurnover} $`} />
              <StatItem label="Hedged trades" value={`${stats.hedgedTrades} $`} />
            </div>

            {/* Row 3: Min trade amount, Max trade amount, Max trade profit */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
              <StatItem label="Min trade amount" value={`${stats.minTradeAmount} $`} />
              <StatItem label="Max trade amount" value={`${stats.maxTradeAmount} $`} />
              <StatItem label="Max trade profit" value={`${stats.maxTradeProfit} $`} />
            </div>

            {/* Color distribution bar */}
            <div className="mt-3">
              <div className="flex h-3 rounded overflow-hidden">
                {DISTRIBUTION_COLORS.map((color, i) => (
                  <div key={i} className="flex-1" style={{ background: color }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">-1K-0</span>
                <span className="text-[9px] text-muted-foreground">0-1K</span>
                <span className="text-[9px] text-muted-foreground">+1K</span>
              </div>
            </div>
          </div>

          {/* Top 5 most profitable instruments */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Top 5 most profitable instruments among traders</h3>
            <div className="flex items-center gap-4">
              <div className="w-[180px] h-[180px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TOP_INSTRUMENTS}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={85}
                      dataKey="pct"
                      strokeWidth={1}
                      stroke="hsl(240, 8%, 7%)"
                    >
                      {TOP_INSTRUMENTS.map((item, i) => (
                        <Cell key={i} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {TOP_INSTRUMENTS.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name} <span className="text-foreground font-medium">{item.pct}%</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-4">

          {/* Statistics of profitable trades */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Statistics of profitable trades</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitableChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 14%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(240, 8%, 10%)', border: '1px solid hsl(240, 5%, 16%)', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(150, 68%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Percentage % of profitable trades */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Percentage % of profitable trades</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={percentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 14%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(240, 8%, 10%)', border: '1px solid hsl(240, 5%, 16%)', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(150, 68%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom two panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Statistics Profit & Loss by instruments</h3>
              <div className="flex items-center justify-center h-[100px]">
                <span className="text-2xl text-muted-foreground/40 font-light">No data</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Distribution of trades by instruments, %</h3>
              <div className="flex items-center justify-center h-[100px]">
                <span className="text-2xl text-muted-foreground/40 font-light">No data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-bold text-foreground">{value}</span>
      <div className="flex gap-0.5 my-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-3 h-1 rounded-full bg-muted-foreground/20" />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
