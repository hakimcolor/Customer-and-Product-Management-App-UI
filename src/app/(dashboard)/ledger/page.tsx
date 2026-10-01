'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown, Printer, RefreshCw, Users, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { reportsApi, customersApi, suppliersApi } from '@/lib/api/endpoints';
import type { LedgerEntry } from '@/types';

interface PartyOption {
  id: number;
  name: string;
}

const REF_BADGE: Record<
  string,
  'success' | 'warning' | 'danger' | 'info' | 'default'
> = {
  sale: 'success',
  payment: 'info',
  expense: 'danger',
  purchase: 'warning',
  opening: 'default',
  return: 'warning',
};

function defaultDates() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { from: fmt(first), to: fmt(now) };
}

export default function LedgerPage() {
  const { from: defaultFrom, to: defaultTo } = defaultDates();

  const [partyType, setPartyType] = useState<'customer' | 'supplier'>(
    'customer'
  );
  const [partyId, setPartyId] = useState('');
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [applied, setApplied] = useState({
    partyType: 'customer' as 'customer' | 'supplier',
    partyId: '',
    fromDate: defaultFrom,
    toDate: defaultTo,
  });

  const { data: customersData } = useQuery<{ data: PartyOption[] }>({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const res = await customersApi.getAll({ limit: 200 });
      return res.data?.data ?? res.data;
    },
  });

  const { data: suppliersData } = useQuery<{ data: PartyOption[] }>({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const res = await suppliersApi.getAll({ limit: 200 });
      return res.data?.data ?? res.data;
    },
  });

  const customers: PartyOption[] = customersData?.data ?? [];
  const suppliers: PartyOption[] = suppliersData?.data ?? [];

  const {
    data: entries = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<LedgerEntry[]>({
    queryKey: ['ledger', applied],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        startDate: applied.fromDate,
        endDate: applied.toDate,
      };
      if (applied.partyId) {
        if (applied.partyType === 'customer')
          params.customerId = applied.partyId;
        else params.supplierId = applied.partyId;
      }
      const res = await reportsApi.ledger(params);
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw : [];
    },
  });

  const totalDebit = entries.reduce(
    (s, r) => s + (r.type === 'DEBIT' ? r.amount : 0),
    0
  );
  const totalCredit = entries.reduce(
    (s, r) => s + (r.type === 'CREDIT' ? r.amount : 0),
    0
  );
  const openingBalance =
    entries.length > 0
      ? entries[0].runningBalance -
        (entries[0].type === 'DEBIT' ? entries[0].amount : -entries[0].amount)
      : 0;
  const closingBalance =
    entries.length > 0 ? entries[entries.length - 1].runningBalance : 0;

  const partyList = applied.partyType === 'customer' ? customers : suppliers;
  const selectedParty = partyList.find((p) => String(p.id) === applied.partyId);

  return (
    <div>
      <PageHeader
        title="Ledger"
        subtitle="Customer & supplier transaction history"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Ledger' }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<FileDown size={14} />}
              onClick={() => toast.success('Export coming soon')}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer size={14} />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Party Type
            </label>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {(['customer', 'supplier'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setPartyType(t);
                    setPartyId('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors capitalize ${
                    partyType === t
                      ? 'bg-primary text-white'
                      : 'bg-card text-muted hover:text-foreground'
                  }`}
                >
                  {t === 'customer' ? (
                    <Users size={13} />
                  ) : (
                    <Building2 size={13} />
                  )}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              {partyType === 'customer' ? 'Customer' : 'Supplier'}
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-w-45"
            >
              <option value="">
                All {partyType === 'customer' ? 'Customers' : 'Suppliers'}
              </option>
              {(partyType === 'customer' ? customers : suppliers).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() =>
                setApplied({ partyType, partyId, fromDate, toDate })
              }
              loading={isFetching}
            >
              Generate
            </Button>
            <Button
              variant="outline"
              icon={<RefreshCw size={14} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {selectedParty && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted">
            {applied.partyType === 'customer' ? (
              <Users size={14} />
            ) : (
              <Building2 size={14} />
            )}
            <span className="font-medium text-foreground">
              {selectedParty.name}
            </span>
            <span>·</span>
            <span>
              {applied.partyType === 'customer' ? 'Customer' : 'Supplier'}{' '}
              Ledger
            </span>
          </div>
        )}
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Opening Balance', value: formatCurrency(openingBalance) },
          {
            label: 'Total Debit (+)',
            value: formatCurrency(totalDebit),
            color: 'text-green-600',
          },
          {
            label: 'Total Credit (−)',
            value: formatCurrency(totalCredit),
            color: 'text-red-500',
          },
          { label: 'Closing Balance', value: formatCurrency(closingBalance) },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-muted uppercase tracking-wider">
              {s.label}
            </p>
            <p
              className={`text-xl font-bold mt-1 ${s.color ?? 'text-foreground'}`}
            >
              {isLoading ? '—' : s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">
                {[
                  'Date',
                  'Description',
                  'Party',
                  'Ref',
                  'Debit (+)',
                  'Credit (−)',
                  'Balance',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl opacity-20">📒</span>
                      <p className="font-semibold text-base text-foreground">
                        No ledger entries found
                      </p>
                      <p className="text-sm">
                        Try a different date range or party filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((row) => {
                  const party = row.customer ?? row.supplier;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-foreground max-w-55 truncate">
                        {row.description ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-foreground text-sm">
                        {party?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={REF_BADGE[row.refType ?? ''] ?? 'default'}
                        >
                          {row.refType ?? 'entry'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-green-600 font-medium">
                        {row.type === 'DEBIT'
                          ? formatCurrency(row.amount)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-red-500 font-medium">
                        {row.type === 'CREDIT'
                          ? formatCurrency(row.amount)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(row.runningBalance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 dark:bg-slate-800/60 border-t-2 border-border font-semibold">
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-xs text-muted uppercase tracking-wider"
                  >
                    Totals
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    {formatCurrency(totalDebit)}
                  </td>
                  <td className="px-4 py-3 text-red-500">
                    {formatCurrency(totalCredit)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatCurrency(closingBalance)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}
