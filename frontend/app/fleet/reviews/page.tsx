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
  AlertCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

type FleetSortOption = 'NEWEST' | 'HIGHEST' | 'LOWEST';

interface VehicleFeedbackSummary {
  vehicleId: number;
  brand: string;
  model: string;
  type: string;
  reviewCount: number;
  avgRating: number;
}

export default function FleetReviewsPage() {
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<FleetSortOption>('NEWEST');

  // Selected review for detail modal
  const [selectedReview, setSelectedReview] = useState<StaffReview | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllReviews({
        vehicleId: selectedVehicleId ?? undefined,
        rating: selectedRating ?? undefined,
        search: searchTerm.trim() || undefined,
      });
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAllReviews({
          vehicleId: selectedVehicleId ?? undefined,
          rating: selectedRating ?? undefined,
          search: searchTerm.trim() || undefined,
        });
        if (mounted) {
          setReviews(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch reviews.');
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicleId, selectedRating]);

  // Aggregate Vehicle Feedback ranking from REAL review data
  const vehicleFeedbackList: VehicleFeedbackSummary[] = useMemo(() => {
    const map = new Map<number, { brand: string; model: string; type: string; totalRating: number; count: number }>();

    reviews.forEach((r) => {
      const vId = r.vehicle.id;
      if (!map.has(vId)) {
        map.set(vId, {
          brand: r.vehicle.brand,
          model: r.vehicle.model,
          type: r.vehicle.type || 'Standard',
          totalRating: r.rating,
          count: 1,
        });
      } else {
        const item = map.get(vId)!;
        item.totalRating += r.rating;
        item.count += 1;
      }
    });

    const arr: VehicleFeedbackSummary[] = [];
    map.forEach((val, vId) => {
      arr.push({
        vehicleId: vId,
        brand: val.brand,
        model: val.model,
        type: val.type,
        reviewCount: val.count,
        avgRating: Number((val.totalRating / val.count).toFixed(1)),
      });
    });

    // Sort by avg rating descending
    arr.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    return arr;
  }, [reviews]);

  // Filtered reviews for ledger
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    if (selectedVehicleId) {
      list = list.filter((r) => r.vehicle.id === selectedVehicleId);
    }

    list.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
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
  }, [reviews, selectedVehicleId, sortBy]);

  // Selected vehicle metadata if any
  const activeVehicleSummary = useMemo(() => {
    if (!selectedVehicleId) return null;
    return vehicleFeedbackList.find((v) => v.vehicleId === selectedVehicleId) || null;
  }, [selectedVehicleId, vehicleFeedbackList]);

  // High & Low performers
  const topVehicle = vehicleFeedbackList[0] || null;
  const lowestVehicle = vehicleFeedbackList.length > 1 ? vehicleFeedbackList[vehicleFeedbackList.length - 1] : null;

  return (
    <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
      <AppShell>
        {/* Editorial Operations Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6">
          <span className="micro-tag text-[#777770] block mb-1">
            02 / FLEET INTELLIGENCE
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
                VEHICLE FEEDBACK
              </h1>
              <p className="text-sm text-[#555550] font-mono mt-1">
                Pinpoint high-performing models and maintenance friction points from real customer telemetry.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedVehicleId(null);
                setSelectedRating(null);
                setSearchTerm('');
                fetchReviews();
              }}
            >
              RESET FILTERS
            </Button>
          </div>
        </div>

        {/* Fleet Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#C7F000]">
            <div className="flex items-center justify-between">
              <span className="micro-tag text-[#777770]">TOP RATED SPECIMEN</span>
              <Sparkles className="w-4 h-4 text-[#C7F000]" />
            </div>
            {topVehicle ? (
              <div className="mt-2">
                <span className="font-display font-black text-xl text-[#111111] block uppercase truncate">
                  {topVehicle.brand} {topVehicle.model}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-[#C7F000] text-[#111111] font-bold font-mono text-xs border border-[#111111]">
                    {topVehicle.avgRating} ★
                  </span>
                  <span className="font-mono text-[10px] text-[#777770]">
                    {topVehicle.reviewCount} customer ride reviews
                  </span>
                </div>
              </div>
            ) : (
              <span className="font-mono text-xs text-[#888880] mt-2 block">Calculating telemetry...</span>
            )}
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#FF654A]">
            <div className="flex items-center justify-between">
              <span className="micro-tag text-[#777770]">QUALITY SCRUTINY / LOWEST</span>
              <AlertTriangle className="w-4 h-4 text-[#FF654A]" />
            </div>
            {lowestVehicle ? (
              <div className="mt-2">
                <span className="font-display font-black text-xl text-[#111111] block uppercase truncate">
                  {lowestVehicle.brand} {lowestVehicle.model}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-[#FFF0ED] text-[#C4381F] font-bold font-mono text-xs border border-[#FF654A]">
                    {lowestVehicle.avgRating} ★
                  </span>
                  <span className="font-mono text-[10px] text-[#777770]">
                    Requires maintenance check
                  </span>
                </div>
              </div>
            ) : (
              <span className="font-mono text-xs text-[#888880] mt-2 block">No outlier flagged</span>
            )}
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
            <div className="flex items-center justify-between">
              <span className="micro-tag text-[#777770]">TOTAL AUDITED RIDES</span>
              <TrendingUp className="w-4 h-4 text-[#111111]" />
            </div>
            <span className="font-display font-black text-3xl text-[#111111] block mt-1">
              {reviews.length}
            </span>
            <span className="font-mono text-[10px] text-[#888880] mt-1 block uppercase">
              ACROSS {vehicleFeedbackList.length} FLEET MODELS
            </span>
          </div>
        </div>

        {/* Section: Vehicle Feedback Ranking Matrix */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-[#C7F000] border border-[#111111]" />
              <h3 className="font-display font-black text-base uppercase text-[#111111]">
                VEHICLE FEEDBACK RANKING
              </h3>
            </div>
            <span className="font-mono text-xs text-[#777770]">
              CLICK ANY VEHICLE TO FILTER THE LEDGER BELOW
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vehicleFeedbackList.map((vf) => {
              const isSelected = selectedVehicleId === vf.vehicleId;
              return (
                <div
                  key={vf.vehicleId}
                  onClick={() => setSelectedVehicleId(isSelected ? null : vf.vehicleId)}
                  className={clsx(
                    'p-4 bg-[#FFFFFF] border-2 transition-all cursor-pointer font-mono text-xs',
                    isSelected
                      ? 'border-[#111111] bg-[#FAF8F5] shadow-[4px_4px_0px_#C7F000]'
                      : 'border-[#111111]/20 hover:border-[#111111] hover:shadow-[3px_3px_0px_#111111]'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-[#777770] uppercase block">{vf.brand}</span>
                      <h4 className="font-display font-black text-sm text-[#111111] uppercase tracking-tight truncate">
                        {vf.model}
                      </h4>
                    </div>
                    <span
                      className={clsx(
                        'px-2 py-0.5 text-xs font-bold border',
                        vf.avgRating >= 4.5
                          ? 'bg-[#C7F000] text-[#111111] border-[#111111]'
                          : vf.avgRating >= 3.5
                          ? 'bg-[#FAF8F5] text-[#111111] border-[#111111]/30'
                          : 'bg-[#FFF0ED] text-[#C4381F] border-[#FF654A]'
                      )}
                    >
                      {vf.avgRating} ★
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#111111]/10 flex items-center justify-between text-[10px] text-[#777770]">
                    <span>{vf.reviewCount} REVIEWS</span>
                    <span className="flex items-center gap-0.5 text-[#111111] font-bold">
                      {isSelected ? 'ACTIVE FILTER' : 'INSPECT'} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Ledger Section */}
        <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] mb-12">
          {/* Active Filter Strip */}
          <div className="p-4 border-b border-[#111111]/15 bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-black text-sm uppercase text-[#111111]">
                REVIEW LEDGER
              </span>
              {activeVehicleSummary && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C7F000] border border-[#111111] font-mono text-xs font-bold text-[#111111]">
                  <span>VEHICLE: {activeVehicleSummary.brand} {activeVehicleSummary.model}</span>
                  <button
                    onClick={() => setSelectedVehicleId(null)}
                    className="hover:text-red-700"
                    aria-label="Clear vehicle filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono text-xs">
                <span className="text-[#777770]">RATING:</span>
                {[null, 5, 4, 3, 2].map((r) => (
                  <button
                    key={r ?? 'all'}
                    onClick={() => setSelectedRating(r)}
                    className={clsx(
                      'px-2 py-0.5 text-xs font-bold border',
                      selectedRating === r
                        ? 'bg-[#111111] text-[#FFFFFF] border-[#111111]'
                        : 'bg-white text-[#555550] border-[#111111]/20 hover:border-[#111111]'
                    )}
                  >
                    {r ? `${r}★` : 'ALL'}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as FleetSortOption)}
                className="bg-white border border-[#111111]/30 px-2 py-1 text-xs font-mono text-[#111111] focus:outline-none"
              >
                <option value="NEWEST">NEWEST</option>
                <option value="HIGHEST">HIGHEST</option>
                <option value="LOWEST">LOWEST</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[#FFF0ED] border-b border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full rounded-none" />
              <Skeleton className="h-12 w-full rounded-none" />
            </div>
          ) : displayedReviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#111111]/20 bg-[#FAF8F5] text-[10px] text-[#777770] uppercase">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4 w-28">RATING</th>
                    <th className="py-3 px-4">VEHICLE SPECIMEN</th>
                    <th className="py-3 px-4">DRIVER</th>
                    <th className="py-3 px-4">COMMENTARY</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/10">
                  {displayedReviews.map((rev, idx) => {
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
                            {rev.vehicle.registrationNumber || `ID #${rev.vehicle.id}`} • {rev.vehicle.type || 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#111111] block">{rev.customer.name}</span>
                          <span className="text-[10px] text-[#777770]">Rental #{rev.rentalId}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[#333330]">
                          {rev.comment ? `“${rev.comment}”` : <span className="text-[#888880] italic">No comment logged</span>}
                        </td>
                        <td className="py-3 px-4 text-[#555550]">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold text-[#111111] underline group-hover:text-[#7657FF]">
                            INSPECT
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<Star className="w-10 h-10 text-[#888880]" />}
                title="NO FEEDBACK RECORDS FOUND"
                description="No reviews found matching the current vehicle selection."
                action={
                  <Button size="sm" variant="outline" onClick={() => setSelectedVehicleId(null)}>
                    CLEAR VEHICLE SELECTION
                  </Button>
                }
              />
            </div>
          )}
        </div>

        {/* Review Detail Modal */}
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[8px_8px_0px_#111111] w-full max-w-xl max-h-[90vh] overflow-y-auto font-mono text-xs">
              <div className="p-4 border-b border-[#111111]/15 bg-[#111111] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#C7F000] text-[#111111] font-display font-black text-xs">
                    REVIEW #{selectedReview.id}
                  </span>
                  <span className="text-[10px] text-[#AAA8A0] uppercase font-mono">
                    FLEET TELEMETRY AUDIT
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
                    <span className="micro-tag text-[#777770] block">FLEET UNIT SPECIMEN</span>
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

                <div>
                  <span className="micro-tag text-[#777770] block mb-1">CUSTOMER FEEDBACK</span>
                  <div className="p-4 bg-[#FAF8F5] border-l-4 border-[#C7F000] border-t border-r border-b border-[#111111]/15">
                    {selectedReview.comment ? (
                      <p className="text-xs text-[#111111] italic leading-relaxed">
                        &ldquo;{selectedReview.comment}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-[#888880] italic">
                        No additional commentary logged.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#111111]/15 text-[11px]">
                  <div>
                    <span className="micro-tag text-[#777770] block mb-0.5">DRIVER IDENTITY</span>
                    <span className="font-bold text-[#111111] block">{selectedReview.customer.name}</span>
                    <span className="text-[#666660] block">{selectedReview.customer.email || `Customer #${selectedReview.customer.id}`}</span>
                  </div>
                  <div>
                    <span className="micro-tag text-[#777770] block mb-0.5">RECORD INTEGRITY</span>
                    <span className="font-bold text-[#111111] block">{selectedReview.createdAt || 'VERIFIED'}</span>
                    <span className="text-[#0E8345] font-semibold block flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> SECURE AUDIT RECORD
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#111111]/15 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedReview(null)}>
                  DISMISS INSPECTION
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
