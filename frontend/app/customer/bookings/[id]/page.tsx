'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import { getBookingById, cancelBooking } from '@/lib/api/bookings';
import { getVehicleById } from '@/lib/api/vehicles';
import { getCustomerRentals, startRental } from '@/lib/api/rentals';
import { getRentalPayments } from '@/lib/api/payments';
import { Booking, Vehicle, Rental, Payment } from '@/types';
import {
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
            .then(async (rList) => {
              if (!mounted) return;
              const r = rList.find((item) => item.bookingId === bookingId);
              if (r) {
                setAssociatedRental(r);
                setTargetRentalId(r.id);
                try {
                  const payments = await getRentalPayments(r.id);
                  if (!mounted) return;
                  const completed = payments.find(
                    (p) =>
                      p.status === 'COMPLETED' &&
                      (p.type === 'BASE_RENT' || p.type === 'RENTAL_FEE')
                  );
                  if (completed) setPayment(completed);
                } catch {
                  // Fall back gracefully
                }
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
          <LoadingState label="Loading booking archive record..." />
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
  const isPaymentCompleted = payment?.status === 'COMPLETED' || booking.status === 'COMPLETED';

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AppShell>
        {/* Navigation Track */}
        <div className="flex items-center justify-between border-b border-[#111111]/15 pb-3 mb-6">
          <Link
            href="/customer/bookings"
            className="font-display text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#7657FF] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 03 / BACK TO BOOKINGS LEDGER
          </Link>
          <span className="font-mono text-xs text-[#888880]">
            TRANSACTION REFERENCE #{String(booking.id).padStart(4, '0')}
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="micro-tag text-[#777770] block mb-1">
              RESERVATION CERTIFICATE
            </span>
            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
              BOOKING #{booking.id}
            </h1>
            <p className="font-mono text-xs text-[#666660] mt-1.5 uppercase">
              CONFIRMED TRIP RECORD • DATES: {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={isPaymentCompleted ? 'COMPLETED' : 'PENDING'} />
          </div>
        </div>

        {/* Rental Journey Timeline Strip */}
        <div className="mb-8 p-5 bg-[#FFFFFF] border border-[#111111]/25 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
          <span className="micro-tag text-[#777770] block mb-3">
            01 / RENTAL JOURNEY LIFECYCLE
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              {
                step: '01',
                label: 'BOOKING CREATED',
                status: 'DONE',
                desc: formatDate(booking.createdAt || booking.startDate),
              },
              {
                step: '02',
                label: 'RESERVED',
                status: booking.status === 'CANCELLED' ? 'CANCELLED' : 'DONE',
                desc: booking.status === 'CANCELLED' ? 'Cancelled' : 'Fleet unit locked',
              },
              {
                step: '03',
                label: 'PAYMENT',
                status: isPaymentCompleted ? 'DONE' : booking.status === 'CANCELLED' ? 'SKIPPED' : 'CURRENT',
                desc: isPaymentCompleted ? 'Settlement verified' : 'Simulated payment due',
              },
              {
                step: '04',
                label: 'KEY HANDOVER',
                status: associatedRental?.status === 'ACTIVE' ? 'CURRENT' : associatedRental?.status === 'COMPLETED' ? 'DONE' : 'UPCOMING',
                desc: associatedRental?.status === 'ACTIVE' ? 'In possession' : 'Odometer check',
              },
              {
                step: '05',
                label: 'TRIP CLOSED',
                status: associatedRental?.status === 'COMPLETED' ? 'DONE' : 'UPCOMING',
                desc: associatedRental?.status === 'COMPLETED' ? 'Returned & audited' : 'Return drop-off',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-3 border font-mono text-xs flex flex-col justify-between ${
                  item.status === 'DONE'
                    ? 'bg-[#E8F7B5] border-[#111111] text-[#111111]'
                    : item.status === 'CURRENT'
                    ? 'bg-[#111111] border-[#111111] text-[#C7F000]'
                    : item.status === 'CANCELLED'
                    ? 'bg-[#FFF0ED] border-[#FF654A] text-[#C4381F]'
                    : 'bg-[#FAF8F5] border-[#111111]/15 text-[#777770]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-[9px] uppercase tracking-widest opacity-80">
                      STAGE {item.step}
                    </span>
                    {item.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />}
                  </div>
                  <strong className="block font-bold text-[11px] uppercase tracking-wider">{item.label}</strong>
                </div>
                <p className="text-[10px] opacity-75 mt-1 leading-tight truncate">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prominent Payment Banner if Pending */}
        {!isPaymentCompleted && booking.status !== 'CANCELLED' && (
          <div className="mb-8 p-6 bg-[#111111] text-[#F4F1EA] border-2 border-[#111111] shadow-[4px_4px_0px_#C7F000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C7F000] text-[#111111] flex items-center justify-center shrink-0 border border-[#111111]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="micro-tag text-[#C7F000] block mb-0.5">
                  PAYMENT SETTLEMENT PENDING
                </span>
                <h4 className="font-display text-lg font-black uppercase text-white tracking-tight">
                  AUTHORIZE BOOKING #{booking.id}
                </h4>
                <p className="font-mono text-xs text-[#AAA8A0] mt-0.5">
                  Complete simulated payment to authorize vehicle key collection at the VeloRent hub.
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-[#C7F000] text-[#111111] hover:bg-[#B5DC00] font-black shrink-0 px-6"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={handleProceedToPayment}
              isLoading={isPreparingPayment}
            >
              PROCEED TO PAYMENT ({formatINR(booking.totalPrice)})
            </Button>
          </div>
        )}

        {/* Payment Success Banner */}
        {isPaymentCompleted && (
          <div className="mb-8 p-5 bg-[#C7F000] border-2 border-[#111111] text-[#111111] flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div className="font-mono text-xs">
              <strong className="font-display font-black text-sm uppercase block">
                PAYMENT CONFIRMED ({formatINR(payment ? payment.amount : booking.totalPrice)})
              </strong>
              <span>
                Transaction Ref: {payment ? (payment.transactionId || `TXN-PAY-${payment.id}`) : `CONFIRMED-#${booking.id}`} via {payment ? payment.method : 'CARD'}. Fleet allocation secured.
              </span>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Summary Ledger (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
              <span className="micro-tag text-[#777770] block mb-4">
                02 / RESERVATION LEDGER SUMMARY
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                {[
                  { label: 'BOOKING REFERENCE', value: `#${booking.id}` },
                  { label: 'BOOKING STATUS', value: booking.status },
                  { label: 'PAYMENT STATUS', value: isPaymentCompleted ? 'COMPLETED' : 'PENDING' },
                  { label: 'PICKUP DATE', value: formatDate(booking.startDate) },
                  { label: 'RETURN DATE', value: formatDate(booking.endDate) },
                  { label: 'RENTAL DURATION', value: `${duration} DAY${duration !== 1 ? 'S' : ''}` },
                ].map((row) => (
                  <div key={row.label} className="p-3 bg-[#FAF8F5] border border-[#111111]/10">
                    <span className="text-[9px] text-[#888880] uppercase block">{row.label}</span>
                    <span className="font-bold text-[#111111] text-xs mt-0.5 block">{row.value}</span>
                  </div>
                ))}
              </div>

              {associatedRental && (
                <div className="mt-4 pt-3 border-t border-[#111111]/10 flex items-center justify-between text-xs font-mono">
                  <span>Linked Rental Check-out: <strong>#{associatedRental.id}</strong> ({associatedRental.status})</span>
                  <Link href={`/customer/rentals/${associatedRental.id}`} className="font-bold text-[#111111] hover:underline">
                    VIEW RENTAL &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Vehicle Details Card */}
            <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
              <span className="micro-tag text-[#777770] block mb-4">
                03 / ALLOCATED VEHICLE SPECIMEN
              </span>

              {vehicle ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-full sm:w-44 h-28 bg-[#111111] overflow-hidden shrink-0 border border-[#111111]/20 relative">
                    <VehicleImage vehicle={vehicle} aspectRatio="16:9" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="micro-tag text-[#888880]">{vehicle.brand}</span>
                    <h4 className="font-display text-xl font-black uppercase text-[#111111] tracking-tight">
                      {vehicle.model}
                    </h4>
                    <p className="text-xs font-mono text-[#666660] mt-0.5">
                      REG: {vehicle.registrationNumber} • {vehicle.type}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3 font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#111111]/15 text-[#111111]">
                        {vehicle.fuelType}
                      </span>
                      <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#111111]/15 text-[#111111]">
                        {vehicle.transmission}
                      </span>
                      <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#111111]/15 text-[#111111]">
                        {vehicle.seats} SEATS
                      </span>
                      <span className="px-2 py-0.5 bg-[#C7F000] border border-[#111111] text-[#111111] font-bold">
                        {vehicle.healthScore}% HEALTH
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono text-[#777770]">Vehicle Specimen #{booking.vehicleId}</p>
              )}
            </div>
          </div>

          {/* Right Column: Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] space-y-4">
              <span className="micro-tag text-[#777770] block">TOTAL QUOTED AMOUNT</span>
              <div className="font-display text-4xl font-black text-[#111111] tabular-nums">
                {formatINR(booking.totalPrice)}
              </div>

              {!isPaymentCompleted && booking.status !== 'CANCELLED' && (
                <Button
                  className="w-full py-3"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  onClick={handleProceedToPayment}
                  isLoading={isPreparingPayment}
                >
                  PROCEED TO PAYMENT
                </Button>
              )}

              {isPaymentCompleted && (
                <div className="p-3 bg-[#E8F7B5] border border-[#111111] text-xs font-mono text-[#111111] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#111111] shrink-0" />
                  <span>Payment completed. Your reservation is fully authorized.</span>
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
                  CANCEL BOOKING
                </Button>
              )}

              <Link href="/customer/vehicles" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  BROWSE MORE VEHICLES
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            if (!isCancelling) setShowCancelModal(false);
          }}
          title="CANCEL THIS BOOKING?"
          description="This action will release the vehicle reservation back into the marketplace lot."
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Cancelling releases this fleet unit immediately. Dynamic rates may adjust if you choose to rebook later.
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
                KEEP BOOKING
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancel} isLoading={isCancelling}>
                CONFIRM CANCEL
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
            existingPayment={payment}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
