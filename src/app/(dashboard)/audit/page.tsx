'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatDateTime } from '@/lib/utils/format';
import { auditApi } from '@/lib/api/endpoints';

interface AuditLog {
  id: number;
  user?: { name: string } | null;
  action: string;
  module: string;
  ipAddress?: string | null;
  createdAt: string;
}
interface AuditResponse {
  data: AuditLog[];
  total: number;
  totalPages: number;
}

const moduleColors: Record<
  string,
  'success' | 'info' | 'warning' | 'danger' | 'default'
> = {
  sales: 'success',
  products: 'info',
  customers: 'default',
  payments: 'warning',
  auth: 'info',
  settings: 'default',
  purchases: 'warning',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<AuditResponse>({
    queryKey: ['audit', page, search],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      const res = await auditApi.getAll(params);
      return res.data?.data ?? res.data;
    },
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Track all system activities"
        breadcrumbs={[{ label: 'Management' }, { label: 'Audit Logs' }]}
      />

      <Card padding={false}>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cursor-text w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-border">
                {['User', 'Action', 'Module', 'IP Address', 'Date & Time'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-muted">
                    <ScrollText size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold">
                      No audit logs found
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                          {log.user?.name?.charAt(0) ?? '?'}
                        </div>
                        <span className="font-medium text-foreground">
                          {log.user?.name ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{log.action}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          moduleColors[log.module?.toLowerCase()] ?? 'default'
                        }
                      >
                        {log.module}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {log.ipAddress ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
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
    </div>
  );
}
