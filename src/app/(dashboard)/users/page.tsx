'use client';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

const mockUsers = [
  {
    id: '1',
    name: 'Hakim Rahman',
    email: 'hakim@example.com',
    role: 'Super Admin',
    branch: 'All Branches',
    status: 'active',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Rahim Uddin',
    email: 'rahim@example.com',
    role: 'Manager',
    branch: 'Main Branch',
    status: 'active',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    name: 'Karim Ali',
    email: 'karim@example.com',
    role: 'Cashier',
    branch: 'Dhaka Branch',
    status: 'active',
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    name: 'Nusrat Jahan',
    email: 'nusrat@example.com',
    role: 'Inventory',
    branch: 'Main Branch',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '5',
    name: 'Farhan Islam',
    email: 'farhan@example.com',
    role: 'Accountant',
    branch: 'Chittagong Branch',
    status: 'active',
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
  },
];

const roleColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  'Super Admin': 'success',
  Manager: 'info',
  Cashier: 'warning',
  Inventory: 'default',
  Accountant: 'default',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = mockUsers.filter(
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
            <Button
              icon={<Plus size={16} />}
              onClick={() => toast.success('Add user form coming soon')}
            >
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
                {['User', 'Role', 'Branch', 'Status', 'Last Login', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm shrink-0 select-none">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {u.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleColors[u.role] || 'default'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {u.branch}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={u.status === 'active' ? 'success' : 'default'}
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDateTime(u.lastLogin)}
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
                            onClick: () => toast.success(`Editing ${u.name}`),
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setDeleteId(null);
          toast.success('User deleted');
        }}
        title="Delete User"
        message="Remove this user from the system?"
      />
    </div>
  );
}
