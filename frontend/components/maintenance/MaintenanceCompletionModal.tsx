import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { completeMaintenanceTask } from '@/lib/api/fleet';
import { MaintenanceTask } from '@/types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface MaintenanceCompletionModalProps {
  isOpen: boolean;
  task: MaintenanceTask | null;
  onClose: () => void;
  onSuccess: (updatedTask: MaintenanceTask) => void;
}

export const MaintenanceCompletionModal: React.FC<MaintenanceCompletionModalProps> = ({
  isOpen,
  task,
  onClose,
  onSuccess,
}) => {
  const [totalCost, setTotalCost] = useState<string>('1500');
  const [notes, setNotes] = useState<string>('Servicing completed cleanly. Tested and verified for fleet re-entry.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(totalCost);
    if (isNaN(costNum) || costNum < 0) {
      setError('Please enter a valid non-negative servicing cost.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await completeMaintenanceTask(task.id, costNum, notes);
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log maintenance completion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-2xl animate-in fade-in zoom-in duration-150">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle className="text-sm flex items-center gap-2 text-slate-900 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Complete Maintenance Task #{task.id}
          </CardTitle>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <span className="text-slate-400 block text-[11px]">Vehicle ID & Task Description</span>
            <span className="font-bold text-slate-900 block">Vehicle #{task.vehicleId} • {task.type}</span>
            <p className="text-slate-600 truncate">{task.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Total Servicing & Parts Cost (INR)"
              type="number"
              min={0}
              step={50}
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="e.g. 2500"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technician Notes & Work Log
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe work done, parts replaced, and inspection findings..."
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Log Completion & Return to Fleet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
