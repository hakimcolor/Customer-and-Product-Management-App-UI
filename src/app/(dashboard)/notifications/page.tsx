'use client';
import { useState } from 'react';
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
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

const mockNotifications = [
  {
    id: '1',
    type: 'stock',
    title: 'Low Stock Alert',
    message: 'Samsung A55 has only 3 units remaining.',
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'sale',
    title: 'New Sale Created',
    message: 'INV-1025 for ৳12,500 by Rahim Enterprise.',
    date: new Date(Date.now() - 1800000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Received',
    message: 'Karim Store paid ৳25,000 for INV-1024.',
    date: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
  {
    id: '4',
    type: 'stock',
    title: 'Out of Stock',
    message: 'Wireless Mouse is now out of stock.',
    date: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: '5',
    type: 'payment',
    title: 'Overdue Payment',
    message: 'ABC Ltd. has overdue payment of ৳55,000.',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
];

const icons: Record<string, React.ReactNode> = {
  stock: <Package size={16} className="text-amber-600" />,
  sale: <ShoppingCart size={16} className="text-[var(--primary)]" />,
  payment: <DollarSign size={16} className="text-blue-600" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
        breadcrumbs={[{ label: 'Communication' }, { label: 'Notifications' }]}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck size={15} />}
              onClick={markAllRead}
            >
              Mark All Read
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-3 max-w-2xl">
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell
              size={40}
              className="text-[var(--muted)] mx-auto mb-3 opacity-30"
            />
            <p className="text-[var(--muted)]">No notifications</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                n.read
                  ? 'bg-[var(--card)] border-[var(--border)]'
                  : 'bg-[var(--primary-light)] dark:bg-green-900/10 border-[var(--primary)] shadow-sm'
              )}
            >
              <div
                className={cn(
                  'p-2.5 rounded-xl shrink-0',
                  n.read
                    ? 'bg-gray-100 dark:bg-slate-700'
                    : 'bg-white dark:bg-slate-800'
                )}
              >
                {icons[n.type] ?? <AlertTriangle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      n.read
                        ? 'text-[var(--foreground)]'
                        : 'text-[var(--foreground)]'
                    )}
                  >
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm text-[var(--muted)] mt-0.5">
                  {n.message}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1.5">
                  {formatDateTime(n.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
