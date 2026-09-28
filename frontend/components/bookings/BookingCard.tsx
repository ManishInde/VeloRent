import React from 'react';
import Link from 'next/link';
import { Booking, Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { Calendar, ArrowRight } from 'lucide-react';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export interface BookingCardProps {
  booking: Booking;
  vehicleMap?: Map<number, Vehicle>;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, vehicleMap }) => {
  const vehicle = vehicleMap?.get(booking.vehicleId);

  return (
    <Link href={`/customer/bookings/${booking.id}`}>
      <Card className="hover:border-slate-300 hover:shadow-sm transition-all duration-150 cursor-pointer group">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking #{booking.id}</span>
                <BookingStatusBadge status={booking.status} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${booking.vehicleId}`}
              </h4>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium block">Amount</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">{formatINR(booking.totalPrice)}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
