'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PricingBreakdown } from '@/components/pricing/PricingBreakdown';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
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
  Fuel,
  Gauge,
  Users,
  Calendar,
  ShieldCheck,
  Star,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
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
          .then((recs) => {
            if (mounted) setRecommendations(recs.filter((r) => r.vehicle.id !== vehicleId).slice(0, 3));
          })
          .catch(() => {});

        // Fetch loyalty for logged-in customer
        if (user) {
          apiClient
            .get<ApiResponse<LoyaltyAccount>>(`/api/customers/${user.id}/loyalty`)
            .then((res) => {
              if (mounted && res.data) setLoyalty(res.data);
            })
            .catch(() => {});
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Vehicle not found.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
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
    if (err) {
      setDateError(err);
      return;
    }
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

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (isLoading)
    return (
      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'FLEET_MANAGER']}>
        <AppShell>
          <LoadingState label="Inspecting vehicle specimen..." />
        </AppShell>
      </ProtectedRoute>
    );

  if (error || !vehicle)
    return (
      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'FLEET_MANAGER']}>
        <AppShell>
          <ErrorState
            title="Vehicle not found"
            message={error || 'This vehicle does not exist.'}
            onRetry={() => router.back()}
          />
        </AppShell>
      </ProtectedRoute>
    );

  const isAvailable = vehicle.status === 'AVAILABLE';
  const canBook =
    isAvailable &&
    startDate &&
    endDate &&
    !dateError &&
    quote &&
    !quoteStale &&
    !quoteLoading &&
    !bookingSuccess;

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'FLEET_MANAGER']}>
      <AppShell>
        {/* Navigation Breadcrumb Track */}
        <div className="flex items-center justify-between border-b border-[#111111]/15 pb-3 mb-6">
          <Link
            href="/customer/vehicles"
            className="font-display text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#7657FF] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 04 / BACK TO CATALOGUE
          </Link>
          <span className="font-mono text-xs text-[#888880]">
            LOT SPECIMEN #{String(vehicle.id).padStart(3, '0')}
          </span>
        </div>

        {/* Magazine Product Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="micro-tag text-[#777770]">01 / VEHICLE SPECIMEN</span>
            <span className="text-[#888880] font-mono">•</span>
            <span className="font-mono text-xs font-bold uppercase text-[#111111]">
              {vehicle.brand}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#111111]">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="font-mono text-xs text-[#666660] mt-1.5 uppercase">
                {vehicle.type} • REG: {vehicle.registrationNumber} • PURCHASE YEAR {vehicle.purchaseYear}
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="micro-tag text-[#888880]">DAILY RATE</span>
              <span className="font-display text-3xl sm:text-4xl font-black text-[#111111]">
                {formatINR(vehicle.baseRentalRate)}
              </span>
              <span className="font-mono text-xs text-[#777770]">/ 24 hrs</span>
            </div>
          </div>
        </div>

        {bookingSuccess && (
          <div className="mb-6 p-4 bg-[#C7F000] border-2 border-[#111111] text-[#111111] font-display font-bold uppercase tracking-wider flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <span>Reservation Confirmed. Transferring to booking confirmation page...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Huge Vehicle Photography & Specifications (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Huge Vehicle Image Frame */}
            <div className="bg-[#111111] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-3 sm:p-4 text-white overflow-hidden">
              <div className="relative h-72 sm:h-96 md:h-[480px] w-full bg-[#181816] overflow-hidden">
                <VehicleImage
                  vehicle={vehicle}
                  aspectRatio="auto"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  priority={true}
                />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <VehicleStatusBadge status={vehicle.status} />
                  <span className="bg-[#111111] text-white text-[10px] font-mono px-2.5 py-0.5 uppercase tracking-wider border border-white/20">
                    {vehicle.type}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#111111]/90 border border-white/10 text-xs font-mono text-[#C7F000]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C7F000]" />
                    <span className="font-bold">{vehicle.healthScore}% HEALTH</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 z-10 bg-[#111111]/90 px-3 py-1 text-[11px] font-mono text-white border border-white/10">
                  SHOT 01 — FULL PROFILE
                </div>

                {avgRating && (
                  <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-[#111111]/90 border border-white/10 text-xs font-mono text-white">
                    <Star className="w-3.5 h-3.5 text-[#C7F000] fill-[#C7F000]" />
                    <span className="font-bold">{avgRating}</span>
                    <span className="text-[#888880]">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Specifications Strip */}
            <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
              <span className="micro-tag text-[#777770] block mb-3">
                02 / TECHNICAL SPECIFICATIONS
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: <Fuel className="w-4 h-4 text-[#111111]" />, label: 'FUEL TYPE', value: vehicle.fuelType },
                  { icon: <Gauge className="w-4 h-4 text-[#111111]" />, label: 'TRANSMISSION', value: vehicle.transmission },
                  { icon: <Users className="w-4 h-4 text-[#111111]" />, label: 'SEATS', value: `${vehicle.seats} SEATER` },
                  { icon: <MapPin className="w-4 h-4 text-[#111111]" />, label: 'ODOMETER', value: `${vehicle.odometerKm.toLocaleString('en-IN')} KM` },
                ].map((spec) => (
                  <div key={spec.label} className="p-4 bg-[#FAF8F5] border border-[#111111]/15">
                    <div className="flex items-center justify-between mb-2">
                      <span className="micro-tag text-[#888880]">{spec.label}</span>
                      {spec.icon}
                    </div>
                    <span className="font-display font-extrabold text-sm uppercase text-[#111111] block">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Health Assessment */}
            {vehicle.healthScore > 0 && (
              <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
                <div className="flex items-center justify-between mb-3 border-b border-[#111111]/10 pb-2">
                  <span className="micro-tag text-[#777770]">03 / TELEMETRY & DIAGNOSTICS</span>
                  <span className="font-mono text-xs text-[#C7F000] bg-[#111111] px-2 py-0.5 font-bold">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-[#111111] text-[#C7F000] border-2 border-[#111111] flex flex-col items-center justify-center shrink-0">
                    <span className="font-display font-black text-2xl leading-none">{vehicle.healthScore}</span>
                    <span className="text-[8px] font-mono uppercase text-[#AAA8A0] mt-1">SCORE</span>
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold uppercase text-[#111111]">
                      {vehicle.healthScore >= 85 ? 'EXCELLENT FLEET CONDITION' : vehicle.healthScore >= 60 ? 'STANDARD FLEET CONDITION' : 'SCHEDULED FOR MAINTENANCE'}
                    </h4>
                    <p className="font-mono text-xs text-[#555550] mt-1 leading-relaxed">
                      Continuous health score computed by VeloRent Intelligence Engine based on real-time sensor telemetry, service history, and engine diagnostics.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Reviews Section */}
            <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
              <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3 mb-4">
                <span className="micro-tag text-[#777770]">04 / RIDE REVIEWS</span>
                {reviews.length > 0 && <Badge variant="dark">{reviews.length} REVIEWS</Badge>}
              </div>

              {reviews.length === 0 ? (
                <EmptyState
                  icon={<Star className="w-8 h-8 text-[#888880]" />}
                  title="NO REVIEWS LOGGED"
                  description="Be the first verified customer to submit feedback after completing a ride."
                />
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 4).map((rev) => (
                    <div key={rev.id} className="p-4 bg-[#FAF8F5] border border-[#111111]/15">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-[#111111] fill-[#111111]' : 'text-[#D3CCC0]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[10px] text-[#888880]">{formatDate(rev.createdAt)}</span>
                      </div>
                      {rev.comment && (
                        <p className="font-mono text-xs text-[#333330] leading-relaxed">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations / You May Also Like */}
            {recommendations.length > 0 && (
              <div>
                <span className="micro-tag text-[#777770] block mb-3">05 / SIMILAR SPECIMENS</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendations.map((rec, i) => (
                    <VehicleCard key={rec.vehicle.id} vehicle={rec.vehicle} index={i} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing Engine & Reservation Terminal (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {!isAvailable && (
              <div className="p-4 bg-[#FFF0ED] border-2 border-[#FF654A] text-[#C4381F] text-xs font-mono">
                <strong className="block font-bold mb-1 uppercase">VEHICLE CURRENTLY {vehicle.status}</strong>
                This fleet unit is not available for new reservations.
              </div>
            )}

            {/* Date Selection Terminal */}
            <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-5">
              <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3 mb-4">
                <span className="micro-tag text-[#111111]">RENTAL DISPATCH TERMINAL</span>
                <Calendar className="w-4 h-4 text-[#111111]" />
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block micro-tag text-[#777770] mb-1">
                    START PICKUP DATE
                  </label>
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
                    className="w-full bg-[#FAF8F5] text-[#111111] border border-[#111111]/30 p-2.5 font-mono text-xs focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                    aria-label="Rental start date"
                  />
                </div>

                <div>
                  <label className="block micro-tag text-[#777770] mb-1">
                    END RETURN DATE
                  </label>
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
                    className="w-full bg-[#FAF8F5] text-[#111111] border border-[#111111]/30 p-2.5 font-mono text-xs focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                    aria-label="Rental end date"
                  />
                </div>

                {dateError && <p className="text-xs text-[#FF654A] font-bold">{dateError}</p>}

                <Button
                  className="w-full py-3"
                  onClick={requestQuote}
                  isLoading={quoteLoading}
                  disabled={!startDate || !endDate || !isAvailable || !!validateDates(startDate, endDate)}
                >
                  GET PRICE QUOTE
                </Button>
              </div>
            </div>

            {/* Pricing Quote Breakdown */}
            {(quote || quoteLoading || quoteError) && (
              <div className="bg-[#FFFFFF] border border-[#111111]/25 p-5 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
                {quoteStale && quote && !quoteLoading && (
                  <div className="p-3 mb-3 bg-[#FFF7D6] border border-[#E0BC38] text-[11px] font-mono text-[#7A5A00]">
                    DATES CHANGED. PLEASE RECALCULATE QUOTE BEFORE BOOKING.
                  </div>
                )}
                <PricingBreakdown quote={quote} isLoading={quoteLoading} error={quoteError} />
              </div>
            )}

            {/* Loyalty Benefit Pill */}
            {loyalty && loyalty.tier !== 'BRONZE' && quote && quote.loyaltyDiscount > 0 && (
              <div className="p-3.5 bg-[#F0EDFF] border border-[#7657FF]/40 text-xs font-mono text-[#5031DE]">
                <strong className="block uppercase font-bold">{loyalty.tier} TIER PASS APPLIED</strong>
                <span>Points balance: {loyalty.currentPoints} pts</span>
              </div>
            )}

            {/* Primary Action Button */}
            <Button
              className="w-full py-3.5 text-sm"
              onClick={() => setShowConfirmModal(true)}
              disabled={!canBook}
              isLoading={isBooking}
            >
              {bookingSuccess ? 'BOOKING CONFIRMED' : isAvailable ? 'RESERVE VEHICLE' : 'UNAVAILABLE'}
            </Button>

            {!isAvailable && (
              <Link href="/customer/vehicles" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  CHOOSE ANOTHER VEHICLE
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Booking Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => {
            if (!isBooking) setShowConfirmModal(false);
          }}
          title="CONFIRM VEHICLE RESERVATION"
          description="Review rental breakdown before locking reservation in the engine."
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-[#FAF8F5] border border-[#111111]/15 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#777770]">VEHICLE</span>
                <span className="font-bold text-[#111111] uppercase">{vehicle.brand} {vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777770]">REGISTRATION</span>
                <span className="font-bold text-[#111111]">{vehicle.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777770]">PICKUP</span>
                <span className="font-bold text-[#111111]">{formatDate(startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777770]">RETURN</span>
                <span className="font-bold text-[#111111]">{formatDate(endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777770]">DURATION</span>
                <span className="font-bold text-[#111111]">{quote?.durationDays} DAYS</span>
              </div>
              <div className="flex justify-between border-t border-[#111111]/15 pt-2 mt-2">
                <span className="font-display font-black text-sm uppercase text-[#111111]">TOTAL AMOUNT</span>
                <span className="font-display text-lg font-black text-[#111111]">{quote ? formatINR(quote.finalPrice) : '—'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-[#777770]">
              <AlertTriangle className="w-4 h-4 text-[#FF654A] shrink-0 mt-0.5" />
              <span>By confirming, you agree to VeloRent rental terms. Backend engine validates availability and allocates fleet unit.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)} disabled={isBooking}>
                CANCEL
              </Button>
              <Button className="flex-1" onClick={handleBooking} isLoading={isBooking} disabled={isBooking || bookingSuccess}>
                CONFIRM BOOKING
              </Button>
            </div>
          </div>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
