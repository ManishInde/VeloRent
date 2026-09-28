'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { getBookingById, cancelBooking } from '@/lib/api/bookings';
import { getVehicleById } from '@/lib/api/vehicles';
import { Booking, Vehicle } from '@/types';
import { Calendar, Search, Car, AlertCircle, Ban, CheckCircle2 } from 'lucide-react';

export default function AdminBookingsPage() {
  const [searchId, setSearchId] = useState<string>('1');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const id = parseInt(searchId, 10);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid numeric Booking ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    setBooking(null);
    setVehicle(null);

    try {
      const b = await getBookingById(id);
      setBooking(b);
      if (b.vehicleId) {
        getVehicleById(b.vehicleId).then(setVehicle).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Booking with ID #${id} not found.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!window.confirm(`Are you sure you want to cancel Booking #${booking.id}?`)) return;

    setIsCancelling(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
      setSuccessMsg(`Booking #${booking.id} has been cancelled.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="Booking Reservations Control"
          description="Inspect active booking reservations, verify vehicle allocations, and process cancellations."
        />

        {/* Search / Lookup Form */}
        <Card className="mb-8 max-w-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" /> Lookup Booking Reservation
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter Booking ID (e.g. 1)"
                  type="number"
                  min={1}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Search className="w-4 h-4" />}>
                Inspect Booking
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-center gap-2 max-w-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Booking Details Card */}
        {booking && (
          <div className="max-w-3xl space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Reservation Details #{booking.id}
                </CardTitle>
                <BookingStatusBadge status={booking.status} />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Customer ID</span>
                    <p className="font-bold text-slate-900">#{booking.customerId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Vehicle ID</span>
                    <p className="font-bold text-slate-900">#{booking.vehicleId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Quoted Price</span>
                    <p className="font-bold text-slate-900 tabular-nums">₹{booking.totalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Start Date</span>
                    <p className="font-semibold text-slate-800">{booking.startDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">End Date</span>
                    <p className="font-semibold text-slate-800">{booking.endDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Created At</span>
                    <p className="font-mono text-slate-600">{booking.createdAt || 'Recent'}</p>
                  </div>
                </div>

                {vehicle && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3 text-xs">
                    <Car className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {vehicle.brand} {vehicle.model}
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Reg: {vehicle.registrationNumber} • {vehicle.fuelType} • Rate: ₹{vehicle.baseRentalRate}/day
                      </p>
                    </div>
                  </div>
                )}

                {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isCancelling}
                      leftIcon={<Ban className="w-4 h-4" />}
                      onClick={handleCancelBooking}
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
