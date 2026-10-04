'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Truck,
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
import { suppliersApi } from '@/lib/api/endpoints';

interface Supplier {
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
interface SuppliersResponse {
  data: Supplier[];
  total: number;
  totalPages: number;
}

const emptyForm = { name: '', phone: '', address: '' };

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') setPage(1);
  }

  const { data, isLoading } = useQuery<SuppliersResponse>({
    queryKey: ['suppliers', page, search],
    queryFn: async () => {
      const res = await suppliersApi.getAll({
        page,
        limit: 10,
        ...(search && { search }),
      });
      return res.data?.data ?? res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof emptyForm) => suppliersApi.create(d),
    onSuccess: () => {
      toast.success('Supplier added');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      closeModal();
    },
    onError: () => toast.error('Failed to add supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof emptyForm }) =>
      suppliersApi.update(id, data),
    onSuccess: () => {
      toast.success('Supplier updated');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersApi.delete(String(id)),
    onSuccess: () => {
      toast.success('Supplier removed');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openAdd() {
    setEditSupplier(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }
  function openEdit(s: Supplier) {
    setEditSupplier(s);
    setForm({ name: s.name, phone: s.phone ?? '', address: s.address ?? '' });
    setFormErrors({});
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditSupplier(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.phone.trim()) e.phone = 'Phone required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (editSupplier)
      updateMutation.mutate({ id: String(editSupplier.id), data: form });
    else createMutation.mutate(form);
  }

  const suppliers = data?.data ?? [];
  const total = data?.total ?? 0;
  const active = suppliers.filter((s) => s.status).length;
  const totalDues = suppliers.reduce((sum, s) => sum + (s.dues || 0), 0);

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Manage your supplier network"
        breadcrumbs={[{ label: 'People' }, { label: 'Suppliers' }]}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            Add Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Total Suppliers',
            value: total,
            icon: <Truck size={20} className="text-[var(--primary)]" />,
          },
          {
            label: 'Active',
            value: active,
            icon: <User size={20} className="text-blue-500" />,
          },
          {
            label: 'Total Payable',
            value: formatCurrency(totalDues),
            icon: <Phone size={20} className="text-orange-500" />,
          },
          {
            label: 'This Page',
            value: suppliers.length,
            icon: <Truck size={20} className="text-purple-500" />,
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
              {isLoading
                ? '—'
                : typeof s.value === 'number'
                  ? s.value
                  : s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={handleSearchKey}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {['Supplier', 'Phone', 'Balance', 'Dues', 'Status', ''].map(
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
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-14 text-center text-[var(--muted)]"
                  >
                    <Truck size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold">
                      No suppliers found
                    </p>
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)] text-base">
                            {s.name}
                          </p>
                          {s.address && (
                            <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {s.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)] font-medium">
                      {s.phone || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                      {formatCurrency(s.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.dues > 0
                            ? 'text-amber-600 font-bold'
                            : 'text-[var(--foreground)]'
                        }
                      >
                        {formatCurrency(s.dues)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${s.status ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {s.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownTrigger>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === s.id ? null : s.id)
                          }
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <DropdownMenu
                          open={openMenuId === s.id}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: 'View Profile',
                              icon: <Eye size={14} />,
                              href: `/suppliers/${s.id}`,
                            },
                            {
                              label: 'Edit',
                              icon: <Edit size={14} />,
                              onClick: () => {
                                setOpenMenuId(null);
                                openEdit(s);
                              },
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} />,
                              danger: true,
                              onClick: () => setDeleteId(s.id),
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
          totalPages={Math.max(1, data?.totalPages ?? 1)}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Full Name *"
            placeholder="e.g. Tech Wholesale"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
            leftIcon={<User size={15} />}
          />
          <Input
            label="Phone Number *"
            placeholder="e.g. 01800000000"
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
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier?"
      />
    </div>
  );
}
