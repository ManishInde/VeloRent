'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerReviews } from '@/lib/api/reviews';
import { getCustomerRentals } from '@/lib/api/rentals';
import { Review, Rental } from '@/types';
import { Star, AlertCircle, Plus } from 'lucide-react';

export default function CustomerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedRentals, setCompletedRentals] = useState<Rental[]>([]);
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchReviewData = async () => {
      if (!user) return;
      try {
        const [revs, rts] = await Promise.all([
          getCustomerReviews(user.id).catch(() => []),
          getCustomerRentals(user.id).catch(() => []),
        ]);
        if (mounted) {
          setReviews(revs);
          setCompletedRentals(rts.filter((r) => r.status === 'COMPLETED'));
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
        <PageHeader
          title="My Vehicle Reviews"
          description="Rate and leave feedback on your completed vehicle rentals."
          action={
            completedRentals.length > 0 && !showForm ? (
              <Button
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setSelectedRentalId(completedRentals[0].id);
                  setShowForm(true);
                }}
              >
                Write a Review
              </Button>
            ) : undefined
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        {showForm && selectedRentalId && (
          <div className="mb-8 max-w-xl">
            {completedRentals.length > 1 && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Completed Rental</label>
                <select
                  value={selectedRentalId}
                  onChange={(e) => setSelectedRentalId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                >
                  {completedRentals.map((r) => (
                    <option key={r.id} value={r.id}>
                      Rental #{r.id} ({r.startDateTime || 'Completed'})
                    </option>
                  ))}
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

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Star className="w-10 h-10 text-slate-400" />}
            title="No reviews submitted yet."
            description="After completing a vehicle rental, you can rate and submit feedback for the fleet."
            action={
              completedRentals.length > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRentalId(completedRentals[0].id);
                    setShowForm(true);
                  }}
                >
                  Leave a Review
                </Button>
              ) : (
                <Link href="/customer/rentals">
                  <Button size="sm" variant="outline">
                    View My Rentals
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
