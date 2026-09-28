import React from 'react';
import Link from 'next/link';
import { Booking, Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
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
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, vehicleMap }) => {
  const vehicle = vehicleMap?.get(booking.vehicleId);
  const days = getDays(booking.startDate, booking.endDate);

  return (
    <Link href={`/customer/bookings/${booking.id}`} className="block">
      <Card className="hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Thumbnail & Info */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-2xs relative">
                {vehicle ? (
                  <VehicleImage
                    vehicle={vehicle}
                    aspectRatio="4:3"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                    <Car className="w-6 h-6 stroke-1" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Booking #{booking.id}
                  </span>
                  <BookingStatusBadge status={booking.status} />
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {days} {days === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${booking.vehicleId}`}
                </h4>

                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Amount & CTA */}
            <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Total Payable
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatINR(booking.totalPrice)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
