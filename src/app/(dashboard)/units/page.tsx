'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import apiClient from '@/lib/api/client';

interface Unit {
  id: number;
  name: string;
  shortName?: string | null;
  _count?: { products: number };
}

const emptyForm = { name: '', shortName: '' };

export default function UnitsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  const { data, isLoading } = useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await apiClient.get('/products/units');
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof emptyForm) => apiClient.post('/products/units', d),
    onSuccess: () => {
      toast.success('Unit created');
      qc.invalidateQueries({ queryKey: ['units'] });
      closeModal();
    },
    onError: () => toast.error('Failed to create unit'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof emptyForm }) =>
      apiClient.put(`/products/units/${id}`, data),
    onSuccess: () => {
      toast.success('Unit updated');
      qc.invalidateQueries({ queryKey: ['units'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/products/units/${id}`),
    onSuccess: () => {
      toast.success('Unit deleted');
      qc.invalidateQueries({ queryKey: ['units'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openAdd() {
    setEditUnit(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }
  function openEdit(u: Unit) {
    setEditUnit(u);
    setForm({ name: u.name, shortName: u.shortName ?? '' });
    setFormErrors({});
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditUnit(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function handleSubmit() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Name required';
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;
    if (editUnit) updateMutation.mutate({ id: editUnit.id, data: form });
    else createMutation.mutate(form);
  }

  const units = data ?? [];

  return (
    <div>
      <PageHeader
        title="Units"
        subtitle="Manage measurement units"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Units' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            Add Unit
          </Button>
        }
      />

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">
              {['Unit Name', 'Short Form', 'Products', ''].map((h) => (
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
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : units.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  No units found
                </td>
              </tr>
            ) : (
              units.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {u.name}
                  </td>
                  <td className="px-4 py-3">
                    {u.shortName && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--primary-light)] text-primary text-xs font-semibold">
                        {u.shortName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {u._count?.products ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit size={13} />}
                        onClick={() => openEdit(u)}
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
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editUnit ? 'Edit Unit' : 'Add Unit'}
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
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Unit Name *"
            placeholder="e.g. Kilogram"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
          />
          <Input
            label="Short Form"
            placeholder="e.g. KG"
            value={form.shortName}
            onChange={(e) =>
              setForm((f) => ({ ...f, shortName: e.target.value }))
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Unit"
        message="Delete this unit?"
      />
    </div>
  );
}
