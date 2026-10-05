'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { brandsApi } from '@/lib/api/endpoints';

interface Brand {
  id: number;
  name: string;
  status: boolean;
  _count?: { products: number };
}

const emptyForm = { name: '' };

export default function BrandsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await brandsApi.getAll();
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof emptyForm) => brandsApi.create(d),
    onSuccess: () => {
      toast.success('Brand created');
      qc.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
    onError: () => toast.error('Failed to create brand'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof emptyForm }) =>
      brandsApi.update(String(id), data),
    onSuccess: () => {
      toast.success('Brand updated');
      qc.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => brandsApi.delete(String(id)),
    onSuccess: () => {
      toast.success('Brand deleted');
      qc.invalidateQueries({ queryKey: ['brands'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openAdd() {
    setEditBrand(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  }
  function openEdit(b: Brand) {
    setEditBrand(b);
    setForm({ name: b.name });
    setFormError('');
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditBrand(null);
    setForm(emptyForm);
    setFormError('');
  }
  function handleSubmit() {
    if (!form.name.trim()) {
      setFormError('Name required');
      return;
    }
    if (editBrand) updateMutation.mutate({ id: editBrand.id, data: form });
    else createMutation.mutate(form);
  }

  const brands = (data ?? []).filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle="Manage product brands"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Brands' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            Add Brand
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="relative max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <div className="h-28 animate-pulse bg-gray-200 dark:bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((b) => (
            <Card key={b.id} className="hover:border-primary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold select-none mb-3">
                {b.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{b.name}</h3>
              {b._count !== undefined && (
                <p className="text-xs text-muted mb-4">
                  {b._count.products} products
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit size={13} />}
                  className="flex-1"
                  onClick={() => openEdit(b)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={13} />}
                  onClick={() => setDeleteId(b.id)}
                >
                  Del
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editBrand ? 'Edit Brand' : 'Add Brand'}
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
        <Input
          label="Brand Name *"
          placeholder="e.g. Samsung"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Brand"
        message="Delete this brand?"
      />
    </div>
  );
}
