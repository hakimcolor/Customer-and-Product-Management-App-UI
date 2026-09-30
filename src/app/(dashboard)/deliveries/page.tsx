'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';
export default function DeliveriesPage() {
  return (
    <div>
      <PageHeader
        title="Deliveries"
        breadcrumbs={[{ label: 'Business' }, { label: 'Deliveries' }]}
      />
      <ComingSoon
        title="Deliveries"
        description="Track delivery orders and shipment status."
      />
    </div>
  );
}
