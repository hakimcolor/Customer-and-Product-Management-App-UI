'use client';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

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
  phone: `0170000${String(1000 + i)}`,
  email: `customer${i + 1}@example.com`,
  totalSales: (i + 1) * 45000,
  totalPaid: (i + 1) * 38000,
  totalDue: (i + 1) * 7000,
  totalOrders: 5 + i,
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
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => toast.success('Add customer form coming soon')}
          >
            Add Customer
          </Button>
        }
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
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
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
                    className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.slice((page - 1) * 10, page * 10).map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {c.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {c.phone}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {formatCurrency(c.totalSales)}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    {formatCurrency(c.totalPaid)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.totalDue > 0
                          ? 'text-red-500 font-medium'
                          : 'text-[var(--foreground)]'
                      }
                    >
                      {formatCurrency(c.totalDue)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {c.totalOrders}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownTrigger>
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === c.id ? null : c.id)
                        }
                        className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <DropdownMenu
                        open={openMenuId === c.id}
                        onClose={() => setOpenMenuId(null)}
                        items={[
                          {
                            label: 'View Profile',
                            icon: <Eye size={14} />,
                            href: `/customers/${c.id}`,
                          },
                          {
                            label: 'Edit',
                            icon: <Edit size={14} />,
                            onClick: () => toast.success('Edit customer'),
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 size={14} />,
                            danger: true,
                            onClick: () => setDeleteId(c.id),
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setDeleteId(null);
          toast.success('Customer deleted');
        }}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
      />
    </div>
  );
}
