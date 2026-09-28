'use client';
import { useState } from 'react';
import { FileDown, Printer } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils/format';

const ledgerData = [
  {
    id: '1',
    date: '2026-09-01',
    description: 'Opening Balance',
    debit: 0,
    credit: 0,
    balance: 50000,
    type: 'opening',
  },
  {
    id: '2',
    date: '2026-09-05',
    description: 'Sale - INV-1020 (Rahim Enterprise)',
    debit: 12500,
    credit: 0,
    balance: 62500,
    type: 'sale',
  },
  {
    id: '3',
    date: '2026-09-07',
    description: 'Payment received - Rahim Enterprise',
    debit: 0,
    credit: 12500,
    balance: 50000,
    type: 'payment',
  },
  {
    id: '4',
    date: '2026-09-10',
    description: 'Sale - INV-1021 (Karim Store)',
    debit: 8200,
    credit: 0,
    balance: 58200,
    type: 'sale',
  },
  {
    id: '5',
    date: '2026-09-12',
    description: 'Expense - Office Rent',
    debit: 0,
    credit: 15000,
    balance: 43200,
    type: 'expense',
  },
  {
    id: '6',
    date: '2026-09-15',
    description: 'Sale - INV-1022 (ABC Ltd)',
    debit: 25000,
    credit: 0,
    balance: 68200,
    type: 'sale',
  },
  {
    id: '7',
    date: '2026-09-20',
    description: 'Purchase - PO-1011',
    debit: 0,
    credit: 35000,
    balance: 33200,
    type: 'purchase',
  },
  {
    id: '8',
    date: '2026-09-25',
    description: 'Payment received - ABC Ltd',
    debit: 25000,
    credit: 0,
    balance: 58200,
    type: 'payment',
  },
];

const typeColors: Record<
  string,
  'success' | 'warning' | 'danger' | 'info' | 'default'
> = {
  sale: 'success',
  payment: 'info',
  expense: 'danger',
  purchase: 'warning',
  opening: 'default',
};

export default function LedgerPage() {
  const [account, setAccount] = useState('main-cash');

  const totalDebit = ledgerData.reduce((s, r) => s + r.debit, 0);
  const totalCredit = ledgerData.reduce((s, r) => s + r.credit, 0);
  const closingBalance = ledgerData[ledgerData.length - 1]?.balance ?? 0;

  return (
    <div>
      <PageHeader
        title="Ledger"
        subtitle="Detailed account transaction history"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Ledger' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<FileDown size={14} />}>
              Export
            </Button>
            <Button variant="outline" size="sm" icon={<Printer size={14} />}>
              Print
            </Button>
          </div>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block mb-1.5">
              Account
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="main-cash">Main Cash</option>
              <option value="bank">Dutch Bangla Bank</option>
              <option value="bkash">bKash Business</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block mb-1.5">
              From
            </label>
            <input
              type="date"
              defaultValue="2026-09-01"
              className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block mb-1.5">
              To
            </label>
            <input
              type="date"
              defaultValue="2026-09-29"
              className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <Button>Generate</Button>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Opening Balance', value: formatCurrency(50000) },
          {
            label: 'Total Debit',
            value: formatCurrency(totalDebit),
            color: 'text-green-600',
          },
          {
            label: 'Total Credit',
            value: formatCurrency(totalCredit),
            color: 'text-red-500',
          },
          { label: 'Closing Balance', value: formatCurrency(closingBalance) },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
              {s.label}
            </p>
            <p
              className={`text-xl font-bold mt-1 ${s.color || 'text-[var(--foreground)]'}`}
            >
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60">
                {[
                  'Date',
                  'Description',
                  'Type',
                  'Debit (+)',
                  'Credit (-)',
                  'Balance',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {ledgerData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDate(row.date)}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {row.description}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={typeColors[row.type]}>{row.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                  </td>
                  <td className="px-4 py-3 text-red-500 font-medium">
                    {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
