'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  Building2,
  Check,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';
import { branchesApi } from '@/lib/api/endpoints';

interface Branch {
  id: number;
  name: string;
}

export function Topbar() {
  const { toggleSidebar, activeBranch, activeBranchName, setBranch } =
    useUIStore();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [branchOpen, setBranchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: branchesData } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchesApi.getAll();
      const d = res.data?.data ?? res.data;
      return d?.data ?? d;
    },
  });

  const branches: { id: string; name: string }[] = [
    { id: 'all', name: 'All Branches' },
    ...(branchesData ?? []).map((b) => ({ id: String(b.id), name: b.name })),
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(e.target as Node))
        setBranchOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center px-4 gap-3 sticky top-0 z-20">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="cursor-pointer p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, customers, invoices..."
          className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Branch selector */}
        <div ref={branchRef} className="relative hidden md:block">
          <button
            onClick={() => {
              setBranchOpen(!branchOpen);
              setProfileOpen(false);
            }}
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Building2 size={14} className="text-[var(--primary)] shrink-0" />
            <span className="max-w-[120px] truncate">{activeBranchName}</span>
            <ChevronDown
              size={13}
              className={cn(
                'text-[var(--muted)] shrink-0 transition-transform',
                branchOpen && 'rotate-180'
              )}
            />
          </button>
          {branchOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1.5 z-50">
              <p className="px-3 py-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Select Branch
              </p>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBranch(b.id, b.name);
                    setBranchOpen(false);
                  }}
                  className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {activeBranch === b.id ? (
                    <Check
                      size={14}
                      className="text-[var(--primary)] shrink-0"
                    />
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => router.push('/notifications')}
          className="cursor-pointer relative p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[var(--card)]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="cursor-pointer p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setBranchOpen(false);
            }}
            className="cursor-pointer flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold select-none shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[var(--foreground)] leading-none">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {user?.role || 'Admin'}
              </p>
            </div>
            <ChevronDown
              size={13}
              className={cn(
                'text-[var(--muted)] hidden md:block shrink-0 transition-transform',
                profileOpen && 'rotate-180'
              )}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-2.5 border-b border-[var(--border)] mb-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              {[
                { label: 'My Profile', href: '/profile' },
                { label: 'Change Password', href: '/change-password' },
                { label: 'Settings', href: '/settings' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[var(--primary)] transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
              <div className="my-1 border-t border-[var(--border)]" />
              <button
                onClick={handleLogout}
                className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
