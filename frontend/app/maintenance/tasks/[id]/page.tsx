'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaintenanceStatusBadge, VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { HealthScoreBadge } from '@/components/fleet/HealthScoreBadge';
import { MaintenanceCompletionModal } from '@/components/maintenance/MaintenanceCompletionModal';
import { getMaintenanceTaskById, updateMaintenanceStatus } from '@/lib/api/fleet';
import { getVehicleById, getVehicleHealth } from '@/lib/api/vehicles';
import { MaintenanceTask, Vehicle, VehicleHealth, MaintenanceStatus } from '@/types';
import {
  Wrench,
  Car,
  AlertCircle,
  CheckCircle2,
  Play,
  ArrowLeft,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function MaintenanceTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const taskId = parseInt(id, 10);

  const [task, setTask] = useState<MaintenanceTask | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [health, setHealth] = useState<VehicleHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Completion modal state
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  const fetchTaskDetails = async () => {
    if (isNaN(taskId) || taskId <= 0) {
      setError('Invalid Maintenance Task ID.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const t = await getMaintenanceTaskById(taskId);
      setTask(t);

      if (t.vehicleId) {
        const [v, h] = await Promise.all([
          getVehicleById(t.vehicleId).catch(() => null),
          getVehicleHealth(t.vehicleId).catch(() => null),
        ]);
        setVehicle(v);
        setHealth(h);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Maintenance task #${taskId} not found.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (isNaN(taskId) || taskId <= 0) {
        if (mounted) {
          setError('Invalid Maintenance Task ID.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const t = await getMaintenanceTaskById(taskId);
        if (mounted) setTask(t);

        if (t.vehicleId) {
          const [v, h] = await Promise.all([
            getVehicleById(t.vehicleId).catch(() => null),
            getVehicleHealth(t.vehicleId).catch(() => null),
          ]);
          if (mounted) {
            setVehicle(v);
            setHealth(h);
          }
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : `Maintenance task #${taskId} not found.`);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [taskId]);

  const handleStatusUpdate = async (newStatus: MaintenanceStatus) => {
    if (!task) return;
    try {
      await updateMaintenanceStatus(task.id, newStatus);
      fetchTaskDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update status for Task #${task.id}.`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['MAINTENANCE_STAFF', 'ADMIN']}>
      <AppShell>
        <div className="mb-4">
          <Link href="/maintenance/tasks" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Task Queue
          </Link>
        </div>

        <PageHeader
          title={`Maintenance Task #${taskId}`}
          description="Detailed technician work order, vehicle specs, health diagnostics, and task completion logger."
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            Loading maintenance task specifications...
          </div>
        ) : task ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Task Details & Workflow Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600" /> Work Order Specifications
                  </CardTitle>
                  <MaintenanceStatusBadge status={task.status} />
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Task Type</span>
                      <span className="font-bold text-slate-900 uppercase">{task.type}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Priority</span>
                      <span
                        className={`font-bold uppercase ${
                          task.priority === 'CRITICAL' || task.priority === 'HIGH'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Scheduled Date</span>
                      <span className="font-semibold text-slate-800">{task.scheduledDate || '—'}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Completion Date</span>
                      <span className="font-semibold text-slate-800">{task.completionDate || 'Pending'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1">Detailed Description</span>
                    <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Damage Report Reference if present */}
                  {task.damageReportId > 0 && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <strong className="block font-bold flex items-center gap-1.5 text-amber-800">
                        <FileText className="w-4 h-4 text-amber-600" /> Linked Damage Report Reference
                      </strong>
                      <p className="text-slate-700">
                        This maintenance task was generated from Damage Report ID #{task.damageReportId}.
                      </p>
                    </div>
                  )}

                  {/* Technician Status Controls */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 font-medium">Technician Action:</span>
                    <div className="flex items-center gap-2">
                      {task.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Play className="w-4 h-4 text-amber-600" />}
                          onClick={() => handleStatusUpdate('IN_PROGRESS')}
                        >
                          Transition to In Progress
                        </Button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => setIsCompletionModalOpen(true)}
                        >
                          Complete Maintenance Work
                        </Button>
                      )}

                      {task.status === 'COMPLETED' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Work Order Completed & Logged
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vehicle Specs & Health Diagnostics */}
            <div className="space-y-6">
              {vehicle && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" /> Vehicle Information
                    </CardTitle>
                    <VehicleStatusBadge status={vehicle.status} />
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 space-y-3 text-xs">
                    <div className="pb-3 border-b border-slate-100">
                      <h4 className="font-extrabold text-base text-slate-900">
                        {vehicle.brand} {vehicle.model}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Reg: {vehicle.registrationNumber} • Vehicle ID #{vehicle.id}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Category ID</span>
                        <span className="font-bold text-slate-900">#{vehicle.categoryId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Type & Fuel</span>
                        <span className="font-bold text-slate-900">{vehicle.type} ({vehicle.fuelType})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Odometer</span>
                        <span className="font-bold text-slate-900 tabular-nums">{vehicle.odometerKm.toLocaleString()} km</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {health && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" /> C++ VehicleHealthEngine Diagnostics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-600 font-semibold">Health Score</span>
                      <HealthScoreBadge score={health.score} category={health.category} />
                    </div>

                    {health.factors && health.factors.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-900 block mb-1">Health Factors</span>
                        <ul className="space-y-1 text-slate-700">
                          {health.factors.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Engine Recommendation</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{health.recommendedAction}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : null}

        {/* Completion Modal */}
        <MaintenanceCompletionModal
          isOpen={isCompletionModalOpen}
          task={task}
          onClose={() => setIsCompletionModalOpen(false)}
          onSuccess={fetchTaskDetails}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
