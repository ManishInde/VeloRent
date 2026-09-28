'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendNotification } from '@/lib/api/admin';
import { Notification, NotificationType } from '@/types';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [userId, setUserId] = useState<string>('1');
  const [title, setTitle] = useState<string>('Operational Notice');
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<NotificationType>('SYSTEM');
  const [referenceId, setReferenceId] = useState<string>('0');

  const [dispatchedNotifs, setDispatchedNotifs] = useState<Notification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uId = parseInt(userId, 10);
    const refId = parseInt(referenceId, 10);

    if (isNaN(uId) || uId <= 0) {
      setError('Please enter a valid numeric Recipient User ID.');
      return;
    }

    if (!message.trim()) {
      setError('Please enter notification message content.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const notif = await sendNotification({
        userId: uId,
        title,
        message: message.trim(),
        type,
        referenceId: isNaN(refId) ? 0 : refId,
      });
      setDispatchedNotifs((prev) => [notif, ...prev]);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="System Notification Dispatcher"
          description="Send operational alerts, booking reminders, or system notices to platform users."
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Dispatch Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" /> Notification Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Recipient User ID"
                    type="number"
                    min={1}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
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
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Verification Required"
                  required
                />

                <div>
                  <label htmlFor="admin-notif-msg" className="block text-xs font-semibold text-slate-700 mb-1">
                    Message Body
                  </label>
                  <textarea
                    id="admin-notif-msg"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter details for the user notification..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>

                <Input
                  label="Reference ID (Optional)"
                  type="number"
                  min={0}
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    isLoading={isSubmitting}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Dispatch Notification
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recently Dispatched Log */}
          {dispatchedNotifs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dispatched Log
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-3">
                {dispatchedNotifs.map((n) => (
                  <div key={n.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Notification #{n.id}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Recipient #{n.userId}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
