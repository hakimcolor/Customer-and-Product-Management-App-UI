'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import apiClient from '@/lib/api/client';
import { productsApi } from '@/lib/api/endpoints';

interface Adjustment {
  id: number;
  product?: { title: string } | null;
  branch?: { name: string } | null;
  type: 'ADD' | 'REMOVE' | string;
  quantity: number;
  reason?: string | null;
  date: string;
}
interface AdjResponse {
  data: Adjustment[];
  total: number;
  totalPages: number;
}
interface Product {
  id: number;
  title: string;
}

const emptyForm = { productId: '', type: 'ADD', quantity: '', reason: '' };

export default function AdjustmentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') setPage(1);
  }

  const { data, isLoading } = useQuery<AdjResponse>({
    queryKey: ['adjustments', page, search],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      const res = await apiClient.get('/products/stock/adjust', { params });
      return res.data?.data ?? res.data;
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await productsApi.getAll({ limit: 300 });
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) =>
      apiClient.post('/products/stock/adjust', d),
    onSuccess: () => {
      toast.success('Adjustment saved');
      qc.invalidateQueries({ queryKey: ['adjustments'] });
      closeModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Failed to save adjustment');
    },
  });

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm);
    setFormErrors({});
  }

  function handleSubmit() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.productId) e.productId = 'Select a product';
    if (
      !form.quantity ||
      isNaN(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    )
      e.quantity = 'Valid quantity required';
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;
    createMutation.mutate({
      productId: parseInt(form.productId),
      type: form.type,
      quantity: parseInt(form.quantity),
      reason: form.reason || undefined,
    });
  }

  const adjustments = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        subtitle="Record stock additions, removals and corrections"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Adjustments' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            New Adjustment
          </Button>
        }
      />

      <Card padding={false}>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              placeholder="Search adjustments..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={handleSearchKey}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">
                {[
                  'Product',
                  'Branch',
                  'Type',
                  'Quantity',
                  'Reason',
                  'Date',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-muted">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold">
                      No adjustments found
                    </p>
                    <p className="text-sm mt-1">
                      Record your first stock adjustment
                    </p>
                  </td>
                </tr>
              ) : (
                adjustments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {a.product?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {a.branch?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a.type === 'ADD' ? 'success' : 'danger'}>
                        {a.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {a.quantity}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {a.reason ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {formatDate(a.date)}
                    </td>
                  </tr>
                ))
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

      <Modal
        open={showModal}
        onClose={closeModal}
        title="New Stock Adjustment"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending}>
              Save Adjustment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Product *
            </label>
            <select
              value={form.productId}
              onChange={(e) =>
                setForm((f) => ({ ...f, productId: e.target.value }))
              }
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select product...</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {formErrors.productId && (
              <p className="text-xs text-red-500">{formErrors.productId}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ADD">Add Stock</option>
              <option value="REMOVE">Remove Stock</option>
            </select>
          </div>
          <Input
            label="Quantity *"
            type="number"
            placeholder="e.g. 10"
            value={form.quantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: e.target.value }))
            }
            error={formErrors.quantity}
          />
          <Input
            label="Reason (optional)"
            placeholder="e.g. Damage, correction..."
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
