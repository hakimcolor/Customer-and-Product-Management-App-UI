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

const mockBrands = [
  { id: '1', name: 'Samsung', products: 42, status: 'active' },
  { id: '2', name: 'Apple', products: 28, status: 'active' },
  { id: '3', name: 'Dell', products: 18, status: 'active' },
  { id: '4', name: 'Logitech', products: 35, status: 'active' },
  { id: '5', name: 'Sony', products: 22, status: 'active' },
  { id: '6', name: 'LG', products: 15, status: 'inactive' },
  { id: '7', name: 'HP', products: 20, status: 'active' },
  { id: '8', name: 'Generic', products: 68, status: 'active' },
];

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = mockBrands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle="Manage product brands"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Brands' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Brand
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
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((b) => (
          <Card
            key={b.id}
            className="hover:border-[var(--primary)] transition-colors cursor-default"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold select-none">
                {b.name.charAt(0)}
              </div>
              <Badge variant={b.status === 'active' ? 'success' : 'default'}>
                {b.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-1">
              {b.name}
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              {b.products} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit size={13} />}
                className="flex-1"
                onClick={() => toast.success('Edit brand')}
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

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Brand"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success('Brand created');
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Input label="Brand Name" placeholder="e.g. Samsung" />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setDeleteId(null);
          toast.success('Brand deleted');
        }}
        title="Delete Brand"
        message="Delete this brand?"
      />
    </div>
  );
}
