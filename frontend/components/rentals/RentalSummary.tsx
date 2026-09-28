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
        'p-5 bg-white rounded-2xl border transition-all duration-200 overflow-hidden',
        isActive
          ? 'border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20 bg-gradient-to-r from-emerald-50/20 via-white to-white'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Vehicle Image + Core Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200/80 shadow-2xs relative">
            {vehicle ? (
              <VehicleImage
                vehicle={vehicle}
                aspectRatio="4:3"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Car className="w-6 h-6 stroke-1" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Rental #{rental.id}
              </span>
              <RentalStatusBadge status={rental.status} />
              {isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active On Road
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : `Booking Reference #${rental.bookingId}`}
            </h4>

            {vehicle && (
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {vehicle.registrationNumber} • {vehicle.fuelType} • {vehicle.transmission}
              </p>
            )}
          </div>
        </div>

        {/* Telemetry / Dates */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div>
            <span className="text-slate-400 font-medium block flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" /> Start Time
            </span>
            <span className="font-semibold text-slate-800 block mt-0.5 truncate max-w-[140px]">
              {rental.startDateTime || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" /> Return
            </span>
            <span className="font-semibold text-slate-800 block mt-0.5 truncate max-w-[140px]">
              {rental.endDateTime || (isActive ? 'In Progress' : '—')}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 font-medium block flex items-center gap-1 text-[11px]">
              <Gauge className="w-3 h-3 text-slate-400" /> Odometer
            </span>
            <span className="font-semibold text-slate-800 tabular-nums block mt-0.5">
              {rental.startOdometerKm.toLocaleString('en-IN')} km
              {rental.endOdometerKm > 0 ? ` → ${rental.endOdometerKm.toLocaleString('en-IN')} km` : ''}
            </span>
            {rental.distanceDrivenKm > 0 && (
              <span className="text-[10px] text-emerald-600 font-bold block">
                +{rental.distanceDrivenKm.toLocaleString('en-IN')} km
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
                'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all w-full md:w-auto',
                isActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              <span>{isActive ? 'Manage Rental' : 'View Summary'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
