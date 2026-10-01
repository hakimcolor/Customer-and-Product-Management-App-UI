'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Wallet,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { accountsApi } from '@/lib/api/endpoints';

interface Account {
  id: number;
  name: string;
  accountType: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  balance: number;
  status: boolean;
}
interface Transaction {
  id: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  description?: string | null;
  refType?: string | null;
  date: string;
  account?: { name: string };
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  CASH: <Wallet size={20} className="text-amber-600" />,
  BANK: <CreditCard size={20} className="text-blue-600" />,
  MOBILE_BANKING: <Smartphone size={20} className="text-pink-600" />,
};
const TYPE_LABEL: Record<string, string> = {
  CASH: 'Cash',
  BANK: 'Bank',
  MOBILE_BANKING: 'Mobile Banking',
};

const emptyAccForm = { name: '', accountType: 'CASH', openingBalance: '0' };
const emptyTxForm = { amount: '', description: '', toAccountId: '' };

export default function AccountsPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [txModal, setTxModal] = useState<
    'deposit' | 'withdraw' | 'transfer' | null
  >(null);
  const [selected, setSelected] = useState<Account | null>(null);
  const [accForm, setAccForm] = useState(emptyAccForm);
  const [txForm, setTxForm] = useState(emptyTxForm);

  /* ── Queries ── */
  const { data: accountsRaw, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await accountsApi.getAll();
      const d = res.data?.data ?? res.data;
      return (d?.data ?? d) as Account[];
    },
  });

  const { data: txRaw } = useQuery({
    queryKey: ['all-transactions'],
    queryFn: async () => {
      const res = await accountsApi.getAllTransactions({ limit: 10 });
      const d = res.data?.data ?? res.data;
      return (d?.data ?? d) as Transaction[];
    },
  });

  const accounts: Account[] = accountsRaw ?? [];
  const transactions: Transaction[] = txRaw ?? [];

  /* ── Derived totals ── */
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  const cash = accounts
    .filter((a) => a.accountType === 'CASH')
    .reduce((s, a) => s + a.balance, 0);
  const bank = accounts
    .filter((a) => a.accountType === 'BANK')
    .reduce((s, a) => s + a.balance, 0);
  const mobile = accounts
    .filter((a) => a.accountType === 'MOBILE_BANKING')
    .reduce((s, a) => s + a.balance, 0);

  /* ── Mutations ── */
  const createAcc = useMutation({
    mutationFn: (d: Record<string, unknown>) => accountsApi.create(d),
    onSuccess: () => {
      toast.success('Account created');
      qc.invalidateQueries({ queryKey: ['accounts'] });
      setAddOpen(false);
      setAccForm(emptyAccForm);
    },
    onError: () => toast.error('Failed to create account'),
  });

  const deposit = useMutation({
    mutationFn: (d: Record<string, unknown>) => accountsApi.deposit(d),
    onSuccess: () => {
      toast.success('Deposit successful');
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['all-transactions'] });
      closeTx();
    },
    onError: () => toast.error('Deposit failed'),
  });

  const withdraw = useMutation({
    mutationFn: (d: Record<string, unknown>) => accountsApi.withdraw(d),
    onSuccess: () => {
      toast.success('Withdrawal successful');
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['all-transactions'] });
      closeTx();
    },
    onError: () => toast.error('Withdrawal failed'),
  });

  const transfer = useMutation({
    mutationFn: (d: Record<string, unknown>) => accountsApi.transfer(d),
    onSuccess: () => {
      toast.success('Transfer successful');
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['all-transactions'] });
      closeTx();
    },
    onError: () => toast.error('Transfer failed'),
  });

  function closeTx() {
    setTxModal(null);
    setTxForm(emptyTxForm);
  }

  function handleTxSubmit() {
    const amount = parseFloat(txForm.amount);
    if (!txForm.amount || isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!selected) return;
    const payload: Record<string, unknown> = {
      accountId: selected.id,
      amount,
      description: txForm.description || undefined,
    };
    if (txModal === 'deposit') deposit.mutate(payload);
    else if (txModal === 'withdraw') withdraw.mutate(payload);
    else if (txModal === 'transfer') {
      if (!txForm.toAccountId) {
        toast.error('Select destination account');
        return;
      }
      transfer.mutate({
        ...payload,
        toAccountId: parseInt(txForm.toAccountId),
      });
    }
  }

  const txPending =
    deposit.isPending || withdraw.isPending || transfer.isPending;

  /* ── UI ── */
  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Manage cash, bank and mobile banking accounts"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Accounts' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Account
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Total Balance"
          value={isLoading ? '...' : formatCurrency(total)}
          icon={<Wallet size={20} className="text-[var(--primary)]" />}
        />
        <StatCard
          title="Cash"
          value={isLoading ? '...' : formatCurrency(cash)}
          icon={<Wallet size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Bank"
          value={isLoading ? '...' : formatCurrency(bank)}
          icon={<CreditCard size={20} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Mobile Banking"
          value={isLoading ? '...' : formatCurrency(mobile)}
          icon={<Smartphone size={20} className="text-pink-600" />}
          iconBg="bg-pink-100 dark:bg-pink-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Account cards */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <div className="h-16 animate-pulse bg-gray-200 dark:bg-slate-700 rounded" />
              </Card>
            ))
          ) : accounts.length === 0 ? (
            <Card>
              <p className="text-center text-[var(--muted)] py-6 text-sm">
                No accounts yet
              </p>
            </Card>
          ) : (
            accounts.map((acc) => (
              <Card
                key={acc.id}
                className="cursor-pointer hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--primary-light)] shrink-0">
                    {TYPE_ICON[acc.accountType] ?? <Wallet size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-muted">
                      {TYPE_LABEL[acc.accountType]}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">
                      {formatCurrency(acc.balance)}
                    </p>
                    <Badge variant={acc.status ? 'success' : 'default'}>
                      {acc.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => {
                      setSelected(acc);
                      setTxModal('deposit');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 transition-colors font-medium"
                  >
                    <ArrowDownRight size={12} /> Deposit
                  </button>
                  <button
                    onClick={() => {
                      setSelected(acc);
                      setTxModal('withdraw');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors font-medium"
                  >
                    <ArrowUpRight size={12} /> Withdraw
                  </button>
                  <button
                    onClick={() => {
                      setSelected(acc);
                      setTxModal('transfer');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors font-medium"
                  >
                    <ArrowLeftRight size={12} /> Transfer
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-foreground mb-4">
            Recent Transactions
          </h2>
          <div className="divide-y divide-border">
            {transactions.length === 0 ? (
              <p className="text-center text-muted py-8 text-sm">
                No transactions yet
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'DEPOSIT'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : tx.type === 'WITHDRAWAL'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' ? (
                      <ArrowDownRight size={14} className="text-green-600" />
                    ) : tx.type === 'WITHDRAWAL' ? (
                      <ArrowUpRight size={14} className="text-red-500" />
                    ) : (
                      <ArrowLeftRight size={14} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.description ?? tx.refType ?? tx.type}
                    </p>
                    <p className="text-xs text-muted">
                      {tx.account?.name ?? '—'} · {formatDateTime(tx.date)}
                    </p>
                  </div>
                  <p
                    className={`font-semibold text-sm shrink-0 ${
                      tx.type === 'DEPOSIT'
                        ? 'text-green-600'
                        : tx.type === 'WITHDRAWAL'
                          ? 'text-red-500'
                          : 'text-blue-600'
                    }`}
                  >
                    {tx.type === 'DEPOSIT'
                      ? '+'
                      : tx.type === 'WITHDRAWAL'
                        ? '−'
                        : '↔'}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Add Account Modal */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAccForm(emptyAccForm);
        }}
        title="Add Account"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setAccForm(emptyAccForm);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                createAcc.mutate({
                  name: accForm.name,
                  accountType: accForm.accountType,
                  openingBalance: parseFloat(accForm.openingBalance) || 0,
                })
              }
              loading={createAcc.isPending}
            >
              Save Account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Account Name *"
            placeholder="e.g. Islami Bank"
            value={accForm.name}
            onChange={(e) =>
              setAccForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Account Type
            </label>
            <select
              value={accForm.accountType}
              onChange={(e) =>
                setAccForm((f) => ({ ...f, accountType: e.target.value }))
              }
              className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="MOBILE_BANKING">Mobile Banking</option>
            </select>
          </div>
          <Input
            label="Opening Balance"
            type="number"
            placeholder="0"
            value={accForm.openingBalance}
            onChange={(e) =>
              setAccForm((f) => ({ ...f, openingBalance: e.target.value }))
            }
          />
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal
        open={!!txModal}
        onClose={closeTx}
        title={
          txModal === 'deposit'
            ? `Deposit — ${selected?.name}`
            : txModal === 'withdraw'
              ? `Withdraw — ${selected?.name}`
              : `Transfer from ${selected?.name}`
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeTx}>
              Cancel
            </Button>
            <Button onClick={handleTxSubmit} loading={txPending}>
              {txModal === 'deposit'
                ? 'Deposit'
                : txModal === 'withdraw'
                  ? 'Withdraw'
                  : 'Transfer'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Amount *"
            type="number"
            placeholder="0.00"
            value={txForm.amount}
            onChange={(e) =>
              setTxForm((f) => ({ ...f, amount: e.target.value }))
            }
          />
          {txModal === 'transfer' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                To Account *
              </label>
              <select
                value={txForm.toAccountId}
                onChange={(e) =>
                  setTxForm((f) => ({ ...f, toAccountId: e.target.value }))
                }
                className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <option value="">Select account...</option>
                {accounts
                  .filter((a) => a.id !== selected?.id)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <Input
            label="Description (optional)"
            placeholder="Note about this transaction"
            value={txForm.description}
            onChange={(e) =>
              setTxForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
}
