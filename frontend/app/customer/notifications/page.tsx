'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { useAuth } from '@/lib/auth/AuthContext';
import { getUserNotifications } from '@/lib/api/notifications';
import { Notification } from '@/types';
import { CheckCheck, AlertCircle } from 'lucide-react';

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
        <PageHeader
          title="Notifications Inbox"
          description="View system alerts, booking reminders, return schedules, and payment receipts."
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-6 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filter === 'UNREAD'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
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
            icon={<CheckCheck className="w-10 h-10 text-slate-400" />}
            title="You're all caught up."
            description={
              filter === 'UNREAD'
                ? 'No unread notifications at this time.'
                : 'System alerts and rental reminders will appear here when generated.'
            }
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
