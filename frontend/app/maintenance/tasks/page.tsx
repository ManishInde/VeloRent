'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { MaintenanceTaskCard } from '@/components/maintenance/MaintenanceTaskCard';
import { MaintenanceCompletionModal } from '@/components/maintenance/MaintenanceCompletionModal';
import { getMaintenanceTasks, updateMaintenanceStatus } from '@/lib/api/fleet';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/types';
import { Search, AlertCircle } from 'lucide-react';

export default function MaintenanceTasksPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Completion modal state
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  const fetchTasksList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMaintenanceTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance task queue.');
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
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load maintenance task queue.');
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
      fetchTasksList();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update status for Task #${id}.`);
    }
  };

  const handleOpenCompleteModal = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsCompletionModalOpen(true);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.id.toString().includes(searchQuery) ||
      t.vehicleId.toString().includes(searchQuery) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <ProtectedRoute allowedRoles={['MAINTENANCE_STAFF', 'ADMIN']}>
      <AppShell>
        <PageHeader
          title="Maintenance Task Queue & Dispatch Workbench"
          description="Technician queue management, priority sorting, status transitions, and repair completions."
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
              placeholder="Search by Task ID, Vehicle ID, type, or description..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
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
                  {st === 'ALL' ? 'All Statuses' : st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pr) => (
                <button
                  key={pr}
                  onClick={() => setPriorityFilter(pr)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    priorityFilter === pr
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading maintenance tasks queue...
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((t) => (
              <MaintenanceTaskCard
                key={t.id}
                task={t}
                onStatusUpdate={handleStatusUpdate}
                onOpenCompleteModal={handleOpenCompleteModal}
              />
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              No maintenance tasks match the selected search, status, and priority filters.
            </div>
          )}
        </div>

        {/* Completion Modal */}
        <MaintenanceCompletionModal
          isOpen={isCompletionModalOpen}
          task={selectedTask}
          onClose={() => setIsCompletionModalOpen(false)}
          onSuccess={fetchTasksList}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
