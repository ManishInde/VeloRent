'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FleetMetricGrid } from '@/components/fleet/FleetMetricGrid';
import { IntelligenceAlertCard } from '@/components/fleet/IntelligenceAlertCard';
import { HealthScoreBadge } from '@/components/fleet/HealthScoreBadge';
import { MaintenanceStatusBadge } from '@/components/ui/StatusBadge';
import { getFleetAnalytics, getFleetInsights } from '@/lib/api/admin';
import { getVehicles } from '@/lib/api/vehicles';
import { getMaintenanceTasks } from '@/lib/api/fleet';
import { FleetAnalyticsReport, FleetInsight, Vehicle, MaintenanceTask } from '@/types';
import {
  Car,
  Activity,
  ShieldCheck,
  Wrench,
  Sparkles,
  Zap,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function FleetOverviewPage() {
  const [report, setReport] = useState<FleetAnalyticsReport | null>(null);
  const [insights, setInsights] = useState<FleetInsight[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [openMaintenance, setOpenMaintenance] = useState<MaintenanceTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchOverviewData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [rep, ins, vList, maints] = await Promise.all([
          getFleetAnalytics().catch(() => null),
          getFleetInsights().catch(() => []),
          getVehicles().catch(() => []),
          getMaintenanceTasks().catch(() => []),
        ]);

        if (mounted) {
          setReport(rep);
          setInsights(ins);
          setVehicles(vList);
          setOpenMaintenance(maints);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load fleet overview data.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchOverviewData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter vehicles requiring health attention (health < 70)
  const healthAttentionVehicles = vehicles
    .filter((v) => v.healthScore < 70)
    .sort((a, b) => a.healthScore - b.healthScore);

  return (
    <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
      <AppShell>
        <PageHeader
          title="Fleet Operations Command Center"
          description="Operational fleet decision support, vehicle health monitoring, allocation optimization, and intelligence engine insights."
          action={
            <Link href="/fleet/allocation">
              <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-xs">
                <Zap className="w-4 h-4" /> Run Smart Allocation
              </button>
            </Link>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Operational Stat Grid */}
        <FleetMetricGrid report={report} totalFleetCount={vehicles.length} isLoading={isLoading} />

        {/* Operations Hub Navigation */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 mb-3 tracking-tight">Fleet Command Modules</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Fleet Inventory', href: '/fleet/vehicles', icon: <Car className="w-5 h-5 text-blue-600" /> },
              { label: 'Utilization Analytics', href: '/fleet/utilization', icon: <Activity className="w-5 h-5 text-emerald-600" /> },
              { label: 'Vehicle Health', href: '/fleet/health', icon: <ShieldCheck className="w-5 h-5 text-indigo-600" /> },
              { label: 'Fleet Intelligence', href: '/fleet/intelligence', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
              { label: 'Smart Allocation', href: '/fleet/allocation', icon: <Zap className="w-5 h-5 text-purple-600" /> },
              { label: 'Maintenance Impact', href: '/fleet/maintenance', icon: <Wrench className="w-5 h-5 text-rose-600" /> },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="p-2.5 bg-slate-50 group-hover:bg-slate-100 rounded-lg transition-colors">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Intelligence Engine High-Priority Alerts */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> FleetIntelligenceEngine Recommendations
              </h3>
              <Link href="/fleet/intelligence" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-6 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                Loading intelligence recommendations...
              </div>
            ) : insights.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {insights.slice(0, 4).map((ins, idx) => (
                  <IntelligenceAlertCard key={idx} insight={ins} />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                No active operational alerts flagged by C++ FleetIntelligenceEngine.
              </div>
            )}
          </div>

          {/* Health Attention Spotlight */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" /> Health Attention Required
              </CardTitle>
              <Link href="/fleet/health" className="text-xs text-blue-600 hover:underline">
                Inspect All
              </Link>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              {isLoading ? (
                <div className="p-3 text-xs text-slate-500">Checking health scores...</div>
              ) : healthAttentionVehicles.length > 0 ? (
                <div className="space-y-3">
                  {healthAttentionVehicles.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {v.brand} {v.model}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">Reg: {v.registrationNumber}</span>
                      </div>
                      <HealthScoreBadge score={v.healthScore} showCategory={false} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  All fleet vehicles maintain healthy operational scores (≥ 70).
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Open Maintenance Tasks Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> Active Maintenance Tasks
            </CardTitle>
            <Link href="/fleet/maintenance" className="text-xs text-blue-600 hover:underline">
              View Maintenance Log
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            {isLoading ? (
              <div className="p-4 text-xs text-slate-500">Loading open tasks...</div>
            ) : openMaintenance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                      <th className="pb-2 font-semibold">Task ID</th>
                      <th className="pb-2 font-semibold">Vehicle ID</th>
                      <th className="pb-2 font-semibold">Type</th>
                      <th className="pb-2 font-semibold">Priority</th>
                      <th className="pb-2 font-semibold">Scheduled Date</th>
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {openMaintenance.slice(0, 5).map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 font-bold text-slate-900">#{m.id}</td>
                        <td className="py-2.5 font-medium text-slate-800">Vehicle #{m.vehicleId}</td>
                        <td className="py-2.5 uppercase font-semibold text-slate-700">{m.type}</td>
                        <td className="py-2.5 font-bold text-slate-900">{m.priority}</td>
                        <td className="py-2.5 text-slate-600">{m.scheduledDate}</td>
                        <td className="py-2.5"><MaintenanceStatusBadge status={m.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No open maintenance tasks scheduled.</p>
            )}
          </CardContent>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
