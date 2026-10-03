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
  PanelLeftClose,
  PanelLeftOpen,
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

const AUTO_OPEN = new Set(['Business', 'Inventory', 'People', 'Finance']);

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Set<string>>(AUTO_OPEN);

  const toggleMenu = (label: string) => {
    if (sidebarCollapsed) return;
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
      {/* Mobile backdrop */}
      {!sidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 cursor-pointer"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col',
          'bg-[var(--card)] border-r border-[var(--border)]',
          'transition-all duration-300 ease-in-out shadow-sm',
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Logo + toggle */}
        <div className="flex items-center h-16 px-4 border-b border-[var(--border)] shrink-0 gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm select-none">B</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-[var(--foreground)] truncate flex-1 select-none">
              Business ERP
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              'cursor-pointer p-1.5 rounded-lg text-[var(--muted)] hover:text-white hover:bg-[var(--primary)] transition-colors shrink-0',
              sidebarCollapsed && 'mx-auto'
            )}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={
              sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menuItems.map((item) => {
            if (item.href) {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium select-none',
                    active
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--muted)] hover:bg-[var(--primary)] hover:text-white',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            }

            const isOpen = openMenus.has(item.label);
            const hasActiveChild = item.children?.some((c) => isActive(c.href));

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium select-none',
                    hasActiveChild
                      ? 'text-[var(--primary)] bg-[var(--primary-light)] dark:bg-green-900/20'
                      : 'text-[var(--muted)] hover:bg-[var(--primary)] hover:text-white',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                      <span
                        className="shrink-0 transition-transform duration-200"
                        style={{
                          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        }}
                      >
                        <ChevronDown size={14} />
                      </span>
                    </>
                  )}
                </button>

                {/* Submenu */}
                {!sidebarCollapsed && (
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200',
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="ml-4 pl-3 border-l-2 border-[var(--primary)] mt-0.5 mb-1 space-y-0.5">
                      {item.children?.map((child) => {
                        const childActive = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 select-none',
                              childActive
                                ? 'bg-[var(--primary)] text-white font-semibold shadow-sm'
                                : 'text-[var(--muted)] hover:bg-[var(--primary)] hover:text-white'
                            )}
                          >
                            {child.icon}
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
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
