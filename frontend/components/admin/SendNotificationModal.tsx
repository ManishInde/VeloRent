import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Notification, NotificationType } from '@/types';
import { sendNotification } from '@/lib/api/admin';
import { Bell, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  defaultUserId?: number;
  onClose: () => void;
  onSuccess: (notification: Notification) => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  defaultUserId = 1,
  onClose,
  onSuccess,
}) => {
  const [userId, setUserId] = useState<number>(defaultUserId);
  const [title, setTitle] = useState<string>('System Alert');
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<NotificationType>('SYSTEM');
  const [referenceId, setReferenceId] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a notification message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const notif = await sendNotification({
        userId,
        title,
        message: message.trim(),
        type,
        referenceId,
      });
      onSuccess(notif);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Dispatch Notification</h3>
            <p className="text-xs text-slate-500">System Notification Engine</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Recipient User ID"
              type="number"
              min={1}
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="SYSTEM">System Alert</option>
                <option value="BOOKING_CONFIRMED">Booking Confirmed</option>
                <option value="RENTAL_REMINDER">Rental Reminder</option>
                <option value="MAINTENANCE_ALERT">Maintenance Alert</option>
                <option value="LOYALTY_TIER_UPGRADE">Loyalty Tier Upgrade</option>
              </select>
            </div>
          </div>

          <Input
            label="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Schedule Verification Required"
            required
          />

          <div>
            <label htmlFor="notif-msg" className="block text-xs font-semibold text-slate-700 mb-1">
              Message Content
            </label>
            <textarea
              id="notif-msg"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message details for the recipient..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
              required
            />
          </div>

          <Input
            label="Reference ID (Optional)"
            type="number"
            min={0}
            value={referenceId}
            onChange={(e) => setReferenceId(Number(e.target.value))}
            helperText="Link to Booking, Rental, or Vehicle ID."
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Send Notification
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
