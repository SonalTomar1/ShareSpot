import React from 'react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';
import { X, Check } from 'lucide-react';

interface TimelineModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ booking, onClose }) => {
  const { auditLogs } = useApp();

  if (!booking) return null;

  const bookingLogs = auditLogs
    .filter((log) => log.bookingId === booking.id || (log.details && log.details.includes(booking.resourceName)))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const stages = [
    { label: 'Requested', key: 'Requested' },
    {
      label:
        booking.status === 'Waitlisted'
          ? 'Waitlisted'
          : booking.status === 'Rejected'
          ? 'Rejected'
          : 'Approved',
      key: booking.status === 'Waitlisted' ? 'Waitlisted' : booking.status === 'Rejected' ? 'Rejected' : 'Approved',
    },
    { label: 'Checked out', key: 'Checked out' },
    { label: 'Returned', key: 'Returned' },
    { label: 'Completed', key: 'Completed' },
  ];

  const getStageState = (stageKey: string) => {
    const order = ['Requested', 'Approved', 'Checked out', 'Returned', 'Completed'];
    const currentIdx = order.indexOf(booking.status);
    const stageIdx = order.indexOf(stageKey);

    if (booking.status === 'Rejected' && stageKey === 'Rejected') return 'rejected';
    if (booking.status === 'Waitlisted' && stageKey === 'Waitlisted') return 'waitlist';
    if (stageIdx <= currentIdx) return 'done';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md max-w-lg w-full border border-[#E5E0D8] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1F2933]">
              Booking history & audit trail
            </h3>
            <p className="text-xs text-[#52606D]">{booking.resourceName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Status stepper */}
          <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded">
            <span className="text-xs font-semibold text-[#52606D] block mb-2">Current stage</span>
            <div className="flex items-center justify-between text-xs">
              {stages.map((st, i) => {
                const state = getStageState(st.key);
                return (
                  <div key={i} className="flex flex-col items-center text-center">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        state === 'done'
                          ? 'bg-[#3F7D4E] text-white'
                          : state === 'rejected'
                          ? 'bg-[#B42318] text-white'
                          : state === 'waitlist'
                          ? 'bg-[#B7791F] text-white'
                          : 'bg-[#E5E0D8] text-[#829AB1]'
                      }`}
                    >
                      {state === 'done' ? '✓' : i + 1}
                    </span>
                    <span
                      className={`text-[11px] mt-1 ${
                        state === 'done'
                          ? 'text-[#3F7D4E] font-medium'
                          : state === 'rejected'
                          ? 'text-[#B42318] font-medium'
                          : state === 'waitlist'
                          ? 'text-[#B7791F] font-medium'
                          : 'text-[#829AB1]'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why this decision box */}
          {booking.decisionReason && (
            <div className="p-3 bg-amber-50 border border-[#B7791F]/30 rounded text-xs space-y-1">
              <span className="font-semibold text-[#1F2933] block">Why this decision:</span>
              <p className="text-[#1F2933]">"{booking.decisionReason}"</p>
              {booking.decisionDate && (
                <p className="text-[10px] text-[#627D98]">
                  Recorded on: {new Date(booking.decisionDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>
          )}

          {/* Audit log rows */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#52606D] block">Action history</span>
            <div className="border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
              {bookingLogs.length === 0 ? (
                <p className="p-4 text-xs text-[#829AB1] text-center">No action logs yet.</p>
              ) : (
                bookingLogs.map((log) => (
                  <div key={log.id} className="p-2.5 text-xs space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#1F2933]">{log.title}</span>
                      <span className="text-[10px] text-[#829AB1]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[#52606D]">{log.details}</p>
                    <div className="text-[11px] text-[#829AB1]">
                      By {log.actorName} ({log.actorRole})
                      {log.reason && ` • "${log.reason}"`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E5E0D8] bg-[#FAF7F2] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#1F2933] text-white text-xs font-semibold hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
