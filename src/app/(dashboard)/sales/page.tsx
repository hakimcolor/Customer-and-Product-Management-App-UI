'use client';
import { useState } from 'react';
import { Plus, Search, Eye, Printer, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';

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
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockSales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Track all your sales transactions"
        breadcrumbs={[{ label: 'Business' }, { label: 'Sales' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Plus size={16} />}>
              New Sale
            </Button>
            <Button icon={<Plus size={16} />}>
              <a href="/pos">POS Sale</a>
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
          <Input
            placeholder="Search by invoice or customer..."
            leftIcon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60">
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
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.slice((page - 1) * 10, page * 10).map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[var(--primary)]">
                    {sale.invoiceNo}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)] font-medium">
                    {sale.customerName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    {formatCurrency(sale.paid)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        sale.due > 0
                          ? 'text-red-500 font-medium'
                          : 'text-[var(--muted)]'
                      }
                    >
                      {formatCurrency(sale.due)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusMap[sale.status]}>
                      {sale.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDateTime(sale.createdAt)}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === sale.id ? null : sale.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)]"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === sale.id && (
                      <div className="absolute right-8 top-8 z-10 w-36 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800">
                          <Eye size={14} className="text-[var(--muted)]" /> View
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800">
                          <Printer size={14} className="text-[var(--muted)]" />{' '}
                          Print
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={Math.ceil(filtered.length / 10)}
          total={filtered.length}
          limit={10}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
