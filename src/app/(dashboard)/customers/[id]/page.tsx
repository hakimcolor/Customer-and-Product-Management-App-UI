'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toast';
import { customersApi, salesApi, paymentsApi, accountsApi } from '@/lib/api/endpoints';

const TABS = ['Overview', 'Sales', 'Payments', 'Ledger'];
const statusMap = { PAID: 'success', PARTIAL: 'warning', UNPAID: 'danger', paid: 'success', partial: 'warning', unpaid: 'danger' };
const refBadge = { sale: 'success', payment: 'info', return: 'warning', opening: 'default' };

export default function CustomerDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState('Overview');
  const [salesPage, setSalesPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [payModal, setPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', accountId: '', note: '' });

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => { const res = await customersApi.getOne(id); return res.data?.data ?? res.data; },
  });
  const { data: salesData } = useQuery({
    queryKey: ['customer-sales', id, salesPage],
    queryFn: async () => { const res = await salesApi.getAll({ customerId: id, page: salesPage, limit: 8 }); return res.data?.data ?? res.data; },
    enabled: tab === 'Sales' || tab === 'Overview',
  });
  const { data: paymentsData } = useQuery({
    queryKey: ['customer-payments', id, payPage],
    queryFn: async () => { const res = await paymentsApi.getAll({ customerId: id, page: payPage, limit: 8 }); return res.data?.data ?? res.data; },
    enabled: tab === 'Payments',
  });
  const { data: ledgerRaw } = useQuery({
    queryKey: ['customer-ledger', id],
    queryFn: async () => { const res = await customersApi.getLedger(id); const d = res.data?.data ?? res.data; return Array.isArray(d) ? d : d?.data ?? []; },
    enabled: tab === 'Ledger',
  });
  const { data: accounts } = useQuery({
    queryKey: ['accounts-list'],
    queryFn: async () => { const res = await accountsApi.getAll(); const d = res.data?.data ?? res.data; return d?.data ?? d; },
    enabled: payModal,
  });

  const payMutation = useMutation({
    mutationFn: (d) => paymentsApi.create({ ...d, type: 'customer', customerId: parseInt(id) }),
    onSuccess: () => {
      toast.success('Payment recorded');
      qc.invalidateQueries({ queryKey: ['customer', id] });
      qc.invalidateQueries({ queryKey: ['customer-payments', id] });
      setPayModal(false);
      setPayForm({ amount: '', accountId: '', note: '' });
    },
    onError: () => toast.error('Failed to record payment'),
  });

  const c = customer;
  const sales = salesData?.data ?? [];
  const payments = paymentsData?.data ?? [];
  const ledger = Array.isArray(ledgerRaw) ? ledgerRaw : [];

  return (
    <div>
      <PageHeader title={c?.name ?? 'Customer'} breadcrumbs={[{ label: 'People' }, { label: 'Customers', href: '/customers' }, { label: c?.name ?? '' }]}
        actions={<div className="flex gap-2"><Link href="/customers"><Button variant="outline" icon={<ArrowLeft size={15} />}>Back</Button></Link><Button icon={<DollarSign size={15} />} onClick={() => setPayModal(true)}>Receive Payment</Button></div>} />

      <Card className="mb-5">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold select-none shrink-0">{c?.name?.charAt(0) ?? '?'}</div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{isLoading ? '...' : c?.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted">
              {c?.phone && <span className="flex items-center gap-1"><Phone size={13} />{c.phone}</span>}
              {c?.email && <span className="flex items-center gap-1"><Mail size={13} />{c.email}</span>}
              {c?.address && <span className="flex items-center gap-1"><MapPin size={13} />{c.address}</span>}
            </div>
          </div>
          {c && <Badge variant={c.status ? 'success' : 'default'} className="ml-auto">{c.status ? 'Active' : 'Inactive'}</Badge>}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[{ label: 'Total Sales', value: formatCurrency(c?.totalSales ?? 0) }, { label: 'Total Paid', value: formatCurrency(c?.totalPaid ?? 0), color: 'text-green-600' }, { label: 'Total Due', value: formatCurrency(c?.dues ?? c?.totalDue ?? 0), color: 'text-red-500' }, { label: 'Balance', value: formatCurrency(c?.balance ?? 0) }].map((s) => (
          <Card key={s.label}><p className="text-xs text-muted uppercase tracking-wider">{s.label}</p><p className={cn('text-xl font-bold mt-1', s.color ?? 'text-foreground')}>{isLoading ? '—' : s.value}</p></Card>
        ))}
      </div>

      <div className="flex gap-1 mb-5 border-b border-border">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn('cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors select-none border-b-2 -mb-px', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground')}>{t}</button>)}
      </div>

      {tab === 'Overview' && <Card><h3 className="font-semibold text-foreground mb-4">Recent Sales</h3><div className="divide-y divide-border">{sales.slice(0, 5).map((s) => (<div key={s.id} className="flex items-center justify-between py-3"><div><p className="text-sm font-semibold text-primary">{s.invoiceNo}</p><p className="text-xs text-muted">{formatDateTime(s.date)}</p></div><div className="text-right"><p className="text-sm font-semibold text-foreground">{formatCurrency(s.totalAmount)}</p><Badge variant={statusMap[s.paymentStatus] ?? 'default'}>{s.paymentStatus}</Badge></div></div>))}{sales.length === 0 && <p className="py-6 text-center text-muted text-sm">No sales yet</p>}</div></Card>}

      {tab === 'Sales' && <Card padding={false}><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">{['Invoice','Total','Paid','Due','Status','Date'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{sales.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No sales found</td></tr> : sales.map((s) => (<tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 py-3 font-mono text-xs font-bold text-primary">{s.invoiceNo}</td><td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(s.totalAmount)}</td><td className="px-4 py-3 text-green-600">{formatCurrency(s.paidAmount)}</td><td className="px-4 py-3 text-red-500">{formatCurrency(s.dueAmount)}</td><td className="px-4 py-3"><Badge variant={statusMap[s.paymentStatus] ?? 'default'}>{s.paymentStatus}</Badge></td><td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{formatDateTime(s.date)}</td></tr>))}</tbody></table></div><Pagination page={salesPage} totalPages={Math.max(1, salesData?.totalPages ?? 1)} total={salesData?.total ?? 0} limit={8} onPageChange={setSalesPage} /></Card>}

      {tab === 'Payments' && <Card padding={false}><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">{['Amount','Method','Account','Note','Date'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{payments.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No payments yet</td></tr> : payments.map((p) => (<tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(p.amount)}</td><td className="px-4 py-3 text-foreground">{p.method ?? '—'}</td><td className="px-4 py-3 text-foreground">{p.account?.name ?? '—'}</td><td className="px-4 py-3 text-muted text-xs">{p.note ?? '—'}</td><td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{formatDateTime(p.date ?? p.createdAt)}</td></tr>))}</tbody></table></div><Pagination page={payPage} totalPages={Math.max(1, paymentsData?.totalPages ?? 1)} total={paymentsData?.total ?? 0} limit={8} onPageChange={setPayPage} /></Card>}

      {tab === 'Ledger' && <Card padding={false}><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">{['Date','Description','Ref','Debit','Credit','Balance'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{ledger.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No ledger entries</td></tr> : ledger.map((row) => (<tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{formatDate(row.date)}</td><td className="px-4 py-3 text-foreground max-w-48 truncate">{row.description ?? '—'}</td><td className="px-4 py-3"><Badge variant={refBadge[row.refType ?? ''] ?? 'default'}>{row.refType ?? 'entry'}</Badge></td><td className="px-4 py-3 text-green-600 font-medium">{row.type === 'DEBIT' ? formatCurrency(row.amount) : '—'}</td><td className="px-4 py-3 text-red-500 font-medium">{row.type === 'CREDIT' ? formatCurrency(row.amount) : '—'}</td><td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{formatCurrency(row.runningBalance)}</td></tr>))}</tbody></table></div></Card>}

      <Modal open={payModal} onClose={() => setPayModal(false)} title="Receive Payment" size="sm"
        footer={<><Button variant="outline" onClick={() => setPayModal(false)}>Cancel</Button><Button onClick={() => { if (!payForm.amount || isNaN(Number(payForm.amount))) { toast.error('Enter valid amount'); return; } payMutation.mutate({ amount: parseFloat(payForm.amount), accountId: payForm.accountId ? parseInt(payForm.accountId) : undefined, note: payForm.note || undefined }); }} loading={payMutation.isPending}>Record Payment</Button></>}>
        <div className="space-y-4">
          <Input label="Amount *" type="number" placeholder="0.00" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} />
          <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-foreground">Account</label><select value={payForm.accountId} onChange={(e) => setPayForm((f) => ({ ...f, accountId: e.target.value }))} className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Select account...</option>{(accounts ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          <Input label="Note (optional)" placeholder="Payment note..." value={payForm.note} onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
