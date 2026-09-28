'use client';
import { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency } from '@/lib/utils/format';

const mockStock = Array.from({ length: 22 }, (_, i) => ({
  id: String(i + 1),
  product: [
    'Samsung A55',
    'iPhone 15',
    'Laptop Dell',
    'USB Hub',
    'Wireless Mouse',
    'Keyboard',
    'Monitor 24"',
    'HDMI Cable',
  ][i % 8],
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  category: ['Electronics', 'Accessories', 'Computers'][i % 3],
  branch: ['Main Branch', 'Dhaka Branch'][i % 2],
  available: [24, 5, 12, 55, 3, 18, 8, 42][i % 8],
  reserved: [2, 0, 1, 5, 0, 3, 0, 2][i % 8],
  damaged: [0, 1, 0, 0, 1, 0, 0, 0][i % 8],
  alertQty: 10,
  value: [45000, 120000, 85000, 2500, 1800, 5500, 28000, 800][i % 8],
}));

const TABS = ['All', 'Low Stock', 'Out of Stock', 'Damaged'];

const getStatus = (
  available: number,
  alertQty: number
): 'success' | 'warning' | 'danger' => {
  if (available === 0) return 'danger';
  if (available <= alertQty) return 'warning';
  return 'success';
};

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = mockStock.filter((s) => {
    const matchSearch =
      s.product.toLowerCase().includes(search.toLowerCase()) ||
      s.sku.includes(search);
    if (tab === 'Low Stock')
      return matchSearch && s.available > 0 && s.available <= s.alertQty;
    if (tab === 'Out of Stock') return matchSearch && s.available === 0;
    if (tab === 'Damaged') return matchSearch && s.damaged > 0;
    return matchSearch;
  });

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Track stock levels across all branches"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Stock' }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Stock Value',
            value: formatCurrency(3200000),
            alert: false,
          },
          { label: 'Total Products', value: '248', alert: false },
          { label: 'Low Stock', value: '18', alert: true },
          { label: 'Out of Stock', value: '7', alert: true },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
              {s.label}
            </p>
            <p
              className={`text-xl font-bold mt-1 ${s.alert ? 'text-amber-600' : 'text-[var(--foreground)]'}`}
            >
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex gap-1 ml-auto flex-wrap">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setPage(1);
                  }}
                  className={`cursor-pointer px-3 py-1.5 text-xs rounded-lg font-medium transition-colors select-none ${
                    tab === t
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700 border border-[var(--border)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {[
                  'Product',
                  'SKU',
                  'Branch',
                  'Available',
                  'Reserved',
                  'Damaged',
                  'Value',
                  'Status',
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
                    colSpan={8}
                    className="px-4 py-16 text-center text-[var(--muted)]"
                  >
                    No items found
                  </td>
                </tr>
              ) : (
                filtered.slice((page - 1) * 10, page * 10).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.available <= item.alertQty && (
                          <AlertTriangle
                            size={13}
                            className="text-amber-500 shrink-0"
                          />
                        )}
                        <span className="font-medium text-[var(--foreground)]">
                          {item.product}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {item.branch}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                      {item.available}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {item.reserved}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.damaged > 0
                            ? 'text-red-500 font-medium'
                            : 'text-[var(--muted)]'
                        }
                      >
                        {item.damaged}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {formatCurrency(item.value * item.available)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatus(item.available, item.alertQty)}>
                        {item.available === 0
                          ? 'Out'
                          : item.available <= item.alertQty
                            ? 'Low'
                            : 'OK'}
                      </Badge>
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
    </div>
  );
}
