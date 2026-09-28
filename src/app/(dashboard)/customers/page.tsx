'use client';
import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency } from '@/lib/utils/format';

const mockCustomers = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  name: [
    'Rahim Enterprise',
    'Karim Store',
    'ABC Ltd.',
    'XYZ Traders',
    'Fresh Mart',
    'City Shop',
  ][i % 6],
  phone: `01${7 + (i % 3)}${String(10000000 + i * 1111111).slice(0, 8)}`,
  email: `customer${i + 1}@example.com`,
  totalSales: (i + 1) * 45000,
  totalPaid: (i + 1) * 38000,
  totalDue: (i + 1) * 7000,
  totalOrders: 5 + i,
  createdAt: '2026-01-15',
}));

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer relationships"
        breadcrumbs={[{ label: 'People' }, { label: 'Customers' }]}
        actions={<Button icon={<Plus size={16} />}>Add Customer</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Customers', value: '248' },
          { label: 'Active', value: '235' },
          { label: 'Total Receivable', value: formatCurrency(425000) },
          { label: 'Overdue', value: '18' },
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
            placeholder="Search customers..."
            leftIcon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60">
                {[
                  'Customer',
                  'Phone',
                  'Total Sales',
                  'Paid',
                  'Due',
                  'Orders',
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
              {filtered.slice((page - 1) * 10, page * 10).map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {customer.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {customer.phone}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {formatCurrency(customer.totalSales)}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    {formatCurrency(customer.totalPaid)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        customer.totalDue > 0
                          ? 'text-red-500 font-medium'
                          : 'text-[var(--foreground)]'
                      }
                    >
                      {formatCurrency(customer.totalDue)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {customer.totalOrders}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === customer.id ? null : customer.id
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)]"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === customer.id && (
                      <div className="absolute right-8 top-8 z-10 w-36 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800">
                          <Eye size={14} className="text-[var(--muted)]" /> View
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800">
                          <Edit size={14} className="text-[var(--muted)]" />{' '}
                          Edit
                        </button>
                        <div className="border-t border-[var(--border)] my-1" />
                        <button
                          onClick={() => {
                            setDeleteId(customer.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <Trash2 size={14} /> Delete
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
      />
    </div>
  );
}
