'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  AlertTriangle,
  Package,
  Boxes,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency } from '@/lib/utils/format';
import apiClient from '@/lib/api/client';

interface StockItem {
  id: number;
  productId: number;
  product: {
    id: number;
    title: string;
    sku?: string;
    alertQuantity: number;
    sellingPrice: number;
    category?: { name: string };
    brand?: { name: string };
  };
  branch?: { name: string };
  warehouse?: { name: string };
  quantity: number;
  reservedQuantity?: number;
  damagedQuantity?: number;
}

interface StockResponse {
  data: StockItem[];
  total: number;
  totalPages: number;
}

const TABS = ['All', 'Low Stock', 'Out of Stock', 'Damaged'];

function getStatus(
  qty: number,
  alert: number
): 'success' | 'warning' | 'danger' {
  if (qty === 0) return 'danger';
  if (qty <= alert) return 'warning';
  return 'success';
}

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [page, setPage] = useState(1);

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') setPage(1);
  }

  const stockParam =
    tab === 'Low Stock'
      ? 'low'
      : tab === 'Out of Stock'
        ? 'out'
        : tab === 'Damaged'
          ? 'damaged'
          : undefined;

  const { data, isLoading } = useQuery<StockResponse>({
    queryKey: ['stock', page, search, tab],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (stockParam) params.status = stockParam;
      const res = await apiClient.get('/reports/stock', { params });
      return res.data?.data ?? res.data;
    },
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  const lowCount = items.filter(
    (i) => i.quantity > 0 && i.quantity <= i.product.alertQuantity
  ).length;
  const outCount = items.filter((i) => i.quantity === 0).length;
  const stockValue = items.reduce(
    (s, i) => s + i.quantity * i.product.sellingPrice,
    0
  );

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
            value: formatCurrency(stockValue),
            icon: <DollarSign size={20} className="text-[var(--primary)]" />,
            alert: false,
          },
          {
            label: 'Total Items',
            value: String(total),
            icon: <Package size={20} className="text-blue-500" />,
            alert: false,
          },
          {
            label: 'Low Stock',
            value: String(lowCount),
            icon: <AlertTriangle size={20} className="text-amber-500" />,
            alert: true,
          },
          {
            label: 'Out of Stock',
            value: String(outCount),
            icon: <Boxes size={20} className="text-red-500" />,
            alert: true,
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">
                {s.label}
              </p>
              {s.icon}
            </div>
            <p
              className={`text-2xl font-bold mt-1 ${s.alert ? 'text-amber-600' : 'text-[var(--foreground)]'}`}
            >
              {isLoading ? '—' : s.value}
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
                onKeyDown={handleSearchKey}
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
                  'Category',
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
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-[var(--muted)]"
                  >
                    <TrendingDown
                      size={40}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p className="font-semibold text-base text-[var(--foreground)]">
                      No stock items found
                    </p>
                    <p className="text-sm mt-1">
                      Add products and opening stock to track inventory
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const qty = item.quantity;
                  const alert = item.product.alertQuantity;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {qty <= alert && (
                            <AlertTriangle
                              size={13}
                              className="text-amber-500 shrink-0"
                            />
                          )}
                          <span className="font-medium text-[var(--foreground)]">
                            {item.product.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {item.product.sku ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {item.product.category?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {item.branch?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                        {qty}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {item.reservedQuantity ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            (item.damagedQuantity ?? 0) > 0
                              ? 'text-red-500 font-medium'
                              : 'text-[var(--muted)]'
                          }
                        >
                          {item.damagedQuantity ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {formatCurrency(qty * item.product.sellingPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatus(qty, alert)}>
                          {qty === 0 ? 'Out' : qty <= alert ? 'Low' : 'OK'}
                        </Badge>
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
