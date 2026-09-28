import React from 'react';
import Link from 'next/link';
import { Rental, Vehicle } from '@/types';
import { RentalStatusBadge } from '@/components/ui/StatusBadge';
import { KeyRound, Gauge, Calendar, ArrowRight, Car } from 'lucide-react';

interface RentalSummaryProps {
  rental: Rental;
  vehicle?: Vehicle;
  showDetailLink?: boolean;
}

export const RentalSummary: React.FC<RentalSummaryProps> = ({ rental, vehicle, showDetailLink = true }) => {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Rental #{rental.id}</span>
              <RentalStatusBadge status={rental.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Booking Reference: #{rental.bookingId}</p>
          </div>
        </div>

        {showDetailLink && (
          <Link
            href={`/customer/rentals/${rental.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {vehicle && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <Car className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Reg: {vehicle.registrationNumber} • {vehicle.fuelType} • {vehicle.transmission}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-slate-400 font-medium block flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Start Time
          </span>
          <span className="font-semibold text-slate-700">{rental.startDateTime || '—'}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> End / Return
          </span>
          <span className="font-semibold text-slate-700">{rental.endDateTime || 'In Progress'}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-slate-400 font-medium block flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5" /> Odometer Reading
          </span>
          <span className="font-semibold text-slate-700 tabular-nums">
            {rental.startOdometerKm.toLocaleString()} km
            {rental.endOdometerKm > 0 ? ` $\\to$ ${rental.endOdometerKm.toLocaleString()} km` : ''}
          </span>
          {rental.distanceDrivenKm > 0 && (
            <span className="text-[10px] text-emerald-600 font-bold block">
              ({rental.distanceDrivenKm.toLocaleString()} km driven)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
