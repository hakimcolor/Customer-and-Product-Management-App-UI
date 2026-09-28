'use client';
import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

const MODULES = [
  'Dashboard',
  'Sales',
  'Purchases',
  'POS',
  'Products',
  'Categories',
  'Customers',
  'Suppliers',
  'Inventory',
  'Stock Transfers',
  'Accounts',
  'Expenses',
  'Ledger',
  'Reports',
  'Users',
  'Roles',
  'Branches',
  'Settings',
];

const ACTIONS = ['View', 'Create', 'Edit', 'Delete'];

const ROLES = ['Manager', 'Cashier', 'Inventory', 'Accountant'];

export default function RolesPage() {
  const [activeRole, setActiveRole] = useState('Manager');
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >(() => {
    const init: Record<string, Record<string, boolean>> = {};
    MODULES.forEach((m) => {
      init[m] = { View: true, Create: false, Edit: false, Delete: false };
    });
    return init;
  });

  const toggle = (module: string, action: string) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const toggleAll = (action: string, value: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => {
        next[m] = { ...next[m], [action]: value };
      });
      return next;
    });
  };

  const isAllChecked = (action: string) =>
    MODULES.every((m) => permissions[m]?.[action]);

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Control what each role can access"
        breadcrumbs={[{ label: 'Management' }, { label: 'Roles' }]}
        actions={<Button icon={<Plus size={16} />}>New Role</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Role list */}
        <div className="space-y-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                activeRole === role
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Permission matrix */}
        <Card padding={false} className="lg:col-span-3">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">
              {activeRole} — Permissions
            </h2>
            <Button
              size="sm"
              icon={<Save size={14} />}
              onClick={() => toast.success('Permissions saved')}
            >
              Save Changes
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Module
                  </th>
                  {ACTIONS.map((action) => (
                    <th
                      key={action}
                      className="px-4 py-3 text-center text-xs font-medium text-[var(--muted)] uppercase tracking-wider"
                    >
                      <div className="flex flex-col items-center gap-1">
                        {action}
                        <input
                          type="checkbox"
                          checked={isAllChecked(action)}
                          onChange={(e) => toggleAll(action, e.target.checked)}
                          className="accent-[var(--primary)] w-3.5 h-3.5"
                          title={`Toggle all ${action}`}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {MODULES.map((module) => (
                  <tr
                    key={module}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      {module}
                    </td>
                    {ACTIONS.map((action) => (
                      <td key={action} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[module]?.[action] ?? false}
                          onChange={() => toggle(module, action)}
                          className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
