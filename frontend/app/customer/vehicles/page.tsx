'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { VehicleGrid } from '@/components/vehicles/VehicleGrid';
import { VehicleFilterPanel } from '@/components/vehicles/VehicleFilterPanel';
import { getVehicles } from '@/lib/api/vehicles';
import { Vehicle, VehicleFilterParams, SortOption } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';

function VehicleMarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL query params
  const [filters, setFilters] = useState<VehicleFilterParams>(() => ({
    search: searchParams.get('search') || '',
    fuelType: (searchParams.get('fuelType') as VehicleFilterParams['fuelType']) || '',
    transmission: (searchParams.get('transmission') as VehicleFilterParams['transmission']) || '',
    status: (searchParams.get('status') as VehicleFilterParams['status']) || '',
  }));
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'price_asc'
  );

  // Sync filters to URL
  const syncURL = useCallback((f: VehicleFilterParams, s: SortOption) => {
    const params = new URLSearchParams();
    if (f.search) params.set('search', f.search);
    if (f.fuelType) params.set('fuelType', f.fuelType);
    if (f.transmission) params.set('transmission', f.transmission);
    if (f.status) params.set('status', f.status);
    if (s !== 'price_asc') params.set('sort', s);
    const qs = params.toString();
    router.replace(`/customer/vehicles${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router]);

  // Fetch vehicles (debounced for search)
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Send server-supported filters to backend
        const serverFilters: VehicleFilterParams = {};
        if (filters.search) serverFilters.search = filters.search;
        if (filters.fuelType) serverFilters.fuelType = filters.fuelType;
        if (filters.transmission) serverFilters.transmission = filters.transmission;
        if (filters.status) serverFilters.status = filters.status;

        const data = await getVehicles(serverFilters);
        if (isMounted) {
          setVehicles(data);
          syncURL(filters, sortBy);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load vehicles from the server.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters, syncURL, sortBy]);

  // Client-side sorting
  const sortedVehicles = useMemo(() => {
    const sorted = [...vehicles];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.baseRentalRate - b.baseRentalRate);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.baseRentalRate - a.baseRentalRate);
        break;
      case 'health_desc':
        sorted.sort((a, b) => b.healthScore - a.healthScore);
        break;
      case 'newest':
        sorted.sort((a, b) => b.purchaseYear - a.purchaseYear);
        break;
    }
    return sorted;
  }, [vehicles, sortBy]);

  const handleReset = () => {
    setFilters({ search: '', fuelType: '', transmission: '', status: '' });
    setSortBy('price_asc');
  };

  const handleSortChange = (s: SortOption) => {
    setSortBy(s);
    syncURL(filters, s);
  };

  if (error && vehicles.length === 0) {
    return <ErrorState title="Unable to load vehicles" message={error} onRetry={() => setFilters({ ...filters })} />;
  }

  return (
    <>
      <VehicleFilterPanel
        filters={filters}
        sortBy={sortBy}
        onChange={setFilters}
        onSortChange={handleSortChange}
        onReset={handleReset}
        resultsCount={sortedVehicles.length}
        isLoading={isLoading}
      />
      <VehicleGrid vehicles={sortedVehicles} isLoading={isLoading} />
    </>
  );
}

export default function VehiclesPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'FLEET_MANAGER']}>
      <AppShell>
        <PageHeader
          title="Find your next vehicle"
          description="Browse our entire fleet with real-time availability, dynamic pricing, and intelligent health indicators."
          breadcrumbs={[
            { label: 'Dashboard', href: '/customer' },
            { label: 'Vehicles' },
          ]}
        />
        <Suspense fallback={<LoadingState label="Loading marketplace..." />}>
          <VehicleMarketplaceContent />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}
