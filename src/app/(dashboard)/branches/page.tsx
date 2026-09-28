'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const mockBranches = [
  {
    id: '1',
    name: 'Main Branch',
    address: 'Motijheel, Dhaka',
    phone: '01700000001',
    manager: 'Hakim Rahman',
    status: 'active',
    products: 248,
    staff: 12,
  },
  {
    id: '2',
    name: 'Dhaka Branch',
    address: 'Mirpur, Dhaka',
    phone: '01700000002',
    manager: 'Rahim Uddin',
    status: 'active',
    products: 180,
    staff: 8,
  },
  {
    id: '3',
    name: 'Chittagong Branch',
    address: 'Agrabad, Chittagong',
    phone: '01700000003',
    manager: 'Karim Ali',
    status: 'active',
    products: 150,
    staff: 6,
  },
  {
    id: '4',
    name: 'Khulna Branch',
    address: 'KDA, Khulna',
    phone: '01700000004',
    manager: 'Farhan Islam',
    status: 'inactive',
    products: 95,
    staff: 4,
  },
];

export default function BranchesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle="Manage your business locations"
        breadcrumbs={[{ label: 'Management' }, { label: 'Branches' }]}
        actions={<Button icon={<Plus size={16} />}>Add Branch</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
        {mockBranches.map((branch) => (
          <Card key={branch.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold">
                  {branch.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {branch.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[var(--muted)] mt-0.5">
                    <MapPin size={11} /> {branch.address}
                  </div>
                </div>
              </div>
              <Badge
                variant={branch.status === 'active' ? 'success' : 'default'}
              >
                {branch.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Products', value: branch.products },
                { label: 'Staff', value: branch.staff },
                { label: 'Manager', value: branch.manager },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[var(--background)] rounded-lg p-2.5 text-center"
                >
                  <p className="font-semibold text-[var(--foreground)] text-sm">
                    {s.value}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit size={14} />}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setDeleteId(branch.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title="Delete Branch"
        message="This will remove the branch and all its configurations."
      />
    </div>
  );
}
