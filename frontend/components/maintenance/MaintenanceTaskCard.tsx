import React from 'react';
import Link from 'next/link';
import { MaintenanceTask, MaintenanceStatus } from '@/types';
import { MaintenanceStatusBadge } from '@/components/ui/StatusBadge';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  onStatusUpdate?: (id: number, status: MaintenanceStatus) => void;
  onOpenCompleteModal?: (task: MaintenanceTask) => void;
}

export const MaintenanceTaskCard: React.FC<MaintenanceTaskCardProps> = ({
  task,
  onStatusUpdate,
  onOpenCompleteModal,
}) => {
  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">Task #{task.id}</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getPriorityStyle()}`}>
              {task.priority}
            </span>
          </div>
          <MaintenanceStatusBadge status={task.status} />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-800 block">
            Vehicle #{task.vehicleId} • {task.type}
          </span>
          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{task.description || 'No description provided.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div>
            <span className="text-slate-400 block">Scheduled Date</span>
            <span className="font-semibold text-slate-700">{task.scheduledDate || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Recorded Cost</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {task.totalCost > 0 ? `₹${task.totalCost.toLocaleString()}` : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/maintenance/tasks/${task.id}`}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          Inspect Details <ArrowRight className="w-3 h-3" />
        </Link>

        <div className="flex items-center gap-1.5">
          {task.status === 'SCHEDULED' && onStatusUpdate && (
            <button
              onClick={() => onStatusUpdate(task.id, 'IN_PROGRESS')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" /> Start Service
            </button>
          )}

          {task.status === 'IN_PROGRESS' && onOpenCompleteModal && (
            <button
              onClick={() => onOpenCompleteModal(task)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
            >
              <CheckCircle2 className="w-3 h-3" /> Log Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
