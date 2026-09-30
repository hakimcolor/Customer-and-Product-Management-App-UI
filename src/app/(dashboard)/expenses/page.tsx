'use client';
import { useState } from 'react';
import { Plus, Search, Trash2, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

const mockExpenses = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  category: [
    'Rent',
    'Salary',
    'Utilities',
    'Marketing',
    'Transport',
    'Supplies',
  ][i % 6],
  description: [
    'Office Rent',
    'Staff Salary',
    'Electricity Bill',
    'Social Media Ads',
    'Delivery Cost',
    'Stationery',
  ][i % 6],
  amount: [35000, 120000, 8500, 15000, 4500, 2200][i % 6],
  account: ['Main Cash', 'Dutch Bangla Bank'][i % 2],
  status: i % 4 === 0 ? 'pending' : 'approved',
  date: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0],
}));

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockExpenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track and manage business expenses"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Expenses' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Expense
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Expenses', value: formatCurrency(totalExpenses) },
          { label: 'This Month', value: formatCurrency(185000) },
          { label: 'Today', value: formatCurrency(8500) },
          { label: 'Pending Approval', value: '5' },
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
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {[
                  'Category',
                  'Description',
                  'Amount',
                  'Account',
                  'Date',
                  'Status',
                  '',
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
              {filtered.slice((page - 1) * 10, page * 10).map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-light)] text-[var(--primary)]">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {e.description}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {formatCurrency(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {e.account}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDate(e.date)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={e.status === 'approved' ? 'success' : 'warning'}
                    >
                      {e.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownTrigger>
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === e.id ? null : e.id)
                        }
                        className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <DropdownMenu
                        open={openMenuId === e.id}
                        onClose={() => setOpenMenuId(null)}
                        items={[
                          {
                            label: 'Approve',
                            onClick: () => toast.success('Expense approved'),
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 size={14} />,
                            danger: true,
                            onClick: () => setDeleteId(e.id),
                          },
                        ]}
                      />
                    </DropdownTrigger>
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setDeleteId(null);
          toast.success('Expense deleted');
        }}
        title="Delete Expense"
        message="Delete this expense record permanently?"
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Expense"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success('Expense added');
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              Category
            </label>
            <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              {[
                'Rent',
                'Salary',
                'Utilities',
                'Marketing',
                'Transport',
                'Supplies',
                'Other',
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input label="Description" placeholder="Expense description" />
          <Input label="Amount" type="number" placeholder="0" />
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              Account
            </label>
            <select className="cursor-pointer w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              <option>Main Cash</option>
              <option>Dutch Bangla Bank</option>
              <option>bKash Business</option>
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>
      </Modal>
    </div>
  );
}
