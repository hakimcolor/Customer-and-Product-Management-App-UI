'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  href?: string;
}

interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
  align?: 'left' | 'right';
}

export function DropdownMenu({
  open,
  onClose,
  items,
  align = 'right',
}: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // slight delay so the opening click doesn't immediately close
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-full mt-1 z-50 min-w-[150px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl py-1',
        align === 'right' ? 'right-0' : 'left-0'
      )}
    >
      {items.map((item, i) =>
        item.href ? (
          <a
            key={i}
            href={item.href}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            onClick={onClose}
          >
            {item.icon && (
              <span className="text-[var(--muted)] shrink-0">{item.icon}</span>
            )}
            {item.label}
          </a>
        ) : (
          <button
            key={i}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className={cn(
              'cursor-pointer w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors',
              item.danger
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                : 'text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700'
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  'shrink-0',
                  item.danger ? 'text-red-400' : 'text-[var(--muted)]'
                )}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// Trigger wrapper with relative positioning
export function DropdownTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('relative', className)}>{children}</div>;
}
