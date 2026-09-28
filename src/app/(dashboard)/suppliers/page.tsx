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

const mockSuppliers = Array.from({ length: 15 }, (_, i) => ({
  id: String(i + 1),
  name: [
    'Tech Wholesale',
    'Global Imports',
    'BD Electronics',
    'Dhaka Distributors',
    'Star Suppliers',
  ][i % 5],
  phone: `0180000${String(1000 + i)}`,
  email: `supplier${i + 1}@example.com`,
  totalPurchases: (i + 1) * 85000,
  totalPaid: (i + 1) * 70000,
  outstanding: (i + 1) * 15000,
}));

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Manage your supplier network"
        breadcrumbs={[{ label: 'People' }, { label: 'Suppliers' }]}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => toast.success('Add supplier form coming soon')}
          >
            Add Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Suppliers', value: '56' },
          { label: 'Active', value: '48' },
          { label: 'Total Payable', value: formatCurrency(210000) },
          { label: 'Overdue', value: '8' },
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
              placeholder="Search suppliers..."
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
                  'Supplier',
                  'Phone',
                  'Total Purchases',
                  'Paid',
                  'Outstanding',
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0 select-none">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {s.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {s.phone}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {formatCurrency(s.totalPurchases)}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    {formatCurrency(s.totalPaid)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.outstanding > 0
                          ? 'text-amber-600 font-medium'
                          : 'text-[var(--foreground)]'
                      }
                    >
                      {formatCurrency(s.outstanding)}
                    </span>
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
                            label: 'View Profile',
                            icon: <Eye size={14} />,
                            href: `/suppliers/${s.id}`,
                          },
                          {
                            label: 'Edit',
                            icon: <Edit size={14} />,
                            onClick: () => toast.success('Edit supplier'),
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 size={14} />,
                            danger: true,
                            onClick: () => setDeleteId(s.id),
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
          toast.success('Supplier deleted');
        }}
        title="Delete Supplier"
        message="Delete this supplier permanently?"
      />
    </div>
  );
}
