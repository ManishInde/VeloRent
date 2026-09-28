'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RentalSummary } from '@/components/rentals/RentalSummary';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerRentals } from '@/lib/api/rentals';
import { Rental, RentalStatus } from '@/types';
import { KeyRound, Car, AlertCircle } from 'lucide-react';

export default function CustomerRentalsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
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
        const rentalData = await getCustomerRentals(user.id);
        if (!mounted) return;
        setRentals(rentalData);
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

  const filteredRentals = rentals.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });


  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        <PageHeader
          title="My Rentals"
          description="View active vehicle check-outs, return schedules, odometer history, and rental status."
          action={
            <Link href="/customer/vehicles">
              <Button leftIcon={<Car className="w-4 h-4" />}>Browse Vehicles</Button>
            </Link>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'OVERDUE', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {status === 'ALL' ? 'All Rentals' : status}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] bg-slate-200/50 text-slate-800">
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
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : filteredRentals.length > 0 ? (
          <div className="space-y-4">
            {filteredRentals.map((rental) => (
              <RentalSummary key={rental.id} rental={rental} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<KeyRound className="w-10 h-10 text-slate-400" />}
            title={filter === 'ALL' ? "You don't have any rentals yet." : `No ${filter.toLowerCase()} rentals.`}
            description="When you start a vehicle rental from a confirmed booking, it will appear here."
            action={
              <Link href="/customer/vehicles">
                <Button variant="outline" size="sm">
                  Browse Vehicles
                </Button>
              </Link>
            }
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
