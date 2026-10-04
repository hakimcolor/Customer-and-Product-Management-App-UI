'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import apiClient from '@/lib/api/client';

interface Capital {
  id: number;
  amount: number;
  type: 'INVESTMENT' | 'WITHDRAWAL' | string;
  description?: string | null;
  date: string;
}
interface CapitalResponse {
  data: Capital[];
  total: number;
  totalPages: number;
}
interface CapitalSummary {
  totalInvestment: number;
  totalWithdrawal: number;
  netCapital: number;
}

const emptyForm = { amount: '', type: 'INVESTMENT', description: '' };

export default function CapitalPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editCapital, setEditCapital] = useState<Capital | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  const { data, isLoading } = useQuery<CapitalResponse>({
    queryKey: ['capital', page],
    queryFn: async () => {
      const res = await apiClient.get('/capital', {
        params: { page, limit: 10 },
      });
      return res.data?.data ?? res.data;
    },
  });

  const { data: summary } = useQuery<CapitalSummary>({
    queryKey: ['capital-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/capital');
      const d = res.data?.data ?? res.data;
      const items: Capital[] = d?.data ?? d ?? [];
      const totalInvestment = items
        .filter((i) => i.type === 'INVESTMENT')
        .reduce((s, i) => s + i.amount, 0);
      const totalWithdrawal = items
        .filter((i) => i.type === 'WITHDRAWAL')
        .reduce((s, i) => s + i.amount, 0);
      return {
        totalInvestment,
        totalWithdrawal,
        netCapital: totalInvestment - totalWithdrawal,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => apiClient.post('/capital', d),
    onSuccess: () => {
      toast.success('Capital record added');
      qc.invalidateQueries({ queryKey: ['capital'] });
      qc.invalidateQueries({ queryKey: ['capital-summary'] });
      closeModal();
    },
    onError: () => toast.error('Failed to add capital record'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiClient.put(`/capital/${id}`, data),
    onSuccess: () => {
      toast.success('Capital record updated');
      qc.invalidateQueries({ queryKey: ['capital'] });
      qc.invalidateQueries({ queryKey: ['capital-summary'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/capital/${id}`),
    onSuccess: () => {
      toast.success('Capital record deleted');
      qc.invalidateQueries({ queryKey: ['capital'] });
      qc.invalidateQueries({ queryKey: ['capital-summary'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function closeModal() {
    setShowModal(false);
    setEditCapital(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function openEdit(item: Capital) {
    setEditCapital(item);
    setForm({
      amount: String(item.amount),
      type: item.type,
      description: item.description ?? '',
    });
    setFormErrors({});
  }

  function handleSubmit() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.amount || isNaN(Number(form.amount)))
      e.amount = 'Valid amount required';
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;
    const payload = {
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description || undefined,
    };
    if (editCapital)
      updateMutation.mutate({ id: editCapital.id, data: payload });
    else createMutation.mutate(payload);
  }

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Capital"
        subtitle="Track owner equity and capital investments"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Capital' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Add Capital
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard
          title="Total Investment"
          value={formatCurrency(summary?.totalInvestment ?? 0)}
          icon={<TrendingUp size={20} className="text-green-600" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Total Withdrawal"
          value={formatCurrency(summary?.totalWithdrawal ?? 0)}
          icon={<TrendingDown size={20} className="text-red-500" />}
          iconBg="bg-red-100 dark:bg-red-900/30"
        />
        <StatCard
          title="Net Capital"
          value={formatCurrency(summary?.netCapital ?? 0)}
          icon={<DollarSign size={20} className="text-[var(--primary)]" />}
        />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">
                {['Type', 'Amount', 'Description', 'Date', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider"
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
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    No capital records yet
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          item.type === 'INVESTMENT' ? 'success' : 'danger'
                        }
                      >
                        {item.type}
                      </Badge>
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${item.type === 'INVESTMENT' ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {item.type === 'INVESTMENT' ? '+' : '−'}
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {item.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-muted hover:text-foreground transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
        open={showModal || !!editCapital}
        onClose={closeModal}
        title={editCapital ? 'Edit Capital Record' : 'Add Capital Record'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editCapital ? 'Save Changes' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="INVESTMENT">Investment</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </div>
          <Input
            label="Amount *"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            error={formErrors.amount}
          />
          <Input
            label="Description (optional)"
            placeholder="e.g. Owner investment"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Capital Record"
        message="Delete this capital record permanently?"
      />
    </div>
  );
}
