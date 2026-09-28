'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { MaintenanceTaskCard } from '@/components/maintenance/MaintenanceTaskCard';
import { MaintenanceCompletionModal } from '@/components/maintenance/MaintenanceCompletionModal';
import { getMaintenanceTasks, updateMaintenanceStatus } from '@/lib/api/fleet';
import { getVehicles } from '@/lib/api/vehicles';
import { MaintenanceTask, Vehicle, MaintenanceStatus } from '@/types';
import { Wrench, Car, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function MaintenanceDashboardPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Completion modal state
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mList, vList] = await Promise.all([
        getMaintenanceTasks().catch(() => []),
        getVehicles().catch(() => []),
      ]);
      setTasks(mList);
      setVehicles(vList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load technician overview data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [mList, vList] = await Promise.all([
          getMaintenanceTasks().catch(() => []),
          getVehicles().catch(() => []),
        ]);
        if (mounted) {
          setTasks(mList);
          setVehicles(vList);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load technician overview data.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: MaintenanceStatus) => {
    try {
      await updateMaintenanceStatus(id, newStatus);
      fetchOverviewData();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update status for Task #${id}.`);
    }
  };

  const handleOpenCompleteModal = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsCompletionModalOpen(true);
  };

  const openTasks = tasks.filter((t) => t.status === 'SCHEDULED' || t.status === 'IN_PROGRESS');
  const highPriorityTasks = tasks.filter(
    (t) => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'COMPLETED'
  );
  const vehiclesInMaintenance = vehicles.filter((v) => v.status === 'MAINTENANCE');

  return (
    <ProtectedRoute allowedRoles={['MAINTENANCE_STAFF', 'ADMIN']}>
      <AppShell>
        <PageHeader
          title="Maintenance Staff Operational Workbench"
          description="Technician dashboard for assigned vehicle repair tasks, status updates, health diagnostics, and work completions."
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Technician Stat Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Open Servicing Tasks"
            value={isLoading ? '—' : openTasks.length}
            subtitle="Scheduled or in-progress repair jobs"
            icon={<Wrench className="w-5 h-5 text-amber-600" />}
          />

          <StatCard
            title="Urgent / High Priority"
            value={isLoading ? '—' : highPriorityTasks.length}
            subtitle="Critical or high priority repair queue"
            icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          />

          <StatCard
            title="Vehicles in Maintenance"
            value={isLoading ? '—' : vehiclesInMaintenance.length}
            subtitle="Current fleet bays under repair"
            icon={<Car className="w-5 h-5 text-indigo-600" />}
          />

          <StatCard
            title="Total Logged Tasks"
            value={isLoading ? '—' : tasks.length}
            subtitle="Active database task inventory"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          />
        </div>

        {/* Urgent Task Queue */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> Urgent Repair Queue ({highPriorityTasks.length})
            </h3>
            <Link href="/maintenance/tasks" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All Tasks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-6 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
              Loading technician task queue...
            </div>
          ) : highPriorityTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highPriorityTasks.map((t) => (
                <MaintenanceTaskCard
                  key={t.id}
                  task={t}
                  onStatusUpdate={handleStatusUpdate}
                  onOpenCompleteModal={handleOpenCompleteModal}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
              No urgent high-priority repair tasks currently pending.
            </div>
          )}
        </div>

        {/* Vehicles Under Maintenance Spot Check */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-indigo-600" /> Fleet Vehicles Currently in Maintenance ({vehiclesInMaintenance.length})
            </CardTitle>
            <Link href="/maintenance/vehicles" className="text-xs text-blue-600 hover:underline">
              Inspect Diagnostics
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            {isLoading ? (
              <div className="p-4 text-xs text-slate-500">Loading maintenance bays...</div>
            ) : vehiclesInMaintenance.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {vehiclesInMaintenance.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{v.brand} {v.model}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Reg: {v.registrationNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                      Health: {v.healthScore}/100
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                No vehicles currently locked in maintenance status.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Task Completion Modal */}
        <MaintenanceCompletionModal
          isOpen={isCompletionModalOpen}
          task={selectedTask}
          onClose={() => setIsCompletionModalOpen(false)}
          onSuccess={fetchOverviewData}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
