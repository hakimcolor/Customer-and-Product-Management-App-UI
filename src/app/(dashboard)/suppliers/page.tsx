'use client';
import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency } from '@/lib/utils/format';

const mockSuppliers = Array.from({ length: 15 }, (_, i) => ({
  id: String(i + 1),
  name: [
    'Tech Wholesale',
    'Global Imports',
    'BD Electronics',
    'Dhaka Distributors',
    'Star Suppliers',
  ][i % 5],
  phone: `01${7 + (i % 3)}${String(10000000 + i * 2222222).slice(0, 8)}`,
  email: `supplier${i + 1}@example.com`,
  totalPurchases: (i + 1) * 85000,
  totalPaid: (i + 1) * 70000,
  outstanding: (i + 1) * 15000,
  createdAt: '2026-01-10',
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
        actions={<Button icon={<Plus size={16} />}>Add Supplier</Button>}
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
          <Input
            placeholder="Search suppliers..."
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
                  'Supplier',
                  'Phone',
                  'Total Purchases',
                  'Paid',
                  'Outstanding',
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
              {filtered.slice((page - 1) * 10, page * 10).map((supplier) => (
                <tr
                  key={supplier.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                        {supplier.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {supplier.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {supplier.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {supplier.phone}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {formatCurrency(supplier.totalPurchases)}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    {formatCurrency(supplier.totalPaid)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        supplier.outstanding > 0
                          ? 'text-amber-600 font-medium'
                          : 'text-[var(--foreground)]'
                      }
                    >
                      {formatCurrency(supplier.outstanding)}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === supplier.id ? null : supplier.id
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)]"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === supplier.id && (
                      <div className="absolute right-8 top-8 z-10 w-36 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800">
                          <Eye size={14} className="text-[var(--muted)]" /> View
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800">
                          <Edit size={14} className="text-[var(--muted)]" />{' '}
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(supplier.id);
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
        title="Delete Supplier"
        message="Delete this supplier permanently?"
      />
    </div>
  );
}
