import { useState, useMemo } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

type TimeFilter = 'today' | 'yesterday' | 'week' | 'month';

function generateDemoData(filter: TimeFilter) {
  const multiplier = filter === 'today' ? 0.3 : filter === 'yesterday' ? 0.4 : filter === 'week' ? 1 : 3;
  const totalTrades = Math.round(48 * multiplier);
  const wins = Math.round(totalTrades * 0.62);
  const profitablePercent = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : '0';
  const tradesProfit = parseFloat((totalTrades * 3.2 * multiplier).toFixed(2));
  const avgProfit = totalTrades > 0 ? parseFloat((tradesProfit / totalTrades).toFixed(2)) : 0;
  const netTurnover = parseFloat((totalTrades * 12.5 * multiplier).toFixed(2));
  const hedgedTrades = parseFloat((totalTrades * 1.1).toFixed(2));
  const minTradeAmount = totalTrades > 0 ? 1 : 0;
  const maxTradeAmount = parseFloat((50 * multiplier).toFixed(2));
  const maxTradeProfit = parseFloat((maxTradeAmount * 0.87).toFixed(2));

  return { totalTrades, wins, profitablePercent, tradesProfit, avgProfit, netTurnover, hedgedTrades, minTradeAmount, maxTradeAmount, maxTradeProfit };
}

function generateChart(filter: TimeFilter) {
  const days = filter === 'today' ? 24 : filter === 'yesterday' ? 24 : filter === 'week' ? 7 : 30;
  const labels = filter === 'month'
    ? Array.from({ length: days }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - days + i + 1);
        return `${d.getDate()}. ${d.toLocaleString('en', { month: 'short' })}`;
      })
    : filter === 'week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: days }, (_, i) => `${i}:00`);

  let cum = 0;
  return labels.map((label) => {
    cum += Math.floor(Math.random() * 5) - 1;
    return { name: label, value: Math.max(0, cum) };
  });
}

function generatePercentChart(filter: TimeFilter) {
  const days = filter === 'today' ? 24 : filter === 'yesterday' ? 24 : filter === 'week' ? 7 : 30;
  const labels = filter === 'month'
    ? Array.from({ length: days }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - days + i + 1);
        return `${d.getDate()}. ${d.toLocaleString('en', { month: 'short' })}`;
      })
    : filter === 'week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: days }, (_, i) => `${i}:00`);

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

const BAR_COLORS = ['hsl(0, 72%, 45%)', 'hsl(20, 80%, 50%)', 'hsl(45, 90%, 50%)', 'hsl(80, 60%, 45%)', 'hsl(150, 68%, 45%)'];

