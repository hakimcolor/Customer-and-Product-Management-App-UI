'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  BarChart2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency } from '@/lib/utils/format';

// Mock data
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
  brand: ['Samsung', 'Apple', 'Dell', 'Generic'][i % 4],
  retailPrice: [45000, 120000, 85000, 2500, 1800, 5500][i % 6],
  currentStock: [24, 5, 12, 55, 3, 18][i % 6],
  alertQty: 10,
  status: i % 7 === 0 ? 'inactive' : 'active',
}));

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Products' }]}
        actions={
          <Button icon={<Plus size={16} />}>
            <a href="/products/new">Add Product</a>
          </Button>
        }
      />

      {/* Stats */}
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
        {/* Filters */}
        <div className="p-4 flex flex-wrap gap-3 border-b border-[var(--border)]">
          <Input
            placeholder="Search products..."
            leftIcon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
            <option value="">All Categories</option>
            <option>Electronics</option>
            <option>Accessories</option>
            <option>Computers</option>
          </select>
          <select className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60">
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
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.slice((page - 1) * 10, page * 10).map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs shrink-0">
                        {product.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[var(--foreground)]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {product.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.currentStock <= product.alertQty
                          ? 'text-amber-600 font-medium'
                          : 'text-[var(--foreground)]'
                      }
                    >
                      {product.currentStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {formatCurrency(product.retailPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        product.status === 'active' ? 'success' : 'default'
                      }
                    >
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === product.id ? null : product.id
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === product.id && (
                      <div className="absolute right-8 top-8 z-10 w-40 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1">
                        {[
                          { label: 'View', icon: <Eye size={14} /> },
                          { label: 'Edit', icon: <Edit size={14} /> },
                          { label: 'Duplicate', icon: <Copy size={14} /> },
                          { label: 'Stock', icon: <BarChart2 size={14} /> },
                        ].map((a) => (
                          <button
                            key={a.label}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="text-[var(--muted)]">
                              {a.icon}
                            </span>{' '}
                            {a.label}
                          </button>
                        ))}
                        <div className="border-t border-[var(--border)] my-1" />
                        <button
                          onClick={() => {
                            setDeleteId(product.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
