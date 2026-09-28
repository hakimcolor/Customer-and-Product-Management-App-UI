'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Sparkles,
  Send,
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { dashboardApi } from '@/lib/api/endpoints';
import Link from 'next/link';

const PERIODS = [
  { label: '7D', value: 'week' },
  { label: '30D', value: 'month' },
  { label: 'Today', value: 'today' },
];

const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  UNPAID: 'danger',
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
  const [period, setPeriod] = useState('today');
  const [aiQuery, setAiQuery] = useState('');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async () => {
      const res = await dashboardApi.getStats({ period });
      return res.data?.data ?? res.data;
    },
    refetchInterval: 60000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['monthly-chart'],
    queryFn: async () => {
      const res = await dashboardApi.getMonthlyChart();
      return res.data?.data ?? res.data;
    },
  });

  const salesTotal = stats?.periodSales?._sum?.totalAmount ?? 0;
  const purchasesTotal = stats?.periodPurchases?._sum?.totalAmount ?? 0;
  const expensesTotal = stats?.periodExpenses?._sum?.amount ?? 0;
  const cashBalance = (stats?.cashBalance ?? 0) + (stats?.bankBalance ?? 0);
  const customerDues = stats?.totalCustomerDues ?? 0;
  const supplierDues = stats?.totalSupplierDues ?? 0;
  const stockValue = stats?.stockValue ?? 0;
  const recentSales = stats?.recentSales ?? [];
  const lowStockItems = stats?.lowStockProducts ?? [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Business overview and key metrics"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex gap-1 rounded-lg border border-[var(--border)] overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                  period === p.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Total Sales"
          value={isLoading ? '...' : formatCurrency(salesTotal)}
          icon={<ShoppingCart size={20} className="text-[var(--primary)]" />}
        />
        <StatCard
          title="Total Purchases"
          value={isLoading ? '...' : formatCurrency(purchasesTotal)}
          icon={<Package size={20} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Total Expenses"
          value={isLoading ? '...' : formatCurrency(expensesTotal)}
          icon={<TrendingUp size={20} className="text-orange-500" />}
          iconBg="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard
          title="Cash & Bank Balance"
          value={isLoading ? '...' : formatCurrency(cashBalance)}
          icon={<Wallet size={20} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Customer Dues"
          value={isLoading ? '...' : formatCurrency(customerDues)}
          icon={<DollarSign size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Supplier Payable"
          value={isLoading ? '...' : formatCurrency(supplierDues)}
          icon={<DollarSign size={20} className="text-red-500" />}
          iconBg="bg-red-100 dark:bg-red-900/30"
        />
        <StatCard
          title="Stock Value"
          value={isLoading ? '...' : formatCurrency(stockValue)}
          icon={<Package size={20} className="text-[var(--primary)]" />}
        />
        <StatCard
          title="Sales Count"
          value={isLoading ? '...' : String(stats?.periodSales?._count ?? 0)}
          icon={<ShoppingCart size={20} className="text-gray-600" />}
          iconBg="bg-gray-100 dark:bg-slate-700"
        />
      </div>

      {/* Chart + Inventory */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card padding={false} className="xl:col-span-2">
          <div className="p-5 pb-0">
            <h2 className="font-semibold text-[var(--foreground)] text-lg">
              Sales & Profit Overview
            </h2>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Monthly revenue trends
            </p>
          </div>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={chartData ?? []}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
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
                    fontSize: 13,
                  }}
                  formatter={(v: number) => [formatCurrency(v), '']}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
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
                  fill="none"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <h2 className="font-semibold text-[var(--foreground)] text-lg mb-4">
            Inventory Alerts
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              {
                label: 'Low Stock',
                value: stats?.lowStockCount ?? 0,
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                color: 'text-amber-600',
              },
              {
                label: 'Out of Stock',
                value: stats?.outOfStockCount ?? 0,
                bg: 'bg-red-50 dark:bg-red-900/20',
                color: 'text-red-500',
              },
              {
                label: 'Total Products',
                value: stats?.totalProducts ?? 0,
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                color: 'text-blue-600',
              },
              {
                label: 'Categories',
                value: stats?.totalCategories ?? 0,
                bg: 'bg-gray-100 dark:bg-slate-700',
                color: 'text-[var(--muted)]',
              },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-3 ${item.bg}`}>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {isLoading ? '—' : item.value}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Low Stock Items
          </h3>
          <div className="space-y-2.5">
            {lowStockItems
              .slice(0, 4)
              .map(
                (p: {
                  name: string;
                  currentStock: number;
                  alertQty: number;
                }) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between"
                  >
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
                        {p.currentStock}/{p.alertQty}
                      </span>
                      <Badge variant="warning">Low</Badge>
                    </div>
                  </div>
                )
              )}
            {lowStockItems.length === 0 && !isLoading && (
              <p className="text-sm text-[var(--muted)] text-center py-2">
                No alerts 🎉
              </p>
            )}
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

      {/* Recent Sales + Due Overview + AI Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)] text-lg">
              Recent Sales
            </h2>
            <Link
              href="/sales"
              className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="py-3 animate-pulse flex justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                  </div>
                ))
              : recentSales
                  .slice(0, 4)
                  .map(
                    (s: {
                      id: number;
                      invoiceNo: string;
                      customer?: { name: string };
                      totalAmount: number;
                      paymentStatus: string;
                      date: string;
                    }) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-[var(--primary)]">
                            {s.invoiceNo}
                          </p>
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {s.customer?.name ?? '—'}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {formatDateTime(s.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {formatCurrency(s.totalAmount)}
                          </p>
                          <Badge
                            variant={statusMap[s.paymentStatus] ?? 'default'}
                          >
                            {s.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    )
                  )}
            {!isLoading && recentSales.length === 0 && (
              <p className="text-sm text-[var(--muted)] py-6 text-center">
                No sales yet
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--foreground)] text-lg mb-4">
            Due Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-4 rounded-xl bg-[var(--primary-light)] dark:bg-green-900/20 text-center">
              <p className="text-xs text-[var(--muted)] mb-1">Receivable</p>
              <p className="text-xl font-bold text-[var(--primary)]">
                {formatCurrency(customerDues)}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">from Customers</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-xs text-[var(--muted)] mb-1">Payable</p>
              <p className="text-xl font-bold text-red-500">
                {formatCurrency(supplierDues)}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">to Suppliers</p>
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

        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-[var(--primary-light)]">
              <Sparkles size={16} className="text-[var(--primary)]" />
            </div>
            <h2 className="font-semibold text-[var(--foreground)] text-lg">
              AI Business Copilot
            </h2>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask anything about your business..."
              className="cursor-text flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
            <button
              onClick={() => setAiQuery('')}
              className="cursor-pointer p-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-all"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] font-bold mb-2 uppercase tracking-wider">
              Suggested
            </p>
            <div className="space-y-1.5">
              {AI_SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setAiQuery(q)}
                  className="cursor-pointer w-full text-left text-sm px-3 py-2 rounded-lg bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary)] transition-all"
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
