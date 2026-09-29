'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { RentalStatusBadge } from '@/components/ui/StatusBadge';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { getRentalById, returnRental } from '@/lib/api/rentals';
import { getBookingById } from '@/lib/api/bookings';
import { getVehicleById } from '@/lib/api/vehicles';
import { getRentalReview } from '@/lib/api/reviews';
import { getRentalPayments } from '@/lib/api/payments';
import { Rental, Booking, Vehicle, Payment, Review } from '@/types';
import { clsx } from 'clsx';
import {
  KeyRound,
  Calendar,
  Gauge,
  CreditCard,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Info,
} from 'lucide-react';

export default function CustomerRentalDetailPage() {
  const params = useParams();
  const rentalId = Number(params?.id);

  const [rental, setRental] = useState<Rental | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Return form state
  const [returnOdometer, setReturnOdometer] = useState<string>('');
  const [isReturning, setIsReturning] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState<boolean>(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  // Modals / forms
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [latestPayment, setLatestPayment] = useState<Payment | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDetailData = async () => {
      if (!rentalId || isNaN(rentalId)) return;
      try {
        const [r, rev, payments] = await Promise.all([
          getRentalById(rentalId),
          getRentalReview(rentalId).catch(() => null),
          getRentalPayments(rentalId).catch(() => []),
        ]);
        if (!mounted) return;
        setRental(r);
        setExistingReview(rev);
        const settled = payments.find(
          (p) =>
            p.status === 'COMPLETED' &&
            (p.type === 'BASE_RENT' || p.type === 'RENTAL_FEE')
        );
        if (settled) setLatestPayment(settled);
        setReturnOdometer((r.startOdometerKm + 50).toString());

        if (r.bookingId) {
          try {
            const b = await getBookingById(r.bookingId);
            if (mounted) setBooking(b);
            if (b.vehicleId) {
              const v = await getVehicleById(b.vehicleId);
              if (mounted) setVehicle(v);
            }
          } catch {
            // Non-fatal if booking lookup is missing
          }
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Rental not found.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchDetailData();
    return () => {
      mounted = false;
    };
  }, [rentalId]);

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rental) return;

    const odo = parseInt(returnOdometer, 10);
    if (isNaN(odo) || odo < rental.startOdometerKm) {
      setReturnError(`Return odometer must be greater than or equal to start odometer (${rental.startOdometerKm} km).`);
      return;
    }

    setIsReturning(true);
    setReturnError(null);

    try {
      const updated = await returnRental(rental.id, odo);
      setRental(updated);
      setReturnSuccess(true);
    } catch (err) {
      setReturnError(err instanceof Error ? err.message : 'Vehicle return could not be processed.');
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#111111]/15 pb-3 mb-6">
          <Link
            href="/customer/rentals"
            className="font-display text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#7657FF] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 02 / BACK TO GARAGE
          </Link>
          <span className="font-mono text-xs text-[#888880]">
            GARAGE SPECIMEN #{String(rentalId).padStart(4, '0')}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
          </div>
        ) : error || !rental ? (
          <div className="p-8 bg-[#FFF0ED] border-2 border-[#FF654A] text-center space-y-3 font-mono">
            <AlertCircle className="w-8 h-8 text-[#FF654A] mx-auto" />
            <h3 className="font-display font-bold text-base text-[#111111] uppercase">RENTAL NOT FOUND</h3>
            <p className="text-xs text-[#C4381F]">{error || 'The requested rental record could not be loaded.'}</p>
            <Link href="/customer/rentals">
              <Button size="sm" variant="outline">
                BACK TO GARAGE
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#111111]/15 pb-6">
              <div>
                <span className="micro-tag text-[#777770] block mb-1">
                  {rental.status === 'ACTIVE' ? 'CURRENT RIDE — ON THE ROAD' : 'RIDE HISTORY ARCHIVE'}
                </span>
                <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
                  RENTAL #{rental.id}
                </h1>
                <p className="font-mono text-xs text-[#666660] mt-1 uppercase">
                  LINKED WITH BOOKING REFERENCE #{rental.bookingId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <RentalStatusBadge status={rental.status} />
              </div>
            </div>

            {/* Return Success Banner */}
            {returnSuccess && (
              <div className="p-6 bg-[#C7F000] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#111111]" />
                  <div>
                    <h3 className="font-display font-black text-lg uppercase text-[#111111]">
                      VEHICLE RETURNED TO GARAGE
                    </h3>
                    <p className="font-mono text-xs text-[#111111]">
                      Ending odometer logged at {rental.endOdometerKm.toLocaleString()} KM. Total distance: {rental.distanceDrivenKm.toLocaleString()} KM.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  {latestPayment ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C7F000] border border-[#111111] text-xs font-mono font-bold text-[#111111]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                      PAYMENT COMPLETED
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<CreditCard className="w-4 h-4" />}
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      PAY RENTAL CHARGES
                    </Button>
                  )}
                  {!existingReview ? (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Star className="w-4 h-4" />}
                      onClick={() => setShowReviewForm(true)}
                    >
                      WRITE REVIEW
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#111111]/25 text-xs font-mono font-bold text-[#111111]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                      REVIEW COMPLETED ({existingReview.rating}★)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Active Return Form Terminal */}
            {rental.status === 'ACTIVE' && (
              <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_#C7F000] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#111111]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#111111]" />
                    <h3 className="font-display font-black text-base uppercase text-[#111111]">
                      ACTIVE RENTAL CHECK-IN & RETURN
                    </h3>
                  </div>
                  <span className="font-display text-[9px] font-black bg-[#C7F000] text-[#111111] px-2 py-0.5 border border-[#111111] uppercase tracking-widest">
                    VEHICLE IN POSSESSION
                  </span>
                </div>

                <p className="font-mono text-xs text-[#555550]">
                  Enter the final odometer reading displayed on the vehicle instrument cluster to complete check-in.
                </p>

                {returnError && (
                  <div className="p-3 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono">
                    {returnError}
                  </div>
                )}

                <form onSubmit={handleReturnSubmit} className="max-w-md space-y-4">
                  <Input
                    label="RETURN ODOMETER READING (KM)"
                    type="number"
                    min={rental.startOdometerKm}
                    value={returnOdometer}
                    onChange={(e) => setReturnOdometer(e.target.value)}
                    helperText={`Starting odometer was ${rental.startOdometerKm.toLocaleString()} KM.`}
                    required
                    className="font-mono"
                  />

                  <Button
                    type="submit"
                    size="md"
                    isLoading={isReturning}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    COMPLETE VEHICLE RETURN
                  </Button>
                </form>
              </div>
            )}

            {/* Rental Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Vehicle & Odometer Info (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Allocated Vehicle Card */}
                <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
                  <span className="micro-tag text-[#777770] block mb-4">
                    01 / ALLOCATED VEHICLE SPECIMEN
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
                            ₹{vehicle.baseRentalRate.toLocaleString('en-IN')}/DAY
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-[#777770]">Vehicle specimen linked via Booking #{rental.bookingId}</p>
                  )}
                </div>

                {/* Odometer & Schedule Ledger */}
                <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
                  <span className="micro-tag text-[#777770] block mb-4">
                    02 / ODOMETER TELEMETRY & SCHEDULE
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                    <div className="p-3 bg-[#FAF8F5] border border-[#111111]/10">
                      <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> START TIME
                      </span>
                      <p className="font-bold text-[#111111] mt-1">{rental.startDateTime || '—'}</p>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] border border-[#111111]/10">
                      <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> RETURN TIME
                      </span>
                      <p className="font-bold text-[#111111] mt-1">{rental.endDateTime || 'IN PROGRESS'}</p>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] border border-[#111111]/10">
                      <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1">
                        <Gauge className="w-3 h-3" /> START ODO
                      </span>
                      <p className="font-bold text-[#111111] tabular-nums mt-1">{rental.startOdometerKm.toLocaleString()} KM</p>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] border border-[#111111]/10">
                      <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1">
                        <Gauge className="w-3 h-3" /> END ODO
                      </span>
                      <p className="font-bold text-[#111111] tabular-nums mt-1">
                        {rental.endOdometerKm > 0 ? `${rental.endOdometerKm.toLocaleString()} KM` : 'PENDING'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review Section */}
                {rental.status === 'COMPLETED' && (
                  <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
                    <span className="micro-tag text-[#777770] block mb-3">03 / RIDE EXPERIENCE FEEDBACK</span>
                    
                    {existingReview ? (
                      <div className="bg-[#FAF8F5] border-2 border-[#111111] p-5 shadow-[3px_3px_0px_#111111] space-y-3 font-mono">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#111111]/15 gap-2">
                          <div>
                            <span className="micro-tag text-[#777770] block">RENTAL #{rental.id}</span>
                            <h4 className="font-display font-black text-sm uppercase text-[#111111] flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                              REVIEW COMPLETED
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={clsx(
                                  'w-4 h-4',
                                  star <= existingReview.rating
                                    ? 'text-[#111111] fill-[#C7F000]'
                                    : 'text-[#DDDDDA]'
                                )}
                              />
                            ))}
                            <span className="ml-1 text-xs font-mono font-bold text-[#111111]">
                              {existingReview.rating}.0
                            </span>
                          </div>
                        </div>

                        {existingReview.comment ? (
                          <p className="text-xs text-[#222220] italic border-l-2 border-[#C7F000] pl-3 py-1">
                            &ldquo;{existingReview.comment}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs text-[#888880] italic">
                            No additional commentary logged.
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#111111]/10 flex items-center justify-between text-[10px] text-[#777770]">
                          <span className="uppercase">REVIEWED</span>
                          <span className="font-bold text-[#111111]">
                            {existingReview.createdAt
                              ? new Date(existingReview.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                }).toUpperCase()
                              : 'VERIFIED'}
                          </span>
                        </div>
                      </div>
                    ) : showReviewForm ? (
                      <ReviewForm
                        rentalId={rental.id}
                        onSuccess={(newRev) => {
                          setExistingReview(newRev);
                          setShowReviewForm(false);
                        }}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    ) : (
                      <div className="p-5 bg-[#FAF8F5] border border-[#111111]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                        <div>
                          <span className="micro-tag text-[#111111] block mb-0.5">FEEDBACK ELIGIBLE</span>
                          <p className="text-[#333330]">
                            Your ride is completed. Help us calibrate fleet telemetry and maintenance by sharing your experience.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<Star className="w-4 h-4" />}
                          onClick={() => setShowReviewForm(true)}
                        >
                          WRITE REVIEW
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Financials & Payment (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#FFFFFF] border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] space-y-4">
                  <span className="micro-tag text-[#777770] block">BOOKING & FINANCIALS</span>

                  {booking && (
                    <div className="space-y-2 font-mono text-xs border-b border-[#111111]/15 pb-4">
                      <div className="flex justify-between">
                        <span className="text-[#888880]">QUOTED RATE:</span>
                        <span className="font-bold text-[#111111]">₹{booking.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#888880]">RESERVATION:</span>
                        <span className="font-bold text-[#111111]">{booking.startDate} &rarr; {booking.endDate}</span>
                      </div>
                    </div>
                  )}

                  {latestPayment ? (
                    <div className="p-4 bg-[#E8F7B5] border border-[#111111] text-xs font-mono space-y-1">
                      <strong className="font-display font-black text-sm uppercase block text-[#111111]">PAYMENT SETTLED</strong>
                      <p className="text-[#555550]">TXN ID: {latestPayment.transactionId}</p>
                      <p className="font-bold text-base text-[#111111]">₹{latestPayment.amount.toLocaleString()}</p>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full py-3"
                      leftIcon={<CreditCard className="w-4 h-4" />}
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      SIMULATE PAYMENT
                    </Button>
                  )}

                  <div className="p-3 bg-[#FAF8F5] border border-[#111111]/15 flex items-start gap-2 text-[10px] font-mono text-[#666660]">
                    <Info className="w-3.5 h-3.5 text-[#888880] shrink-0 mt-0.5" />
                    <span>Academic payment simulation. No real financial charges are executed.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulated Payment Modal */}
        {rental && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            rentalId={rental.id}
            amount={booking ? booking.totalPrice : 1500}
            existingPayment={latestPayment}
            onSuccess={(p) => {
              setLatestPayment(p);
            }}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
