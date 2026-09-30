'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';
export default function CapitalPage() {
  return (
    <div>
      <PageHeader
        title="Capital"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Capital' }]}
      />
      <ComingSoon
        title="Capital Management"
        description="Track owner equity, loans and capital investments."
      />
    </div>
  );
}
