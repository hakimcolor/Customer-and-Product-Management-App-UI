'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Eye,
  MoreVertical,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { purchasesApi, suppliersApi, accountsApi } from '@/lib/api/endpoints';

interface Purchase {
  id: number;
  reference: string;
  supplier?: { name: string };
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  date: string;
}
interface PurchasesResponse {
  data: Purchase[];
  total: number;
  totalPages: number;
}
interface Supplier {
  id: number;
  name: string;
}
interface Account {
  id: number;
  name: string;
}

const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  UNPAID: 'danger',
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

const emptyForm = {
  supplierId: '',
  accountId: '',
  totalAmount: '',
  paidAmount: '',
  note: '',
  date: new Date().toISOString().split('T')[0],
};

export default function PurchasesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  const { data, isLoading } = useQuery<PurchasesResponse>({
    queryKey: ['purchases', page, search, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.paymentStatus = statusFilter;
      const res = await purchasesApi.getAll(params);
      return res.data?.data ?? res.data;
    },
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const res = await suppliersApi.getAll({ limit: 200 });
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['accounts-list'],
    queryFn: async () => {
      const res = await accountsApi.getAll();
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => purchasesApi.create(d),
    onSuccess: () => {
      toast.success('Purchase created');
      qc.invalidateQueries({ queryKey: ['purchases'] });
      closeModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Failed to create purchase');
    },
  });

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.supplierId) e.supplierId = 'Supplier required';
    if (!form.totalAmount || isNaN(Number(form.totalAmount)))
      e.totalAmount = 'Valid amount required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const paid = parseFloat(form.paidAmount) || 0;
    const total = parseFloat(form.totalAmount);
    createMutation.mutate({
      supplierId: parseInt(form.supplierId),
      accountId: form.accountId ? parseInt(form.accountId) : undefined,
      totalAmount: total,
      paidAmount: paid,
      note: form.note || undefined,
      date: form.date,
    });
  }

  const purchases = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalAmount = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalDue = purchases.reduce((s, p) => s + (p.dueAmount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Manage purchase orders and supplier payments"
        breadcrumbs={[{ label: 'Business' }, { label: 'Purchases' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            New Purchase
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'This Page Total',
            value: formatCurrency(totalAmount),
            icon: <ShoppingBag size={20} className="text-[var(--primary)]" />,
          },
          {
            label: 'Total Due',
            value: formatCurrency(totalDue),
            icon: <AlertCircle size={20} className="text-red-500" />,
          },
          {
            label: 'Total Orders',
            value: String(total),
            icon: <TrendingDown size={20} className="text-blue-500" />,
          },
          {
            label: 'Paid',
            value: formatCurrency(
              purchases.reduce((s, p) => s + (p.paidAmount || 0), 0)
            ),
            icon: <DollarSign size={20} className="text-green-600" />,
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">
                {s.label}
              </p>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {isLoading ? '—' : s.value}
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
              placeholder="Search by reference or supplier..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-64 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {[
                  'Reference',
                  'Supplier',
                  'Total',
                  'Paid',
                  'Due',
                  'Status',
                  'Date',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
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
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-[var(--muted)]"
                  >
                    <ShoppingBag
                      size={40}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p className="text-base font-semibold">
                      No purchases found
                    </p>
                    <p className="text-sm mt-1">
                      Create your first purchase order
                    </p>
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--primary)]">
                      {p.reference}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)] text-base">
                      {p.supplier?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {formatCurrency(p.paidAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.dueAmount > 0
                            ? 'text-red-500 font-bold'
                            : 'text-[var(--muted)]'
                        }
                      >
                        {formatCurrency(p.dueAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMap[p.paymentStatus] ?? 'default'}>
                        {p.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                      {formatDateTime(p.date)}
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
                              href: `/purchases/${p.id}`,
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
          totalPages={Math.max(1, data?.totalPages ?? 1)}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      <Modal
        open={showModal}
        onClose={closeModal}
        title="New Purchase"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending}>
              Create Purchase
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Supplier *
            </label>
            <select
              value={form.supplierId}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplierId: e.target.value }))
              }
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            >
              <option value="">Select supplier...</option>
              {(suppliers ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {formErrors.supplierId && (
              <p className="text-xs text-red-500">{formErrors.supplierId}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Payment Account
            </label>
            <select
              value={form.accountId}
              onChange={(e) =>
                setForm((f) => ({ ...f, accountId: e.target.value }))
              }
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            >
              <option value="">Select account...</option>
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Amount *"
              type="number"
              placeholder="0.00"
              value={form.totalAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, totalAmount: e.target.value }))
              }
              error={formErrors.totalAmount}
            />
            <Input
              label="Paid Amount"
              type="number"
              placeholder="0.00"
              value={form.paidAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, paidAmount: e.target.value }))
              }
            />
          </div>
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="Note (optional)"
            placeholder="Purchase note..."
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
