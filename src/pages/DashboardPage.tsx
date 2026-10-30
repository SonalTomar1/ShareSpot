import React, { useState } from 'react';
import { Booking, Resource } from '../types';
import { useApp } from '../context/AppContext';
import { FairnessStatusCard } from '../components/FairnessStatusCard';
import { Plus, History, Star, AlertTriangle, X } from 'lucide-react';

interface DashboardPageProps {
  onOpenCheckout: (booking: Booking) => void;
  onOpenReturn: (booking: Booking) => void;
  onOpenRating: (booking: Booking) => void;
  onOpenTimeline: (booking: Booking) => void;
  onOpenIncident: (booking: Booking) => void;
  onOpenNewListing: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCheckout,
  onOpenReturn,
  onOpenRating,
  onOpenTimeline,
  onOpenIncident,
  onOpenNewListing,
}) => {
  const {
    currentUser,
    bookings,
    resources,
    ownerDecideBooking,
    cancelBooking,
    requestExtension,
    updateResource,
    deleteResource,
    showToast,
    setCurrentView,
  } = useApp();

  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState<'seeker' | 'owner'>('seeker');

  // Decision Modal state (requires written reason)
  const [decisionModalBooking, setDecisionModalBooking] = useState<Booking | null>(null);
  const [decisionAction, setDecisionAction] = useState<'Approved' | 'Rejected' | 'Waitlisted'>('Approved');
  const [decisionReasonText, setDecisionReasonText] = useState('');

  // Extension prompt state
  const [extendingBooking, setExtendingBooking] = useState<Booking | null>(null);
  const [extHours, setExtHours] = useState(2);
  const [extReason, setExtReason] = useState('');

  const myBorrowings = bookings.filter((b) => b.borrowerId === currentUser.id);

  const isManager = currentUser.roles.includes('Manager');
  const isOwnerOrManager =
    currentUser.roles.includes('Owner') ||
    currentUser.roles.includes('Manager') ||
    currentUser.roles.includes('Admin');
  const myLendingRequests = bookings.filter((b) => {
    if (isManager && currentUser.hostelBlock) {
      const res = resources.find((r) => r.id === b.resourceId);
      return res?.hostelBlock === currentUser.hostelBlock || b.ownerId === currentUser.id;
    }
    return b.ownerId === currentUser.id;
  });

  const myListings = resources.filter((r) => r.ownerId === currentUser.id);

  const isBookingOverdue = (b: Booking) => {
    if (b.status !== 'Checked out') return false;
    const now = new Date();
    const dueTime = new Date(`${b.endDate}T${b.endTime}`);
    return now > dueTime;
  };

  const handleOpenDecisionModal = (booking: Booking, action: 'Approved' | 'Rejected' | 'Waitlisted') => {
    setDecisionModalBooking(booking);
    setDecisionAction(action);
    const defaults = {
      Approved: `Approved. Pick it up at ${booking.resourceLocation} during handover hours.`,
      Rejected: 'Not approved. Reason: item required for scheduled lab session.',
      Waitlisted: 'Placed on waitlist. We will notify you if the slot opens up.',
    };
    setDecisionReasonText(defaults[action]);
  };

  const handleConfirmDecision = () => {
    if (!decisionModalBooking) return;
    if (!decisionReasonText.trim()) {
      showToast('Please provide a written reason for this decision.', 'warning');
      return;
    }

    ownerDecideBooking(decisionModalBooking.id, decisionAction, decisionReasonText.trim());
    setDecisionModalBooking(null);
    setDecisionReasonText('');
  };

  const handleConfirmExtension = () => {
    if (!extendingBooking) return;
    requestExtension(extendingBooking.id, extHours, extReason);
    setExtendingBooking(null);
    setExtReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F2933]">
            My campus dashboard
          </h1>
          <p className="text-sm text-[#52606D] mt-0.5">
            Logged in as {currentUser.name} ({currentUser.group})
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex space-x-2 text-sm">
          <button
            onClick={() => setActiveTab('seeker')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              activeTab === 'seeker'
                ? 'bg-[#0F766E] text-white font-semibold'
                : 'bg-white border border-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]'
            }`}
          >
            My borrowings ({myBorrowings.length})
          </button>
          {isOwnerOrManager && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
                activeTab === 'owner'
                  ? 'bg-[#0F766E] text-white font-semibold'
                  : 'bg-white border border-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              {isManager ? 'Manager desk' : 'Items I lend'} ({myListings.length})
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: SEEKER (BORROWINGS)
          ========================================================================= */}
      {activeTab === 'seeker' && (
        <div className="space-y-6">
          <FairnessStatusCard />

          <div>
            <h2 className="font-serif text-lg font-semibold text-[#1F2933] mb-3">
              Your borrowing list
            </h2>

            {myBorrowings.length === 0 ? (
              <div className="bg-white rounded border border-[#E5E0D8] p-8 text-center space-y-2">
                <p className="text-sm text-[#1F2933]">No bookings yet. Browse what's available.</p>
                <button
                  onClick={() => setCurrentView('browse')}
                  className="text-xs text-[#0F766E] font-semibold hover:underline"
                >
                  Browse catalog →
                </button>
              </div>
            ) : (
              /* Clean list table / rows */
              <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
                {myBorrowings.map((b) => {
                  const overdue = isBookingOverdue(b);
                  const isCheckedOut = b.status === 'Checked out';
                  const isApproved = b.status === 'Approved';
                  const isCompleted = b.status === 'Completed';
                  const twoWay = b.twoWayRating;

                  return (
                    <div
                      key={b.id}
                      className={`p-4 sm:p-5 space-y-3 ${
                        overdue ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={b.resourcePhoto || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-12 h-12 rounded object-cover border border-[#E5E0D8] shrink-0"
                          />
                          <div>
                            <h3 className="font-serif font-semibold text-base text-[#1F2933]">
                              {b.resourceName}
                            </h3>
                            <p className="text-xs text-[#52606D] mt-0.5">
                              Owner: {b.ownerName} • Handover: {b.resourceLocation}
                            </p>
                            <p className="text-xs text-[#627D98] mt-0.5">
                              {b.startDate} ({b.startTime} to {b.endTime})
                            </p>
                          </div>
                        </div>

                        {/* Status tag & timeline link */}
                        <div className="flex items-center gap-2">
                          {overdue ? (
                            <span className="text-xs font-semibold text-[#B42318] bg-red-100 px-2 py-0.5 rounded">
                              Overdue
                            </span>
                          ) : (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                b.status === 'Approved'
                                  ? 'text-[#3F7D4E] bg-green-100'
                                  : b.status === 'Requested'
                                  ? 'text-[#B7791F] bg-amber-100'
                                  : b.status === 'Waitlisted'
                                  ? 'text-[#B7791F] bg-amber-100'
                                  : b.status === 'Checked out'
                                  ? 'text-[#0F766E] bg-teal-100'
                                  : 'text-[#52606D] bg-[#FAF7F2]'
                              }`}
                            >
                              {b.status === 'Waitlisted'
                                ? `Waitlist (#${b.waitlistPosition || 1})`
                                : b.status}
                            </span>
                          )}

                          <button
                            onClick={() => onOpenTimeline(b)}
                            className="text-xs text-[#52606D] hover:text-[#1F2933] border border-[#E5E0D8] px-2 py-1 rounded cursor-pointer"
                          >
                            History
                          </button>
                        </div>
                      </div>

                      {/* Purpose and decision text */}
                      <div className="text-xs text-[#52606D] space-y-1">
                        <p>
                          <strong className="text-[#1F2933]">Purpose:</strong> "{b.purpose}"
                        </p>
                        {b.decisionReason && (
                          <p className="bg-[#FAF7F2] p-2 rounded border border-[#E5E0D8] text-[#1F2933]">
                            <strong>Decision note:</strong> "{b.decisionReason}"
                          </p>
                        )}
                      </div>

                      {/* Completed rating row */}
                      {isCompleted && (
                        <div className="p-2.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded text-xs flex justify-between items-center">
                          <span className="text-[#52606D]">
                            {twoWay.revealed
                              ? 'Two-way ratings completed and visible.'
                              : twoWay.borrowerRated
                              ? 'Your rating is submitted. Waiting for owner.'
                              : 'Leave feedback for ' + b.ownerName}
                          </span>
                          <button
                            onClick={() => onOpenRating(b)}
                            className="text-xs text-[#0F766E] font-semibold hover:underline"
                          >
                            {twoWay.revealed ? 'View ratings' : twoWay.borrowerRated ? 'Check status' : 'Rate now'}
                          </button>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E0D8]/60 text-xs">
                        <button
                          onClick={() => onOpenIncident(b)}
                          className="text-[#B42318] hover:underline cursor-pointer"
                        >
                          Report a problem
                        </button>

                        <div className="flex items-center gap-2">
                          {['Requested', 'Waitlisted', 'Approved'].includes(b.status) && (
                            <button
                              onClick={() => cancelBooking(b.id, 'Cancelled by borrower')}
                              className="px-2.5 py-1 rounded border border-[#E5E0D8] text-[#52606D] hover:bg-[#FAF7F2]"
                            >
                              Cancel request
                            </button>
                          )}

                          {isCheckedOut && (
                            <button
                              onClick={() => setExtendingBooking(b)}
                              className="px-2.5 py-1 rounded border border-[#E5E0D8] text-[#0F766E] hover:bg-[#FAF7F2]"
                            >
                              Request extension
                            </button>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => onOpenCheckout(b)}
                              className="px-3 py-1 rounded bg-[#0F766E] text-white font-semibold hover:bg-[#115E59]"
                            >
                              Complete check-out
                            </button>
                          )}

                          {isCheckedOut && (
                            <button
                              onClick={() => onOpenReturn(b)}
                              className="px-3 py-1 rounded bg-[#0F766E] text-white font-semibold hover:bg-[#115E59]"
                            >
                              Return item
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: OWNER / MANAGER (ITEMS I LEND)
          ========================================================================= */}
      {activeTab === 'owner' && (
        <div className="space-y-6">
          {/* Pending approval section */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-[#1F2933]">
              Pending requests awaiting your review
            </h2>

            {myLendingRequests.filter((b) => b.status === 'Requested').length === 0 ? (
              <div className="bg-white rounded border border-[#E5E0D8] p-5 text-center text-xs text-[#829AB1]">
                No pending requests right now.
              </div>
            ) : (
              <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
                {myLendingRequests
                  .filter((b) => b.status === 'Requested')
                  .map((req) => (
                    <div key={req.id} className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={req.borrowerAvatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-[#E5E0D8]"
                          />
                          <div>
                            <p className="font-semibold text-sm text-[#1F2933]">
                              {req.borrowerName} ({req.borrowerGroup})
                            </p>
                            <p className="text-xs text-[#52606D]">
                              Rating: ★ {req.borrowerRating} • On-time: {req.borrowerOnTimeRecord}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-[#52606D] sm:text-right">
                          <p className="font-semibold text-[#1F2933]">{req.resourceName}</p>
                          <p>{req.startDate} ({req.startTime} to {req.endTime})</p>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#FAF7F2] rounded border border-[#E5E0D8] text-xs text-[#1F2933]">
                        <strong>Purpose:</strong> "{req.purpose}"
                      </div>

                      {/* Decision buttons with required written reason */}
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => handleOpenDecisionModal(req, 'Rejected')}
                          className="px-3 py-1.5 rounded border border-[#B42318] text-[#B42318] hover:bg-red-50 font-medium"
                        >
                          Reject with reason
                        </button>
                        <button
                          onClick={() => handleOpenDecisionModal(req, 'Waitlisted')}
                          className="px-3 py-1.5 rounded border border-[#B7791F] text-[#B7791F] hover:bg-amber-50 font-medium"
                        >
                          Waitlist with reason
                        </button>
                        <button
                          onClick={() => handleOpenDecisionModal(req, 'Approved')}
                          className="px-3.5 py-1.5 rounded bg-[#0F766E] text-white hover:bg-[#115E59] font-medium"
                        >
                          Approve with reason
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Overdue alerts if any */}
          {myLendingRequests.some((b) => isBookingOverdue(b)) && (
            <div className="p-4 border border-[#B42318] bg-red-50 rounded space-y-2 text-xs">
              <span className="font-semibold text-[#B42318] block">Overdue equipment alert</span>
              {myLendingRequests
                .filter((b) => isBookingOverdue(b))
                .map((b) => (
                  <div key={b.id} className="flex justify-between items-center bg-white p-2.5 rounded border border-red-200">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{b.resourceName}</p>
                      <p className="text-[#627D98]">With {b.borrowerName} • Due on {b.endDate} at {b.endTime}</p>
                    </div>
                    <button
                      onClick={() => onOpenReturn(b)}
                      className="px-3 py-1 rounded bg-[#B42318] text-white font-medium"
                    >
                      Process return
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Active checked-out items */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-[#1F2933]">
              Active loans (currently checked out)
            </h2>

            {myLendingRequests.filter((b) => b.status === 'Checked out').length === 0 ? (
              <p className="text-xs text-[#829AB1]">No items currently checked out.</p>
            ) : (
              <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
                {myLendingRequests
                  .filter((b) => b.status === 'Checked out')
                  .map((b) => (
                    <div key={b.id} className="p-3.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-[#1F2933]">{b.resourceName}</p>
                        <p className="text-[#52606D]">Borrower: {b.borrowerName} • Due: {b.endDate} at {b.endTime}</p>
                      </div>
                      <button
                        onClick={() => onOpenReturn(b)}
                        className="px-3 py-1 rounded bg-[#0F766E] text-white font-medium"
                      >
                        Inspect return
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Listings management */}
          <div className="space-y-3 pt-4 border-t border-[#E5E0D8]">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-lg font-semibold text-[#1F2933]">
                  Your listed resources
                </h2>
                <p className="text-xs text-[#52606D]">Manage availability or update items</p>
              </div>
              <button
                onClick={onOpenNewListing}
                className="px-3.5 py-1.5 rounded bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59]"
              >
                + List an item
              </button>
            </div>

            {myListings.length === 0 ? (
              <div className="bg-white rounded border border-[#E5E0D8] p-6 text-center text-xs text-[#829AB1]">
                You have not listed any items yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myListings.map((res) => (
                  <div key={res.id} className="p-3 bg-white rounded border border-[#E5E0D8] text-xs space-y-2">
                    <div className="flex gap-2.5">
                      <img src={res.photos[0]} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#1F2933] truncate">{res.name}</p>
                        <p className="text-[#627D98]">{res.location}</p>
                        <p className="text-[#627D98]">{res.depositAmount > 0 ? `₹${res.depositAmount} deposit` : 'Free'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#E5E0D8]">
                      <button
                        onClick={() => {
                          const updated = res.status === 'active' ? 'paused' : 'active';
                          updateResource({ ...res, status: updated });
                          showToast(`Listing ${updated}.`, 'info');
                        }}
                        className="text-xs text-[#52606D] hover:text-[#1F2933]"
                      >
                        Status: <strong className={res.status === 'active' ? 'text-[#3F7D4E]' : 'text-[#829AB1]'}>{res.status}</strong>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove "${res.name}"?`)) {
                            deleteResource(res.id);
                          }
                        }}
                        className="text-xs text-[#B42318] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision modal (Reason required) */}
      {decisionModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full border border-[#E5E0D8] p-5 space-y-3 text-sm">
            <h3 className="font-serif font-semibold text-base text-[#1F2933]">
              Decision for {decisionModalBooking.borrowerName}: {decisionAction}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Written reason (shown to borrower)
              </label>
              <textarea
                rows={3}
                value={decisionReasonText}
                onChange={(e) => setDecisionReasonText(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-xs text-[#1F2933]"
              />
              <p className="text-[11px] text-[#627D98] mt-0.5">
                Every decision must be accompanied by a clear explanation.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => setDecisionModalBooking(null)}
                className="px-3 py-1.5 rounded border border-[#E5E0D8] text-xs text-[#52606D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={!decisionReasonText.trim()}
                className={`px-4 py-1.5 rounded text-xs font-semibold text-white ${
                  decisionAction === 'Approved'
                    ? 'bg-[#3F7D4E]'
                    : decisionAction === 'Waitlisted'
                    ? 'bg-[#B7791F]'
                    : 'bg-[#B42318]'
                }`}
              >
                Confirm {decisionAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension modal */}
      {extendingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full border border-[#E5E0D8] p-5 space-y-3 text-sm">
            <h3 className="font-serif font-semibold text-base text-[#1F2933]">Request extension</h3>
            <p className="text-xs text-[#52606D]">{extendingBooking.resourceName}</p>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Additional time needed
              </label>
              <select
                value={extHours}
                onChange={(e) => setExtHours(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-xs text-[#1F2933]"
              >
                <option value={1}>+1 hour</option>
                <option value={2}>+2 hours</option>
                <option value={4}>+4 hours</option>
                <option value={24}>+24 hours (1 day)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Reason
              </label>
              <input
                type="text"
                value={extReason}
                onChange={(e) => setExtReason(e.target.value)}
                placeholder="e.g. Lab experiment running 2 hours longer..."
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-xs text-[#1F2933]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
              <button
                onClick={() => setExtendingBooking(null)}
                className="px-3 py-1.5 rounded border border-[#E5E0D8] text-xs text-[#52606D]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtension}
                className="px-4 py-1.5 rounded bg-[#0F766E] text-white text-xs font-semibold"
              >
                Submit request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
