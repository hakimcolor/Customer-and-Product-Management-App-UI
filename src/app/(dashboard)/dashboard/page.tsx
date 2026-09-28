'use client';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Wallet,
  AlertTriangle,
  Package,
  Users,
  ArrowRight,
  Send,
  Sparkles,
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

const chartData = [
  { name: 'Jan', sales: 185000, profit: 42000 },
  { name: 'Feb', sales: 210000, profit: 55000 },
  { name: 'Mar', sales: 195000, profit: 48000 },
  { name: 'Apr', sales: 240000, profit: 68000 },
  { name: 'May', sales: 228000, profit: 62000 },
  { name: 'Jun', sales: 275000, profit: 78000 },
  { name: 'Jul', sales: 310000, profit: 92000 },
  { name: 'Aug', sales: 295000, profit: 85000 },
  { name: 'Sep', sales: 245000, profit: 72000 },
];

const recentSales = [
  {
    id: 'INV-1025',
    customer: 'Rahim Enterprise',
    amount: 12500,
    time: 'Today 10:32 AM',
    status: 'paid',
  },
  {
    id: 'INV-1024',
    customer: 'Karim Store',
    amount: 8200,
    time: 'Today 10:05 AM',
    status: 'partial',
  },
  {
    id: 'INV-1023',
    customer: 'ABC Ltd.',
    amount: 25000,
    time: 'Yesterday 3:45 PM',
    status: 'paid',
  },
  {
    id: 'INV-1022',
    customer: 'XYZ Traders',
    amount: 5400,
    time: 'Yesterday 2:20 PM',
    status: 'unpaid',
  },
];

const lowStock = [
  { name: 'Samsung A55', stock: 3, alert: 10 },
  { name: 'iPhone 15 Case', stock: 5, alert: 20 },
  { name: 'USB-C Cable 2m', stock: 2, alert: 15 },
  { name: 'Wireless Mouse', stock: 4, alert: 10 },
];

const PERIODS = ['7D', '30D', '3M', '6M', '1Y'];
const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

const AI_SUGGESTIONS = [
  'Which products may run out soon?',
  'Show my most profitable products',
  'Which customers have overdue payments?',
  'Why did sales decrease this month?',
];

export default function DashboardPage() {
  const [period, setPeriod] = useState('6M');
  const [aiQuery, setAiQuery] = useState('');

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Business overview and key metrics"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Total Sales"
          value={formatCurrency(2450000)}
          change={12.5}
          icon={<ShoppingCart size={20} className="text-[var(--primary)]" />}
        />
        <StatCard
          title="Total Purchases"
          value={formatCurrency(1300000)}
          change={8.2}
          icon={<Package size={20} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(720000)}
          change={15.4}
          icon={<TrendingUp size={20} className="text-[var(--primary)]" />}
        />
        <StatCard
          title="Cash Balance"
          value={formatCurrency(3500000)}
          icon={<Wallet size={20} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Receivable"
          value={formatCurrency(425000)}
          icon={<DollarSign size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Payable"
          value={formatCurrency(210000)}
          icon={<DollarSign size={20} className="text-red-500" />}
          iconBg="bg-red-100 dark:bg-red-900/30"
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(3200000)}
          icon={<Package size={20} className="text-[var(--primary)]" />}
        />
        <StatCard
          title="Today Expenses"
          value={formatCurrency(45000)}
          icon={<Wallet size={20} className="text-gray-600" />}
          iconBg="bg-gray-100 dark:bg-slate-700"
        />
      </div>

      {/* Chart + Inventory */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card padding={false} className="xl:col-span-2">
          <div className="flex items-center justify-between p-5 pb-0">
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">
                Sales & Profit Overview
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Revenue trends over time
              </p>
            </div>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`cursor-pointer px-2.5 py-1 text-xs rounded-lg font-medium transition-colors select-none ${
                    period === p
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-[var(--foreground)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatCurrency(v), '']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#gSales)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#gProfit)"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Inventory Intelligence */}
        <Card>
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            Inventory Intelligence
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              {
                label: 'Low Stock',
                value: 18,
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                color: 'text-amber-600',
              },
              {
                label: 'Out of Stock',
                value: 7,
                bg: 'bg-red-50 dark:bg-red-900/20',
                color: 'text-red-500',
              },
              {
                label: 'Expiring Soon',
                value: 12,
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                color: 'text-orange-600',
              },
              {
                label: 'Slow Moving',
                value: 24,
                bg: 'bg-gray-100 dark:bg-slate-700',
                color: 'text-[var(--muted)]',
              },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-3 ${item.bg}`}>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Low Stock Products
          </h3>
          <div className="space-y-2.5">
            {lowStock.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={13}
                    className="text-amber-500 shrink-0"
                  />
                  <span className="text-sm text-[var(--foreground)] truncate max-w-[120px]">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">
                    {p.stock}/{p.alert}
                  </span>
                  <Badge variant="warning">Low</Badge>
                </div>
              </div>
            ))}
          </div>
          <Link href="/inventory">
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              icon={<ArrowRight size={14} />}
            >
              View All Alerts
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Sales + Dues + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Sales */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)]">
              Recent Sales
            </h2>
            <Link
              href="/sales"
              className="cursor-pointer text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {recentSales.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors cursor-default"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    {s.id}
                  </p>
                  <p className="text-xs font-medium text-[var(--foreground)]">
                    {s.customer}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{s.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {formatCurrency(s.amount)}
                  </p>
                  <Badge variant={statusMap[s.status]}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Due Overview */}
        <Card>
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            Due Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-4 rounded-xl bg-[var(--primary-light)] dark:bg-green-900/20 text-center">
              <p className="text-xs text-[var(--muted)] mb-1">Receivable</p>
              <p className="text-xl font-bold text-[var(--primary)]">
                {formatCurrency(425000)}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">42 Customers</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-xs text-[var(--muted)] mb-1">Payable</p>
              <p className="text-xl font-bold text-red-500">
                {formatCurrency(210000)}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">18 Suppliers</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/customers">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                icon={<Users size={14} />}
              >
                View Customer Dues
              </Button>
            </Link>
            <Link href="/suppliers">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                icon={<Users size={14} />}
              >
                View Supplier Dues
              </Button>
            </Link>
          </div>
        </Card>

        {/* AI Copilot */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-[var(--primary-light)]">
              <Sparkles size={16} className="text-[var(--primary)]" />
            </div>
            <h2 className="font-semibold text-[var(--foreground)]">
              AI Business Copilot
            </h2>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask anything about your business..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiQuery.trim()) setAiQuery('');
              }}
              className="cursor-text flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
            <button
              onClick={() => setAiQuery('')}
              className="cursor-pointer p-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] active:scale-95 transition-all"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] font-semibold mb-2 uppercase tracking-wider">
              Suggested
            </p>
            <div className="space-y-1.5">
              {AI_SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setAiQuery(q)}
                  className="cursor-pointer w-full text-left text-xs px-3 py-2 rounded-lg bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary)] transition-all"
                >
                  • {q}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
