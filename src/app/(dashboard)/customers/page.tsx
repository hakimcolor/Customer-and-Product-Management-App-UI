'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Users,
  UserCheck,
  Banknote,
  AlertCircle,
  Phone,
  User,
  MapPin,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { customersApi } from '@/lib/api/endpoints';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  dues: number;
  status: boolean;
  createdAt: string;
}

interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

type FilterStatus = 'all' | 'new' | 'active' | 'inactive';

const STATUS_FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'New (This Month)', value: 'new' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function CustomersPage() {
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'phone'>('name');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [page, setPage] = useState(1);

  // Modal & dialogs
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Form
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Build query params
  const queryParams = useCallback(() => {
    const params: Record<string, unknown> = { page, limit: 10 };
    if (search) params.search = search;
    if (statusFilter === 'active') params.status = 'true';
    if (statusFilter === 'inactive') params.status = 'false';
    return params;
  }, [page, search, statusFilter]);

  const { data, isLoading } = useQuery<CustomersResponse>({
    queryKey: ['customers', page, search, statusFilter],
    queryFn: async () => {
      const res = await customersApi.getAll(queryParams());
      return res.data?.data ?? res.data;
    },
  });

  const customers: Customer[] = data?.data ?? [];
  const totalCustomers = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Filter "new" client-side (joined this month)
  const now = new Date();
  const displayCustomers =
    statusFilter === 'new'
      ? customers.filter((c) => {
          const d = new Date(c.createdAt);
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        })
      : customers;

  const activeCount = customers.filter((c) => c.status).length;
  const totalDues = customers.reduce((s, c) => s + (c.dues || 0), 0);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof form) => customersApi.create(data),
    onSuccess: () => {
      toast.success('Customer added successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowAddModal(false);
      setForm({ name: '', phone: '', address: '' });
      setFormErrors({});
    },
    onError: () => toast.error('Failed to add customer'),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) =>
      customersApi.update(String(id), data),
    onSuccess: () => {
      toast.success('Customer updated');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditCustomer(null);
      setForm({ name: '', phone: '', address: '' });
      setFormErrors({});
    },
    onError: () => toast.error('Failed to update customer'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.delete(String(id)),
    onSuccess: () => {
      toast.success('Customer removed');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete customer'),
  });

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleAddSubmit() {
    if (!validateForm()) return;
    createMutation.mutate(form);
  }

  function openEdit(c: Customer) {
    setEditCustomer(c);
    setForm({ name: c.name, phone: c.phone ?? '', address: c.address ?? '' });
    setFormErrors({});
    setOpenMenuId(null);
  }

  function handleEditSubmit() {
    if (!validateForm()) return;
    if (!editCustomer) return;
    updateMutation.mutate({ id: editCustomer.id, data: form });
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer relationships"
        breadcrumbs={[{ label: 'People' }, { label: 'Customers' }]}
        actions={
          <Button
            icon={<Plus size={17} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Customer
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Customers',
            value: String(totalCustomers),
            icon: <Users size={22} className="text-[var(--primary)]" />,
          },
          {
            label: 'Active',
            value: String(activeCount),
            icon: <UserCheck size={22} className="text-blue-500" />,
          },
          {
            label: 'Total Receivable',
            value: formatCurrency(totalDues),
            icon: <Banknote size={22} className="text-orange-500" />,
          },
          {
            label: 'This Month',
            value: String(
              customers.filter((c) => {
                const d = new Date(c.createdAt);
                return (
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                );
              }).length
            ),
            icon: <AlertCircle size={22} className="text-purple-500" />,
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">
                {s.label}
              </p>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {isLoading ? '—' : s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        {/* Filters bar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
            {(['name', 'phone'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSearchType(t);
                  setSearch('');
                  setPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium transition-colors capitalize ${
                  searchType === t
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {t === 'name' ? (
                  <span className="flex items-center gap-1.5">
                    <User size={13} />
                    {t}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} />
                    {t}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder={`Search by ${searchType}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  statusFilter === f.value
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {['Customer', 'Phone', 'Balance', 'Dues', 'Status', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-14 text-center text-[var(--muted)]"
                  >
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold">
                      No customers found
                    </p>
                    <p className="text-sm mt-1">
                      Try adjusting your search or add a new customer
                    </p>
                  </td>
                </tr>
              ) : (
                displayCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold shrink-0 select-none shadow-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)] text-base">
                            {c.name}
                          </p>
                          {c.address && (
                            <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {c.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)] font-medium">
                      {c.phone || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                      {formatCurrency(c.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.dues > 0
                            ? 'text-red-500 font-bold'
                            : 'text-[var(--foreground)]'
                        }
                      >
                        {formatCurrency(c.dues)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${c.status ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {c.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownTrigger>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === c.id ? null : c.id)
                          }
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <DropdownMenu
                          open={openMenuId === c.id}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: 'View Profile',
                              icon: <Eye size={14} />,
                              href: `/customers/${c.id}`,
                            },
                            {
                              label: 'Edit',
                              icon: <Edit size={14} />,
                              onClick: () => openEdit(c),
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} />,
                              danger: true,
                              onClick: () => setDeleteId(c.id),
                            },
                          ]}
                        />
                      </DropdownTrigger>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={Math.max(1, totalPages)}
          total={totalCustomers}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      {/* Add Customer Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setForm({ name: '', phone: '', address: '' });
          setFormErrors({});
        }}
        title="Add New Customer"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setForm({ name: '', phone: '', address: '' });
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubmit}
              loading={createMutation.isPending}
            >
              Add Customer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Full Name *"
            placeholder="e.g. Rahim Enterprise"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
            leftIcon={<User size={15} />}
          />
          <Input
            label="Phone Number *"
            placeholder="e.g. 01700000000"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            error={formErrors.phone}
            leftIcon={<Phone size={15} />}
          />
          <Input
            label="Address (optional)"
            placeholder="e.g. Motijheel, Dhaka"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            leftIcon={<MapPin size={15} />}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This will deactivate their account."
      />

      {/* Edit Customer Modal */}
      <Modal
        open={!!editCustomer}
        onClose={() => {
          setEditCustomer(null);
          setForm({ name: '', phone: '', address: '' });
          setFormErrors({});
        }}
        title="Edit Customer"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditCustomer(null);
                setForm({ name: '', phone: '', address: '' });
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Full Name *"
            placeholder="e.g. Rahim Enterprise"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
            leftIcon={<User size={15} />}
          />
          <Input
            label="Phone Number *"
            placeholder="e.g. 01700000000"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            error={formErrors.phone}
            leftIcon={<Phone size={15} />}
          />
          <Input
            label="Address (optional)"
            placeholder="e.g. Motijheel, Dhaka"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            leftIcon={<MapPin size={15} />}
          />
        </div>
      </Modal>
    </div>
  );
}
