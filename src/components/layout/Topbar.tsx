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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const BRANCHES = [
  { id: 'all', name: 'All Branches' },
  { id: 'main', name: 'Main Branch' },
  { id: 'dhaka', name: 'Dhaka Branch' },
  { id: 'ctg', name: 'Chittagong Branch' },
];

export function Topbar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    activeBranch,
    activeBranchName,
    setBranch,
  } = useUIStore();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [branchOpen, setBranchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const branchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
      {/* Menu toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, customers, invoices..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Branch selector */}
        <div ref={branchRef} className="relative hidden md:block">
          <button
            onClick={() => setBranchOpen(!branchOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Building2 size={14} className="text-[var(--primary)]" />
            <span className="max-w-32 truncate">{activeBranchName}</span>
            <ChevronDown size={13} className="text-[var(--muted)]" />
          </button>
          {branchOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-50">
              <p className="px-3 py-2 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Select Branch
              </p>
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBranch(b.id, b.name);
                    setBranchOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {activeBranch === b.id && (
                    <Check size={14} className="text-[var(--primary)]" />
                  )}
                  <span className={cn(activeBranch !== b.id && 'ml-5')}>
                    {b.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
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
              className="text-[var(--muted)] hidden md:block"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-50">
              {[
                { label: 'My Profile', href: '/profile' },
                { label: 'Change Password', href: '/change-password' },
                { label: 'Settings', href: '/settings' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="my-1 border-t border-[var(--border)]" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
