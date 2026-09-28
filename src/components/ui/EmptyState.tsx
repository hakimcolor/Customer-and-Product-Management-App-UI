import { PackageSearch } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your search or filters',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 p-4 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        {icon || <PackageSearch size={32} />}
      </div>
      <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--muted)] mb-5 max-w-xs">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
