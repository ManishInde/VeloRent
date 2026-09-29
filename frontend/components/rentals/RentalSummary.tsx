import React from 'react';
import Link from 'next/link';
import { Rental, Vehicle } from '@/types';
import { RentalStatusBadge } from '@/components/ui/StatusBadge';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { Gauge, Calendar, ArrowRight, Car } from 'lucide-react';
import { clsx } from 'clsx';

interface RentalSummaryProps {
  rental: Rental;
  vehicle?: Vehicle;
  showDetailLink?: boolean;
}

export const RentalSummary: React.FC<RentalSummaryProps> = ({ rental, vehicle, showDetailLink = true }) => {
  const isActive = rental.status === 'ACTIVE';

  return (
    <div
      className={clsx(
        'p-5 border transition-all duration-200 overflow-hidden',
        isActive
          ? 'bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_#C7F000]'
          : 'bg-[#FFFFFF] border border-[#111111]/20 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)]'
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Vehicle Image + Core Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-24 h-16 sm:w-28 sm:h-18 bg-[#111111] overflow-hidden shrink-0 border border-[#111111]/20 relative">
            {vehicle ? (
              <VehicleImage
                vehicle={vehicle}
                aspectRatio="auto"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#888880]">
                <Car className="w-6 h-6 stroke-1" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="micro-tag text-[#777770]">
                RENTAL #{rental.id}
              </span>
              <RentalStatusBadge status={rental.status} />
              {isActive ? (
                <span className="font-display text-[9px] font-black uppercase tracking-wider bg-[#C7F000] text-[#111111] px-2 py-0.5 border border-[#111111]">
                  CURRENT RIDE — ON THE ROAD
                </span>
              ) : (
                <span className="font-display text-[9px] font-bold uppercase tracking-wider bg-[#FAF8F5] text-[#777770] px-2 py-0.5 border border-[#111111]/15">
                  BACK IN THE GARAGE
                </span>
              )}
            </div>

            <h4 className="font-display text-base sm:text-lg font-black text-[#111111] uppercase tracking-tight truncate">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : `BOOKING REFERENCE #${rental.bookingId}`}
            </h4>

            {vehicle && (
              <p className="text-[11px] text-[#666660] font-mono mt-0.5 uppercase">
                REG: {vehicle.registrationNumber} • {vehicle.fuelType} • {vehicle.transmission}
              </p>
            )}
          </div>
        </div>

        {/* Telemetry / Dates */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#111111]/10">
          <div>
            <span className="text-[#888880] text-[9px] uppercase block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> CHECKOUT
            </span>
            <span className="font-bold text-[#111111] block mt-0.5 truncate max-w-[130px]">
              {rental.startDateTime || '—'}
            </span>
          </div>

          <div>
            <span className="text-[#888880] text-[9px] uppercase block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> RETURN
            </span>
            <span className="font-bold text-[#111111] block mt-0.5 truncate max-w-[130px]">
              {rental.endDateTime || (isActive ? 'ON ROAD' : '—')}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[#888880] text-[9px] uppercase block flex items-center gap-1">
              <Gauge className="w-3 h-3" /> ODOMETER
            </span>
            <span className="font-bold text-[#111111] tabular-nums block mt-0.5">
              {rental.startOdometerKm.toLocaleString('en-IN')} KM
              {rental.endOdometerKm > 0 ? ` → ${rental.endOdometerKm.toLocaleString('en-IN')} KM` : ''}
            </span>
            {rental.distanceDrivenKm > 0 && (
              <span className="text-[10px] text-[#111111] bg-[#C7F000] px-1 font-bold inline-block mt-0.5">
                +{rental.distanceDrivenKm.toLocaleString('en-IN')} KM DRIVEN
              </span>
            )}
          </div>
        </div>

        {/* Action Link */}
        {showDetailLink && (
          <div className="shrink-0 w-full md:w-auto flex justify-end">
            <Link
              href={`/customer/rentals/${rental.id}`}
              className={clsx(
                'inline-flex items-center justify-center gap-1.5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all w-full md:w-auto border border-[#111111]',
                isActive
                  ? 'bg-[#C7F000] text-[#111111] hover:bg-[#B5DC00] shadow-[2px_2px_0px_#111111]'
                  : 'bg-[#FAF8F5] text-[#111111] hover:bg-[#111111] hover:text-[#F4F1EA]'
              )}
            >
              <span>{isActive ? 'MANAGE TRIP' : 'INSPECT RIDE'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
