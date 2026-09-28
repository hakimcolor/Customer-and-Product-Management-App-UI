'use client';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDateTime } from '@/lib/utils/format';

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
        actions={<Button icon={<Plus size={16} />}>Add User</Button>}
      />

      <Card padding={false}>
        <div className="p-4 flex flex-wrap gap-3 border-b border-[var(--border)]">
          <Input
            placeholder="Search users..."
            leftIcon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button
            variant="outline"
            icon={<Shield size={16} />}
            className="ml-auto"
          >
            <a href="/roles">Manage Roles</a>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60">
                {['User', 'Role', 'Branch', 'Status', 'Last Login', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleColors[user.role] || 'default'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {user.branch}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.status === 'active' ? 'success' : 'default'}
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDateTime(user.lastLogin)}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === user.id ? null : user.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)]"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === user.id && (
                      <div className="absolute right-8 top-8 z-10 w-36 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800">
                          <Edit size={14} className="text-[var(--muted)]" />{' '}
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(user.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
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
        onConfirm={() => setDeleteId(null)}
        title="Delete User"
        message="Remove this user from the system?"
      />
    </div>
  );
}
