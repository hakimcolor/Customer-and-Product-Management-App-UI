import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="p-5 rounded-2xl bg-[var(--primary-light)]">
        <Construction size={40} className="text-[var(--primary)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
      <p className="text-[var(--muted)] max-w-sm">
        {description ?? 'This module is under development. Check back soon.'}
      </p>
    </div>
  );
}
