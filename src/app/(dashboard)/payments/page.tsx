'use client';
import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

const mockPayments = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  reference: `PAY-${String(1000 + i).padStart(5, '0')}`,
  party: ['Rahim Enterprise', 'Karim Store', 'Tech Wholesale', 'ABC Ltd.'][
    i % 4
  ],
  type: i % 2 === 0 ? 'received' : 'sent',
  method: ['Cash', 'Bank Transfer', 'bKash', 'Card'][i % 4],
  amount: (i + 1) * 8500,
  date: new Date(Date.now() - i * 86400000).toISOString(),
  note: i % 3 === 0 ? 'Advance payment' : '',
}));

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockPayments.filter((p) => {
    const match =
      p.party.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase());
    return match && (!type || p.type === type);
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track all incoming and outgoing payments"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => toast.success('Add payment form coming soon')}
          >
            Add Payment
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Received', value: formatCurrency(850000) },
          { label: 'Total Sent', value: formatCurrency(420000) },
          { label: 'This Month', value: formatCurrency(185000) },
          { label: 'Today', value: formatCurrency(42500) },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-xl font-bold text-[var(--foreground)] mt-1">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="p-4 flex flex-wrap gap-3 border-b border-[var(--border)]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search payments..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-56 transition-colors"
            />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">All Types</option>
            <option value="received">Received</option>
            <option value="sent">Sent</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {[
                  'Reference',
                  'Party',
                  'Type',
                  'Method',
                  'Amount',
                  'Date',
                  'Note',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.slice((page - 1) * 10, page * 10).map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[var(--primary)]">
                    {p.reference}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {p.party}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={p.type === 'received' ? 'success' : 'warning'}
                    >
                      {p.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {p.method}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDateTime(p.date)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">
                    {p.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(filtered.length / 10))}
          total={filtered.length}
          limit={10}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
