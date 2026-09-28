'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/store/uiStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  BarChart2,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  Truck,
  ClipboardList,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  UserCheck,
  Store,
  Layers,
  Tag,
  Ruler,
  Boxes,
  AlertTriangle,
  BadgeDollarSign,
  Receipt,
  CreditCard,
  BookOpen,
  PiggyBank,
  Users2,
  Shield,
  ScrollText,
  Wrench,
  X,
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string; icon?: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    href: '/dashboard',
  },
  {
    label: 'Business',
    icon: <TrendingUp size={18} />,
    children: [
      { label: 'POS', href: '/pos', icon: <Store size={16} /> },
      { label: 'Sales', href: '/sales', icon: <ShoppingCart size={16} /> },
      {
        label: 'Purchases',
        href: '/purchases',
        icon: <ClipboardList size={16} />,
      },
      { label: 'Quotations', href: '/quotations', icon: <Receipt size={16} /> },
      { label: 'Deliveries', href: '/deliveries', icon: <Truck size={16} /> },
    ],
  },
  {
    label: 'Inventory',
    icon: <Package size={18} />,
    children: [
      { label: 'Products', href: '/products', icon: <Package size={16} /> },
      { label: 'Categories', href: '/categories', icon: <Layers size={16} /> },
      { label: 'Brands', href: '/brands', icon: <Tag size={16} /> },
      { label: 'Units', href: '/units', icon: <Ruler size={16} /> },
      { label: 'Stock', href: '/inventory', icon: <Boxes size={16} /> },
      {
        label: 'Transfers',
        href: '/transfers',
        icon: <ArrowLeftRight size={16} />,
      },
      {
        label: 'Adjustments',
        href: '/adjustments',
        icon: <AlertTriangle size={16} />,
      },
    ],
  },
  {
    label: 'People',
    icon: <Users size={18} />,
    children: [
      { label: 'Customers', href: '/customers', icon: <UserCheck size={16} /> },
      { label: 'Suppliers', href: '/suppliers', icon: <Truck size={16} /> },
      { label: 'Employees', href: '/employees', icon: <Users size={16} /> },
    ],
  },
  {
    label: 'Finance',
    icon: <DollarSign size={18} />,
    children: [
      { label: 'Accounts', href: '/accounts', icon: <Wallet size={16} /> },
      { label: 'Payments', href: '/payments', icon: <CreditCard size={16} /> },
      {
        label: 'Expenses',
        href: '/expenses',
        icon: <BadgeDollarSign size={16} />,
      },
      { label: 'Ledger', href: '/ledger', icon: <BookOpen size={16} /> },
      { label: 'Capital', href: '/capital', icon: <PiggyBank size={16} /> },
    ],
  },
  { label: 'Reports', icon: <BarChart2 size={18} />, href: '/reports' },
  {
    label: 'Communication',
    icon: <Bell size={18} />,
    children: [
      {
        label: 'Notifications',
        href: '/notifications',
        icon: <Bell size={16} />,
      },
    ],
  },
  {
    label: 'Management',
    icon: <Shield size={18} />,
    children: [
      { label: 'Branches', href: '/branches', icon: <Building2 size={16} /> },
      { label: 'Users', href: '/users', icon: <Users2 size={16} /> },
      { label: 'Roles', href: '/roles', icon: <Shield size={16} /> },
      { label: 'Audit Logs', href: '/audit', icon: <ScrollText size={16} /> },
    ],
  },
  { label: 'Settings', icon: <Settings size={18} />, href: '/settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Set<string>>(
    new Set(['Business', 'Inventory'])
  );

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300',
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
          // On mobile: off-screen when collapsed
          'max-lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-[var(--foreground)] truncate">
                Business ERP
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-[var(--muted)] transition-colors"
              aria-label="Collapse sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {menuItems.map((item) => {
            if (item.href) {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors text-sm font-medium',
                    active
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[var(--foreground)]',
                    sidebarCollapsed && 'justify-center'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            }

            const isOpen = openMenus.has(item.label);
            const hasActiveChild = item.children?.some((c) => isActive(c.href));

            return (
              <div key={item.label}>
                <button
                  onClick={() => !sidebarCollapsed && toggleMenu(item.label)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors text-sm font-medium',
                    hasActiveChild
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[var(--foreground)]',
                    sidebarCollapsed && 'justify-center'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </>
                  )}
                </button>

                {!sidebarCollapsed && isOpen && item.children && (
                  <div className="ml-3 pl-3 border-l border-[var(--border)] mb-1">
                    {item.children.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors',
                            childActive
                              ? 'bg-[var(--primary-light)] text-[var(--primary-dark)] font-medium'
                              : 'text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[var(--foreground)]'
                          )}
                        >
                          {child.icon}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
