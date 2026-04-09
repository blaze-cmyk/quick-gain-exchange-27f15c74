import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target, Clock, DollarSign, Activity, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

type TimeFilter = 'today' | 'week' | 'month' | 'all';

// Demo data generator
function generateDemoData(filter: TimeFilter) {
  const seed = filter === 'today' ? 1 : filter === 'week' ? 2 : filter === 'month' ? 3 : 4;
  const totalTrades = [24, 87, 312, 1547][seed - 1];
  const wins = Math.round(totalTrades * (0.58 + seed * 0.02));
  const losses = totalTrades - wins;
  const winRate = ((wins / totalTrades) * 100).toFixed(1);
  const totalProfit = [120.5, 445.8, 1820.3, 8540.6][seed - 1];
  const totalLoss = [85.2, 312.4, 1240.1, 5920.3][seed - 1];
  const netProfit = totalProfit - totalLoss;
  const avgTrade = netProfit / totalTrades;
  const bestTrade = [45.0, 125.0, 320.0, 890.0][seed - 1];
  const worstTrade = [-30.0, -85.0, -180.0, -450.0][seed - 1];
  const avgDuration = ['1m 23s', '1m 45s', '2m 10s', '1m 58s'][seed - 1];

  return { totalTrades, wins, losses, winRate, totalProfit, totalLoss, netProfit, avgTrade, bestTrade, worstTrade, avgDuration };
}

function generateProfitChart(filter: TimeFilter) {
  const points = filter === 'today' ? 24 : filter === 'week' ? 7 : filter === 'month' ? 30 : 12;
  const labels = filter === 'today'
    ? Array.from({ length: points }, (_, i) => `${i}:00`)
    : filter === 'week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : filter === 'month'
    ? Array.from({ length: points }, (_, i) => `${i + 1}`)
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let cumulative = 0;
  return labels.map((label) => {
    const change = (Math.random() - 0.42) * 50;
    cumulative += change;
    return { name: label, profit: parseFloat(cumulative.toFixed(2)) };
  });
}

function generateAssetData() {
  return [
    { asset: 'EUR/USD', trades: 245, winRate: 64.2, profit: 1240.5, icon: '💱' },
    { asset: 'GBP/USD', trades: 189, winRate: 58.7, profit: 820.3, icon: '💷' },
    { asset: 'BTC/USD', trades: 156, winRate: 71.3, profit: 2150.8, icon: '₿' },
    { asset: 'Gold', trades: 134, winRate: 55.4, profit: 440.2, icon: '🥇' },
    { asset: 'ETH/USD', trades: 98, winRate: 62.1, profit: 680.4, icon: 'Ξ' },
    { asset: 'USD/JPY', trades: 87, winRate: 52.8, profit: -120.6, icon: '¥' },
  ];
}

function generateTradesByHour() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    trades: Math.floor(Math.random() * 30) + 2,
    winRate: parseFloat((Math.random() * 30 + 45).toFixed(1)),
  }));
}

