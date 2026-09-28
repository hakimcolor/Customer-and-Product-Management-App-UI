'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  MoreVertical,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { usersApi, branchesApi } from '@/lib/api/endpoints';
import Link from 'next/link';

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  branch?: { name: string };
  createdAt: string;
}

const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'BRANCH_MANAGER',
  'SALES_MANAGER',
  'SALESMAN',
  'ACCOUNTANT',
  'INVENTORY_MANAGER',
  'PURCHASE_MANAGER',
  'CASHIER',
  'EMPLOYEE',
];
const roleColorMap: Record<string, 'success' | 'info' | 'warning' | 'default'> =
  {
    SUPER_ADMIN: 'success',
    ADMIN: 'success',
    BRANCH_MANAGER: 'info',
    SALESMAN: 'warning',
    CASHIER: 'warning',
    ACCOUNTANT: 'default',
  };

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'SALESMAN',
  branchId: '',
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});

  const { data, isLoading } = useQuery<{ data: SystemUser[]; total: number }>({
    queryKey: ['users', search],
    queryFn: async () => {
      const res = await usersApi.getAll();
      return res.data?.data ?? res.data;
    },
  });

  const { data: branches } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchesApi.getAll();
      return res.data?.data ?? res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof emptyForm) => usersApi.create(d),
    onSuccess: () => {
      toast.success('User created');
      qc.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: () => toast.error('Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<typeof emptyForm>;
    }) => usersApi.update(id, data),
    onSuccess: () => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(String(id)),
    onSuccess: () => {
      toast.success('User removed');
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openAdd() {
    setEditUser(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }
  function openEdit(u: SystemUser) {
    setEditUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      branchId: '',
    });
    setFormErrors({});
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditUser(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim() || !form.email.includes('@'))
      e.email = 'Valid email required';
    if (!editUser && !form.password) e.password = 'Password required';
    if (!editUser && form.password.length < 6) e.password = 'Min 6 characters';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload = editUser
      ? {
          name: form.name,
          role: form.role,
          ...(form.branchId && { branchId: parseInt(form.branchId) }),
        }
      : {
          ...form,
          branchId: form.branchId ? parseInt(form.branchId) : undefined,
        };
    if (editUser)
      updateMutation.mutate({ id: String(editUser.id), data: payload });
    else createMutation.mutate(form);
  }

  const users: SystemUser[] = Array.isArray(data) ? data : (data?.data ?? []);
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage system users and access"
        breadcrumbs={[{ label: 'Management' }, { label: 'Users' }]}
        actions={
          <div className="flex gap-2">
            <Link href="/roles">
              <Button variant="outline" icon={<Shield size={16} />}>
                Manage Roles
              </Button>
            </Link>
            <Button icon={<Plus size={16} />} onClick={openAdd}>
              Add User
            </Button>
          </div>
        }
      />

      <Card padding={false}>
        <div className="p-4 flex flex-wrap gap-3 border-b border-[var(--border)]">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-[var(--border)]">
                {['User', 'Role', 'Branch', 'Status', 'Joined', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-14 text-center text-[var(--muted)]"
                  >
                    <User size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold">No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)] text-base">
                            {u.name}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleColorMap[u.role] ?? 'default'}>
                        {u.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {u.branch?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={u.status === 'ACTIVE' ? 'success' : 'default'}
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownTrigger>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === u.id ? null : u.id)
                          }
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <DropdownMenu
                          open={openMenuId === u.id}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: 'Edit',
                              icon: <Edit size={14} />,
                              onClick: () => {
                                setOpenMenuId(null);
                                openEdit(u);
                              },
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} />,
                              danger: true,
                              onClick: () => setDeleteId(u.id),
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
      </Card>

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editUser ? 'Edit User' : 'Add New User'}
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
              {editUser ? 'Save Changes' : 'Add User'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Rahim Uddin"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
            leftIcon={<User size={15} />}
          />
          <Input
            label="Email *"
            type="email"
            placeholder="user@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={formErrors.email}
            leftIcon={<Mail size={15} />}
            disabled={!!editUser}
          />
          {!editUser && (
            <Input
              label="Password *"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              error={formErrors.password}
              leftIcon={<Lock size={15} />}
            />
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Role *
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Branch
            </label>
            <select
              value={form.branchId}
              onChange={(e) =>
                setForm((f) => ({ ...f, branchId: e.target.value }))
              }
              className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            >
              <option value="">Select branch...</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete User"
        message="Remove this user from the system permanently?"
      />
    </div>
  );
}
