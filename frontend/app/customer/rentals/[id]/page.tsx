'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
import { Rental, Booking, Vehicle, Payment } from '@/types';
import {
  KeyRound,
  Calendar,
  Gauge,
  Car,
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
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchDetailData = async () => {
      if (!rentalId || isNaN(rentalId)) return;
      try {
        const r = await getRentalById(rentalId);
        if (!mounted) return;
        setRental(r);
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
        <div className="mb-4">
          <Link href="/customer/rentals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to My Rentals
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : error || !rental ? (
          <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold">Rental Not Found</h3>
            <p className="text-xs text-rose-600">{error || 'The requested rental record could not be loaded.'}</p>
            <Link href="/customer/rentals">
              <Button size="sm" variant="outline">
                Return to Rentals List
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
              title={`Rental #${rental.id}`}
              description={`Check-out record for Booking #${rental.bookingId}`}
              action={
                <div className="flex items-center gap-2">
                  <RentalStatusBadge status={rental.status} />
                </div>
              }
            />

            {/* Confirmation Banner if Returned */}
            {returnSuccess && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">Rental Returned Successfully</h3>
                    <p className="text-xs text-emerald-700">
                      Vehicle checked in with ending odometer {rental.endOdometerKm.toLocaleString()} km. Total distance driven: {rental.distanceDrivenKm.toLocaleString()} km.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    Pay Rental Charges
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Star className="w-4 h-4" />}
                    onClick={() => setShowReviewForm(true)}
                  >
                    Leave Review
                  </Button>
                </div>
              </div>
            )}

            {/* Prominent Active Rental Banner & Return Form */}
            {rental.status === 'ACTIVE' && (
              <Card className="border-2 border-emerald-500/30 bg-emerald-50/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-emerald-900">
                    <KeyRound className="w-5 h-5 text-emerald-600" />
                    Active Rental Check-Out
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  <p className="text-xs text-slate-600">
                    This vehicle is currently active in your possession. You can check in and return the vehicle by entering the final odometer reading below.
                  </p>

                  {returnError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{returnError}</span>
                    </div>
                  )}

                  <form onSubmit={handleReturnSubmit} className="max-w-md space-y-4">
                    <Input
                      label="Return Odometer Reading (km)"
                      type="number"
                      min={rental.startOdometerKm}
                      value={returnOdometer}
                      onChange={(e) => setReturnOdometer(e.target.value)}
                      helperText={`Starting odometer was ${rental.startOdometerKm.toLocaleString()} km.`}
                      required
                    />

                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isReturning}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Complete Vehicle Return
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Rental Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Vehicle & Booking Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" /> Allocated Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    {vehicle ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200/80 shadow-2xs relative">
                          <VehicleImage
                            vehicle={vehicle}
                            aspectRatio="16:9"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-bold text-slate-900">
                              {vehicle.brand} {vehicle.model}
                            </h4>
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                              {vehicle.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Reg: <span className="font-mono font-semibold text-slate-700">{vehicle.registrationNumber}</span> — Booking #{rental.bookingId}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md">
                              {vehicle.fuelType}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md">
                              {vehicle.transmission}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md">
                              {vehicle.seats} Seats
                            </span>
                            <span className="font-extrabold text-slate-900 ml-auto">
                              ₹{vehicle.baseRentalRate.toLocaleString('en-IN')}/day
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Vehicle info linked via Booking #{rental.bookingId}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Odometer & Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-indigo-600" /> Odometer & Return Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Start Time
                        </span>
                        <p className="font-semibold text-slate-800">{rental.startDateTime || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Return Time
                        </span>
                        <p className="font-semibold text-slate-800">{rental.endDateTime || 'In Progress'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Start Odometer</span>
                        <p className="font-bold text-slate-900 tabular-nums">{rental.startOdometerKm.toLocaleString()} km</p>
                      </div>
                      <div>
                        <span className="text-slate-400">End Odometer</span>
                        <p className="font-bold text-slate-900 tabular-nums">
                          {rental.endOdometerKm > 0 ? `${rental.endOdometerKm.toLocaleString()} km` : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Section */}
                {(rental.status === 'COMPLETED' || showReviewForm) && (
                  <div className="space-y-4">
                    {reviewSubmitted ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Thank you! Your customer review for this rental has been submitted.</span>
                      </div>
                    ) : (
                      <ReviewForm
                        rentalId={rental.id}
                        onSuccess={() => {
                          setReviewSubmitted(true);
                          setShowReviewForm(false);
                        }}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking & Price Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> Booking & Financials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 space-y-4">
                    {booking && (
                      <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Quoted Booking Price:</span>
                          <span className="font-bold text-slate-900">₹{booking.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Reservation Range:</span>
                          <span className="font-medium text-slate-700">{booking.startDate} $\to$ {booking.endDate}</span>
                        </div>
                      </div>
                    )}

                    {latestPayment ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-emerald-900 block">Payment Confirmed</span>
                        <p className="text-emerald-700 font-mono">Txn ID: {latestPayment.transactionId}</p>
                        <p className="font-bold text-emerald-800 text-sm">₹{latestPayment.amount.toLocaleString()}</p>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        size="sm"
                        leftIcon={<CreditCard className="w-4 h-4" />}
                        onClick={() => setIsPaymentModalOpen(true)}
                      >
                        Simulate Payment
                      </Button>
                    )}

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-[11px] text-slate-500">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>All payment transactions are academic simulations. No real financial credentials required.</span>
                    </div>
                  </CardContent>
                </Card>
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
            onSuccess={(p) => {
              setLatestPayment(p);
            }}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
