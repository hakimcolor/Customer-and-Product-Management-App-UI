'use client';
import { useState } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toast';

const TABS = ['Overview', 'Purchases', 'Payments', 'Ledger'];

const supplier = {
  name: 'Tech Wholesale',
  phone: '01800000001',
  email: 'tech@wholesale.com',
  address: 'Nawabpur, Dhaka',
  totalPurchases: 1250000,
  totalPaid: 1000000,
  outstanding: 250000,
};

export default function SupplierDetailPage() {
  const [tab, setTab] = useState('Overview');
  return (
    <div>
      <PageHeader
        title={supplier.name}
        breadcrumbs={[
          { label: 'People' },
          { label: 'Suppliers', href: '/suppliers' },
          { label: supplier.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/suppliers">
              <Button variant="outline" icon={<ArrowLeft size={15} />}>
                Back
              </Button>
            </Link>
            <Button
              variant="outline"
              icon={<Edit size={15} />}
              onClick={() => toast.success('Edit supplier')}
            >
              Edit
            </Button>
            <Button
              onClick={() => toast.success('Make payment form coming soon')}
            >
              Make Payment
            </Button>
          </div>
        }
      />
      <Card className="mb-5">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold select-none shrink-0">
            {supplier.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {supplier.name}
            </h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Phone size={13} />
                {supplier.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={13} />
                {supplier.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {supplier.address}
              </span>
            </div>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          {
            label: 'Total Purchases',
            value: formatCurrency(supplier.totalPurchases),
          },
          {
            label: 'Total Paid',
            value: formatCurrency(supplier.totalPaid),
            color: 'text-green-600',
          },
          {
            label: 'Outstanding',
            value: formatCurrency(supplier.outstanding),
            color: 'text-red-500',
          },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
              {s.label}
            </p>
            <p
              className={cn(
                'text-xl font-bold mt-1',
                s.color ?? 'text-[var(--foreground)]'
              )}
            >
              {s.value}
            </p>
          </Card>
        ))}
      </div>
      <div className="flex gap-1 mb-5 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors select-none border-b-2 -mb-px',
              tab === t
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <Card>
        <p className="text-[var(--muted)] text-sm">
          {tab} data will load from API.
        </p>
      </Card>
    </div>
  );
}
