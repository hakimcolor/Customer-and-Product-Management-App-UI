'use client';
import { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

const STATUS_STEPS = ['Requested', 'Approved', 'Sent', 'Received', 'Completed'];

const mockTransfers = [
  {
    id: '1',
    ref: 'TRF-001',
    from: 'Main Branch',
    to: 'Dhaka Branch',
    items: 12,
    status: 'Completed',
    date: '2026-09-20',
  },
  {
    id: '2',
    ref: 'TRF-002',
    from: 'Dhaka Branch',
    to: 'Chittagong Branch',
    items: 5,
    status: 'Sent',
    date: '2026-09-25',
  },
  {
    id: '3',
    ref: 'TRF-003',
    from: 'Main Branch',
    to: 'Khulna Branch',
    items: 8,
    status: 'Approved',
    date: '2026-09-28',
  },
  {
    id: '4',
    ref: 'TRF-004',
    from: 'Chittagong Branch',
    to: 'Main Branch',
    items: 3,
    status: 'Requested',
    date: '2026-09-29',
  },
];

const statusVariant = (
  s: string
): 'success' | 'info' | 'warning' | 'default' => {
  if (s === 'Completed') return 'success';
  if (s === 'Received' || s === 'Sent') return 'info';
  if (s === 'Approved') return 'warning';
  return 'default';
};

export default function TransfersPage() {
  const [addOpen, setAddOpen] = useState(false);

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

      <div className="space-y-4">
        {mockTransfers.map((t) => {
          const stepIndex = STATUS_STEPS.indexOf(t.status);
          return (
            <Card key={t.id}>
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {t.ref}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)] mt-1">
                    <span className="font-medium text-[var(--foreground)]">
                      {t.from}
                    </span>
                    <ArrowRight size={14} className="text-[var(--primary)]" />
                    <span className="font-medium text-[var(--foreground)]">
                      {t.to}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {t.items} items · {formatDate(t.date)}
                  </p>
                </div>
                <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        i <= stepIndex
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-gray-200 dark:bg-slate-700 text-[var(--muted)]'
                      }`}
                    >
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-1 rounded-full ${i < stepIndex ? 'bg-[var(--primary)]' : 'bg-gray-200 dark:bg-slate-700'}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {STATUS_STEPS.map((step) => (
                  <span
                    key={step}
                    className="text-[10px] text-[var(--muted)] flex-1 text-center"
                  >
                    {step}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New Stock Transfer"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success('Transfer created');
              }}
            >
              Create Transfer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              From Branch
            </label>
            <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              <option>Main Branch</option>
              <option>Dhaka Branch</option>
              <option>Chittagong Branch</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              To Branch
            </label>
            <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              <option>Dhaka Branch</option>
              <option>Main Branch</option>
              <option>Chittagong Branch</option>
            </select>
          </div>
          <Input label="Notes" placeholder="Optional notes" />
        </div>
      </Modal>
    </div>
  );
}
