'use client';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/cn';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 flex flex-col flex-1',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <Topbar />
        <main className="p-5 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
