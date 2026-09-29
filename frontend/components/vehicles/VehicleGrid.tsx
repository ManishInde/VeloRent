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
        <div className="md:col-span-2 border border-[#111111]/15 bg-[#FFFFFF] overflow-hidden flex flex-col md:flex-row">
          <Skeleton className="h-64 md:h-auto md:w-3/5 rounded-none" />
          <div className="p-6 md:w-2/5 space-y-4">
            <Skeleton className="h-4 w-24 rounded-none" />
            <Skeleton className="h-8 w-3/4 rounded-none" />
            <Skeleton className="h-16 w-full rounded-none" />
            <Skeleton className="h-10 w-full rounded-none" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-[#111111]/15 bg-[#FFFFFF] overflow-hidden">
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-20 rounded-none" />
              <Skeleton className="h-6 w-3/4 rounded-none" />
              <Skeleton className="h-8 w-full rounded-none" />
              <div className="pt-3 border-t border-[#111111]/10 flex justify-between items-center">
                <Skeleton className="h-6 w-20 rounded-none" />
                <Skeleton className="h-8 w-24 rounded-none" />
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
        icon={<Car className="w-10 h-10 text-[#888880]" />}
        title="NO VEHICLES FOUND ON THE LOT"
        description="No fleet units match your current search and filter criteria. Try adjusting your parameters or resetting filters."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle, idx) => {
        // Deliberate rhythm: The first vehicle (or every 7th) is featured spanning 2 columns
        const isFeatured = idx === 0 || (idx > 0 && idx % 7 === 0);
        return (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            index={idx}
            variant={isFeatured ? 'featured' : 'standard'}
          />
        );
      })}
    </div>
  );
};
