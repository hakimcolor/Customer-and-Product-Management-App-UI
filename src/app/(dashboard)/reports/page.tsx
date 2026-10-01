'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  FileDown,
  Printer,
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
import { reportsApi } from '@/lib/api/endpoints';
import apiClient from '@/lib/api/client';

const CATEGORIES = [
  {
    label: 'Sales',
    icon: <ShoppingCart size={16} />,
    reports: [
      'Daily Sales',
      'Monthly Sales',
      'Product Sales',
      'Customer Sales',
      'Payment Summary',
    ],
  },
  {
    label: 'Purchases',
    icon: <Package size={16} />,
    reports: ['Daily Purchases', 'Monthly Purchases', 'Supplier Purchases'],
  },
  {
    label: 'Inventory',
    icon: <Package size={16} />,
    reports: ['Stock Report', 'Low Stock', 'Stock Valuation'],
  },
  {
    label: 'Finance',
    icon: <DollarSign size={16} />,
    reports: ['Profit & Loss', 'Cash Flow', 'Expense Report'],
  },
  {
    label: 'Customers',
    icon: <Users size={16} />,
    reports: ['Customer Dues', 'Customer Sales'],
  },
  {
    label: 'Suppliers',
    icon: <Truck size={16} />,
    reports: ['Supplier Dues', 'Supplier Purchases'],
  },
];

function defaultDates() {
  const now = new Date();
  const firstOfYear = `${now.getFullYear()}-01-01`;
  const today = now.toISOString().split('T')[0];
  return { from: firstOfYear, to: today };
}

export default function ReportsPage() {
  const { from: defFrom, to: defTo } = defaultDates();
  const [activeCategory, setActiveCategory] = useState('Sales');
  const [activeReport, setActiveReport] = useState('Monthly Sales');
  const [dateFrom, setDateFrom] = useState(defFrom);
  const [dateTo, setDateTo] = useState(defTo);
  const [generated, setGenerated] = useState({
    from: defFrom,
    to: defTo,
    cat: 'Sales',
  });

  const currentCategory = CATEGORIES.find((c) => c.label === activeCategory);

  const { data: salesData } = useQuery({
    queryKey: ['report-sales', generated],
    queryFn: async () => {
      const res = await reportsApi.sales({
        startDate: generated.from,
        endDate: generated.to,
      });
      return res.data?.data ?? res.data;
    },
  });

  const { data: profitData } = useQuery({
    queryKey: ['report-profit', generated],
    queryFn: async () => {
      const res = await reportsApi.profit({
        startDate: generated.from,
        endDate: generated.to,
      });
      return res.data?.data ?? res.data;
    },
  });

  const { data: purchasesData } = useQuery({
    queryKey: ['report-purchases', generated],
    queryFn: async () => {
      const res = await reportsApi.purchases({
        startDate: generated.from,
        endDate: generated.to,
      });
      return res.data?.data ?? res.data;
    },
  });

  const { data: chartRaw } = useQuery({
    queryKey: ['report-chart', generated],
    queryFn: async () => {
      const res = await apiClient.get('/reports/dashboard', {
        params: { period: 'month' },
      });
      return res.data?.data ?? res.data;
    },
  });

  const chartData = chartRaw?.monthlySales ?? chartRaw?.chartData ?? [];

  const totalSales =
    salesData?.totalAmount ?? salesData?._sum?.totalAmount ?? 0;
  const totalPurchases =
    purchasesData?.totalAmount ?? purchasesData?._sum?.totalAmount ?? 0;
  const netProfit =
    profitData?.netProfit ?? profitData?.profit ?? totalSales - totalPurchases;

  function handleExport() {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'}/export/sales?startDate=${dateFrom}&endDate=${dateTo}`;
    window.open(url, '_blank');
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and export business reports"
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Category sidebar */}
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setActiveCategory(cat.label);
                setActiveReport(cat.reports[0]);
              }}
              className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all select-none border ${
                activeCategory === cat.label
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card border-border text-foreground hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-primary'
              }`}
            >
              <span className="shrink-0">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Filters */}
          <Card>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-40">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Report Type
                </label>
                <select
                  value={activeReport}
                  onChange={(e) => setActiveReport(e.target.value)}
                  className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  {currentCategory?.reports.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>
              <Button
                onClick={() =>
                  setGenerated({
                    from: dateFrom,
                    to: dateTo,
                    cat: activeCategory,
                  })
                }
              >
                Generate
              </Button>
            </div>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Sales', value: formatCurrency(totalSales) },
              {
                label: 'Total Purchases',
                value: formatCurrency(totalPurchases),
              },
              { label: 'Net Profit', value: formatCurrency(netProfit) },
            ].map((s) => (
              <Card key={s.label}>
                <p className="text-xs text-muted uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {s.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  {activeReport}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {generated.from} — {generated.to}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileDown size={14} />}
                  onClick={handleExport}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer size={14} />}
                  onClick={() => window.print()}
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
                    fontSize: 12,
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
