import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, AlertTriangle } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking: (bookingId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBooking,
}) => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen || !currentUser) return null;

  const userNotifs = notifications
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
      <div className="bg-white w-full max-w-sm h-full border-l border-[#E5E0D8] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-semibold text-[#1F2933] text-base">Notifications</h3>
            {userNotifs.filter((n) => !n.isRead).length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#0F766E] text-white text-[11px] font-semibold rounded">
                {userNotifs.filter((n) => !n.isRead).length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {userNotifs.some((n) => !n.isRead) && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#0F766E] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {userNotifs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#829AB1]">
              No notifications right now.
            </div>
          ) : (
            userNotifs.map((notif) => {
              const isOverdue = notif.isOverdue;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.bookingId) {
                      onSelectBooking(notif.bookingId);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded border text-xs cursor-pointer transition-colors ${
                    isOverdue
                      ? 'border-[#B42318] bg-red-50 text-[#B42318]'
                      : notif.isRead
                      ? 'border-[#E5E0D8] bg-white text-[#1F2933]'
                      : 'border-[#0F766E]/40 bg-[#FAF7F2] text-[#1F2933]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-semibold ${isOverdue ? 'text-[#B42318]' : 'text-[#1F2933]'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#829AB1] shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-[#52606D] leading-snug">{notif.message}</p>
                  {notif.bookingId && (
                    <span className="inline-block mt-2 text-[11px] text-[#0F766E] font-medium hover:underline">
                      View booking →
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
