'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MapPin, Phone, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { branchesApi } from '@/lib/api/endpoints';

interface Branch {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  status: boolean;
  _count?: { users: number };
}

const emptyForm = { name: '', address: '', phone: '' };

export default function BranchesPage() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  const { data, isLoading } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchesApi.getAll();
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof emptyForm) => branchesApi.create(d),
    onSuccess: () => {
      toast.success('Branch created');
      qc.invalidateQueries({ queryKey: ['branches'] });
      closeModal();
    },
    onError: () => toast.error('Failed to create branch'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof emptyForm }) =>
      branchesApi.update(id, data),
    onSuccess: () => {
      toast.success('Branch updated');
      qc.invalidateQueries({ queryKey: ['branches'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => branchesApi.delete(String(id)),
    onSuccess: () => {
      toast.success('Branch deleted');
      qc.invalidateQueries({ queryKey: ['branches'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openAdd() {
    setEditBranch(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(b: Branch) {
    setEditBranch(b);
    setForm({ name: b.name, address: b.address ?? '', phone: b.phone ?? '' });
    setFormErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditBranch(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Branch name required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (editBranch)
      updateMutation.mutate({ id: String(editBranch.id), data: form });
    else createMutation.mutate(form);
  }

  const branches = data ?? [];

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle="Manage your business locations"
        breadcrumbs={[{ label: 'Management' }, { label: 'Branches' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            Add Branch
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="h-32 animate-pulse bg-gray-200 dark:bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      ) : branches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-foreground">No branches yet</p>
            <p className="text-sm text-muted mt-1">
              Add your first branch to get started
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map((b) => (
            <Card key={b.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold select-none">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{b.name}</h3>
                    {b.address && (
                      <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                        <MapPin size={11} className="shrink-0" />
                        <span>{b.address}</span>
                      </div>
                    )}
                    {b.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                        <Phone size={11} className="shrink-0" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={b.status ? 'success' : 'default'}>
                  {b.status ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit size={14} />}
                  className="flex-1"
                  onClick={() => openEdit(b)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => setDeleteId(b.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Branch"
        message="This will remove the branch and all its configurations."
      />

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editBranch ? 'Edit Branch' : 'Add Branch'}
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
              {editBranch ? 'Save Changes' : 'Save Branch'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Branch Name *"
            placeholder="e.g. Sylhet Branch"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
          />
          <Input
            label="Address"
            placeholder="Full address"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
          <Input
            label="Phone"
            placeholder="+880 1XXX-XXXXXX"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
