'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

const mockCategories = [
  { id: '1', name: 'Electronics', products: 85, status: 'active' },
  { id: '2', name: 'Accessories', products: 62, status: 'active' },
  { id: '3', name: 'Computers', products: 45, status: 'active' },
  { id: '4', name: 'Mobile Phones', products: 38, status: 'active' },
  { id: '5', name: 'Audio & Video', products: 28, status: 'active' },
  { id: '6', name: 'Networking', products: 18, status: 'inactive' },
  { id: '7', name: 'Printers', products: 12, status: 'active' },
  { id: '8', name: 'Storage', products: 22, status: 'active' },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = mockCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Categories' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Category
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="relative max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
          />
          <input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cat) => (
          <Card
            key={cat.id}
            className="hover:border-[var(--primary)] transition-colors cursor-default"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold select-none">
                {cat.name.charAt(0)}
              </div>
              <Badge variant={cat.status === 'active' ? 'success' : 'default'}>
                {cat.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-1">
              {cat.name}
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              {cat.products} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit size={13} />}
                className="flex-1"
                onClick={() => {
                  setEditId(cat.id);
                  setAddOpen(true);
                }}
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

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditId(null);
        }}
        title={editId ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setEditId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                setEditId(null);
                toast.success(editId ? 'Category updated' : 'Category created');
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Electronics"
            defaultValue={
              editId ? mockCategories.find((c) => c.id === editId)?.name : ''
            }
          />
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              Status
            </label>
            <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setDeleteId(null);
          toast.success('Category deleted');
        }}
        title="Delete Category"
        message="Delete this category? Products in this category won't be affected."
      />
    </div>
  );
}
