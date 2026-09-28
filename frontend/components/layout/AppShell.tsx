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
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
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
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getNavGroups = (): NavGroup[] => {
    if (!user) return [];

    switch (user.role) {
      case 'CUSTOMER':
        return [
          {
            title: 'Marketplace',
            items: [
              { label: 'Dashboard', href: '/customer', icon: <LayoutDashboard className="w-4 h-4" /> },
              { label: 'Browse Vehicles', href: '/customer/vehicles', icon: <Car className="w-4 h-4" /> },
            ],
          },
          {
            title: 'My Trips',
            items: [
              { label: 'My Bookings', href: '/customer/bookings', icon: <Calendar className="w-4 h-4" /> },
              { label: 'My Rentals', href: '/customer/rentals', icon: <KeyRound className="w-4 h-4" /> },
              { label: 'My Payments', href: '/customer/payments', icon: <CreditCard className="w-4 h-4" /> },
            ],
          },
          {
            title: 'Rewards & Account',
            items: [
              { label: 'Loyalty Rewards', href: '/customer/loyalty', icon: <Award className="w-4 h-4 text-amber-500" /> },
              {
                label: 'Notifications',
                href: '/customer/notifications',
                icon: <Bell className="w-4 h-4" />,
                badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
              },
              { label: 'My Reviews', href: '/customer/reviews', icon: <Star className="w-4 h-4 text-amber-400" /> },
              { label: 'Profile', href: '/customer/profile', icon: <UserIcon className="w-4 h-4" /> },
            ],
          },
        ];
      case 'ADMIN':
        return [
          {
            title: 'Administration',
            items: [
              { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
              { label: 'Manage Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
              { label: 'Fleet Vehicles', href: '/admin/vehicles', icon: <Car className="w-4 h-4" /> },
              { label: 'Bookings', href: '/admin/bookings', icon: <Calendar className="w-4 h-4" /> },
              { label: 'Rentals', href: '/admin/rentals', icon: <KeyRound className="w-4 h-4" /> },
              { label: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
              { label: 'Customer Reviews', href: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
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
              { label: 'Fleet Inventory', href: '/fleet/vehicles', icon: <Car className="w-4 h-4" /> },
              { label: 'Fleet Utilization', href: '/fleet/utilization', icon: <BarChart3 className="w-4 h-4" /> },
              { label: 'Vehicle Health', href: '/fleet/health', icon: <ShieldCheck className="w-4 h-4" /> },
              { label: 'Fleet Intelligence', href: '/fleet/intelligence', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
              { label: 'Smart Allocation', href: '/fleet/allocation', icon: <Zap className="w-4 h-4 text-purple-400" /> },
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
              { label: 'Maintenance Tasks', href: '/maintenance/tasks', icon: <Wrench className="w-4 h-4" /> },
              { label: 'Vehicle Status', href: '/maintenance/vehicles', icon: <Car className="w-4 h-4" /> },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const navGroups = getNavGroups();

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm group-hover:bg-blue-500 transition-colors">
                VR
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-tight">
                  Velo<span className="text-blue-500">Rent</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase leading-none">
                  Automotive Marketplace
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Notification Icon Button with Badge */}
                <Link
                  href="/customer/notifications"
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-500 text-white leading-none shadow-xs">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </Link>

                {/* User Profile & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-blue-400/30">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-white leading-tight">{user.fullName}</span>
                      <span className="text-[10px] text-slate-400 leading-tight">{user.email}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>

                      <div className="py-1 text-xs font-medium text-slate-700">
                        <Link href="/customer/profile" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          Profile
                        </Link>
                        <Link href="/customer/bookings" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          My Bookings
                        </Link>
                        <Link href="/customer/rentals" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                          <KeyRound className="w-4 h-4 text-slate-500" />
                          My Rentals
                        </Link>
                        <Link href="/customer/loyalty" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                          <Award className="w-4 h-4 text-amber-500" />
                          Loyalty Rewards
                        </Link>
                        <Link href="/customer/notifications" className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors">
                          <span className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4 text-slate-500" />
                            Notifications
                          </span>
                          {unreadNotifCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                              {unreadNotifCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
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

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] p-4">
          <div className="space-y-6">
            {navGroups.map((group, idx) => (
              <div key={group.title || idx} className="space-y-1">
                {group.title && (
                  <h5 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {group.title}
                  </h5>
                )}
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/customer' &&
                        item.href !== '/admin' &&
                        item.href !== '/fleet' &&
                        item.href !== '/maintenance' &&
                        pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={clsx(isActive ? 'text-white' : 'text-slate-500')}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={clsx(
                              'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                              isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Profile Card at Sidebar Bottom */}
          {user && (
            <div className="pt-4 border-t border-slate-100 mt-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 capitalize leading-tight">{user.role.toLowerCase().replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      VR
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">VeloRent</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {navGroups.map((group, idx) => (
                  <div key={group.title || idx} className="space-y-1">
                    {group.title && (
                      <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {group.title}
                      </h5>
                    )}
                    <nav className="space-y-1">
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/customer' &&
                            item.href !== '/admin' &&
                            item.href !== '/fleet' &&
                            item.href !== '/maintenance' &&
                            pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={clsx(
                              'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                              isActive
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span
                                className={clsx(
                                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                                  isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>

              {user && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-900 block truncate">{user.fullName}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
};

