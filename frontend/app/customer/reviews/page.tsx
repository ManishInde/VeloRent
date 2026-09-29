'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerReviews } from '@/lib/api/reviews';
import { getCustomerRentals } from '@/lib/api/rentals';
import { getVehicles } from '@/lib/api/vehicles';
import { Review, Rental, Vehicle } from '@/types';
import { Star, AlertCircle, Plus } from 'lucide-react';

export default function CustomerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedRentals, setCompletedRentals] = useState<Rental[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Map<number, Vehicle>>(new Map());
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reviewedRentalIds = useMemo(() => new Set(reviews.map((r) => r.rentalId)), [reviews]);
  const unreviewedRentals = useMemo(
    () => completedRentals.filter((r) => !reviewedRentalIds.has(r.id)),
    [completedRentals, reviewedRentalIds]
  );

  useEffect(() => {
    let mounted = true;
    const fetchReviewData = async () => {
      if (!user) return;
      try {
        const [revs, rts, vehicles] = await Promise.all([
          getCustomerReviews(user.id).catch(() => []),
          getCustomerRentals(user.id).catch(() => []),
          getVehicles().catch(() => []),
        ]);
        if (mounted) {
          setReviews(revs);
          setCompletedRentals(rts.filter((r) => r.status === 'COMPLETED'));
          const map = new Map<number, Vehicle>();
          vehicles.forEach((v) => map.set(v.id, v));
          setVehicleMap(map);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load reviews.');
          setIsLoading(false);
        }
      }
    };

    fetchReviewData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleReviewSuccess = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    setShowForm(false);
    setSelectedRentalId(null);
  };

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Editorial Reviews Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="micro-tag text-[#777770] block mb-1">
              FLEET TELEMETRY & FEEDBACK
            </span>
            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
              YOUR RIDES
            </h1>
            <p className="text-sm text-[#555550] font-mono mt-1 max-w-xl">
              Rate vehicle driving dynamics, interior cleanliness, and engine performance on completed trips.
            </p>
          </div>

          {unreviewedRentals.length > 0 && !showForm && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setSelectedRentalId(unreviewedRentals[0].id);
                setShowForm(true);
              }}
            >
              WRITE REVIEW
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Unreviewed Completed Rides Banner */}
        {unreviewedRentals.length > 0 && !showForm && (
          <div className="mb-8 p-5 bg-[#FAF8F5] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <span className="micro-tag text-[#111111] block mb-0.5">COMPLETED RIDE ELIGIBLE FOR REVIEW</span>
              <p className="font-bold text-[#111111] text-sm uppercase">
                Rental #{unreviewedRentals[0].id} completed — Share your feedback with the fleet.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setSelectedRentalId(unreviewedRentals[0].id);
                setShowForm(true);
              }}
            >
              WRITE REVIEW
            </Button>
          </div>
        )}

        {/* Review Form Container */}
        {showForm && selectedRentalId && (
          <div className="mb-8 max-w-xl font-mono text-xs">
            {completedRentals.length > 1 && (
              <div className="mb-3">
                <label className="block micro-tag text-[#777770] mb-1">SELECT COMPLETED RENTAL</label>
                <select
                  value={selectedRentalId}
                  onChange={(e) => setSelectedRentalId(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#111111]/30 font-mono text-xs text-[#111111] focus:outline-none"
                >
                  {completedRentals.map((r) => {
                    const isReviewed = reviewedRentalIds.has(r.id);
                    return (
                      <option key={r.id} value={r.id} disabled={isReviewed}>
                        Rental #{r.id} ({r.startDateTime || 'Completed'}){isReviewed ? ' — Already Reviewed' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <ReviewForm
              rentalId={selectedRentalId}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-none" />
            <Skeleton className="h-28 w-full rounded-none" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                vehicle={vehicleMap.get(rev.vehicleId)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Star className="w-10 h-10 text-[#888880]" />}
            title="NO RIDE REVIEWS LOGGED"
            description="Complete a rental journey to submit telemetry and condition reviews for the vehicle."
            action={
              unreviewedRentals.length > 0 ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSelectedRentalId(unreviewedRentals[0].id);
                    setShowForm(true);
                  }}
                >
                  LEAVE A REVIEW
                </Button>
              ) : (
                <Link href="/customer/rentals">
                  <Button size="sm" variant="outline">
                    VIEW MY GARAGE
                  </Button>
                </Link>
              )
            }
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
