'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  BarChart2,
  MoreVertical,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: [
    'Samsung A55',
    'iPhone 15',
    'Laptop Dell',
    'USB Hub',
    'Wireless Mouse',
    'Mechanical Keyboard',
  ][i % 6],
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  category: ['Electronics', 'Accessories', 'Computers'][i % 3],
  retailPrice: [45000, 120000, 85000, 2500, 1800, 5500][i % 6],
  currentStock: [24, 5, 12, 55, 3, 18][i % 6],
  alertQty: 10,
  status: i % 7 === 0 ? 'inactive' : 'active',
}));

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockProducts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = !category || p.category.toLowerCase() === category;
    const matchStatus = !status || p.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Products' }]}
        actions={
          <Link href="/products/new">
            <Button icon={<Plus size={16} />}>Add Product</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Products', value: '248' },
          { label: 'Active', value: '231' },
          { label: 'Low Stock', value: '18' },
          { label: 'Out of Stock', value: '7' },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
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
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-56 transition-colors"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="accessories">Accessories</option>
            <option value="computers">Computers</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {[
                  'Product',
                  'SKU',
                  'Category',
                  'Stock',
                  'Price',
                  'Status',
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-[var(--muted)]"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.slice((page - 1) * 10, page * 10).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs shrink-0 select-none">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-medium text-[var(--foreground)]">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {p.sku}
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {p.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.currentStock <= p.alertQty
                            ? 'text-amber-600 font-semibold'
                            : 'text-[var(--foreground)]'
                        }
                      >
                        {p.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      {formatCurrency(p.retailPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={p.status === 'active' ? 'success' : 'default'}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownTrigger>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === p.id ? null : p.id)
                          }
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <DropdownMenu
                          open={openMenuId === p.id}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: 'View',
                              icon: <Eye size={14} />,
                              onClick: () => toast.success(`Viewing ${p.name}`),
                            },
                            {
                              label: 'Edit',
                              icon: <Edit size={14} />,
                              href: `/products/${p.id}/edit`,
                            },
                            {
                              label: 'Duplicate',
                              icon: <Copy size={14} />,
                              onClick: () =>
                                toast.success('Product duplicated'),
                            },
                            {
                              label: 'Stock History',
                              icon: <BarChart2 size={14} />,
                              href: `/inventory`,
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} />,
                              danger: true,
                              onClick: () => setDeleteId(p.id),
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
          toast.success('Product deleted');
        }}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
