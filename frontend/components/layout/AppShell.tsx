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

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'CUSTOMER':
        return [
          { label: 'Dashboard', href: '/customer', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Browse Vehicles', href: '/customer/vehicles', icon: <Car className="w-4 h-4" /> },
          { label: 'My Bookings', href: '/customer/bookings', icon: <Calendar className="w-4 h-4" /> },
          { label: 'My Rentals', href: '/customer/rentals', icon: <KeyRound className="w-4 h-4" /> },
          { label: 'My Payments', href: '/customer/payments', icon: <CreditCard className="w-4 h-4" /> },
          { label: 'Loyalty Rewards', href: '/customer/loyalty', icon: <Award className="w-4 h-4" /> },
          { label: 'Notifications', href: '/customer/notifications', icon: <Bell className="w-4 h-4" /> },
          { label: 'My Reviews', href: '/customer/reviews', icon: <Star className="w-4 h-4" /> },
          { label: 'Profile', href: '/customer/profile', icon: <UserIcon className="w-4 h-4" /> },
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Manage Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
          { label: 'Fleet Vehicles', href: '/admin/vehicles', icon: <Car className="w-4 h-4" /> },
          { label: 'Bookings', href: '/admin/bookings', icon: <Calendar className="w-4 h-4" /> },
          { label: 'Rentals', href: '/admin/rentals', icon: <KeyRound className="w-4 h-4" /> },
          { label: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
          { label: 'Customer Reviews', href: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
          { label: 'System Alerts', href: '/admin/notifications', icon: <Bell className="w-4 h-4" /> },
        ];
      case 'FLEET_MANAGER':
        return [
          { label: 'Overview', href: '/fleet', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Fleet Inventory', href: '/fleet/vehicles', icon: <Car className="w-4 h-4" /> },
          { label: 'Fleet Utilization', href: '/fleet/utilization', icon: <BarChart3 className="w-4 h-4" /> },
          { label: 'Vehicle Health', href: '/fleet/health', icon: <ShieldCheck className="w-4 h-4" /> },
          { label: 'Fleet Intelligence', href: '/fleet/intelligence', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
          { label: 'Smart Allocation', href: '/fleet/allocation', icon: <Zap className="w-4 h-4 text-purple-400" /> },
          { label: 'Maintenance Impact', href: '/fleet/maintenance', icon: <Wrench className="w-4 h-4" /> },
        ];
      case 'MAINTENANCE_STAFF':
        return [
          { label: 'Dashboard', href: '/maintenance', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Maintenance Tasks', href: '/maintenance/tasks', icon: <Wrench className="w-4 h-4" /> },
          { label: 'Vehicle Status', href: '/maintenance/vehicles', icon: <Car className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-blue-600 rounded-lg text-white font-black tracking-wider text-sm shadow-sm group-hover:bg-blue-500 transition-colors">
                VR
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-tight">
                  Velo<span className="text-blue-500">Rent</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase leading-none">
                  Fleet Intelligence
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
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white leading-none shadow-xs">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </Link>

                {/* User Profile & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
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
                      className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in duration-150"
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
                        <Link href="/customer/profile" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          Profile
                        </Link>
                        <Link href="/customer/bookings" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          My Bookings
                        </Link>
                        <Link href="/customer/rentals" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50">
                          <KeyRound className="w-4 h-4 text-slate-500" />
                          My Rentals
                        </Link>
                        <Link href="/customer/loyalty" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50">
                          <Award className="w-4 h-4 text-amber-500" />
                          Loyalty Rewards
                        </Link>
                        <Link href="/customer/notifications" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50">
                          <Bell className="w-4 h-4 text-slate-500" />
                          Notifications ({unreadNotifCount})
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
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
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
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Navigation</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium',
                        pathname === item.href
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {user && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-900">{user.fullName}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
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

