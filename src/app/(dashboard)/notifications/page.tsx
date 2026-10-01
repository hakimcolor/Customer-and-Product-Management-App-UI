'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  ShoppingCart,
  Package,
  DollarSign,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils/format';
import { notificationsApi } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils/cn';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const icons: Record<string, React.ReactNode> = {
  stock: <Package size={16} className="text-amber-600" />,
  sale: <ShoppingCart size={16} className="text-primary" />,
  payment: <DollarSign size={16} className="text-blue-600" />,
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsApi.getAll();
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        breadcrumbs={[{ label: 'Communication' }, { label: 'Notifications' }]}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck size={15} />}
              onClick={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
            >
              Mark All Read
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-3 max-w-2xl">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <div className="h-16 animate-pulse bg-gray-200 dark:bg-slate-700 rounded" />
            </Card>
          ))
        ) : notifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Bell size={40} className="text-muted mx-auto mb-3 opacity-30" />
              <p className="text-muted">No notifications</p>
            </div>
          </Card>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead.mutate(String(n.id))}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                n.isRead
                  ? 'bg-card border-border'
                  : 'bg-primary-light dark:bg-green-900/10 border-primary shadow-sm'
              )}
            >
              <div
                className={cn(
                  'p-2.5 rounded-xl shrink-0',
                  n.isRead
                    ? 'bg-gray-100 dark:bg-slate-700'
                    : 'bg-white dark:bg-slate-800'
                )}
              >
                {icons[n.type?.toLowerCase()] ?? (
                  <AlertTriangle size={16} className="text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm text-muted mt-0.5">{n.message}</p>
                <p className="text-xs text-muted mt-1.5">
                  {formatDateTime(n.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
