import React from 'react';
import Link from 'next/link';
import { Booking, Vehicle } from '@/types';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { Calendar, ArrowRight, Car } from 'lucide-react';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const getDays = (start: string, end: string) => {
  try {
    const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  } catch {
    return 1;
  }
};

export interface BookingCardProps {
  booking: Booking;
  vehicleMap?: Map<number, Vehicle>;
  index?: number;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, vehicleMap, index = 0 }) => {
  const vehicle = vehicleMap?.get(booking.vehicleId);
  const days = getDays(booking.startDate, booking.endDate);
  const itemNumber = String(index + 1).padStart(2, '0');

  return (
    <Link href={`/customer/bookings/${booking.id}`} className="block group">
      <div className="bg-[#FFFFFF] border border-[#111111]/20 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] p-4 sm:p-5 transition-all duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Sequential Index + Vehicle Thumbnail + Info */}
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-display font-black text-xl sm:text-2xl text-[#888880] w-8 shrink-0">
              {itemNumber}
            </span>

            <div className="w-20 h-14 sm:w-28 sm:h-18 bg-[#111111] overflow-hidden shrink-0 border border-[#111111]/20 relative">
              {vehicle ? (
                <VehicleImage
                  vehicle={vehicle}
                  aspectRatio="auto"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  BOOKING #{booking.id}
                </span>
                <BookingStatusBadge status={booking.status} />
                <span className="text-[10px] font-mono text-[#555550] bg-[#FAF8F5] px-1.5 py-0.5 border border-[#111111]/10">
                  {days} {days === 1 ? 'DAY' : 'DAYS'}
                </span>
              </div>

              <h4 className="font-display text-base sm:text-lg font-black text-[#111111] uppercase tracking-tight truncate group-hover:text-[#7657FF] transition-colors">
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : `VEHICLE SPECIMEN #${booking.vehicleId}`}
              </h4>

              <div className="flex items-center gap-2 mt-1 text-xs font-mono text-[#666660]">
                <Calendar className="w-3.5 h-3.5 text-[#888880] shrink-0" />
                <span className="truncate uppercase">
                  {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Amount & Action */}
          <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#111111]/10">
            <div className="text-left sm:text-right">
              <span className="micro-tag text-[#888880] block">
                TOTAL PAYABLE
              </span>
              <span className="font-display text-lg sm:text-xl font-black text-[#111111] tabular-nums">
                {formatINR(booking.totalPrice)}
              </span>
            </div>

            <div className="w-9 h-9 border border-[#111111] bg-[#FAF8F5] group-hover:bg-[#C7F000] group-hover:text-[#111111] flex items-center justify-center text-[#111111] transition-colors shrink-0">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
