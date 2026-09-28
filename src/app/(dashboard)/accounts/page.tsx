'use client';
import { useState } from 'react';
import { Plus, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

const accounts = [
  { id: '1', name: 'Main Cash', type: 'Cash', balance: 250000 },
  { id: '2', name: 'Dutch Bangla Bank', type: 'Bank', balance: 1850000 },
  { id: '3', name: 'bKash Business', type: 'Mobile Banking', balance: 85000 },
  { id: '4', name: 'Petty Cash', type: 'Cash', balance: 15000 },
];

const transactions = [
  {
    id: '1',
    description: 'Sale INV-1025',
    type: 'credit',
    amount: 12500,
    account: 'Main Cash',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    description: 'Expense - Office Supplies',
    type: 'debit',
    amount: 3500,
    account: 'Main Cash',
    date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    description: 'Purchase PO-1012',
    type: 'debit',
    amount: 85000,
    account: 'Dutch Bangla Bank',
    date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    description: 'Customer Payment - Rahim',
    type: 'credit',
    amount: 25000,
    account: 'bKash Business',
    date: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '5',
    description: 'Salary - October',
    type: 'debit',
    amount: 120000,
    account: 'Dutch Bangla Bank',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

const acctIcons: Record<string, React.ReactNode> = {
  Cash: <Wallet size={20} className="text-amber-600" />,
  Bank: <CreditCard size={20} className="text-blue-600" />,
  'Mobile Banking': <Smartphone size={20} className="text-pink-600" />,
};

export default function AccountsPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Manage cash, bank and mobile banking"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Accounts' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Account
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Total Balance"
          value={formatCurrency(2200000)}
          icon={<Wallet size={20} className="text-[var(--primary)]" />}
        />
        <StatCard
          title="Cash"
          value={formatCurrency(265000)}
          icon={<Wallet size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Bank"
          value={formatCurrency(1850000)}
          icon={<CreditCard size={20} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Mobile Banking"
          value={formatCurrency(85000)}
          icon={<Smartphone size={20} className="text-pink-600" />}
          iconBg="bg-pink-100 dark:bg-pink-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Accounts */}
        <div className="space-y-3">
          {accounts.map((acc) => (
            <Card
              key={acc.id}
              className="cursor-pointer hover:border-[var(--primary)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--primary-light)] shrink-0">
                  {acctIcons[acc.type] ?? <Wallet size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] truncate">
                    {acc.name}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{acc.type}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[var(--foreground)]">
                    {formatCurrency(acc.balance)}
                  </p>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Transactions */}
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors cursor-default"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'credit'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {tx.type === 'credit' ? '+' : '−'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {tx.account} · {formatDateTime(tx.date)}
                  </p>
                </div>
                <p
                  className={`font-semibold text-sm shrink-0 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}
                >
                  {tx.type === 'credit' ? '+' : '−'}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success('Account created');
              }}
            >
              Save Account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Account Name" placeholder="e.g. Islami Bank" />
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              Account Type
            </label>
            <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors">
              <option>Cash</option>
              <option>Bank</option>
              <option>Mobile Banking</option>
            </select>
          </div>
          <Input label="Opening Balance" type="number" placeholder="0" />
        </div>
      </Modal>
    </div>
  );
}
