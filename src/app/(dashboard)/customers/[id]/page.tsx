'use client';
import { useState } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Edit, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toast';

const TABS = ['Overview', 'Sales', 'Payments', 'Ledger'];

// Mock customer data
const customer = {
  id: '1',
  name: 'Rahim Enterprise',
  phone: '01700000001',
  email: 'rahim@example.com',
  address: 'Motijheel, Dhaka',
  totalSales: 850000,
  totalPaid: 700000,
  totalDue: 150000,
  totalOrders: 42,
  joinDate: '2025-01-15',
};

const recentSales = [
  {
    id: '1',
    invoice: 'INV-1025',
    amount: 12500,
    paid: 12500,
    due: 0,
    status: 'paid',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    invoice: 'INV-1020',
    amount: 45000,
    paid: 25000,
    due: 20000,
    status: 'partial',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '3',
    invoice: 'INV-1015',
    amount: 28000,
    paid: 0,
    due: 28000,
    status: 'unpaid',
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

export default function CustomerDetailPage() {
  const [tab, setTab] = useState('Overview');

  return (
    <div>
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: 'People' },
          { label: 'Customers', href: '/customers' },
          { label: customer.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/customers">
              <Button variant="outline" icon={<ArrowLeft size={15} />}>
                Back
              </Button>
            </Link>
            <Button
              variant="outline"
              icon={<Edit size={15} />}
              onClick={() => toast.success('Edit customer')}
            >
              Edit
            </Button>
            <Button
              icon={<DollarSign size={15} />}
              onClick={() => toast.success('Receive payment form coming soon')}
            >
              Receive Payment
            </Button>
          </div>
        }
      />

      {/* Profile card */}
      <Card className="mb-5">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold select-none shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {customer.name}
            </h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Phone size={13} />
                {customer.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={13} />
                {customer.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {customer.address}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Sales', value: formatCurrency(customer.totalSales) },
          {
            label: 'Total Paid',
            value: formatCurrency(customer.totalPaid),
            color: 'text-green-600',
          },
          {
            label: 'Total Due',
            value: formatCurrency(customer.totalDue),
            color: 'text-red-500',
          },
          { label: 'Total Orders', value: String(customer.totalOrders) },
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

      {/* Tabs */}
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

      {tab === 'Overview' && (
        <Card>
          <h3 className="font-semibold text-[var(--foreground)] mb-4">
            Recent Sales
          </h3>
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {recentSales.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    {s.invoice}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatDateTime(s.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {formatCurrency(s.amount)}
                  </p>
                  <Badge variant={statusMap[s.status]}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'Sales' && (
        <Card>
          <p className="text-[var(--muted)] text-sm">
            Full sales history will load from API.
          </p>
        </Card>
      )}

      {tab === 'Payments' && (
        <Card>
          <p className="text-[var(--muted)] text-sm">
            Payment history will load from API.
          </p>
        </Card>
      )}

      {tab === 'Ledger' && (
        <Card>
          <p className="text-[var(--muted)] text-sm">
            Customer ledger will load from API.
          </p>
        </Card>
      )}
    </div>
  );
}
