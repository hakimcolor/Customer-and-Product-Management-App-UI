'use client';
import { useState } from 'react';
import { Plus, Search, Eye, Printer, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

const mockSales = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  invoiceNo: `INV-2026-${String(1000 + i).padStart(5, '0')}`,
  customerName: ['Rahim Enterprise', 'Karim Store', 'ABC Ltd.', 'XYZ Traders'][
    i % 4
  ],
  total: (i + 1) * 12500,
  paid: i % 3 === 0 ? (i + 1) * 12500 : (i + 1) * 8000,
  due: i % 3 === 0 ? 0 : (i + 1) * 4500,
  status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partial' : 'unpaid',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockSales.filter((s) => {
    const matchSearch =
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
              onClick={() => toast.success('New sale form coming soon')}
            >
              New Sale
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={() => (window.location.href = '/pos')}
            >
              Open POS
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Today Sales', value: formatCurrency(125000) },
          { label: 'This Month', value: formatCurrency(2450000) },
          { label: 'Total Due', value: formatCurrency(425000) },
          { label: 'Total Orders', value: '248' },
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
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
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
                    className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.slice((page - 1) * 10, page * 10).map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[var(--primary)]">
                    {s.invoiceNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {s.customerName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {formatCurrency(s.total)}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    {formatCurrency(s.paid)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.due > 0
                          ? 'text-red-500 font-medium'
                          : 'text-[var(--muted)]'
                      }
                    >
                      {formatCurrency(s.due)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusMap[s.status]}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDateTime(s.createdAt)}
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
                            onClick: () =>
                              toast.success(`Opening ${s.invoiceNo}`),
                          },
                          {
                            label: 'Print',
                            icon: <Printer size={14} />,
                            onClick: () => toast.success('Print dialog opened'),
                          },
                        ]}
                      />
                    </DropdownTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(filtered.length / 10))}
          total={filtered.length}
          limit={10}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
