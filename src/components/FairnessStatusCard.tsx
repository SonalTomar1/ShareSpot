import React from 'react';
import { useApp } from '../context/AppContext';

export const FairnessStatusCard: React.FC = () => {
  const { currentUser, bookings } = useApp();

  if (!currentUser) return null;

  const activeBookings = bookings.filter(
    (b) =>
      b.borrowerId === currentUser.id &&
      ['Requested', 'Approved', 'Checked out', 'Waitlisted'].includes(b.status)
  );

  const activeCount = activeBookings.length;
  const maxActive = 2;
  const daysBooked = currentUser.daysBookedThisWeek || 1;
  const maxDays = 7;

  return (
    <div className="bg-white rounded-md border border-[#E5E0D8] p-4 text-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-2.5">
        <div>
          <h3 className="font-serif font-semibold text-base text-[#1F2933]">
            Your fairness status
          </h3>
          <p className="text-xs text-[#52606D]">
            Campus lending limits and priority standing
          </p>
        </div>

        <div className="text-xs text-[#52606D]">
          Fairness score: <strong className="text-[#0F766E]">{currentUser.fairnessPriorityScore} / 100</strong>
        </div>
      </div>

      {/* Limits row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded">
          <div className="flex justify-between items-center text-[#1F2933] font-medium">
            <span>Active bookings</span>
            <span>{activeCount} of {maxActive} allowed</span>
          </div>
          <p className="text-[11px] text-[#627D98] mt-1">
            {activeCount >= maxActive ? 'Limit reached. Complete or cancel a booking to request another.' : '1 slot available for requests.'}
          </p>
        </div>

        <div className="p-2.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded">
          <div className="flex justify-between items-center text-[#1F2933] font-medium">
            <span>Days booked this week</span>
            <span>{daysBooked} of {maxDays} days</span>
          </div>
          <p className="text-[11px] text-[#627D98] mt-1">
            {maxDays - daysBooked} days remaining in current weekly period.
          </p>
        </div>
      </div>

      {/* Priority notes */}
      {currentUser.priorityNotes && currentUser.priorityNotes.length > 0 && (
        <div className="text-xs text-[#52606D] pt-1">
          <span className="font-semibold text-[#1F2933]">Priority notes: </span>
          <span>{currentUser.priorityNotes.join(' • ')}</span>
        </div>
      )}
    </div>
  );
};
