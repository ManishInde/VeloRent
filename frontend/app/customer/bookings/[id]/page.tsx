'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { getBookingById, cancelBooking } from '@/lib/api/bookings';
import { getVehicleById } from '@/lib/api/vehicles';
import { Booking, Vehicle } from '@/types';
import { Car, ArrowLeft, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return d; }
};

const getDurationDays = (start: string, end: string) => {
  try {
    const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return d > 0 ? d : 0;
  } catch { return 0; }
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const b = await getBookingById(bookingId);
        if (!mounted) return;
        setBooking(b);
        getVehicleById(b.vehicleId)
          .then(v => { if (mounted) setVehicle(v); })
          .catch(() => {});
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Booking not found.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [bookingId]);

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      const updated = await cancelBooking(bookingId, 'Cancelled by customer via web portal');
      setBooking(updated);
      setShowCancelModal(false);
      toast.success('Booking cancelled successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel booking.');
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AppShell><LoadingState label="Loading booking details..." /></AppShell>
    </ProtectedRoute>
  );

  if (error || !booking) return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AppShell><ErrorState title="Booking not found" message={error || 'This booking does not exist.'} onRetry={() => router.back()} /></AppShell>
    </ProtectedRoute>
  );

  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'PENDING';
  const duration = getDurationDays(booking.startDate, booking.endDate);

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AppShell>
        <PageHeader
          title={`Booking #${booking.id}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/customer' },
            { label: 'Bookings', href: '/customer/bookings' },
            { label: `#${booking.id}` },
          ]}
          action={
            <Link href="/customer/bookings">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                All Bookings
              </Button>
            </Link>
          }
        />

        {booking.status === 'CANCELLED' && (
          <Alert variant="error" title="This booking has been cancelled" className="mb-6">
            This reservation is no longer active.
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Booking Summary
                  </CardTitle>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Booking ID', value: `#${booking.id}` },
                    { label: 'Status', value: booking.status },
                    { label: 'Pickup Date', value: formatDate(booking.startDate) },
                    { label: 'Return Date', value: formatDate(booking.endDate) },
                    { label: 'Duration', value: `${duration} day${duration !== 1 ? 's' : ''}` },
                    { label: 'Total Amount', value: formatINR(booking.totalPrice), highlight: true },
                  ].map((row) => (
                    <div key={row.label} className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{row.label}</span>
                      <span className={`text-sm font-semibold mt-0.5 ${row.highlight ? 'text-lg text-slate-900' : 'text-slate-800'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {booking.createdAt && (
                  <p className="mt-4 text-[11px] text-slate-400">
                    Created: {formatDate(booking.createdAt)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                {vehicle ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <Car className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{vehicle.registrationNumber} — {vehicle.type}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                        <span>{vehicle.fuelType}</span>
                        <span className="text-slate-300">|</span>
                        <span>{vehicle.transmission}</span>
                        <span className="text-slate-300">|</span>
                        <span>{vehicle.seats} seats</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Vehicle #{booking.vehicleId}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="text-center pb-3 border-b border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Total Amount</span>
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">{formatINR(booking.totalPrice)}</div>
                </div>

                {canCancel && (
                  <Button
                    variant="danger"
                    className="w-full"
                    size="sm"
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Booking
                  </Button>
                )}

                <Link href="/customer/vehicles" className="block">
                  <Button variant="outline" className="w-full" size="sm">
                    Browse More Vehicles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => { if (!isCancelling) setShowCancelModal(false); }}
          title="Cancel this booking?"
          description="This action cannot be undone."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Cancelling this booking will release the vehicle reservation. You may rebook if the vehicle remains available.</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
                Keep Booking
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancel} isLoading={isCancelling}>
                Cancel Booking
              </Button>
            </div>
          </div>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
