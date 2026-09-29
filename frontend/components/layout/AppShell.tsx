'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { RoleBadge } from '@/components/ui/StatusBadge';
import { getUserNotifications } from '@/lib/api/notifications';
import {
  Car,
  LayoutDashboard,
  Calendar,
  KeyRound,
  Award,
  Bell,
  User as UserIcon,
  LogOut,
  Users,
  CreditCard,
  Star,
  Wrench,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  number?: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    if (user) {
      getUserNotifications(user.id, true)
        .then((notifs) => {
          if (mounted) setUnreadNotifCount(notifs.length);
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [user, pathname]);

  const getInitials = (name: string) => {
    if (!name) return 'VR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isCustomer = user?.role === 'CUSTOMER';

  const customerNavItems: NavItem[] = [
    { number: '01', label: 'DISCOVER', href: '/customer' },
    { number: '02', label: 'GARAGE', href: '/customer/profile' },
    { number: '03', label: 'BOOKINGS', href: '/customer/bookings' },
    { number: '04', label: 'RIDES', href: '/customer/rentals' },
    { number: '05', label: 'REWARDS', href: '/customer/loyalty' },
  ];

  const getAdminFleetNavGroups = (): NavGroup[] => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          {
            title: 'Operations',
            items: [
              { label: 'Overview', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
              { label: 'Fleet Inventory', href: '/admin/vehicles', icon: <Car className="w-4 h-4" /> },
              { label: 'Bookings Ledger', href: '/admin/bookings', icon: <Calendar className="w-4 h-4" /> },
              { label: 'Active Rentals', href: '/admin/rentals', icon: <KeyRound className="w-4 h-4" /> },
              { label: 'Transactions', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
            ],
          },
          {
            title: 'Control & Users',
            items: [
              { label: 'Users Directory', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
              { label: 'Feedback & Reviews', href: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
              { label: 'System Alerts', href: '/admin/notifications', icon: <Bell className="w-4 h-4" /> },
            ],
          },
        ];
      case 'FLEET_MANAGER':
        return [
          {
            title: 'Fleet Operations',
            items: [
              { label: 'Overview', href: '/fleet', icon: <LayoutDashboard className="w-4 h-4" /> },
              { label: 'Fleet Vehicles', href: '/fleet/vehicles', icon: <Car className="w-4 h-4" /> },
              { label: 'Utilization Stats', href: '/fleet/utilization', icon: <BarChart3 className="w-4 h-4" /> },
              { label: 'Health Scores', href: '/fleet/health', icon: <ShieldCheck className="w-4 h-4" /> },
              { label: 'Customer Feedback', href: '/fleet/reviews', icon: <Star className="w-4 h-4 text-[#C7F000]" /> },
              { label: 'Intelligence Engine', href: '/fleet/intelligence', icon: <Sparkles className="w-4 h-4 text-[#C7F000]" /> },
              { label: 'Smart Allocation', href: '/fleet/allocation', icon: <Zap className="w-4 h-4 text-[#7657FF]" /> },
              { label: 'Maintenance Impact', href: '/fleet/maintenance', icon: <Wrench className="w-4 h-4" /> },
            ],
          },
        ];
      case 'MAINTENANCE_STAFF':
        return [
          {
            title: 'Maintenance',
            items: [
              { label: 'Dashboard', href: '/maintenance', icon: <LayoutDashboard className="w-4 h-4" /> },
              { label: 'Task Queue', href: '/maintenance/tasks', icon: <Wrench className="w-4 h-4" /> },
              { label: 'Vehicle Readiness', href: '/maintenance/vehicles', icon: <Car className="w-4 h-4" /> },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const isCurrentActive = (itemHref: string, itemNumber?: string) => {
    if (isCustomer && itemNumber) {
      switch (itemNumber) {
        case '01': // DISCOVER: /customer, /customer/vehicles, /customer/vehicles/[id]
          return pathname === '/customer' || pathname.startsWith('/customer/vehicles');
        case '02': // GARAGE: /customer/profile
          return pathname.startsWith('/customer/profile');
        case '03': // BOOKINGS: /customer/bookings, /customer/bookings/[id]
          return pathname.startsWith('/customer/bookings');
        case '04': // RIDES: /customer/rentals, /customer/rentals/[id], /customer/reviews
          return pathname.startsWith('/customer/rentals') || pathname.startsWith('/customer/reviews');
        case '05': // REWARDS: /customer/loyalty
          return pathname.startsWith('/customer/loyalty');
        default:
          return false;
      }
    }

    if (pathname === itemHref) return true;
    if (itemHref !== '/customer' && itemHref !== '/admin' && itemHref !== '/fleet' && itemHref !== '/maintenance') {
      return pathname.startsWith(itemHref);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#111111] flex flex-col font-sans selection:bg-[#C7F000] selection:text-[#111111]">
      {/* Top Editorial Ticker Bar */}
      <div className="bg-[#111111] text-[#F4F1EA] text-[10px] font-display uppercase tracking-[0.2em] py-1 px-4 border-b border-[#242422]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 bg-[#C7F000]" />
            <span className="font-bold">VELORENT AUTOMOTIVE EDITORIAL</span>
            <span className="hidden sm:inline text-[#777770]">/</span>
            <span className="hidden sm:inline text-[#AAA8A0]">CURATED FLEET MARKETPLACE</span>
          </div>
          <div className="flex items-center gap-4 text-[#AAA8A0]">
            <span className="hidden md:inline font-mono">EDITION 2026.09</span>
            <span className="text-[#C7F000] font-bold">READY TO ROLL</span>
          </div>
        </div>
      </div>

      {/* Main Editorial Header */}
      <header className="sticky top-0 z-40 bg-[#111111] border-b border-[#222220] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#AAA8A0] hover:text-[#C7F000] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href={isCustomer ? '/customer' : '/'} className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-[#C7F000] text-[#111111] font-display font-black text-sm tracking-tighter flex items-center justify-center border border-[#111111] shadow-[2px_2px_0px_#7657FF] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                VR
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg tracking-tight uppercase leading-none text-white">
                  VELO<span className="text-[#C7F000]">RENT</span>
                </span>
                <span className="text-[9px] font-display uppercase tracking-[0.25em] text-[#888880] mt-0.5">
                  AUTOMOTIVE × GEN-Z
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Horizontal Navigation for Customer */}
          {isCustomer && (
            <nav className="hidden lg:flex items-center space-x-1">
              {customerNavItems.map((item) => {
                const active = isCurrentActive(item.href, item.number);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5',
                      active
                        ? 'bg-[#C7F000] text-[#111111] shadow-[2px_2px_0px_#000000]'
                        : 'text-[#AAA8A0] hover:text-white hover:bg-[#222220]'
                    )}
                  >
                    <span className={clsx('text-[10px] font-mono', active ? 'text-[#111111]/70' : 'text-[#666660]')}>
                      {item.number}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Notifications Link */}
                <Link
                  href="/customer/notifications"
                  className="relative p-2 text-[#AAA8A0] hover:text-white hover:bg-[#222220] transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.2 font-display text-[9px] font-black bg-[#C7F000] text-[#111111] leading-none">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </Link>

                {/* Driver Identity Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-[#222220] transition-colors focus:outline-none border border-[#2E2E2A]"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-7 h-7 bg-[#242422] text-[#C7F000] font-display font-bold text-xs flex items-center justify-center border border-[#3E3E38]">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-display font-bold text-white uppercase tracking-wider leading-tight">
                        {user.fullName}
                      </span>
                      <span className="text-[9px] font-mono text-[#888880] leading-none">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888880] hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] text-[#111111] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-[#111111]/10 bg-[#FAF8F5]">
                        <span className="micro-tag text-[#888880]">DRIVER IDENTITY</span>
                        <p className="font-display text-sm font-extrabold text-[#111111] uppercase tracking-tight mt-0.5">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-[#666660] font-mono truncate">{user.email}</p>
                        <div className="mt-2">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>

                      <div className="py-1 text-xs font-display font-semibold uppercase tracking-wider">
                        {isCustomer && (
                          <>
                            <Link href="/customer/profile" className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#C7F000] hover:text-[#111111] transition-colors">
                              <UserIcon className="w-4 h-4 text-[#888880]" />
                              01 / Driver Profile
                            </Link>
                            <Link href="/customer/rentals" className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#C7F000] hover:text-[#111111] transition-colors">
                              <KeyRound className="w-4 h-4 text-[#888880]" />
                              02 / Your Garage
                            </Link>
                            <Link href="/customer/bookings" className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#C7F000] hover:text-[#111111] transition-colors">
                              <Calendar className="w-4 h-4 text-[#888880]" />
                              03 / Bookings Ledger
                            </Link>
                            <Link href="/customer/payments" className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#C7F000] hover:text-[#111111] transition-colors">
                              <CreditCard className="w-4 h-4 text-[#888880]" />
                              04 / Payment History
                            </Link>
                            <Link href="/customer/loyalty" className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#C7F000] hover:text-[#111111] transition-colors">
                              <Award className="w-4 h-4 text-[#7657FF]" />
                              05 / Membership Pass
                            </Link>
                            <Link href="/customer/reviews" className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#C7F000] hover:text-[#111111] transition-colors">
                              <Star className="w-4 h-4 text-[#888880]" />
                              06 / Ride Reviews
                            </Link>
                          </>
                        )}
                        {!isCustomer && (
                          <Link href={`/${user.role.toLowerCase().replace('_', '')}`} className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#C7F000] hover:text-[#111111] transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-[#888880]" />
                            Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#111111]/10">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-[#FF654A] hover:bg-[#FFF0ED] transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#111111]/80 backdrop-blur-xs flex">
          <div className="w-80 bg-[#111111] text-white h-full p-6 flex flex-col justify-between border-r border-[#2E2E2A] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#222220]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#C7F000] text-[#111111] font-display font-black text-xs flex items-center justify-center">
                    VR
                  </div>
                  <span className="font-display font-bold text-sm tracking-tight text-white uppercase">
                    VELORENT
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#AAA8A0] hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isCustomer ? (
                <nav className="space-y-2">
                  <span className="micro-tag text-[#888880] block mb-2">INDEX</span>
                  {customerNavItems.map((item) => {
                    const active = isCurrentActive(item.href, item.number);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          'flex items-center justify-between px-3 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition-all',
                          active
                            ? 'bg-[#C7F000] text-[#111111]'
                            : 'text-[#AAA8A0] hover:bg-[#222220] hover:text-white'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-mono opacity-60">{item.number}</span>
                          <span>{item.label}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-50" />
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t border-[#222220] space-y-1">
                    <span className="micro-tag text-[#888880] block mb-2">ACCOUNT</span>
                    <Link
                      href="/customer/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-display font-semibold text-[#AAA8A0] hover:text-white uppercase"
                    >
                      Driver Profile
                    </Link>
                    <Link
                      href="/customer/payments"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-display font-semibold text-[#AAA8A0] hover:text-white uppercase"
                    >
                      Payments Ledger
                    </Link>
                    <Link
                      href="/customer/reviews"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-display font-semibold text-[#AAA8A0] hover:text-white uppercase"
                    >
                      Ride Reviews
                    </Link>
                    <Link
                      href="/customer/notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-display font-semibold text-[#AAA8A0] hover:text-white uppercase"
                    >
                      Notifications ({unreadNotifCount})
                    </Link>
                  </div>
                </nav>
              ) : (
                <div className="space-y-4">
                  {getAdminFleetNavGroups().map((group, idx) => (
                    <div key={idx} className="space-y-1">
                      {group.title && (
                        <span className="micro-tag text-[#888880] block mb-1">
                          {group.title}
                        </span>
                      )}
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={clsx(
                            'flex items-center gap-2 px-3 py-2 text-xs font-display font-bold uppercase tracking-wider',
                            isCurrentActive(item.href)
                              ? 'bg-[#C7F000] text-[#111111]'
                              : 'text-[#AAA8A0] hover:bg-[#222220] hover:text-white'
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <div className="pt-4 border-t border-[#222220] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#242422] text-[#C7F000] font-display font-bold text-xs flex items-center justify-center border border-[#3E3E38]">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-display font-bold text-white block truncate uppercase">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-[#888880] font-mono block">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 p-2 font-display text-xs font-bold uppercase tracking-wider text-[#FF654A] bg-[#FF654A]/10 border border-[#FF654A]/30 hover:bg-[#FF654A]/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex">
        {/* Left Sidebar ONLY for Admin / Fleet Manager / Maintenance Staff */}
        {!isCustomer && (
          <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 border-r border-[#E2DDD5] bg-[#FAF8F5] min-h-[calc(100vh-4rem)] p-4">
            <div className="space-y-6">
              {getAdminFleetNavGroups().map((group, idx) => (
                <div key={idx} className="space-y-1">
                  {group.title && (
                    <span className="micro-tag text-[#888880] block px-3 mb-2">
                      {group.title}
                    </span>
                  )}
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const active = isCurrentActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-2 text-xs font-display font-bold uppercase tracking-wider transition-all',
                            active
                              ? 'bg-[#111111] text-[#C7F000] shadow-[2px_2px_0px_#C7F000]'
                              : 'text-[#555550] hover:bg-[#ECE8E0] hover:text-[#111111]'
                          )}
                        >
                          <span className={active ? 'text-[#C7F000]' : 'text-[#888880]'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Primary Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>

      {/* Editorial Footer Strip */}
      <footer className="mt-auto border-t border-[#E2DDD5] bg-[#FAF8F5] text-[#777770] py-6 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-[#111111] uppercase tracking-wider">VELORENT</span>
            <span>/</span>
            <span>AUTOMOTIVE EDITORIAL × FLEET ENGINE</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] uppercase tracking-wider">
            <span>DATABASE: MYSQL LIVE</span>
            <span>•</span>
            <span>INTELLIGENCE: ACTIVE</span>
            <span>•</span>
            <span className="text-[#111111] font-bold">ALL RIGHTS RESERVED 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
