'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

const mockUnits = [
  { id: '1', name: 'Piece', short: 'PC', products: 185 },
  { id: '2', name: 'Box', short: 'Box', products: 42 },
  { id: '3', name: 'Kilogram', short: 'KG', products: 8 },
  { id: '4', name: 'Litre', short: 'L', products: 5 },
  { id: '5', name: 'Meter', short: 'M', products: 3 },
  { id: '6', name: 'Dozen', short: 'Dz', products: 12 },
];

export default function UnitsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Units"
        subtitle="Manage measurement units"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Units' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Unit
          </Button>
        }
      />

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
              {['Unit Name', 'Short Form', 'Products', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {mockUnits.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                  {u.name}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold">
                    {u.short}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--foreground)]">
                  {u.products}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit size={13} />}
                      onClick={() => toast.success('Edit unit')}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      onClick={() => setDeleteId(u.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Unit"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success('Unit created');
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Unit Name" placeholder="e.g. Kilogram" />
          <Input label="Short Form" placeholder="e.g. KG" />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setDeleteId(null);
          toast.success('Unit deleted');
        }}
        title="Delete Unit"
        message="Delete this unit?"
      />
    </div>
  );
}
