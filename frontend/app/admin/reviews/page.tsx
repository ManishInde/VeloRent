'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getVehicleReviews, getCustomerReviews } from '@/lib/api/reviews';
import { Review } from '@/types';
import { Star, Search, Car, Users, AlertCircle, Info } from 'lucide-react';

export default function AdminReviewsPage() {
  const [targetType, setTargetType] = useState<'VEHICLE' | 'CUSTOMER'>('VEHICLE');
  const [searchId, setSearchId] = useState<string>('1');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const id = parseInt(searchId, 10);
    if (isNaN(id) || id <= 0) {
      setError(`Please enter a valid numeric ${targetType === 'VEHICLE' ? 'Vehicle' : 'Customer'} ID.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setReviews([]);

    try {
      const data =
        targetType === 'VEHICLE'
          ? await getVehicleReviews(id)
          : await getCustomerReviews(id);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="Customer Feedback & Review Oversight"
          description="Inspect vehicle rating distributions and customer review comments."
        />

        {/* Backend Limitation Note */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-slate-900 font-bold mb-0.5">API Specification Note:</strong>
            Reviews are looked up by Vehicle ID (`GET /api/vehicles/:id/reviews`) or Customer ID (`GET /api/customers/:id/reviews`). The backend REST API does not expose review moderation/deletion endpoints; reviews remain read-only audit records.
          </div>
        </div>

        {/* Search Controls */}
        <Card className="mb-8 max-w-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" /> Review Lookup Target
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetType('VEHICLE')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                  targetType === 'VEHICLE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Car className="w-4 h-4" /> By Vehicle ID
              </button>
              <button
                type="button"
                onClick={() => setTargetType('CUSTOMER')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                  targetType === 'CUSTOMER'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" /> By Customer ID
              </button>
            </div>

            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder={`Enter ${targetType === 'VEHICLE' ? 'Vehicle' : 'Customer'} ID (e.g. 1)`}
                  type="number"
                  min={1}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Search className="w-4 h-4" />}>
                Fetch Reviews
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

        {/* Results */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        ) : !isLoading ? (
          <EmptyState
            icon={<Star className="w-10 h-10 text-slate-400" />}
            title="No reviews found"
            description={`No customer reviews recorded for ${targetType.toLowerCase()} #${searchId}.`}
          />
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}
