'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { paymentsApi } from '@/lib/api/endpoints';

interface Payment {
  id: number;
  amount: number;
  type: 'customer' | 'supplier' | string;
  method?: string | null;
  note?: string | null;
  date: string;
  createdAt: string;
  customer?: { name: string } | null;
  supplier?: { name: string } | null;
  account?: { name: string } | null;
  reference?: string | null;
}
interface PaymentsResponse {
  data: Payment[];
  total: number;
  totalPages: number;
  received?: number;
  sent?: number;
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaymentsResponse>({
    queryKey: ['payments', page, search, typeFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await paymentsApi.getAll(params);
      return res.data?.data ?? res.data;
    },
  });

  const payments = data?.data ?? [];
  const total = data?.total ?? 0;
  const receivedTotal = payments
    .filter((p) => p.type === 'customer')
    .reduce((s, p) => s + p.amount, 0);
  const sentTotal = payments
    .filter((p) => p.type === 'supplier')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track all incoming and outgoing payments"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Total Records',
            value: String(total),
            icon: <DollarSign size={20} className="text-[var(--primary)]" />,
          },
          {
            label: 'Received (Page)',
            value: formatCurrency(receivedTotal),
            icon: <ArrowDownLeft size={20} className="text-green-600" />,
          },
          {
            label: 'Sent (Page)',
            value: formatCurrency(sentTotal),
            icon: <ArrowUpRight size={20} className="text-red-500" />,
          },
          {
            label: 'Net (Page)',
            value: formatCurrency(receivedTotal - sentTotal),
            icon: <DollarSign size={20} className="text-blue-500" />,
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
        <div className="p-4 flex flex-wrap gap-3 border-b border-border">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              placeholder="Search payments..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary w-56 transition-colors"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            <option value="customer">Customer (Received)</option>
            <option value="supplier">Supplier (Sent)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">
                {[
                  'Party',
                  'Type',
                  'Method',
                  'Account',
                  'Amount',
                  'Date',
                  'Note',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted">
                    <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold">No payments found</p>
                    <p className="text-sm mt-1">
                      Payments are created via sales and purchases
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const party = p.customer ?? p.supplier;
                  const isCustomer = p.type === 'customer';
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {party?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={isCustomer ? 'success' : 'warning'}>
                          {isCustomer ? 'Received' : 'Sent'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {p.method ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {p.account?.name ?? '—'}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${isCustomer ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                        {formatDateTime(p.date ?? p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {p.note ?? '—'}
                      </td>
                    </tr>
                  );
                })
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
