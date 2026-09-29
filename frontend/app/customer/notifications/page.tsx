'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { useAuth } from '@/lib/auth/AuthContext';
import { getUserNotifications } from '@/lib/api/notifications';
import { Notification } from '@/types';
import { CheckCheck, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function CustomerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchNotificationsData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserNotifications(user.id, filter === 'UNREAD');
        if (mounted) setNotifications(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load notifications.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchNotificationsData();
    return () => {
      mounted = false;
    };
  }, [user, filter]);

  const handleNotificationRead = (updated: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Editorial Notifications Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="micro-tag text-[#777770] block mb-1">
              SYSTEM BROADCASTS & ALERTS
            </span>
            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
              ACTIVITY FEED
            </h1>
            <p className="text-sm text-[#555550] font-mono mt-1 max-w-xl">
              Real-time reservation confirmations, key handover dispatches, and rental receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#777770]">
            <span className="w-2 h-2 bg-[#C7F000] border border-[#111111]" />
            <span>SOCKET DISPATCH MONITOR</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-[#111111]/15 mb-6 pb-px">
          <button
            onClick={() => setFilter('ALL')}
            className={clsx(
              'px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer',
              filter === 'ALL'
                ? 'text-[#111111] border-[#111111] bg-[#FAF8F5]'
                : 'text-[#777770] border-transparent hover:text-[#111111] hover:bg-[#FAF8F5]'
            )}
          >
            ALL DISPATCHES
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={clsx(
              'px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2',
              filter === 'UNREAD'
                ? 'text-[#111111] border-[#111111] bg-[#FAF8F5]'
                : 'text-[#777770] border-transparent hover:text-[#111111] hover:bg-[#FAF8F5]'
            )}
          >
            <span>UNREAD ALERTS</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 font-mono text-[9px] font-black bg-[#C7F000] text-[#111111] border border-[#111111]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-none" />
            <Skeleton className="h-20 w-full rounded-none" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onReadUpdate={handleNotificationRead}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCheck className="w-10 h-10 text-[#888880]" />}
            title="YOU ARE ALL CAUGHT UP"
            description={
              filter === 'UNREAD'
                ? 'Zero unread dispatches at this time.'
                : 'System alerts and reservation reminders will stream here as generated.'
            }
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
