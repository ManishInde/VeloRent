import React, { useState } from 'react';
import { Notification } from '@/types';
import { markNotificationAsRead } from '@/lib/api/notifications';
import { Bell, Check, Calendar, Tag } from 'lucide-react';
import { clsx } from 'clsx';

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
      className={clsx(
        'p-5 border transition-all duration-150',
        isRead
          ? 'bg-[#FFFFFF] border-[#111111]/15 text-[#555550]'
          : 'bg-[#FAF8F5] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              'w-8 h-8 flex items-center justify-center shrink-0 border border-[#111111]',
              isRead ? 'bg-[#ECE8E0] text-[#777770]' : 'bg-[#C7F000] text-[#111111]'
            )}
          >
            <Bell className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-black text-sm uppercase tracking-tight leading-tight text-[#111111]">
                {notification.title}
              </h4>
              {!isRead && (
                <span className="w-2 h-2 bg-[#C7F000] border border-[#111111] shrink-0" title="Unread notification" />
              )}
            </div>

            <p className="text-xs font-mono text-[#555550] mt-1 leading-relaxed">
              {notification.message}
            </p>

            <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-[#888880] uppercase">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" /> {notification.type}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {notification.createdAt || 'RECENT ALERT'}
              </span>
            </div>
          </div>
        </div>

        {!isRead && (
          <button
            onClick={handleMarkAsRead}
            disabled={isUpdating}
            className="px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider bg-white border border-[#111111] hover:bg-[#111111] hover:text-[#F4F1EA] transition-colors shrink-0 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            title="Mark as read"
          >
            <Check className="w-3 h-3" />
            <span className="hidden sm:inline">ACKNOWLEDGE</span>
          </button>
        )}
      </div>
    </div>
  );
};
