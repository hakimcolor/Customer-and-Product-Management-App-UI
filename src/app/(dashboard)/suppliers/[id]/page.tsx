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
import { suppliersApi, purchasesApi, paymentsApi, accountsApi } from '@/lib/api/endpoints';

const TABS = ['Overview', 'Purchases', 'Payments', 'Ledger'];
const statusMap = { PAID: 'success', PARTIAL: 'warning', UNPAID: 'danger', paid: 'success', partial: 'warning', unpaid: 'danger' };
const refBadge = { purchase: 'warning', payment: 'info', return: 'success', opening: 'default' };

export default function SupplierDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState('Overview');
  const [purchPage, setPurchPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [payModal, setPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', accountId: '', note: '' });

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => { const res = await suppliersApi.getOne(id); return res.data?.data ?? res.data; },
  });
  const { data: purchData } = useQuery({
    queryKey: ['supplier-purchases', id, purchPage],
    queryFn: async () => { const res = await purchasesApi.getAll({ supplierId: id, page: purchPage, limit: 8 }); return res.data?.data ?? res.data; },
    enabled: tab === 'Purchases' || tab === 'Overview',
  });
  const { data: paymentsData } = useQuery({
    queryKey: ['supplier-payments', id, payPage],
    queryFn: async () => { const res = await paymentsApi.getAll({ supplierId: id, page: payPage, limit: 8 }); return res.data?.data ?? res.data; },
    enabled: tab === 'Payments',
  });
  const { data: ledgerRaw } = useQuery({
    queryKey: ['supplier-ledger', id],
    queryFn: async () => {
      const res = await import('@/lib/api/client').then(m => m.default.get('/suppliers/' + id + '/ledger'));
      const d = res.data?.data ?? res.data; return Array.isArray(d) ? d : d?.data ?? [];
    },
    enabled: tab === 'Ledger',
  });
  const { data: accounts } = useQuery({
    queryKey: ['accounts-list'],
    queryFn: async () => { const res = await accountsApi.getAll(); const d = res.data?.data ?? res.data; return d?.data ?? d; },
    enabled: payModal,
  });

  const payMutation = useMutation({
    mutationFn: (d) => paymentsApi.create({ ...d, type: 'supplier', supplierId: parseInt(id) }),
    onSuccess: () => {
      toast.success('Payment recorded');
      qc.invalidateQueries({ queryKey: ['supplier', id] });
      qc.invalidateQueries({ queryKey: ['supplier-payments', id] });
      setPayModal(false);
      setPayForm({ amount: '', accountId: '', note: '' });
    },
    onError: () => toast.error('Failed to record payment'),
  });

  const s = supplier;
  const purchases = purchData?.data ?? [];
  const payments = paymentsData?.data ?? [];
  const ledger = Array.isArray(ledgerRaw) ? ledgerRaw : [];

  return (
    <div>
      <PageHeader title={s?.name ?? 'Supplier'} breadcrumbs={[{ label: 'People' }, { label: 'Suppliers', href: '/suppliers' }, { label: s?.name ?? '' }]}
        actions={<div className="flex gap-2"><Link href="/suppliers"><Button variant="outline" icon={<ArrowLeft size={15} />}>Back</Button></Link><Button icon={<DollarSign size={15} />} onClick={() => setPayModal(true)}>Make Payment</Button></div>} />

      <Card className="mb-5">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold select-none shrink-0">{s?.name?.charAt(0) ?? '?'}</div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{isLoading ? '...' : s?.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted">
              {s?.phone && <span className="flex items-center gap-1"><Phone size={13} />{s.phone}</span>}
              {s?.email && <span className="flex items-center gap-1"><Mail size={13} />{s.email}</span>}
              {s?.address && <span className="flex items-center gap-1"><MapPin size={13} />{s.address}</span>}
            </div>
          </div>
          {s && <Badge variant={s.status ? 'success' : 'default'} className="ml-auto">{s.status ? 'Active' : 'Inactive'}</Badge>}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        {[{ label: 'Total Purchases', value: formatCurrency(s?.totalPurchases ?? 0) }, { label: 'Total Paid', value: formatCurrency(s?.totalPaid ?? 0), color: 'text-green-600' }, { label: 'Outstanding', value: formatCurrency(s?.dues ?? s?.outstanding ?? 0), color: 'text-red-500' }].map((item) => (
          <Card key={item.label}><p className="text-xs text-muted uppercase tracking-wider">{item.label}</p><p className={cn('text-xl font-bold mt-1', item.color ?? 'text-foreground')}>{isLoading ? '—' : item.value}</p></Card>
        ))}
      </div>

      <div className="flex gap-1 mb-5 border-b border-border">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn('cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors select-none border-b-2 -mb-px', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground')}>{t}</button>)}
      </div>

      {tab === 'Overview' && <Card><h3 className="font-semibold text-foreground mb-4">Recent Purchases</h3><div className="divide-y divide-border">{purchases.slice(0, 5).map((p) => (<div key={p.id} className="flex items-center justify-between py-3"><div><p className="text-sm font-semibold text-primary">{p.reference}</p><p className="text-xs text-muted">{formatDateTime(p.date)}</p></div><div className="text-right"><p className="text-sm font-semibold text-foreground">{formatCurrency(p.totalAmount)}</p><Badge variant={statusMap[p.paymentStatus] ?? 'default'}>{p.paymentStatus}</Badge></div></div>))}{purchases.length === 0 && <p className="py-6 text-center text-muted text-sm">No purchases yet</p>}</div></Card>}

      {tab === 'Purchases' && <Card padding={false}><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">{['Reference','Total','Paid','Due','Status','Date'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{purchases.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No purchases found</td></tr> : purchases.map((p) => (<tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 py-3 font-mono text-xs font-bold text-primary">{p.reference}</td><td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(p.totalAmount)}</td><td className="px-4 py-3 text-green-600">{formatCurrency(p.paidAmount)}</td><td className="px-4 py-3 text-red-500">{formatCurrency(p.dueAmount)}</td><td className="px-4 py-3"><Badge variant={statusMap[p.paymentStatus] ?? 'default'}>{p.paymentStatus}</Badge></td><td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{formatDateTime(p.date)}</td></tr>))}</tbody></table></div><Pagination page={purchPage} totalPages={Math.max(1, purchData?.totalPages ?? 1)} total={purchData?.total ?? 0} limit={8} onPageChange={setPurchPage} /></Card>}

      {tab === 'Payments' && <Card padding={false}><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">{['Amount','Method','Account','Note','Date'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{payments.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No payments yet</td></tr> : payments.map((p) => (<tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 py-3 font-semibold text-amber-600">{formatCurrency(p.amount)}</td><td className="px-4 py-3 text-foreground">{p.method ?? '—'}</td><td className="px-4 py-3 text-foreground">{p.account?.name ?? '—'}</td><td className="px-4 py-3 text-muted text-xs">{p.note ?? '—'}</td><td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{formatDateTime(p.date ?? p.createdAt)}</td></tr>))}</tbody></table></div><Pagination page={payPage} totalPages={Math.max(1, paymentsData?.totalPages ?? 1)} total={paymentsData?.total ?? 0} limit={8} onPageChange={setPayPage} /></Card>}

      {tab === 'Ledger' && <Card padding={false}><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">{['Date','Description','Ref','Debit','Credit','Balance'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{ledger.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No ledger entries</td></tr> : ledger.map((row) => (<tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{formatDate(row.date)}</td><td className="px-4 py-3 text-foreground max-w-48 truncate">{row.description ?? '—'}</td><td className="px-4 py-3"><Badge variant={refBadge[row.refType ?? ''] ?? 'default'}>{row.refType ?? 'entry'}</Badge></td><td className="px-4 py-3 text-green-600 font-medium">{row.type === 'DEBIT' ? formatCurrency(row.amount) : '—'}</td><td className="px-4 py-3 text-red-500 font-medium">{row.type === 'CREDIT' ? formatCurrency(row.amount) : '—'}</td><td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{formatCurrency(row.runningBalance)}</td></tr>))}</tbody></table></div></Card>}

      <Modal open={payModal} onClose={() => setPayModal(false)} title="Make Payment" size="sm"
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
