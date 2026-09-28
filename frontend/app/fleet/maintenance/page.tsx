'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MaintenanceStatusBadge } from '@/components/ui/StatusBadge';
import { getMaintenanceTasks, scheduleMaintenance, updateMaintenanceStatus } from '@/lib/api/fleet';
import { MaintenanceTask, MaintenanceStatus, MaintenanceType, MaintenancePriority } from '@/types';
import { Wrench, Plus, AlertCircle, Info, X } from 'lucide-react';

export default function FleetMaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedVehicleId, setSchedVehicleId] = useState<string>('1');
  const [schedType, setSchedType] = useState<MaintenanceType>('ROUTINE');
  const [schedPriority, setSchedPriority] = useState<MaintenancePriority>('MEDIUM');
  const [schedDesc, setSchedDesc] = useState<string>('Routine oil change and brake inspection.');
  const [schedDate, setSchedDate] = useState<string>('2026-10-01');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMaintenanceTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fleet maintenance tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getMaintenanceTasks();
        if (mounted) setTasks(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load fleet maintenance tasks.');
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
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update status for Task #${id}.`);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vId = parseInt(schedVehicleId, 10);
    if (isNaN(vId) || vId <= 0) {
      setModalError('Please enter a valid numeric Vehicle ID.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      await scheduleMaintenance({
        vehicleId: vId,
        type: schedType,
        priority: schedPriority,
        description: schedDesc,
        scheduledDate: schedDate,
      });
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to schedule maintenance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute total accumulated maintenance cost from returned backend tasks
  const totalCost = tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0);
  const openTasksCount = tasks.filter((t) => t.status === 'SCHEDULED' || t.status === 'IN_PROGRESS').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const filteredTasks = tasks.filter((t) => statusFilter === 'ALL' || t.status === statusFilter);

  return (
    <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
      <AppShell>
        <PageHeader
          title="Maintenance Impact & Downtime Oversight"
          description="Operational visibility into scheduled maintenance tasks, accumulated costs, task priorities, and scheduling."
          action={
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
              Schedule Maintenance
            </Button>
          }
        />

        {/* Operational Scope Note */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-slate-900 font-bold mb-0.5">Role Authorization Scope:</strong>
            Fleet Managers schedule maintenance tasks (`POST /api/maintenance`) and transition task statuses (`PATCH /api/maintenance/:id/status`). Final task completion logging (`POST /api/maintenance/:id/complete`) with actual cost entry is performed by Maintenance Staff.
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Maintenance Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <Card>
            <CardContent className="p-5 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Open Maintenance Tasks
              </span>
              <span className="text-3xl font-extrabold text-amber-600 tabular-nums">{openTasksCount}</span>
              <p className="text-xs text-slate-500">Scheduled or currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Completed Servicing Log
              </span>
              <span className="text-3xl font-extrabold text-emerald-600 tabular-nums">{completedTasksCount}</span>
              <p className="text-xs text-slate-500">Serviced & verified by maintenance staff</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Maintenance Expenditures
              </span>
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <p className="text-xs text-slate-500">Recorded parts & servicing receipts</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
          {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Tasks' : st}
            </button>
          ))}
        </div>

        {/* Maintenance Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> Maintenance Records ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading maintenance log...</div>
            ) : filteredTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                      <th className="pb-3 font-semibold">Task ID</th>
                      <th className="pb-3 font-semibold">Vehicle</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Priority</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Scheduled Date</th>
                      <th className="pb-3 font-semibold">Recorded Cost</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-bold text-slate-900">#{t.id}</td>
                        <td className="py-3 font-semibold text-slate-900">Vehicle #{t.vehicleId}</td>
                        <td className="py-3 font-bold uppercase text-slate-700">{t.type}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              t.priority === 'CRITICAL' || t.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : t.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 max-w-xs truncate">{t.description || '—'}</td>
                        <td className="py-3 text-slate-600">{t.scheduledDate}</td>
                        <td className="py-3 font-bold text-slate-900 tabular-nums">
                          {t.totalCost > 0 ? `₹${t.totalCost.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3">
                          <MaintenanceStatusBadge status={t.status} />
                        </td>
                        <td className="py-3">
                          {t.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleStatusUpdate(t.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md text-[11px] font-bold transition-colors"
                            >
                              Start Service
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 p-4">No maintenance tasks match the active filter.</p>
            )}
          </CardContent>
        </Card>

        {/* Schedule Maintenance Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white shadow-2xl animate-in fade-in zoom-in duration-150">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" /> Schedule Maintenance Task
                </CardTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <Input
                    label="Vehicle ID"
                    type="number"
                    min={1}
                    value={schedVehicleId}
                    onChange={(e) => setSchedVehicleId(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Task Type</label>
                      <select
                        value={schedType}
                        onChange={(e) => setSchedType(e.target.value as MaintenanceType)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ROUTINE">ROUTINE</option>
                        <option value="REPAIR">REPAIR</option>
                        <option value="INSPECTION">INSPECTION</option>
                        <option value="EMERGENCY">EMERGENCY</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                      <select
                        value={schedPriority}
                        onChange={(e) => setSchedPriority(e.target.value as MaintenancePriority)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Scheduled Date"
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Maintenance Description
                    </label>
                    <textarea
                      value={schedDesc}
                      onChange={(e) => setSchedDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {modalError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<Wrench className="w-4 h-4" />}>
                      Schedule Task
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
