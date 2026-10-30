import React, { useState } from 'react';
import { Resource } from '../types';
import { useApp } from '../context/AppContext';
import { X, Clock } from 'lucide-react';

interface BookingModalProps {
  resource: Resource | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  resource,
  onClose,
  onSuccess,
}) => {
  const { currentUser, createBookingRequest, bookings, showToast } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('14:00');
  const [endDate, setEndDate] = useState(todayStr);
  const [endTime, setEndTime] = useState('17:00');
  const [purpose, setPurpose] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!resource || !currentUser) return null;

  // Real-time duration calculation
  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);
  const durationHours = Math.max(
    0,
    (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)
  );

  // Check conflicts
  const hasConflict = bookings.some((b) => {
    if (b.resourceId !== resource.id) return false;
    if (!['Approved', 'Checked out'].includes(b.status)) return false;

    const bStart = `${b.startDate}T${b.startTime}`;
    const bEnd = `${b.endDate}T${b.endTime}`;
    const reqStart = `${startDate}T${startTime}`;
    const reqEnd = `${endDate}T${endTime}`;

    return reqStart < bEnd && reqEnd > bStart;
  });

  const exceedsDuration = durationHours > resource.maxDurationHours;

  const activeBookings = bookings.filter(
    (b) =>
      b.borrowerId === currentUser.id &&
      ['Requested', 'Approved', 'Checked out', 'Waitlisted'].includes(b.status)
  );
  const activeLimitReached = activeBookings.length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!purpose.trim()) {
      showToast('Please describe what you plan to use this for.', 'warning');
      return;
    }

    if (durationHours <= 0) {
      showToast('End time must be after start time.', 'warning');
      return;
    }

    if (exceedsDuration) {
      showToast(
        `Duration exceeds the ${resource.maxDurationHours}h limit for this item.`,
        'error'
      );
      return;
    }

    if (activeLimitReached) {
      showToast(
        'Fair access limit: you have 2 active bookings right now. Please return or cancel one first.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    const result = createBookingRequest({
      resourceId: resource.id,
      startDate,
      startTime,
      endDate,
      endTime,
      purpose,
      teamMembers,
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      showToast(result.error || 'Could not submit request.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md max-w-lg w-full border border-[#E5E0D8] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1F2933]">Request booking</h3>
            <p className="text-xs text-[#52606D]">{resource.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Summary line */}
          <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded text-xs text-[#52606D] flex justify-between">
            <span>Owner: <strong className="text-[#1F2933]">{resource.ownerName}</strong></span>
            <span>{resource.depositAmount > 0 ? `₹${resource.depositAmount} deposit` : 'Free to borrow'}</span>
          </div>

          {/* Date and time fields */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Start time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                End time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>
          </div>

          {/* Duration line */}
          <div className="text-xs text-[#52606D] flex justify-between items-center bg-[#FAF7F2] p-2 rounded border border-[#E5E0D8]">
            <span>Requested duration:</span>
            <span className={exceedsDuration ? 'text-[#B42318] font-bold' : 'font-semibold text-[#1F2933]'}>
              {durationHours.toFixed(1)} hours (limit: {resource.maxDurationHours}h)
            </span>
          </div>

          {/* Conflict notice if applicable */}
          {hasConflict && (
            <div className="p-3 bg-amber-50 border border-[#B7791F]/30 rounded text-xs text-[#B7791F]">
              <p className="font-semibold">This slot has an existing booking.</p>
              <p className="mt-0.5">
                Submitting will place you in the waitlist. If the previous booking cancels, we will offer it to you next.
              </p>
            </div>
          )}

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Purpose of borrowing
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Capstone project demo, course presentation, evening practice..."
              required
              className="w-full px-3 py-2 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
            />
            <p className="text-[11px] text-[#627D98] mt-0.5">
              The owner reads this before approving.
            </p>
          </div>

          {/* Team members */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Co-borrowers or team members (optional)
            </label>
            <input
              type="text"
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              placeholder="e.g. Pooja (CS-301), Rohan (ME-204)"
              className="w-full px-3 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
            />
          </div>

          {/* Fair access reminder */}
          <p className="text-[11px] text-[#627D98]">
            Fair access quota: you currently have {activeBookings.length} of 2 allowed active bookings.
          </p>

          {/* Submit button */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E0D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-[#E5E0D8] text-sm text-[#52606D] hover:bg-[#FAF7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || exceedsDuration || activeLimitReached}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors cursor-pointer ${
                exceedsDuration || activeLimitReached
                  ? 'bg-[#E5E0D8] text-[#829AB1] cursor-not-allowed'
                  : 'bg-[#0F766E] hover:bg-[#115E59] text-white'
              }`}
            >
              {hasConflict ? 'Join waitlist' : 'Request this'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
