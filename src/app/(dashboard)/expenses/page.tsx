'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Trash2,
  MoreVertical,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { expensesApi, accountsApi } from '@/lib/api/endpoints';

interface Expense {
  id: number;
  category: string;
  description?: string | null;
  amount: number;
  account?: { name: string } | null;
  date: string;
  createdAt: string;
}
interface ExpensesResponse {
  data: Expense[];
  total: number;
  totalPages: number;
}
interface Account {
  id: number;
  name: string;
}

const CATEGORIES = [
  'Rent',
  'Salary',
  'Utilities',
  'Marketing',
  'Transport',
  'Supplies',
  'Other',
];

const emptyForm = {
  category: 'Rent',
  description: '',
  amount: '',
  accountId: '',
  date: new Date().toISOString().split('T')[0],
};

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  const { data, isLoading } = useQuery<ExpensesResponse>({
    queryKey: ['expenses', page, search],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      const res = await expensesApi.getAll(params);
      return res.data?.data ?? res.data;
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
    mutationFn: (d: Record<string, unknown>) => expensesApi.create(d),
    onSuccess: () => {
      toast.success('Expense added');
      qc.invalidateQueries({ queryKey: ['expenses'] });
      closeModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Failed to add expense');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(String(id)),
    onSuccess: () => {
      toast.success('Expense deleted');
      qc.invalidateQueries({ queryKey: ['expenses'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function closeModal() {
    setAddOpen(false);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.amount || isNaN(Number(form.amount)))
      e.amount = 'Valid amount required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    createMutation.mutate({
      category: form.category,
      description: form.description || undefined,
      amount: parseFloat(form.amount),
      accountId: form.accountId ? parseInt(form.accountId) : undefined,
      date: form.date,
    });
  }

  const expenses = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track and manage business expenses"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Expenses' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Expense
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Total Records',
            value: String(total),
            icon: <TrendingDown size={20} className="text-[var(--primary)]" />,
          },
          {
            label: 'This Page Total',
            value: formatCurrency(pageTotal),
            icon: <DollarSign size={20} className="text-red-500" />,
          },
          {
            label: 'Categories',
            value: String(CATEGORIES.length - 1),
            icon: <TrendingDown size={20} className="text-blue-500" />,
          },
          {
            label: 'Current Page',
            value: String(page),
            icon: <DollarSign size={20} className="text-orange-500" />,
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
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">
                {[
                  'Category',
                  'Description',
                  'Amount',
                  'Account',
                  'Date',
                  '',
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
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-muted">
                    <TrendingDown
                      size={40}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p className="text-base font-semibold">No expenses found</p>
                    <p className="text-sm mt-1">
                      Add your first expense record
                    </p>
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {e.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {e.account?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownTrigger>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === e.id ? null : e.id)
                          }
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-muted hover:text-foreground transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <DropdownMenu
                          open={openMenuId === e.id}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} />,
                              danger: true,
                              onClick: () => {
                                setOpenMenuId(null);
                                setDeleteId(e.id);
                              },
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Expense"
        message="Delete this expense record permanently?"
      />

      <Modal
        open={addOpen}
        onClose={closeModal}
        title="Add Expense"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input
            label="Description"
            placeholder="Expense description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <Input
            label="Amount *"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            error={formErrors.amount}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Account
            </label>
            <select
              value={form.accountId}
              onChange={(e) =>
                setForm((f) => ({ ...f, accountId: e.target.value }))
              }
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select account...</option>
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
