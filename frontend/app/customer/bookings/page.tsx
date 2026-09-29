'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { BookingCard } from '@/components/bookings/BookingCard';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyBookings } from '@/lib/api/bookings';
import { getVehicles } from '@/lib/api/vehicles';
import { Booking, BookingStatus, Vehicle } from '@/types';
import { Calendar, Car } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

type Tab = 'ALL' | BookingStatus;

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Map<number, Vehicle>>(new Map());
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
        const [data, vehicles] = await Promise.all([
          getMyBookings(user.id),
          getVehicles().catch(() => []),
        ]);
        if (mounted) {
          setBookings(data.sort((a, b) => b.id - a.id));
          const map = new Map<number, Vehicle>();
          vehicles.forEach((v) => map.set(v.id, v));
          setVehicleMap(map);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load bookings.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchBookings();
    return () => {
      mounted = false;
    };
  }, [user]);

  const tabs: { label: string; value: Tab; count: number }[] = useMemo(
    () => [
      { label: 'ALL BOOKINGS', value: 'ALL', count: bookings.length },
      { label: 'CONFIRMED', value: 'CONFIRMED', count: bookings.filter((b) => b.status === 'CONFIRMED').length },
      { label: 'PENDING', value: 'PENDING', count: bookings.filter((b) => b.status === 'PENDING').length },
      { label: 'COMPLETED', value: 'COMPLETED', count: bookings.filter((b) => b.status === 'COMPLETED').length },
      { label: 'CANCELLED', value: 'CANCELLED', count: bookings.filter((b) => b.status === 'CANCELLED').length },
    ],
    [bookings]
  );

  const filtered = useMemo(
    () => (activeTab === 'ALL' ? bookings : bookings.filter((b) => b.status === activeTab)),
    [bookings, activeTab]
  );

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AppShell>
        {/* Editorial Bookings Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="micro-tag text-[#777770] block mb-1">
              03 / TRIP LEDGER
            </span>
            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
              BOOKINGS ARCHIVE
            </h1>
            <p className="text-sm text-[#555550] font-mono mt-1 max-w-xl">
              Historical and scheduled reservations locked in the VeloRent booking engine.
            </p>
          </div>

          <Link href="/customer/vehicles">
            <Button size="sm" variant="primary" leftIcon={<Car className="w-3.5 h-3.5" />}>
              EXPLORE VEHICLES
            </Button>
          </Link>
        </div>

        {/* Tab Selector Strip */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto border-b border-[#111111]/15 pb-px scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={clsx(
                'px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 cursor-pointer',
                activeTab === tab.value
                  ? 'text-[#111111] border-[#111111] bg-[#FAF8F5]'
                  : 'text-[#777770] border-transparent hover:text-[#111111] hover:bg-[#FAF8F5]'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={clsx(
                    'ml-2 px-1.5 py-0.2 text-[10px] font-mono font-bold',
                    activeTab === tab.value ? 'bg-[#C7F000] text-[#111111] border border-[#111111]' : 'bg-[#ECE8E0] text-[#555550]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingState label="Loading booking ledger..." />
        ) : error ? (
          <ErrorState title="Failed to load bookings" message={error} onRetry={() => window.location.reload()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-10 h-10 text-[#888880]" />}
            title={activeTab === 'ALL' ? 'NO BOOKINGS LOGGED YET' : `NO ${activeTab} BOOKINGS FOUND`}
            description={
              activeTab === 'ALL'
                ? 'Reserve a vehicle from our lot to lock in dynamic pricing.'
                : 'Select a different tab or browse active fleet units.'
            }
            action={
              activeTab === 'ALL' ? (
                <Link href="/customer/vehicles">
                  <Button size="sm" variant="primary">
                    BROWSE VEHICLES
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((booking, idx) => (
              <BookingCard key={booking.id} booking={booking} vehicleMap={vehicleMap} index={idx} />
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
