'use client';
import { useState } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatDateTime } from '@/lib/utils/format';

const mockLogs = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  user: ['Hakim Rahman', 'Rahim Uddin', 'Karim Ali', 'Nusrat Jahan'][i % 4],
  action: [
    'Created Sale',
    'Updated Product',
    'Deleted Customer',
    'Added Payment',
    'Login',
    'Updated Settings',
  ][i % 6],
  module: ['Sales', 'Products', 'Customers', 'Payments', 'Auth', 'Settings'][
    i % 6
  ],
  ip: `192.168.1.${10 + i}`,
  date: new Date(Date.now() - i * 1800000).toISOString(),
}));

const moduleColors: Record<
  string,
  'success' | 'info' | 'warning' | 'danger' | 'default'
> = {
  Sales: 'success',
  Products: 'info',
  Customers: 'default',
  Payments: 'warning',
  Auth: 'info',
  Settings: 'default',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const filtered = mockLogs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Track all system activities"
        breadcrumbs={[{ label: 'Management' }, { label: 'Audit Logs' }]}
      />

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              placeholder="Search logs..."
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
                {['User', 'Action', 'Module', 'IP Address', 'Date & Time'].map(
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
              {filtered.slice((page - 1) * 10, page * 10).map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                        {log.user.charAt(0)}
                      </div>
                      <span className="font-medium text-[var(--foreground)]">
                        {log.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={moduleColors[log.module]}>
                      {log.module}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {log.ip}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatDateTime(log.date)}
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
    </div>
  );
}
