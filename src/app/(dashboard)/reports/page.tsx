'use client';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  FileDown,
  Printer,
  BarChart2,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Truck,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';

const CATEGORIES = [
  {
    label: 'Sales',
    icon: <ShoppingCart size={16} />,
    reports: [
      'Daily Sales',
      'Monthly Sales',
      'Product Sales',
      'Customer Sales',
      'Branch Sales',
      'Payment Summary',
    ],
  },
  {
    label: 'Purchases',
    icon: <Package size={16} />,
    reports: [
      'Daily Purchases',
      'Monthly Purchases',
      'Supplier Purchases',
      'Product Purchases',
    ],
  },
  {
    label: 'Inventory',
    icon: <Package size={16} />,
    reports: ['Stock Report', 'Low Stock', 'Stock Movement', 'Stock Valuation'],
  },
  {
    label: 'Finance',
    icon: <DollarSign size={16} />,
    reports: ['Profit & Loss', 'Cash Flow', 'Expense Report', 'Ledger Report'],
  },
  {
    label: 'Customers',
    icon: <Users size={16} />,
    reports: ['Customer Due', 'Customer Sales', 'Customer Ledger'],
  },
  {
    label: 'Suppliers',
    icon: <Truck size={16} />,
    reports: ['Supplier Due', 'Supplier Purchases', 'Supplier Ledger'],
  },
];

const chartData = [
  { name: 'Jan', sales: 185000, purchases: 120000, profit: 65000 },
  { name: 'Feb', sales: 210000, purchases: 130000, profit: 80000 },
  { name: 'Mar', sales: 195000, purchases: 115000, profit: 80000 },
  { name: 'Apr', sales: 240000, purchases: 145000, profit: 95000 },
  { name: 'May', sales: 228000, purchases: 135000, profit: 93000 },
  { name: 'Jun', sales: 275000, purchases: 155000, profit: 120000 },
];

export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState('Sales');
  const [activeReport, setActiveReport] = useState('Monthly Sales');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-09-29');

  const currentCategory = CATEGORIES.find((c) => c.label === activeCategory);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and export business reports"
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setActiveCategory(cat.label);
                setActiveReport(cat.reports[0]);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat.label
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Report picker + filters */}
          <Card>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-40">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block mb-1.5">
                  Report Type
                </label>
                <select
                  value={activeReport}
                  onChange={(e) => setActiveReport(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {currentCategory?.reports.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block mb-1.5">
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block mb-1.5">
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <Button>Generate</Button>
            </div>
          </Card>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Sales', value: formatCurrency(1333000) },
              { label: 'Total Purchases', value: formatCurrency(800000) },
              { label: 'Net Profit', value: formatCurrency(533000) },
            ].map((s) => (
              <Card key={s.label}>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-[var(--foreground)] mt-1">
                  {s.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[var(--foreground)]">
                {activeReport}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileDown size={14} />}
                >
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer size={14} />}
                >
                  Print
                </Button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              >
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
                  }}
                  formatter={(v: number) => [formatCurrency(v), '']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="purchases"
                  name="Purchases"
                  fill="#86efac"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="#bbf7d0"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
