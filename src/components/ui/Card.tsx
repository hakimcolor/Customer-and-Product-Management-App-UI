import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  iconBg = 'bg-[var(--primary-light)]',
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--foreground)]">
            {value}
          </p>
          {change !== undefined && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                isPositive ? 'text-green-600' : 'text-red-500'
              )}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg)}>{icon}</div>
      </div>
    </Card>
  );
}
