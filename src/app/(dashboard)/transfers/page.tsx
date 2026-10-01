'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowRight, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import apiClient from '@/lib/api/client';
import { branchesApi } from '@/lib/api/endpoints';

interface Transfer {
  id: number;
  reference: string;
  fromBranch?: { name: string };
  toBranch?: { name: string };
  status: string;
  date: string;
  _count?: { items: number };
}
interface Branch {
  id: number;
  name: string;
}

const STATUS_STEPS = ['REQUESTED', 'APPROVED', 'SENT', 'RECEIVED', 'COMPLETED'];
const STATUS_LABEL: Record<string, string> = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  SENT: 'Sent',
  RECEIVED: 'Received',
  COMPLETED: 'Completed',
};

function statusVariant(s: string): 'success' | 'info' | 'warning' | 'default' {
  if (s === 'COMPLETED') return 'success';
  if (s === 'RECEIVED' || s === 'SENT') return 'info';
  if (s === 'APPROVED') return 'warning';
  return 'default';
}

const emptyForm = { fromBranchId: '', toBranchId: '', note: '' };

export default function TransfersPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery<Transfer[]>({
    queryKey: ['transfers'],
    queryFn: async () => {
      const res = await apiClient.get('/products/stock/transfers');
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchesApi.getAll();
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) =>
      apiClient.post('/products/stock/transfers', d),
    onSuccess: () => {
      toast.success('Transfer created');
      qc.invalidateQueries({ queryKey: ['transfers'] });
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to create transfer'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/products/stock/transfers/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['transfers'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  function handleCreate() {
    if (!form.fromBranchId || !form.toBranchId) {
      toast.error('Select both branches');
      return;
    }
    if (form.fromBranchId === form.toBranchId) {
      toast.error('Source and destination must differ');
      return;
    }
    createMutation.mutate({
      fromBranchId: parseInt(form.fromBranchId),
      toBranchId: parseInt(form.toBranchId),
      note: form.note || undefined,
    });
  }

  function nextStatus(current: string) {
    const idx = STATUS_STEPS.indexOf(current);
    return STATUS_STEPS[idx + 1] ?? null;
  }

  const transfers = data ?? [];

  return (
    <div>
      <PageHeader
        title="Stock Transfers"
        subtitle="Transfer inventory between branches"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Transfers' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            New Transfer
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="h-24 animate-pulse bg-gray-200 dark:bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      ) : transfers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-foreground">No transfers found</p>
            <p className="text-sm text-muted mt-1">
              Create your first stock transfer
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {transfers.map((t) => {
            const stepIndex = STATUS_STEPS.indexOf(t.status);
            const next = nextStatus(t.status);
            return (
              <Card key={t.id}>
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {t.reference}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted mt-1">
                      <span className="font-medium text-foreground">
                        {t.fromBranch?.name ?? '—'}
                      </span>
                      <ArrowRight size={14} className="text-primary" />
                      <span className="font-medium text-foreground">
                        {t.toBranch?.name ?? '—'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {t._count?.items ?? 0} items · {formatDate(t.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(t.status)}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </Badge>
                    {next && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatus.mutate({ id: t.id, status: next })
                        }
                        loading={updateStatus.isPending}
                      >
                        Mark {STATUS_LABEL[next]}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center flex-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${i <= stepIndex ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700 text-muted'}`}
                      >
                        {i < stepIndex ? '✓' : i + 1}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-1 rounded-full ${i < stepIndex ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {STATUS_STEPS.map((step) => (
                    <span
                      key={step}
                      className="text-[10px] text-muted flex-1 text-center"
                    >
                      {STATUS_LABEL[step]}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm(emptyForm);
        }}
        title="New Stock Transfer"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Create Transfer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              From Branch *
            </label>
            <select
              value={form.fromBranchId}
              onChange={(e) =>
                setForm((f) => ({ ...f, fromBranchId: e.target.value }))
              }
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select branch...</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              To Branch *
            </label>
            <select
              value={form.toBranchId}
              onChange={(e) =>
                setForm((f) => ({ ...f, toBranchId: e.target.value }))
              }
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select branch...</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Optional notes..."
              rows={2}
              className="cursor-text w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
