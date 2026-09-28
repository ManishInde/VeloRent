'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import { getBookingById, cancelBooking } from '@/lib/api/bookings';
import { getVehicleById } from '@/lib/api/vehicles';
import { getCustomerRentals, startRental } from '@/lib/api/rentals';
import { Booking, Vehicle, Rental, Payment } from '@/types';
import {
  Car,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
};

const getDurationDays = (start: string, end: string) => {
  try {
    const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return d > 0 ? d : 0;
  } catch {
    return 0;
  }
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [associatedRental, setAssociatedRental] = useState<Rental | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [targetRentalId, setTargetRentalId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const b = await getBookingById(bookingId);
        if (!mounted) return;
        setBooking(b);

        // Fetch vehicle information
        getVehicleById(b.vehicleId)
          .then((v) => {
            if (mounted) setVehicle(v);
          })
          .catch(() => {});

        // Fetch user rentals to check if a rental is already linked to this booking
        if (user) {
          getCustomerRentals(user.id)
            .then((rList) => {
              if (!mounted) return;
              const r = rList.find((item) => item.bookingId === bookingId);
              if (r) {
                setAssociatedRental(r);
                setTargetRentalId(r.id);
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Booking not found.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [bookingId, user]);

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

  const handleProceedToPayment = async () => {
    if (!booking) return;
    setIsPreparingPayment(true);
    try {
      let rId = targetRentalId;

      // If no rental has been created for this booking yet, call startRental to get authoritative rental ID
      if (!rId) {
        const newRental = await startRental(booking.id, vehicle?.odometerKm || 0);
        setAssociatedRental(newRental);
        rId = newRental.id;
        setTargetRentalId(rId);
      }

      setIsPaymentModalOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to initialize payment session.');
    } finally {
      setIsPreparingPayment(false);
    }
  };

  const handlePaymentSuccess = (completedPayment: Payment) => {
    setPayment(completedPayment);
    toast.success(`Payment #${completedPayment.id} processed successfully via ${completedPayment.method}!`);
    // Refresh booking details
    getBookingById(bookingId)
      .then(setBooking)
      .catch(() => {});
  };

  if (isLoading)
    return (
      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
        <AppShell>
          <LoadingState label="Loading booking confirmation details..." />
        </AppShell>
      </ProtectedRoute>
    );

  if (error || !booking)
    return (
      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
        <AppShell>
          <ErrorState
            title="Booking not found"
            message={error || 'This booking does not exist.'}
            onRetry={() => router.back()}
          />
        </AppShell>
      </ProtectedRoute>
    );

  const canCancel = (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && !payment;
  const duration = getDurationDays(booking.startDate, booking.endDate);
  const isPaymentCompleted = payment?.status === 'COMPLETED';

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AppShell>
        <PageHeader
          title={`Booking Confirmation #${booking.id}`}
          description="Review reservation details, vehicle allocation, and process simulated rental payment."
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

        {/* Rental Lifecycle Timeline */}
        <div className="mb-6 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rental Journey Lifecycle</span>
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={isPaymentCompleted ? 'COMPLETED' : 'PENDING'} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              {
                step: '1',
                label: 'Booking Created',
                status: 'DONE',
                desc: formatDate(booking.createdAt || booking.startDate),
              },
              {
                step: '2',
                label: 'Confirmed',
                status: booking.status === 'CANCELLED' ? 'CANCELLED' : 'DONE',
                desc: booking.status === 'CANCELLED' ? 'Reservation Cancelled' : 'Fleet unit reserved',
              },
              {
                step: '3',
                label: 'Payment',
                status: isPaymentCompleted ? 'DONE' : booking.status === 'CANCELLED' ? 'SKIPPED' : 'CURRENT',
                desc: isPaymentCompleted ? 'Settlement verified' : 'Simulated payment due',
              },
              {
                step: '4',
                label: 'Vehicle Handover',
                status: associatedRental?.status === 'ACTIVE' ? 'CURRENT' : associatedRental?.status === 'COMPLETED' ? 'DONE' : 'UPCOMING',
                desc: associatedRental?.status === 'ACTIVE' ? 'Vehicle in possession' : 'Odometer check at pickup',
              },
              {
                step: '5',
                label: 'Trip Completed',
                status: associatedRental?.status === 'COMPLETED' ? 'DONE' : 'UPCOMING',
                desc: associatedRental?.status === 'COMPLETED' ? 'Rental closed & audited' : 'Return scheduled',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  item.status === 'DONE'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : item.status === 'CURRENT'
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 text-blue-950'
                    : item.status === 'CANCELLED'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200/80 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-[10px] tracking-wider uppercase">
                      Stage {item.step}
                    </span>
                    {item.status === 'DONE' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : item.status === 'CURRENT' ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    ) : null}
                  </div>
                  <strong className="block font-bold text-xs">{item.label}</strong>
                </div>
                <p className="text-[10px] opacity-80 mt-1 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Success Banner */}
        {isPaymentCompleted && (
          <Alert variant="success" title="Payment Settled Successfully" className="mb-6">
            Payment of <strong>{formatINR(payment.amount)}</strong> confirmed via {payment.method}. Transaction Reference: <span className="font-mono">{payment.transactionId || `TXN-PAY-${payment.id}`}</span>.
          </Alert>
        )}

        {/* Prominent Pending Payment Notice */}
        {!isPaymentCompleted && booking.status !== 'CANCELLED' && (
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
                  Payment Pending
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Authorization required for Booking #{booking.id}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Complete simulated payment to authorize vehicle key collection at the VeloRent hub.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shrink-0 py-2.5 px-5"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={handleProceedToPayment}
              isLoading={isPreparingPayment}
            >
              Proceed to Payment ({formatINR(booking.totalPrice)})
            </Button>
          </div>
        )}

        {booking.status === 'CANCELLED' && (
          <Alert variant="error" title="This booking has been cancelled" className="mb-6">
            This vehicle reservation is no longer active.
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Confirmation Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Reservation Summary
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Booking Reference', value: `#${booking.id}` },
                    { label: 'Booking Status', value: booking.status },
                    { label: 'Payment Status', value: isPaymentCompleted ? 'COMPLETED' : 'PENDING' },
                    { label: 'Pickup Date', value: formatDate(booking.startDate) },
                    { label: 'Return Date', value: formatDate(booking.endDate) },
                    { label: 'Rental Duration', value: `${duration} day${duration !== 1 ? 's' : ''}` },
                    { label: 'Total Payable Amount', value: formatINR(booking.totalPrice), highlight: true },
                  ].map((row) => (
                    <div key={row.label} className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                        {row.label}
                      </span>
                      <span
                        className={`text-sm font-semibold mt-0.5 ${
                          row.highlight ? 'text-lg text-slate-900 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                {associatedRental && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Linked Check-out Record: <strong>Rental #{associatedRental.id}</strong> ({associatedRental.status})</span>
                    <Link href={`/customer/rentals/${associatedRental.id}`} className="text-blue-600 font-semibold hover:underline">
                      View Rental &rarr;
                    </Link>
                  </div>
                )}
                {booking.createdAt && (
                  <p className="mt-4 text-[11px] text-slate-400">Created At: {formatDate(booking.createdAt)}</p>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Details Card with VehicleImage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                {vehicle ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200/80 shadow-2xs relative">
                      <VehicleImage
                        vehicle={vehicle}
                        aspectRatio="16:9"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-slate-900">
                        {vehicle.brand} {vehicle.model}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reg: <span className="font-mono font-semibold text-slate-700">{vehicle.registrationNumber}</span> — {vehicle.type}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {vehicle.fuelType}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {vehicle.transmission}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {vehicle.seats} Seats
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                          {vehicle.healthScore} Health
                        </span>
                        <span className="text-xs font-bold text-slate-900 ml-auto">
                          {formatINR(vehicle.baseRentalRate)}/day
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Vehicle #{booking.vehicleId}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="text-center pb-3 border-b border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium block">
                    Total Quoted Amount
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                    {formatINR(booking.totalPrice)}
                  </div>
                </div>

                {!isPaymentCompleted && booking.status !== 'CANCELLED' && (
                  <Button
                    className="w-full"
                    size="sm"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    onClick={handleProceedToPayment}
                    isLoading={isPreparingPayment}
                  >
                    Proceed to Payment
                  </Button>
                )}

                {isPaymentCompleted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment completed. Your reservation is fully confirmed.</span>
                  </div>
                )}

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
          onClose={() => {
            if (!isCancelling) setShowCancelModal(false);
          }}
          title="Cancel this booking?"
          description="This action will release the vehicle reservation."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Cancelling this booking will release the vehicle reservation. You may rebook if the vehicle remains
                available.
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancel} isLoading={isCancelling}>
                Cancel Booking
              </Button>
            </div>
          </div>
        </Modal>

        {/* Simulated Payment Modal */}
        {targetRentalId && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            rentalId={targetRentalId}
            amount={booking.totalPrice}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
