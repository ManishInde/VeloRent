'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RentalSummary } from '@/components/rentals/RentalSummary';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerRentals } from '@/lib/api/rentals';
import { getMyBookings } from '@/lib/api/bookings';
import { getVehicles } from '@/lib/api/vehicles';
import { Rental, RentalStatus, Vehicle, Booking } from '@/types';
import { KeyRound, Car, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function CustomerRentalsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<RentalStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRentalsData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const [rentalData, bookingData, vehicleData] = await Promise.all([
          getCustomerRentals(user.id),
          getMyBookings(user.id).catch(() => []),
          getVehicles().catch(() => []),
        ]);
        if (!mounted) return;
        setRentals(rentalData);
        setBookings(bookingData);
        setVehicles(vehicleData);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load rentals.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchRentalsData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const getVehicleForRental = (rental: Rental): Vehicle | undefined => {
    const booking = bookings.find((b) => b.id === rental.bookingId);
    if (!booking) return undefined;
    return vehicles.find((v) => v.id === booking.vehicleId);
  };

  const filteredRentals = rentals.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Editorial Garage Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="micro-tag text-[#777770] block mb-1">
              02 / FLEET CHECK-OUTS
            </span>
            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
              YOUR GARAGE
            </h1>
            <p className="text-sm text-[#555550] font-mono mt-1 max-w-xl">
              Active on-the-road checkouts, historical journeys, odometer logs, and return drop-offs.
            </p>
          </div>

          <Link href="/customer/vehicles">
            <Button size="sm" variant="primary" leftIcon={<Car className="w-3.5 h-3.5" />}>
              EXPLORE VEHICLES
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-[#111111]/15 mb-6 pb-px overflow-x-auto scrollbar-none">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'OVERDUE', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={clsx(
                'px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 cursor-pointer',
                filter === status
                  ? 'text-[#111111] border-[#111111] bg-[#FAF8F5]'
                  : 'text-[#777770] border-transparent hover:text-[#111111] hover:bg-[#FAF8F5]'
              )}
            >
              {status === 'ALL' ? 'ALL GARAGE' : status === 'ACTIVE' ? 'ON THE ROAD' : status === 'COMPLETED' ? 'BACK IN GARAGE' : status}
              <span
                className={clsx(
                  'ml-2 px-1.5 py-0.2 text-[10px] font-mono font-bold',
                  filter === status ? 'bg-[#C7F000] text-[#111111] border border-[#111111]' : 'bg-[#ECE8E0] text-[#555550]'
                )}
              >
                {status === 'ALL'
                  ? rentals.length
                  : rentals.filter((r) => r.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-none" />
            <Skeleton className="h-32 w-full rounded-none" />
          </div>
        ) : filteredRentals.length > 0 ? (
          <div className="space-y-4">
            {filteredRentals.map((rental) => (
              <RentalSummary
                key={rental.id}
                rental={rental}
                vehicle={getVehicleForRental(rental)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<KeyRound className="w-10 h-10 text-[#888880]" />}
            title={filter === 'ALL' ? 'YOUR GARAGE IS EMPTY' : `NO ${filter} RENTALS FOUND`}
            description="When you initiate an active rental from a confirmed booking, it will appear here."
            action={
              <Link href="/customer/vehicles">
                <Button variant="primary" size="sm">
                  EXPLORE VEHICLES
                </Button>
              </Link>
            }
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
