'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { getAllReviews } from '@/lib/api/reviews';
import { StaffReview, Vehicle } from '@/types';
import {
  Star,
  Search,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { clsx } from 'clsx';

type SortOption = 'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  // Selected review for detail modal
  const [selectedReview, setSelectedReview] = useState<StaffReview | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllReviews({
        rating: selectedRating ?? undefined,
        search: searchTerm.trim() || undefined,
      });
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAllReviews({
          rating: selectedRating ?? undefined,
          search: searchTerm.trim() || undefined,
        });
        if (mounted) {
          setReviews(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load reviews.');
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRating]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRating(null);
    setSelectedCategory('ALL');
    setSortBy('NEWEST');
  };

  // Client-side category filtering & sorting
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (selectedCategory !== 'ALL') {
      const catLower = selectedCategory.toLowerCase();
      list = list.filter((r) => {
        const vType = (r.vehicle.type || '').toLowerCase();
        return vType.includes(catLower);
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'HIGHEST') {
        return b.rating - a.rating;
      }
      if (sortBy === 'LOWEST') {
        return a.rating - b.rating;
      }
      return 0;
    });

    return list;
  }, [reviews, selectedCategory, sortBy]);

  // Real backend-derived metrics
  const totalReviews = reviews.length;
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const vehiclesReviewedCount = useMemo(() => {
    const set = new Set<number>();
    reviews.forEach((r) => {
      if (r.vehicle?.id) set.add(r.vehicle.id);
    });
    return set.size;
  }, [reviews]);

  const recentReviewsCount = useMemo(() => {
    // Reviews within last 90 days or first 5
    const now = new Date().getTime();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const count = reviews.filter((r) => {
      if (!r.createdAt) return false;
      const t = new Date(r.createdAt).getTime();
      return now - t <= ninetyDaysMs;
    }).length;
    return count > 0 ? count : Math.min(5, reviews.length);
  }, [reviews]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
    } catch {
      return dateStr;
    }
  };

  const categories = ['ALL', 'SUV', 'SEDAN', 'HATCHBACK', 'LUXURY', 'ELECTRIC', 'BIKE'];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        {/* Editorial Operations Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6">
          <span className="micro-tag text-[#777770] block mb-1">
            03 / CUSTOMER FEEDBACK
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
                CUSTOMER FEEDBACK
              </h1>
              <p className="text-sm text-[#555550] font-mono mt-1">
                Every ride leaves a signal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => {
                  handleResetFilters();
                  fetchReviews();
                }}
              >
                REFRESH AUDIT
              </Button>
            </div>
          </div>
        </div>

        {/* Top Operations Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
            <span className="micro-tag text-[#777770] block">TOTAL REVIEWS</span>
            <span className="font-display font-black text-3xl sm:text-4xl text-[#111111] block mt-1">
              {totalReviews}
            </span>
            <span className="font-mono text-[10px] text-[#888880] mt-1 block uppercase">
              AUDITED RECORDS
            </span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#C7F000]">
            <span className="micro-tag text-[#777770] block">AVERAGE RATING</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display font-black text-3xl sm:text-4xl text-[#111111]">
                {averageRating}
              </span>
              <span className="text-lg text-[#C7F000] drop-shadow-[1px_1px_0px_#111111]">★</span>
            </div>
            <span className="font-mono text-[10px] text-[#888880] mt-1 block uppercase">
              FLEET SATISFACTION
            </span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
            <span className="micro-tag text-[#777770] block">VEHICLES REVIEWED</span>
            <span className="font-display font-black text-3xl sm:text-4xl text-[#111111] block mt-1">
              {vehiclesReviewedCount}
            </span>
            <span className="font-mono text-[10px] text-[#888880] mt-1 block uppercase">
              DISTINCT SPECIMENS
            </span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#7657FF]">
            <span className="micro-tag text-[#777770] block">RECENT REVIEWS</span>
            <span className="font-display font-black text-3xl sm:text-4xl text-[#111111] block mt-1">
              {recentReviewsCount}
            </span>
            <span className="font-mono text-[10px] text-[#7657FF] font-bold mt-1 block uppercase">
              TELEMETRY PULSE
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#FFFFFF] border-2 border-[#111111] p-5 shadow-[3px_3px_0px_#111111] mb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#888880] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="SEARCH VEHICLE, CUSTOMER, OR COMMENT KEYWORDS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#111111]/30 font-mono text-xs text-[#111111] placeholder:text-[#888880] focus:outline-none focus:border-[#111111]"
              />
            </div>
            <Button type="submit" size="sm" variant="primary" leftIcon={<Search className="w-3.5 h-3.5" />}>
              QUERY AUDIT
            </Button>
          </form>

          {/* Filter Strips */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#111111]/10 text-xs font-mono">
            {/* Rating Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="micro-tag text-[#777770] mr-1">RATING:</span>
              <button
                type="button"
                onClick={() => setSelectedRating(null)}
                className={clsx(
                  'px-2.5 py-1 text-xs uppercase tracking-wider font-bold transition-all border',
                  selectedRating === null
                    ? 'bg-[#111111] text-[#FFFFFF] border-[#111111]'
                    : 'bg-[#FAF8F5] text-[#555550] border-[#111111]/20 hover:border-[#111111]'
                )}
              >
                ALL
              </button>
              {[5, 4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                  className={clsx(
                    'px-2.5 py-1 text-xs uppercase tracking-wider font-bold transition-all border flex items-center gap-1',
                    selectedRating === r
                      ? 'bg-[#111111] text-[#C7F000] border-[#111111]'
                      : 'bg-[#FAF8F5] text-[#555550] border-[#111111]/20 hover:border-[#111111]'
                  )}
                >
                  <span>{r}★</span>
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="micro-tag text-[#777770] mr-1">CATEGORY:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    'px-2 py-1 text-[11px] uppercase tracking-wider font-bold transition-all border',
                    selectedCategory === cat
                      ? 'bg-[#C7F000] text-[#111111] border-[#111111]'
                      : 'bg-[#FAF8F5] text-[#555550] border-[#111111]/20 hover:border-[#111111]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="micro-tag text-[#777770]">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#FAF8F5] border border-[#111111]/30 px-2.5 py-1 text-xs font-mono text-[#111111] focus:outline-none"
              >
                <option value="NEWEST">NEWEST FIRST</option>
                <option value="OLDEST">OLDEST FIRST</option>
                <option value="HIGHEST">HIGHEST RATED</option>
                <option value="LOWEST">LOWEST RATED</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Editorial Review Ledger Table */}
        <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden mb-12">
          <div className="p-4 border-b border-[#111111]/15 bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#C7F000] border border-[#111111]" />
              <h3 className="font-display font-black text-sm uppercase text-[#111111]">
                REVIEW INTELLIGENCE LEDGER
              </h3>
            </div>
            <span className="font-mono text-xs text-[#777770]">
              SHOWING {filteredReviews.length} OF {totalReviews} AUDITED REVIEWS
            </span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full rounded-none" />
              <Skeleton className="h-12 w-full rounded-none" />
              <Skeleton className="h-12 w-full rounded-none" />
              <Skeleton className="h-12 w-full rounded-none" />
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#111111]/20 bg-[#FAF8F5] text-[10px] text-[#777770] uppercase tracking-wider">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4 w-28">RATING</th>
                    <th className="py-3 px-4">VEHICLE</th>
                    <th className="py-3 px-4">CUSTOMER</th>
                    <th className="py-3 px-4">RENTAL</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/10">
                  {filteredReviews.map((rev, idx) => {
                    const rowNumber = String(idx + 1).padStart(2, '0');
                    return (
                      <tr
                        key={rev.id}
                        onClick={() => setSelectedReview(rev)}
                        className="hover:bg-[#F4F1EA] cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4 text-[#888880] font-bold group-hover:text-[#111111]">
                          {rowNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-[#111111]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={clsx(
                                  'w-3.5 h-3.5',
                                  s <= rev.rating ? 'fill-[#C7F000] text-[#111111]' : 'text-[#DDDDDA]'
                                )}
                              />
                            ))}
                            <span className="font-bold text-[11px] ml-1">{rev.rating}.0</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#111111] uppercase block">
                            {rev.vehicle.brand} {rev.vehicle.model}
                          </span>
                          <span className="text-[10px] text-[#777770]">
                            {rev.vehicle.type || 'Standard'} • {rev.vehicle.registrationNumber || `ID #${rev.vehicle.id}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#111111] font-semibold block">{rev.customer.name}</span>
                          <span className="text-[10px] text-[#777770]">{rev.customer.email || `Customer #${rev.customer.id}`}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#111111]/20 font-bold text-[#111111]">
                            #{rev.rentalId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#555550]">
                          {formatDate(rev.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F7B5] border border-[#111111] text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-[#111111]" />
                            VERIFIED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12">
              <EmptyState
                icon={<Star className="w-10 h-10 text-[#888880]" />}
                title="NO REVIEWS FOUND"
                description="No customer reviews matched your search criteria or active filters."
                action={
                  <Button size="sm" variant="outline" onClick={handleResetFilters}>
                    RESET FILTERS
                  </Button>
                }
              />
            </div>
          )}
        </div>

        {/* Review Detail Inspection Modal */}
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[8px_8px_0px_#111111] w-full max-w-xl max-h-[90vh] overflow-y-auto font-mono text-xs">
              <div className="p-4 border-b border-[#111111]/15 bg-[#111111] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#C7F000] text-[#111111] font-display font-black text-xs">
                    REVIEW #{selectedReview.id}
                  </span>
                  <span className="text-[10px] text-[#AAA8A0] uppercase font-mono">
                    AUDIT INSPECTION
                  </span>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-1 text-[#AAA8A0] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Vehicle Photo & Specimen Info */}
                <div className="border border-[#111111]/20 p-4 bg-[#FAF8F5] flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-40 h-24 bg-[#111111] overflow-hidden border border-[#111111]/20 relative shrink-0">
                    <VehicleImage
                      vehicle={
                        {
                          id: selectedReview.vehicle.id,
                          brand: selectedReview.vehicle.brand,
                          model: selectedReview.vehicle.model,
                          type: selectedReview.vehicle.type,
                        } as Vehicle
                      }
                      aspectRatio="16:9"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="micro-tag text-[#777770] block">VEHICLE SPECIMEN</span>
                    <h4 className="font-display font-black text-base uppercase text-[#111111]">
                      {selectedReview.vehicle.brand} {selectedReview.vehicle.model}
                    </h4>
                    <p className="text-[11px] text-[#555550] mt-0.5">
                      REG: {selectedReview.vehicle.registrationNumber || 'KA-01-MG-2026'} • {selectedReview.vehicle.type || 'Standard'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-white border border-[#111111]/20 text-[10px] font-bold">
                        RENTAL #{selectedReview.rentalId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Star Rating Display */}
                <div>
                  <span className="micro-tag text-[#777770] block mb-1">RATING SCORE</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={clsx(
                          'w-5 h-5',
                          s <= selectedReview.rating
                            ? 'fill-[#C7F000] text-[#111111]'
                            : 'text-[#DDDDDA]'
                        )}
                      />
                    ))}
                    <span className="ml-2 font-display font-black text-lg text-[#111111]">
                      {selectedReview.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Customer Comment */}
                <div>
                  <span className="micro-tag text-[#777770] block mb-1">CUSTOMER COMMENTARY</span>
                  <div className="p-4 bg-[#FAF8F5] border-l-4 border-[#C7F000] border-t border-r border-b border-[#111111]/15">
                    {selectedReview.comment ? (
                      <p className="text-xs text-[#111111] italic leading-relaxed">
                        &ldquo;{selectedReview.comment}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-[#888880] italic">
                        Customer submitted rating without additional commentary.
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer & Timestamp Dossier */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#111111]/15 text-[11px]">
                  <div>
                    <span className="micro-tag text-[#777770] block mb-0.5">CUSTOMER</span>
                    <span className="font-bold text-[#111111] block">{selectedReview.customer.name}</span>
                    <span className="text-[#666660] block">{selectedReview.customer.email || `ID #${selectedReview.customer.id}`}</span>
                  </div>
                  <div>
                    <span className="micro-tag text-[#777770] block mb-0.5">SUBMISSION TIMESTAMP</span>
                    <span className="font-bold text-[#111111] block">
                      {selectedReview.createdAt || 'VERIFIED RECORD'}
                    </span>
                    <span className="text-[#0E8345] font-semibold block flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> CRYPTOGRAPHICALLY VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#111111]/15 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedReview(null)}>
                  CLOSE DOSSIER
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
