'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
export default function QuotationsPage() {
  return (
    <div>
      <PageHeader
        title="Quotations"
        breadcrumbs={[{ label: 'Business' }, { label: 'Quotations' }]}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => toast.success('Create quotation coming soon')}
          >
            New Quotation
          </Button>
        }
      />
      <ComingSoon
        title="Quotations"
        description="Create and manage price quotations for customers."
      />
    </div>
  );
}
