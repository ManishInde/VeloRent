import React, { useState } from 'react';
import { Notification } from '@/types';
import { markNotificationAsRead } from '@/lib/api/notifications';
import { Bell, Check, Calendar, Tag } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
  onReadUpdate?: (updated: Notification) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onReadUpdate }) => {
  const [isRead, setIsRead] = useState(notification.isRead);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkAsRead = async () => {
    if (isRead || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await markNotificationAsRead(notification.id);
      setIsRead(true);
      if (onReadUpdate) {
        onReadUpdate(updated);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isRead
          ? 'bg-white border-slate-200 text-slate-700'
          : 'bg-blue-50/40 border-blue-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white shadow-xs'
            }`}
          >
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">{notification.title}</h4>
              {!isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread notification" />
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
            <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> {notification.type}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-slate-400" /> {notification.createdAt || 'Recent'}
              </span>
            </div>
          </div>
        </div>

        {!isRead && (
          <button
            onClick={handleMarkAsRead}
            disabled={isUpdating}
            className="p-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors shrink-0 flex items-center gap-1 disabled:opacity-50"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark read</span>
          </button>
        )}
      </div>
    </div>
  );
};
