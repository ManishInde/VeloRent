'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { VehicleGrid } from '@/components/vehicles/VehicleGrid';
import { VehicleFilterPanel } from '@/components/vehicles/VehicleFilterPanel';
import { getVehicles } from '@/lib/api/vehicles';
import { Vehicle, VehicleFilterParams, SortOption } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';

const CATEGORY_NAME_TO_ID: Record<string, number> = {
  hatchback: 1,
  sedan: 2,
  suv: 3,
  luxury: 4,
  electric: 5,
  motorcycle: 6,
  bike: 6,
};

function parseCategoryId(val: string | null): number | undefined {
  if (!val) return undefined;
  const num = Number(val);
  if (!isNaN(num) && num > 0) return num;
  return CATEGORY_NAME_TO_ID[val.toLowerCase().trim()];
}

function VehicleMarketplaceContent() {
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL query params
  const [filters, setFilters] = useState<VehicleFilterParams>(() => {
    const cat = searchParams.get('categoryId') || searchParams.get('category');
    return {
      search: searchParams.get('search') || '',
      fuelType: (searchParams.get('fuelType') as VehicleFilterParams['fuelType']) || '',
      transmission: (searchParams.get('transmission') as VehicleFilterParams['transmission']) || '',
      status: (searchParams.get('status') as VehicleFilterParams['status']) || '',
      categoryId: parseCategoryId(cat),
    };
  });
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'price_asc'
  );

  // Sync filters to URL without triggering full Next.js page remounts
  const syncURL = useCallback((f: VehicleFilterParams, s: SortOption) => {
    const params = new URLSearchParams();
    if (f.search) params.set('search', f.search);
    if (f.fuelType) params.set('fuelType', f.fuelType);
    if (f.transmission) params.set('transmission', f.transmission);
    if (f.status) params.set('status', f.status);
    if (f.categoryId !== undefined) params.set('categoryId', String(f.categoryId));
    if (s !== 'price_asc') params.set('sort', s);
    const qs = params.toString();
    const targetUrl = `/customer/vehicles${qs ? `?${qs}` : ''}`;
    if (typeof window !== 'undefined' && (window.location.pathname + window.location.search) !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
  }, []);

  // Sync state if browser back/forward is used
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const cat = sp.get('categoryId') || sp.get('category');
      setFilters({
        search: sp.get('search') || '',
        fuelType: (sp.get('fuelType') as VehicleFilterParams['fuelType']) || '',
        transmission: (sp.get('transmission') as VehicleFilterParams['transmission']) || '',
        status: (sp.get('status') as VehicleFilterParams['status']) || '',
        categoryId: parseCategoryId(cat),
      });
      setSortBy((sp.get('sort') as SortOption) || 'price_asc');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch vehicles (debounced for search)
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const serverFilters: VehicleFilterParams = {};
        if (filters.search) serverFilters.search = filters.search;
        if (filters.fuelType) serverFilters.fuelType = filters.fuelType;
        if (filters.transmission) serverFilters.transmission = filters.transmission;
        if (filters.status) serverFilters.status = filters.status;
        if (filters.categoryId !== undefined) serverFilters.categoryId = filters.categoryId;

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
    }, 250);

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
    setFilters({ search: '', fuelType: '', transmission: '', status: '', categoryId: undefined });
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
        {/* Editorial Marketplace Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="micro-tag text-[#777770] block mb-1">
                04 / VEHICLE MARKETPLACE
              </span>
              <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
                FIND YOUR RIDE.
              </h1>
              <p className="text-sm text-[#555550] mt-2 font-mono max-w-xl">
                Curated automotive catalogue. Real-time dynamic pricing quotes, verified fleet diagnostics, and instant checkout.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-[#777770]">
              <span className="inline-block w-2 h-2 bg-[#C7F000] border border-[#111111]" />
              <span>LIVE INVENTORY</span>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingState label="Loading marketplace..." />}>
          <VehicleMarketplaceContent />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}
