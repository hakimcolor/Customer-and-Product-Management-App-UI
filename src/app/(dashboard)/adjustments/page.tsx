'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
export default function AdjustmentsPage() {
  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Adjustments' }]}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => toast.success('Add adjustment form coming soon')}
          >
            New Adjustment
          </Button>
        }
      />
      <ComingSoon
        title="Stock Adjustments"
        description="Record stock additions, removals and damage adjustments."
      />
    </div>
  );
}
