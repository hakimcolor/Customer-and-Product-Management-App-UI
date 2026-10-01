'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
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

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm);
    setFormErrors({});
  }

  function handleSubmit() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.amount || isNaN(Number(form.amount)))
      e.amount = 'Valid amount required';
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;
    createMutation.mutate({
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description || undefined,
    });
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
                {['Type', 'Amount', 'Description', 'Date'].map((h) => (
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
                  <td colSpan={4} className="px-4 py-12 text-center text-muted">
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
        title="Add Capital Record"
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
    </div>
  );
}
