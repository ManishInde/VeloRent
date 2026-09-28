'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { getFleetAnalytics } from '@/lib/api/admin';
import { getVehicles } from '@/lib/api/vehicles';
import { FleetAnalyticsReport, Vehicle } from '@/types';
import { Activity, Car, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function FleetUtilizationPage() {
  const [report, setReport] = useState<FleetAnalyticsReport | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchUtilizationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [rep, vList] = await Promise.all([
          getFleetAnalytics().catch(() => null),
          getVehicles().catch(() => []),
        ]);
        if (mounted) {
          setReport(rep);
          setVehicles(vList);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load fleet utilization data.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchUtilizationData();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute status distributions directly from real backend vehicles list
  const totalCount = vehicles.length;
  const statusCounts = vehicles.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Compute category breakdown from real vehicles list
  const categoryMap: Record<number, { count: number; rented: number; available: number }> = {};
  vehicles.forEach((v) => {
    if (!categoryMap[v.categoryId]) {
      categoryMap[v.categoryId] = { count: 0, rented: 0, available: 0 };
    }
    categoryMap[v.categoryId].count += 1;
    if (v.status === 'RENTED') categoryMap[v.categoryId].rented += 1;
    if (v.status === 'AVAILABLE') categoryMap[v.categoryId].available += 1;
  });

  const availableVehiclesList = vehicles.filter((v) => v.status === 'AVAILABLE');
  const rentedVehiclesList = vehicles.filter((v) => v.status === 'RENTED');

  return (
    <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
      <AppShell>
        <PageHeader
          title="Fleet Utilization & Operational Load Analytics"
          description="Authoritative fleet capacity metrics, active rented vs available distribution, and category utilization breakdown."
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Backend Analytics Note */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-slate-900 font-bold mb-0.5">Authoritative Utilization Note:</strong>
            All utilization percentages and fleet breakdown counts represent live current operational state returned by the C++ backend. Historical time-series trends are omitted in compliance with backend API availability.
          </div>
        </div>

        {/* Aggregate Utilization Stat Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Card className="bg-slate-900 text-white border-none shadow-md">
            <CardContent className="p-6 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Live Fleet Utilization Rate
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-white tabular-nums">
                  {isLoading || !report ? '—' : `${report.fleetUtilizationPct.toFixed(1)}%`}
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Live
                </span>
              </div>
              <p className="text-xs text-slate-400 pt-1">
                {report ? `${report.rentedVehicles} of ${report.totalVehicles} active fleet vehicles checked out` : 'Calculating utilization...'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Available Capacity
              </span>
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {isLoading || !report ? '—' : report.availableVehicles}
              </span>
              <p className="text-xs text-slate-500">Ready for customer booking allocation</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                In Maintenance / Service
              </span>
              <span className="text-3xl font-extrabold text-amber-600 tabular-nums">
                {isLoading || !report ? '—' : report.maintenanceVehicles}
              </span>
              <p className="text-xs text-slate-500">Scheduled or active maintenance tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Real Status Distribution Progress Bars */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChartIcon className="w-4 h-4 text-blue-600" /> Operational Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 space-y-5">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {totalCount > 0 && (
                <>
                  <div
                    style={{ width: `${((statusCounts['RENTED'] || 0) / totalCount) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`RENTED: ${statusCounts['RENTED'] || 0}`}
                  />
                  <div
                    style={{ width: `${((statusCounts['AVAILABLE'] || 0) / totalCount) * 100}%` }}
                    className="bg-blue-500 h-full transition-all"
                    title={`AVAILABLE: ${statusCounts['AVAILABLE'] || 0}`}
                  />
                  <div
                    style={{ width: `${((statusCounts['MAINTENANCE'] || 0) / totalCount) * 100}%` }}
                    className="bg-amber-500 h-full transition-all"
                    title={`MAINTENANCE: ${statusCounts['MAINTENANCE'] || 0}`}
                  />
                  <div
                    style={{ width: `${((statusCounts['RESERVED'] || 0) / totalCount) * 100}%` }}
                    className="bg-purple-500 h-full transition-all"
                    title={`RESERVED: ${statusCounts['RESERVED'] || 0}`}
                  />
                  <div
                    style={{ width: `${((statusCounts['OUT_OF_SERVICE'] || 0) / totalCount) * 100}%` }}
                    className="bg-rose-500 h-full transition-all"
                    title={`OUT_OF_SERVICE: ${statusCounts['OUT_OF_SERVICE'] || 0}`}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {[
                { status: 'RENTED', label: 'Rented', count: statusCounts['RENTED'] || 0, color: 'bg-emerald-500' },
                { status: 'AVAILABLE', label: 'Available', count: statusCounts['AVAILABLE'] || 0, color: 'bg-blue-500' },
                { status: 'MAINTENANCE', label: 'Maintenance', count: statusCounts['MAINTENANCE'] || 0, color: 'bg-amber-500' },
                { status: 'RESERVED', label: 'Reserved', count: statusCounts['RESERVED'] || 0, color: 'bg-purple-500' },
                { status: 'OUT_OF_SERVICE', label: 'Out of Service', count: statusCounts['OUT_OF_SERVICE'] || 0, color: 'bg-rose-500' },
              ].map((st) => (
                <div key={st.status} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                    <span className="font-semibold text-slate-700">{st.label}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-lg font-bold text-slate-900 tabular-nums">{st.count}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {totalCount > 0 ? `${((st.count / totalCount) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rented Vehicles List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Rented Fleet ({rentedVehiclesList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              {isLoading ? (
                <div className="p-4 text-xs text-slate-500">Loading rented vehicles...</div>
              ) : rentedVehiclesList.length > 0 ? (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {rentedVehiclesList.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{v.brand} {v.model}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Reg: {v.registrationNumber} • Rate: ₹{v.baseRentalRate}/day
                        </span>
                      </div>
                      <VehicleStatusBadge status={v.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 p-4">No vehicles currently checked out on active rentals.</p>
              )}
            </CardContent>
          </Card>

          {/* Available Fleet Inventory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" /> Ready Capacity Fleet ({availableVehiclesList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              {isLoading ? (
                <div className="p-4 text-xs text-slate-500">Loading available capacity...</div>
              ) : availableVehiclesList.length > 0 ? (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {availableVehiclesList.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{v.brand} {v.model}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Reg: {v.registrationNumber} • {v.type} ({v.fuelType})
                        </span>
                      </div>
                      <VehicleStatusBadge status={v.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 p-4">No vehicles currently available for new bookings.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}
