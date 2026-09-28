'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { PricingBreakdown } from '@/components/pricing/PricingBreakdown';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { getVehicleById, getVehicleReviews } from '@/lib/api/vehicles';
import { getPricingQuote } from '@/lib/api/pricing';
import { createBooking } from '@/lib/api/bookings';
import { getRecommendations } from '@/lib/api/recommendations';
import { Vehicle, Review, PricingQuote, Recommendation, LoyaltyAccount, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api/client';
import {
  Fuel, Gauge, Users, Calendar, ShieldCheck, Star,
  MapPin, ArrowLeft, CheckCircle2, AlertTriangle, Sparkles
} from 'lucide-react';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const vehicleId = Number(params.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  // Pricing
  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteStale, setQuoteStale] = useState(false);

  // Booking submission
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch vehicle data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [v, revs] = await Promise.all([
          getVehicleById(vehicleId),
          getVehicleReviews(vehicleId).catch(() => []),
        ]);
        if (!mounted) return;
        setVehicle(v);
        setReviews(revs);

        // Fetch recommendations
        getRecommendations({ categoryId: v.categoryId })
          .then(recs => { if (mounted) setRecommendations(recs.filter(r => r.vehicle.id !== vehicleId).slice(0, 4)); })
          .catch(() => {});

        // Fetch loyalty for logged-in customer
        if (user) {
          apiClient.get<ApiResponse<LoyaltyAccount>>(`/api/customers/${user.id}/loyalty`)
            .then(res => { if (mounted && res.data) setLoyalty(res.data); })
            .catch(() => {});
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Vehicle not found.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [vehicleId, user]);

  // Date validation
  const validateDates = useCallback((s: string, e: string): string | null => {
    if (!s || !e) return null;
    const start = new Date(s);
    const end = new Date(e);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) return 'Start date cannot be in the past.';
    if (end <= start) return 'End date must be after start date.';
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) return 'Maximum rental duration is 90 days.';
    return null;
  }, []);



  // Request pricing quote
  const requestQuote = async () => {
    const err = validateDates(startDate, endDate);
    if (err) { setDateError(err); return; }
    setDateError(null);
    setQuoteLoading(true);
    setQuoteError(null);
    setQuoteStale(false);
    try {
      const q = await getPricingQuote({
        vehicleId,
        startDate,
        endDate,
        loyaltyTier: loyalty?.tier,
      });
      setQuote(q);
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : 'Unable to calculate pricing. Please try again.');
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  // Submit booking
  const handleBooking = async () => {
    if (isBooking || bookingSuccess) return;
    setIsBooking(true);
    try {
      const booking = await createBooking({ vehicleId, startDate, endDate });
      setBookingSuccess(true);
      setShowConfirmModal(false);
      toast.success(`Booking #${booking.id} confirmed successfully!`);
      setTimeout(() => router.push(`/customer/bookings/${booking.id}`), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Booking failed.';
      toast.error(msg);
      setShowConfirmModal(false);
    } finally {
      setIsBooking(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'FLEET_MANAGER']}>
      <AppShell><LoadingState label="Loading vehicle details..." /></AppShell>
    </ProtectedRoute>
  );

  if (error || !vehicle) return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'FLEET_MANAGER']}>
      <AppShell>
        <ErrorState title="Vehicle not found" message={error || 'This vehicle does not exist.'} onRetry={() => router.back()} />
      </AppShell>
    </ProtectedRoute>
  );

  const isAvailable = vehicle.status === 'AVAILABLE';
  const canBook = isAvailable && startDate && endDate && !dateError && quote && !quoteStale && !quoteLoading && !bookingSuccess;

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'FLEET_MANAGER']}>
      <AppShell>
        <PageHeader
          title={`${vehicle.brand} ${vehicle.model}`}
          description={`${vehicle.type} — ${vehicle.registrationNumber}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/customer' },
            { label: 'Vehicles', href: '/customer/vehicles' },
            { label: `${vehicle.brand} ${vehicle.model}` },
          ]}
          action={
            <Link href="/customer/vehicles">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Marketplace
              </Button>
            </Link>
          }
        />

        {bookingSuccess && (
          <Alert variant="success" title="Booking Confirmed">
            Your vehicle reservation has been created. Redirecting to booking details...
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Vehicle Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Premium Vehicle Hero Showcase */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-950 overflow-hidden">
                <VehicleImage
                  vehicle={vehicle}
                  aspectRatio="16:9"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  priority={true}
                />
                {/* Subtle dark vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

                {/* Top Floating Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <VehicleStatusBadge status={vehicle.status} />
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-slate-700/60 uppercase tracking-wider">
                    {vehicle.type}
                  </span>
                </div>

                {/* Top Right: Health Score Pill */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-white shadow-md">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        vehicle.healthScore >= 85
                          ? 'bg-emerald-400 animate-pulse'
                          : vehicle.healthScore >= 60
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="font-bold">{vehicle.healthScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Health</span>
                  </div>
                </div>

                {/* Bottom Left: Title & Model */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                      {vehicle.brand} {vehicle.model}
                    </h1>
                    <p className="text-xs text-slate-300 font-medium drop-shadow-xs mt-0.5">
                      {vehicle.registrationNumber} • Model Year {vehicle.purchaseYear}
                    </p>
                  </div>

                  {avgRating && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs self-start sm:self-auto">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold">{avgRating}</span>
                      <span className="text-slate-400">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications Strip & Base Price */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Standard Daily Rental
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                        {formatINR(vehicle.baseRentalRate)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">/ 24 hrs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-blue-600" /> Verified Fleet Unit
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: <Fuel className="w-4 h-4" />, label: 'Fuel Type', value: vehicle.fuelType },
                    { icon: <Gauge className="w-4 h-4" />, label: 'Transmission', value: vehicle.transmission },
                    { icon: <Users className="w-4 h-4" />, label: 'Seating Capacity', value: `${vehicle.seats} Seats` },
                    { icon: <MapPin className="w-4 h-4" />, label: 'Odometer', value: `${vehicle.odometerKm.toLocaleString('en-IN')} km` },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="flex flex-col items-center justify-center p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-center"
                    >
                      <div className="text-blue-600 mb-1.5">{spec.icon}</div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        {spec.label}
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health Score */}
            {vehicle.healthScore > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Vehicle Health Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-extrabold text-white ${
                      vehicle.healthScore >= 85 ? 'bg-emerald-500' : vehicle.healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                      {vehicle.healthScore}
                    </div>
                    <div>
                      <span className={`text-sm font-bold ${
                        vehicle.healthScore >= 85 ? 'text-emerald-700' : vehicle.healthScore >= 60 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {vehicle.healthScore >= 85 ? 'Excellent' : vehicle.healthScore >= 60 ? 'Good' : 'Needs Attention'}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Health score computed by VeloRent Intelligence Engine based on mileage, age, and maintenance history.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-amber-500" />
                  Customer Reviews
                  {reviews.length > 0 && <Badge variant="slate" size="sm">{reviews.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                {reviews.length === 0 ? (
                  <EmptyState
                    icon={<Star className="w-8 h-8 text-slate-400" />}
                    title="No reviews yet"
                    description="Be the first to review this vehicle after completing a rental."
                  />
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((rev) => (
                      <div key={rev.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</span>
                        </div>
                        {rev.comment && <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> You may also like
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <RecommendationCard key={rec.vehicle.id} recommendation={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Booking Panel */}
          <div className="space-y-6">
            {!isAvailable && (
              <Alert variant="warning" title="Vehicle Unavailable">
                This vehicle is currently <strong>{vehicle.status}</strong> and cannot be reserved at this time.
              </Alert>
            )}

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Select Rental Dates
                </CardTitle>
                <CardDescription>Choose your pickup and return dates</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDateError(null);
                      if (quote) setQuoteStale(true);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={!isAvailable}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    aria-label="Rental start date"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDateError(null);
                      if (quote) setQuoteStale(true);
                    }}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    disabled={!isAvailable}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    aria-label="Rental end date"
                  />
                </div>
                {dateError && <p className="text-xs text-rose-600 font-medium">{dateError}</p>}
                <Button
                  className="w-full"
                  onClick={requestQuote}
                  isLoading={quoteLoading}
                  disabled={!startDate || !endDate || !isAvailable || !!validateDates(startDate, endDate)}
                >
                  Get Price Quote
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Quote */}
            {(quote || quoteLoading || quoteError) && (
              <div>
                {quoteStale && quote && !quoteLoading && (
                  <Alert variant="warning" className="mb-3">
                    Dates changed. Please recalculate the price before booking.
                  </Alert>
                )}
                <PricingBreakdown quote={quote} isLoading={quoteLoading} error={quoteError} />
              </div>
            )}

            {/* Loyalty */}
            {loyalty && loyalty.tier !== 'BRONZE' && quote && quote.loyaltyDiscount > 0 && (
              <div className="flex items-start gap-2 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Your {loyalty.tier} tier loyalty benefits have been applied.</span>
                  <p className="text-amber-700 mt-0.5">Points balance: {loyalty.currentPoints}</p>
                </div>
              </div>
            )}

            {/* Reserve Button */}
            <Button
              className="w-full py-3 text-sm font-semibold"
              onClick={() => setShowConfirmModal(true)}
              disabled={!canBook}
              isLoading={isBooking}
            >
              {bookingSuccess ? 'Booking Confirmed' : isAvailable ? 'Reserve Vehicle' : 'Unavailable'}
            </Button>

            {!isAvailable && (
              <Link href="/customer/vehicles" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  Choose Another Vehicle
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Booking Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => { if (!isBooking) setShowConfirmModal(false); }}
          title="Confirm Vehicle Reservation"
          description="Please review the booking summary before confirming."
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Vehicle</span><span className="font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Registration</span><span className="font-semibold text-slate-900">{vehicle.registrationNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pickup</span><span className="font-semibold text-slate-900">{formatDate(startDate)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Return</span><span className="font-semibold text-slate-900">{formatDate(endDate)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-semibold text-slate-900">{quote?.durationDays} days</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-extrabold text-slate-900 text-base">{quote ? formatINR(quote.finalPrice) : '—'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-500">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>By confirming, you agree to the VeloRent rental terms. The backend will validate availability and calculate the final amount.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)} disabled={isBooking}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleBooking} isLoading={isBooking} disabled={isBooking || bookingSuccess}>
                Confirm Booking
              </Button>
            </div>
          </div>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
