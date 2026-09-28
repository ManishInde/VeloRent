'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AllocationRecommendationCard } from '@/components/fleet/AllocationRecommendationCard';
import { allocateVehicle } from '@/lib/api/fleet';
import { VehicleAllocationResult } from '@/types';
import { Zap, AlertCircle, Info } from 'lucide-react';

export default function FleetAllocationPage() {
  const [categoryId, setCategoryId] = useState<string>('0');
  const [maxBudget, setMaxBudget] = useState<string>('10000');
  const [allocationResult, setAllocationResult] = useState<VehicleAllocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = parseInt(categoryId, 10);
    const budget = parseFloat(maxBudget);

    setIsLoading(true);
    setError(null);
    setAllocationResult(null);

    try {
      const result = await allocateVehicle({
        categoryId: isNaN(cat) ? 0 : cat,
        maxBudget: isNaN(budget) || budget <= 0 ? 100000 : budget,
      });
      setAllocationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No matching available vehicle for allocation request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
      <AppShell>
        <PageHeader
          title="Intelligent Vehicle Allocation Engine"
          description="Demonstrate C++ VehicleAllocationEngine optimizing allocation decisions based on fleet availability, vehicle health, and customer requirements."
        />

        {/* Engine Rationale Note */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-slate-900 font-bold mb-0.5">Authoritative Backend Allocation:</strong>
            Allocation scores and selected vehicles are computed by the C++ `VehicleAllocationEngine` (`POST /api/vehicles/allocate`). The frontend displays the backend decision rationale without calculating competing allocation scores.
          </div>
        </div>

        {/* Allocation Query Controls */}
        <Card className="mb-8 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" /> Allocation Request Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 space-y-4">
            <form onSubmit={handleRunAllocation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Category ID (0 for Any Category)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="e.g. 1 (Sedan) or 0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Daily Rental Budget (INR)
                  </label>
                  <Input
                    type="number"
                    min={100}
                    step={100}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                isLoading={isLoading}
                leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
              >
                Execute C++ Allocation Engine
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 max-w-2xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Allocation Result Visual Card */}
        {allocationResult && (
          <div className="max-w-3xl">
            <AllocationRecommendationCard result={allocationResult} />
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
