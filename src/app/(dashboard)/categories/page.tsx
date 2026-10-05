'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { categoriesApi } from '@/lib/api/endpoints';

interface Category {
  id: number;
  name: string;
  status: boolean;
  _count?: { products: number };
}

const emptyForm = { name: '' };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.getAll();
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof emptyForm) => categoriesApi.create(d),
    onSuccess: () => {
      toast.success('Category created');
      qc.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: () => toast.error('Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof emptyForm }) =>
      categoriesApi.update(String(id), data),
    onSuccess: () => {
      toast.success('Category updated');
      qc.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(String(id)),
    onSuccess: () => {
      toast.success('Category deleted');
      qc.invalidateQueries({ queryKey: ['categories'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openAdd() {
    setEditCat(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(c: Category) {
    setEditCat(c);
    setForm({ name: c.name });
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditCat(null);
    setForm(emptyForm);
    setFormError('');
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setFormError('Name required');
      return;
    }
    if (editCat) updateMutation.mutate({ id: editCat.id, data: form });
    else createMutation.mutate(form);
  }

  const categories = (data ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Categories' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            Add Category
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
            placeholder="Search categories..."
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
      ) : categories.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-foreground">No categories found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold select-none">
                  {cat.name.charAt(0)}
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{cat.name}</h3>
              {cat._count !== undefined && (
                <p className="text-xs text-muted mb-4">
                  {cat._count.products} products
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit size={13} />}
                  className="flex-1"
                  onClick={() => openEdit(cat)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={13} />}
                  onClick={() => setDeleteId(cat.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editCat ? 'Edit Category' : 'Add Category'}
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
          label="Category Name *"
          placeholder="e.g. Electronics"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Category"
        message="Delete this category? Products won't be affected."
      />
    </div>
  );
}
