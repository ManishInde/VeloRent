import React from 'react';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export interface VehicleCardProps {
  vehicle: Vehicle;
  variant?: 'featured' | 'standard' | 'compact';
  index?: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  variant = 'standard',
  index = 0,
}) => {
  const isAvailable = vehicle.status === 'AVAILABLE';
  const itemIndex = String(index + 1).padStart(2, '0');

  // Featured variant: Asymmetric horizontal editorial object (occupies 2 columns on desktop)
  if (variant === 'featured') {
    return (
      <div className="md:col-span-2 group bg-[#FFFFFF] border border-[#111111]/25 hover:border-[#111111] transition-all duration-200 shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] flex flex-col md:flex-row overflow-hidden">
        {/* Left: Large Photo Area */}
        <div className="relative md:w-3/5 aspect-[16/10] md:aspect-auto min-h-[260px] bg-[#111111] overflow-hidden">
          <VehicleImage
            vehicle={vehicle}
            aspectRatio="auto"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            priority={index === 0}
          />
          {/* Top badges */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="bg-[#C7F000] text-[#111111] border border-[#111111] text-[9px] font-display font-extrabold px-2 py-0.5 uppercase tracking-widest">
              FEATURED LOT
            </span>
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          <div className="absolute top-3 right-3 z-10 bg-[#111111] text-white text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider">
            {vehicle.type}
          </div>

          {vehicle.healthScore > 0 && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-[#111111]/90 px-2.5 py-1 text-white text-[10px] font-mono border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C7F000]" />
              <span>HEALTH {vehicle.healthScore}%</span>
            </div>
          )}
        </div>

        {/* Right: Editorial Typography & Actions */}
        <div className="p-6 md:w-2/5 flex flex-col justify-between bg-[#FFFFFF] border-t md:border-t-0 md:border-l border-[#111111]/10">
          <div>
            <div className="flex items-center justify-between text-[#888880] text-[10px] font-mono mb-1">
              <span>LOT #{itemIndex}</span>
              <span>YEAR {vehicle.purchaseYear}</span>
            </div>

            <span className="micro-tag text-[#555550] block mb-1">
              {vehicle.brand}
            </span>

            <h3 className="font-display text-2xl font-black text-[#111111] uppercase tracking-tight leading-tight group-hover:text-[#111111]">
              {vehicle.model}
            </h3>

            <p className="text-xs text-[#777770] font-mono mt-1">
              REG: {vehicle.registrationNumber}
            </p>

            {/* Spec grid */}
            <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#111111]/10 py-3 text-xs">
              <div>
                <span className="text-[9px] font-mono uppercase text-[#888880] block">FUEL</span>
                <span className="font-display font-bold text-[#111111] uppercase text-[11px] mt-0.5 block truncate">
                  {vehicle.fuelType}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-[#888880] block">GEAR</span>
                <span className="font-display font-bold text-[#111111] uppercase text-[11px] mt-0.5 block truncate">
                  {vehicle.transmission}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-[#888880] block">SEATS</span>
                <span className="font-display font-bold text-[#111111] uppercase text-[11px] mt-0.5 block truncate">
                  {vehicle.seats} PERS
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#888880] uppercase tracking-wider block">
                DAILY RATE
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-black text-[#111111] tracking-tight">
                  {formatCurrency(vehicle.baseRentalRate)}
                </span>
                <span className="text-[11px] font-mono text-[#777770]">/day</span>
              </div>
            </div>

            <Link href={`/customer/vehicles/${vehicle.id}`}>
              <Button
                variant={isAvailable ? 'primary' : 'outline'}
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
              >
                {isAvailable ? 'VIEW VEHICLE' : 'INSPECT'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Standard Editorial Card
  return (
    <div className="group bg-[#FFFFFF] border border-[#111111]/20 hover:border-[#111111] transition-all duration-200 shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] flex flex-col justify-between overflow-hidden">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] w-full bg-[#111111] overflow-hidden">
          <VehicleImage
            vehicle={vehicle}
            aspectRatio="auto"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          <div className="absolute top-2.5 right-2.5 z-10 bg-[#111111] text-white text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider">
            {vehicle.type}
          </div>

          {vehicle.healthScore > 0 && (
            <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 bg-[#111111]/90 px-2 py-0.5 text-white text-[9px] font-mono border border-white/10">
              <ShieldCheck className="w-3 h-3 text-[#C7F000]" />
              <span>{vehicle.healthScore}%</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#888880] text-[9px] font-mono mb-1">
            <span>LOT #{itemIndex}</span>
            <span>{vehicle.purchaseYear}</span>
          </div>

          <span className="micro-tag text-[#777770] block">
            {vehicle.brand}
          </span>

          <h4 className="font-display text-lg font-black text-[#111111] uppercase tracking-tight mt-0.5 line-clamp-1">
            {vehicle.model}
          </h4>

          {/* Micro Specs */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 py-2.5 border-y border-[#111111]/10 text-[10px] font-mono text-[#555550]">
            <div className="truncate">
              <span className="text-[#999990] block text-[8px]">FUEL</span>
              <span className="font-bold text-[#111111]">{vehicle.fuelType}</span>
            </div>
            <div className="truncate">
              <span className="text-[#999990] block text-[8px]">GEAR</span>
              <span className="font-bold text-[#111111]">{vehicle.transmission}</span>
            </div>
            <div className="truncate">
              <span className="text-[#999990] block text-[8px]">SEATS</span>
              <span className="font-bold text-[#111111]">{vehicle.seats}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Action */}
      <div className="p-4 sm:p-5 pt-0 border-t border-[#111111]/10 flex items-baseline justify-between mt-2">
        <div>
          <span className="text-[9px] font-mono text-[#888880] uppercase block">DAILY RATE</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-lg font-black text-[#111111] tracking-tight">
              {formatCurrency(vehicle.baseRentalRate)}
            </span>
            <span className="text-[10px] font-mono text-[#777770]">/d</span>
          </div>
        </div>

        <Link href={`/customer/vehicles/${vehicle.id}`}>
          <Button
            size="sm"
            variant={isAvailable ? 'primary' : 'outline'}
            rightIcon={<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />}
          >
            {isAvailable ? 'DETAILS' : 'VIEW'}
          </Button>
        </Link>
      </div>
    </div>
  );
};