export default function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const stats = useMemo(() => generateDemoData(timeFilter), [timeFilter]);
  const profitData = useMemo(() => generateProfitChart(timeFilter), [timeFilter]);
  const assetData = useMemo(() => generateAssetData(), []);
  const hourlyData = useMemo(() => generateTradesByHour(), []);

  const pieData = [
    { name: 'Wins', value: stats.wins },
    { name: 'Losses', value: stats.losses },
  ];

  const PIE_COLORS = ['hsl(150, 68%, 45%)', 'hsl(0, 72%, 51%)'];

  const filters: { label: string; value: TimeFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'All time', value: 'all' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4 md:py-6 space-y-5">
      {/* Header + Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Trading Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monitor your trading performance and statistics</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeFilter === f.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Net Profit" value={`$${stats.netProfit.toFixed(2)}`} trend={stats.netProfit >= 0 ? 'up' : 'down'} />
        <StatCard icon={Target} label="Win Rate" value={`${stats.winRate}%`} trend={parseFloat(stats.winRate) >= 55 ? 'up' : 'down'} />
        <StatCard icon={BarChart3} label="Total Trades" value={stats.totalTrades.toString()} />
        <StatCard icon={Clock} label="Avg Duration" value={stats.avgDuration} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profit Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Profit / Loss Over Time</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(150, 68%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(150, 68%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 16%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(240, 8%, 10%)', border: '1px solid hsl(240, 5%, 16%)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(240, 5%, 96%)' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit']}
                />
                <Area type="monotone" dataKey="profit" stroke="hsl(150, 68%, 45%)" fill="url(#profitGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win/Loss Donut */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-foreground mb-2 self-start">Win / Loss Ratio</h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(240, 8%, 10%)', border: '1px solid hsl(240, 5%, 16%)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[0] }} />
              <span className="text-xs text-muted-foreground">Wins <span className="font-semibold text-foreground">{stats.wins}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[1] }} />
              <span className="text-xs text-muted-foreground">Losses <span className="font-semibold text-foreground">{stats.losses}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats + Asset Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Detailed Stats */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Detailed Statistics</h3>
          <div className="space-y-2.5">
            <DetailRow label="Total Profit" value={`+$${stats.totalProfit.toFixed(2)}`} color="text-success" />
            <DetailRow label="Total Loss" value={`-$${stats.totalLoss.toFixed(2)}`} color="text-danger" />
            <DetailRow label="Net Profit/Loss" value={`${stats.netProfit >= 0 ? '+' : ''}$${stats.netProfit.toFixed(2)}`} color={stats.netProfit >= 0 ? 'text-success' : 'text-danger'} />
            <div className="border-t border-border my-2" />
            <DetailRow label="Average Trade" value={`${stats.avgTrade >= 0 ? '+' : ''}$${stats.avgTrade.toFixed(2)}`} color={stats.avgTrade >= 0 ? 'text-success' : 'text-danger'} />
            <DetailRow label="Best Trade" value={`+$${stats.bestTrade.toFixed(2)}`} color="text-success" />
            <DetailRow label="Worst Trade" value={`$${stats.worstTrade.toFixed(2)}`} color="text-danger" />
            <DetailRow label="Win Rate" value={`${stats.winRate}%`} />
            <DetailRow label="Wins / Losses" value={`${stats.wins} / ${stats.losses}`} />
          </div>
        </div>

        {/* Asset Performance */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Asset Performance</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_60px_60px_80px] text-[10px] text-muted-foreground font-medium px-2 pb-1.5">
              <span>Asset</span>
              <span className="text-center">Trades</span>
              <span className="text-center">Win %</span>
              <span className="text-right">Profit</span>
            </div>
            {assetData.map((a) => (
              <div key={a.asset} className="grid grid-cols-[1fr_60px_60px_80px] items-center px-2 py-2 rounded-lg hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{a.icon}</span>
                  <span className="text-xs font-medium text-foreground">{a.asset}</span>
                </div>
                <span className="text-xs text-muted-foreground text-center">{a.trades}</span>
                <span className={`text-xs font-medium text-center ${a.winRate >= 60 ? 'text-success' : a.winRate >= 50 ? 'text-foreground' : 'text-danger'}`}>
                  {a.winRate}%
                </span>
                <span className={`text-xs font-semibold text-right ${a.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {a.profit >= 0 ? '+' : ''}${a.profit.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trades by Hour */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Trading Activity by Hour</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 16%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(240, 4%, 64%)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(240, 8%, 10%)', border: '1px solid hsl(240, 5%, 16%)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'hsl(240, 5%, 96%)' }}
              />
              <Bar dataKey="trades" fill="hsl(166, 80%, 48%)" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function StatCard({ icon: Icon, label, value, trend }: { icon: React.ElementType; label: string; value: string; trend?: 'up' | 'down' }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={16} className="text-primary" />
        </div>
        {trend && (
          trend === 'up'
            ? <ArrowUpRight size={16} className="text-success" />
            : <ArrowDownRight size={16} className="text-danger" />
        )}
      </div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold ${color || 'text-foreground'}`}>{value}</span>
    </div>
  );
}
