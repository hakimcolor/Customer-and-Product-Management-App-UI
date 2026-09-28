'use client';
import { create } from 'zustand';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ToastType = 'success' | 'error' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4000
    );
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().add('success', msg),
  error: (msg: string) => useToastStore.getState().add('error', msg),
  warning: (msg: string) => useToastStore.getState().add('warning', msg),
};

const styles: Record<ToastType, { icon: React.ReactNode; bar: string }> = {
  success: {
    icon: <CheckCircle size={18} className="text-green-500 shrink-0" />,
    bar: 'bg-green-500',
  },
  error: {
    icon: <XCircle size={18} className="text-red-500 shrink-0" />,
    bar: 'bg-red-500',
  },
  warning: {
    icon: <AlertCircle size={18} className="text-amber-500 shrink-0" />,
    bar: 'bg-amber-500',
  },
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto relative overflow-hidden flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-xl min-w-[300px] max-w-sm"
        >
          <div
            className={cn(
              'absolute bottom-0 left-0 h-0.5 w-full animate-[shrink_4s_linear_forwards]',
              styles[t.type].bar
            )}
          />
          {styles[t.type].icon}
          <p className="flex-1 text-sm font-medium text-[var(--foreground)]">
            {t.message}
          </p>
          <button
            onClick={() => remove(t.id)}
            className="cursor-pointer shrink-0 p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
