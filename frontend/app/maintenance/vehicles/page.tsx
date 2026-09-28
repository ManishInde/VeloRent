'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { HealthScoreBadge } from '@/components/fleet/HealthScoreBadge';
import { getVehicles, getVehicleHealth } from '@/lib/api/vehicles';
import { updateVehicleStatus } from '@/lib/api/admin';
import { Vehicle, VehicleHealth, VehicleStatus } from '@/types';
import { Search, ShieldCheck, AlertCircle, ChevronRight, X } from 'lucide-react';

export default function MaintenanceVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('MAINTENANCE');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Diagnostics Drawer state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [healthDetail, setHealthDetail] = useState<VehicleHealth | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchVehiclesList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getVehicles();
        if (mounted) setVehicles(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load maintenance vehicles.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInspectHealth = async (v: Vehicle) => {
    setSelectedVehicle(v);
    setHealthDetail(null);
    setIsEvaluating(true);
    try {
      const res = await getVehicleHealth(v.id);
      setHealthDetail(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to evaluate health score for Vehicle #${v.id}.`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTransitionStatus = async (vId: number, newStatus: VehicleStatus) => {
    try {
      await updateVehicleStatus(vId, newStatus);
      fetchVehiclesList();
      if (selectedVehicle?.id === vId) {
        setSelectedVehicle(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update status for Vehicle #${vId}.`);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['MAINTENANCE_STAFF', 'ADMIN']}>
      <AppShell>
        <PageHeader
          title="Maintenance Operational Vehicles & Health Diagnostics"
          description="Technician inspection view for vehicles in maintenance status, health diagnostics evaluation, and status transitions."
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Input
              placeholder="Search by brand, model, registration..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['MAINTENANCE', 'AVAILABLE', 'OUT_OF_SERVICE', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === 'MAINTENANCE' ? 'Under Maintenance' : st === 'ALL' ? 'All Fleet' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Diagnostics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading vehicles for technician inspection...
            </div>
          ) : filteredVehicles.length > 0 ? (
            filteredVehicles.map((v) => (
              <Card key={v.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      {v.brand} {v.model}
                    </CardTitle>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Reg: {v.registrationNumber} • {v.type}
                    </span>
                  </div>
                  <VehicleStatusBadge status={v.status} />
                </CardHeader>

                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Health Score</span>
                    <HealthScoreBadge score={v.healthScore} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Odometer</span>
                      <p className="font-bold text-slate-800 tabular-nums">{v.odometerKm.toLocaleString()} km</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Fuel / Trans</span>
                      <p className="font-bold text-slate-800">{v.fuelType} ({v.transmission})</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleInspectHealth(v)}
                    >
                      <span>Diagnostics</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>

                    {v.status === 'MAINTENANCE' && (
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleTransitionStatus(v.id, 'AVAILABLE')}
                      >
                        Set Available
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              No vehicles match the selected status filter.
            </div>
          )}
        </div>

        {/* Diagnostics Drawer Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-xl w-full bg-white shadow-2xl animate-in fade-in zoom-in duration-150">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> C++ Health Engine Inspection
                </CardTitle>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Reg: {selectedVehicle.registrationNumber} • ID #{selectedVehicle.id}
                    </p>
                  </div>
                  <HealthScoreBadge score={selectedVehicle.healthScore} />
                </div>

                {isEvaluating ? (
                  <div className="p-6 text-center text-xs text-slate-500">Evaluating C++ health parameters...</div>
                ) : healthDetail ? (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-600 font-semibold">Engine Category</span>
                      <span className="font-extrabold text-slate-900 uppercase">{healthDetail.category || 'GOOD'}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Contributing Factors</span>
                      {healthDetail.factors && healthDetail.factors.length > 0 ? (
                        <ul className="space-y-1 text-slate-700">
                          {healthDetail.factors.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 italic">No adverse factors recorded.</p>
                      )}
                    </div>

                    <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-900">
                      <span className="font-bold block text-blue-800 mb-0.5">Technician Recommendation</span>
                      <p className="text-slate-800 font-medium">{healthDetail.recommendedAction}</p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
