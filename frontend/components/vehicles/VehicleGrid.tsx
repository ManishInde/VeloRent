import React from 'react';
import { Vehicle } from '@/types';
import { VehicleCard } from './VehicleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Car } from 'lucide-react';

export interface VehicleGridProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
}

export const VehicleGrid: React.FC<VehicleGridProps> = ({
  vehicles,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <div className="grid grid-cols-3 gap-1.5">
                <Skeleton className="h-7" />
                <Skeleton className="h-7" />
                <Skeleton className="h-7" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={<Car className="w-10 h-10 text-slate-400" />}
        title="No vehicles found"
        description="No vehicles match your current search and filter criteria. Try adjusting your filters or clearing the search."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};
