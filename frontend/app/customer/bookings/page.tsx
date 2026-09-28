'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { BookingCard } from '@/components/bookings/BookingCard';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyBookings } from '@/lib/api/bookings';
import { Booking, BookingStatus } from '@/types';
import { Calendar, Car } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

type Tab = 'ALL' | BookingStatus;

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('ALL');

  useEffect(() => {
    let mounted = true;
    const fetchBookings = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMyBookings(user.id);
        if (mounted) setBookings(data.sort((a, b) => b.id - a.id));
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load bookings.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchBookings();
    return () => { mounted = false; };
  }, [user]);

  const tabs: { label: string; value: Tab; count: number }[] = useMemo(() => [
    { label: 'All', value: 'ALL', count: bookings.length },
    { label: 'Confirmed', value: 'CONFIRMED', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { label: 'Pending', value: 'PENDING', count: bookings.filter(b => b.status === 'PENDING').length },
    { label: 'Completed', value: 'COMPLETED', count: bookings.filter(b => b.status === 'COMPLETED').length },
    { label: 'Cancelled', value: 'CANCELLED', count: bookings.filter(b => b.status === 'CANCELLED').length },
  ], [bookings]);

  const filtered = useMemo(() =>
    activeTab === 'ALL' ? bookings : bookings.filter(b => b.status === activeTab),
  [bookings, activeTab]);

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AppShell>
        <PageHeader
          title="My Bookings"
          description="View, manage, and track your vehicle reservations."
          breadcrumbs={[
            { label: 'Dashboard', href: '/customer' },
            { label: 'Bookings' },
          ]}
          action={
            <Link href="/customer/vehicles">
              <Button size="sm" leftIcon={<Car className="w-3.5 h-3.5" />}>Browse Vehicles</Button>
            </Link>
          }
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto border-b border-slate-200 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={clsx(
                'px-4 py-2.5 text-xs font-semibold tracking-wide rounded-t-md transition-colors whitespace-nowrap border-b-2',
                activeTab === tab.value
                  ? 'text-blue-700 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={clsx(
                  'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  activeTab === tab.value ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                )}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingState label="Loading your bookings..." />
        ) : error ? (
          <ErrorState title="Failed to load bookings" message={error} onRetry={() => window.location.reload()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-10 h-10 text-slate-400" />}
            title={activeTab === 'ALL' ? 'No bookings yet' : `No ${activeTab.toLowerCase()} bookings`}
            description={activeTab === 'ALL' ? 'Reserve a vehicle to get started.' : 'Try selecting a different tab.'}
            action={activeTab === 'ALL' ? (
              <Link href="/customer/vehicles"><Button size="sm">Browse Vehicles</Button></Link>
            ) : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