export default function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const stats = useMemo(() => generateDemoData(timeFilter), [timeFilter]);
  const profitableChart = useMemo(() => generateChart(timeFilter), [timeFilter]);
  const percentChart = useMemo(() => generatePercentChart(timeFilter), [timeFilter]);

  const filterLabels: Record<TimeFilter, string> = { today: 'Today', yesterday: 'Yesterday', week: 'Week', month: 'Month' };

  return (
    <div className="w-full">
      {/* User info bar */}
      <div className="flex items-center gap-6 px-5 py-3 border-b border-border text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-xs">👤</span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">user@example.com</div>
            <div className="text-xs text-foreground font-medium">ID: 85795063 <span className="text-primary">✈</span></div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Location</div>
          <div className="text-xs font-semibold text-foreground">India</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">In the account</div>
          <div className="text-xs font-semibold text-foreground">$0.00</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">In the demo</div>
          <div className="text-xs font-semibold text-foreground">$10,000.00</div>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <Eye size={16} />
        </button>

        {/* Time filter dropdown - far right */}
        <div className="ml-auto relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded border border-border bg-card text-sm font-medium text-foreground hover:bg-muted/50 transition-colors min-w-[120px] justify-between"
          >
            {filterLabels[timeFilter]}
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden">
              {(Object.entries(filterLabels) as [TimeFilter, string][]).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => { setTimeFilter(value); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    timeFilter === value ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] min-h-0">

        {/* === LEFT COLUMN === */}
        <div className="border-r border-border">

          {/* General Data */}
          <div className="px-5 pt-5 pb-6">
            <h3 className="text-base font-bold text-foreground mb-6">General data</h3>

            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-2 mb-2">
              <div>
                <div className="w-14 h-14 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-foreground">{stats.totalTrades}</span>
                </div>
                <span className="text-xs text-muted-foreground">Trades count</span>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground mb-1">{stats.tradesProfit} $</div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-4 h-1.5 rounded-sm bg-primary/30" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Trades profit</span>
              </div>
              <div>
                <div className="w-14 h-14 rounded-full border-2 border-primary/40 flex items-center justify-center mb-2 relative">
                  <span className="text-lg font-bold text-foreground">{stats.wins}</span>
                  <span className="absolute -bottom-1 right-0 text-[9px] text-primary font-semibold">{stats.profitablePercent}%</span>
                </div>
                <span className="text-xs text-primary">Profitable trades</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-x-6 py-5 border-t border-border mt-4">
              <StatItem label="Average profit" value={`${stats.avgProfit} $`} />
              <StatItem label="Net turnover" value={`${stats.netTurnover} $`} />
              <StatItem label="Hedged trades" value={`${stats.hedgedTrades} $`} />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-x-6 py-5 border-t border-border">
              <StatItem label="Min trade amount" value={`${stats.minTradeAmount} $`} />
              <StatItem label="Max trade amount" value={`${stats.maxTradeAmount} $`} />
              <StatItem label="Max trade profit" value={`${stats.maxTradeProfit} $`} />
            </div>

            {/* Color bar */}
            <div className="mt-4 max-w-[160px]">
              <div className="flex h-3.5 rounded-sm overflow-hidden">
                {BAR_COLORS.map((color, i) => (
                  <div key={i} className="flex-1" style={{ background: color }} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                <span>-1K-0</span>
                <span>0-1K</span>
                <span>+1K</span>
              </div>
            </div>
          </div>

          {/* Top 5 instruments */}
          <div className="px-5 py-5 border-t border-border">
            <h3 className="text-base font-bold text-foreground mb-5">Top 5 most profitable instruments among traders</h3>
            <div className="flex items-center gap-6">
              <div className="w-[220px] h-[220px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TOP_INSTRUMENTS}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={105}
                      dataKey="pct"
                      strokeWidth={2}
                      stroke="hsl(240, 8%, 7%)"
                      label={({ pct }) => `${pct}%`}
                      labelLine={false}
                    >
                      {TOP_INSTRUMENTS.map((item, i) => (
                        <Cell key={i} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {TOP_INSTRUMENTS.map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name} <span className="text-foreground font-semibold">{item.pct}%</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div>
          {/* Statistics of profitable trades */}
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground mb-4">Statistics of profitable trades</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitableChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 14%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(240, 8%, 10%)', border: '1px solid hsl(240, 5%, 16%)', borderRadius: '6px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(150, 68%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Percentage % of profitable trades */}
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground mb-4">Percentage % of profitable trades</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={percentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 14%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(240, 8%, 10%)', border: '1px solid hsl(240, 5%, 16%)', borderRadius: '6px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(150, 68%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="grid grid-cols-2">
            <div className="px-5 py-5 border-r border-border">
              <h3 className="text-base font-bold text-foreground mb-4">Statistics Profit & Loss by instruments</h3>
              <div className="flex items-center justify-center h-[120px]">
                <span className="text-3xl text-muted-foreground/30 font-light">No data</span>
              </div>
            </div>
            <div className="px-5 py-5">
              <h3 className="text-base font-bold text-foreground mb-4">Distribution of trades by instruments, %</h3>
              <div className="flex items-center justify-center h-[120px]">
                <span className="text-3xl text-muted-foreground/30 font-light">No data</span>
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
    <div>
      <div className="text-lg font-bold text-foreground mb-1">{value}</div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-4 h-1.5 rounded-sm bg-muted-foreground/20" />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
