'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Eye,
  Printer,
  MoreVertical,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { salesApi } from '@/lib/api/endpoints';
import Link from 'next/link';

interface Sale {
  id: number;
  invoiceNo: string;
  customer?: { name: string };
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  date: string;
}
interface SalesResponse {
  data: Sale[];
  total: number;
  totalPages: number;
}

const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  UNPAID: 'danger',
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') setPage(1);
  }

  const { data, isLoading } = useQuery<SalesResponse>({
    queryKey: ['sales', page, search, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.paymentStatus = statusFilter;
      const res = await salesApi.getAll(params);
      return res.data?.data ?? res.data;
    },
  });

  const sales = data?.data ?? [];
  const total = data?.total ?? 0;
  const todaySales = sales.filter(
    (s) => new Date(s.date).toDateString() === new Date().toDateString()
  );
  const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalDue = sales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);
  const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Track all your sales transactions"
        breadcrumbs={[{ label: 'Business' }, { label: 'Sales' }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Plus size={16} />}
              onClick={() => toast.info('Use POS for new sales')}
            >
              New Sale
            </Button>
            <Link href="/pos">
              <Button icon={<ShoppingCart size={16} />}>Open POS</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Today Sales',
            value: formatCurrency(todayTotal),
            icon: <TrendingUp size={20} className="text-[var(--primary)]" />,
          },
          {
            label: 'This Page Total',
            value: formatCurrency(totalAmount),
            icon: <ShoppingCart size={20} className="text-blue-500" />,
          },
          {
            label: 'Total Due',
            value: formatCurrency(totalDue),
            icon: <AlertCircle size={20} className="text-red-500" />,
          },
          {
            label: 'Total Orders',
            value: String(total),
            icon: <DollarSign size={20} className="text-purple-500" />,
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">
                {s.label}
              </p>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {isLoading ? '—' : s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="p-4 flex flex-wrap gap-3 border-b border-[var(--border)]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search by invoice or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={handleSearchKey}
              className="cursor-text pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-64 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {[
                  'Invoice',
                  'Customer',
                  'Total',
                  'Paid',
                  'Due',
                  'Status',
                  'Date',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-[var(--muted)]"
                  >
                    <ShoppingCart
                      size={40}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p className="text-base font-semibold">No sales found</p>
                    <p className="text-sm mt-1">
                      Create your first sale via the POS
                    </p>
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--primary)]">
                      {s.invoiceNo}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)] text-base">
                      {s.customer?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                      {formatCurrency(s.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {formatCurrency(s.paidAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.dueAmount > 0
                            ? 'text-red-500 font-bold'
                            : 'text-[var(--muted)]'
                        }
                      >
                        {formatCurrency(s.dueAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMap[s.paymentStatus] ?? 'default'}>
                        {s.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                      {formatDateTime(s.date)}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownTrigger>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === s.id ? null : s.id)
                          }
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <DropdownMenu
                          open={openMenuId === s.id}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: 'View Invoice',
                              icon: <Eye size={14} />,
                              href: `/sales/${s.id}`,
                            },
                            {
                              label: 'Print',
                              icon: <Printer size={14} />,
                              onClick: () =>
                                toast.success(`Print ${s.invoiceNo}`),
                            },
                          ]}
                        />
                      </DropdownTrigger>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={Math.max(1, data?.totalPages ?? 1)}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
