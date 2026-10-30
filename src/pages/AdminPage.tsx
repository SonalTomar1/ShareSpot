import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentReport } from '../types';

export const AdminPage: React.FC = () => {
  const {
    currentUser,
    resources,
    bookings,
    allUsers,
    auditLogs,
    incidents,
    resolveIncident,
    verifyUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'incidents' | 'verifications' | 'audit' | 'ratings'>('analytics');

  const [auditFilterAction, setAuditFilterAction] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [adminDecisionNote, setAdminDecisionNote] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);

  // Access check: only Admin and Manager
  if (!currentUser || (!currentUser.roles.includes('Admin') && !currentUser.roles.includes('Manager'))) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="font-serif text-xl font-semibold text-[#1F2933]">Access restricted</h2>
        <p className="text-sm text-[#52606D]">
          The Admin Desk is only accessible to Campus Administrators and facility managers.
        </p>
      </div>
    );
  }

  const pendingVerificationCount = allUsers.filter(
    (u) => u.verificationStatus === 'pending' || !u.verifiedCollegeId
  ).length;

  // Key metrics
  const totalListings = resources.length;
  const activeLoans = bookings.filter((b) => ['Approved', 'Checked out'].includes(b.status)).length;
  const totalReturns = allUsers.reduce((acc, u) => acc + u.totalReturnsCount, 0);
  const totalOnTime = allUsers.reduce((acc, u) => acc + u.onTimeReturnsCount, 0);
  const onTimePercentage = totalReturns > 0 ? Math.round((totalOnTime / totalReturns) * 100) : 96;
  const damageRate = bookings.length > 0 ? ((incidents.length / bookings.length) * 100).toFixed(1) : '1.2';

  const usageCounts: { [resId: string]: number } = {};
  bookings.forEach((b) => {
    usageCounts[b.resourceId] = (usageCounts[b.resourceId] || 0) + 1;
  });

  const sortedByUsage = [...resources].sort((a, b) => (usageCounts[b.id] || 0) - (usageCounts[a.id] || 0));
  const mostUsed = sortedByUsage.slice(0, 4);
  const idleItems = sortedByUsage.filter((r) => (usageCounts[r.id] || 0) === 0).slice(0, 4);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditFilterAction !== 'all' && log.action !== auditFilterAction) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const mActor = log.actorName.toLowerCase().includes(q);
        const mDetails = log.details.toLowerCase().includes(q);
        const mTitle = log.title.toLowerCase().includes(q);
        if (!mActor && !mDetails && !mTitle) return false;
      }
      return true;
    });
  }, [auditLogs, auditFilterAction, auditSearch]);

  const handleResolve = () => {
    if (!selectedIncident) return;
    if (!adminDecisionNote.trim()) {
      showToast('Please enter an administrative resolution note.', 'warning');
      return;
    }

    resolveIncident(selectedIncident.id, adminDecisionNote.trim(), penaltyAmount);
    setSelectedIncident(null);
    setAdminDecisionNote('');
    setPenaltyAmount(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F2933]">
            Campus admin desk
          </h1>
          <p className="text-sm text-[#52606D] mt-0.5">
            Campus oversight, dispute resolution, and audit logs
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#0F766E] text-white font-semibold'
                : 'bg-white border border-[#E5E0D8] text-[#52606D]'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-[#0F766E] text-white font-semibold'
                : 'bg-white border border-[#E5E0D8] text-[#52606D]'
            }`}
          >
            Disputes ({incidents.filter((i) => i.resolutionStatus === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              activeTab === 'verifications'
                ? 'bg-[#0F766E] text-white font-semibold'
                : 'bg-white border border-[#E5E0D8] text-[#52606D]'
            }`}
          >
            User verifications ({pendingVerificationCount})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#0F766E] text-white font-semibold'
                : 'bg-white border border-[#E5E0D8] text-[#52606D]'
            }`}
          >
            Audit log
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              activeTab === 'ratings'
                ? 'bg-[#0F766E] text-white font-semibold'
                : 'bg-white border border-[#E5E0D8] text-[#52606D]'
            }`}
          >
            Ratings review
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-white p-3.5 border border-[#E5E0D8] rounded">
              <span className="text-xs text-[#52606D]">Total listed items</span>
              <p className="font-serif text-2xl font-semibold text-[#1F2933] mt-1">{totalListings}</p>
            </div>
            <div className="bg-white p-3.5 border border-[#E5E0D8] rounded">
              <span className="text-xs text-[#52606D]">Active loans now</span>
              <p className="font-serif text-2xl font-semibold text-[#1F2933] mt-1">{activeLoans}</p>
            </div>
            <div className="bg-white p-3.5 border border-[#E5E0D8] rounded">
              <span className="text-xs text-[#52606D]">On-time return rate</span>
              <p className="font-serif text-2xl font-semibold text-[#3F7D4E] mt-1">{onTimePercentage}%</p>
            </div>
            <div className="bg-white p-3.5 border border-[#E5E0D8] rounded">
              <span className="text-xs text-[#52606D]">Problem / damage rate</span>
              <p className="font-serif text-2xl font-semibold text-[#1F2933] mt-1">{damageRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Most borrowed */}
            <div className="bg-white p-4 border border-[#E5E0D8] rounded space-y-2.5">
              <h3 className="font-serif font-semibold text-sm text-[#1F2933]">
                Most requested items
              </h3>
              <div className="space-y-1.5 divide-y divide-[#E5E0D8]">
                {mostUsed.map((item) => (
                  <div key={item.id} className="pt-1.5 first:pt-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{item.name}</p>
                      <p className="text-[#627D98]">{item.ownerName} • {item.groupTag}</p>
                    </div>
                    <span className="text-[#0F766E] font-semibold">{usageCounts[item.id] || 0} loans</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Idle items */}
            <div className="bg-white p-4 border border-[#E5E0D8] rounded space-y-2.5">
              <h3 className="font-serif font-semibold text-sm text-[#1F2933]">
                Underused items
              </h3>
              <div className="space-y-1.5 divide-y divide-[#E5E0D8]">
                {idleItems.map((item) => (
                  <div key={item.id} className="pt-1.5 first:pt-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{item.name}</p>
                      <p className="text-[#627D98]">{item.location}</p>
                    </div>
                    <span className="text-[#829AB1]">0 active loans</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Incidents */}
      {activeTab === 'incidents' && (
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-[#1F2933]">
            Problem reports & disputes
          </h2>

          {incidents.length === 0 ? (
            <p className="text-xs text-[#829AB1]">No problem reports filed.</p>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-[#B42318] uppercase text-[10px]">
                        {inc.incidentType}
                      </span>
                      <h4 className="font-semibold text-sm text-[#1F2933] mt-0.5">{inc.resourceName}</h4>
                      <p className="text-[#627D98]">
                        Filed by {inc.reporterName} on{' '}
                        {new Date(inc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        inc.resolutionStatus === 'resolved'
                          ? 'bg-green-100 text-[#3F7D4E]'
                          : 'bg-amber-100 text-[#B7791F]'
                      }`}
                    >
                      {inc.resolutionStatus === 'resolved' ? 'Resolved' : 'Pending review'}
                    </span>
                  </div>

                  <p className="text-[#52606D] bg-[#FAF7F2] p-2 rounded border border-[#E5E0D8]">
                    "{inc.description}"
                  </p>

                  {inc.resolutionStatus === 'resolved' ? (
                    <div className="text-[#3F7D4E]">
                      <strong>Admin ruling:</strong> "{inc.adminDecision}"
                      {inc.penaltyAmount ? ` • Deposit settlement: ₹${inc.penaltyAmount}` : ''}
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-3 py-1 rounded bg-[#1F2933] text-white hover:bg-black font-semibold"
                      >
                        Enter admin ruling
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: User Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#1F2933]">
                College ID Verifications
              </h2>
              <p className="text-xs text-[#52606D]">
                Review campus IDs to authorize students and hostelers to safely lend and borrow equipment.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white border border-[#CBD5E1] text-[#1F2933]">
              {pendingVerificationCount} pending review
            </span>
          </div>

          <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
            {allUsers.map((user) => {
              const isPending = user.verificationStatus === 'pending' || !user.verifiedCollegeId;
              const isHosteler = user.group === 'Hosteler';
              const canVerify =
                currentUser.roles.includes('Admin') ||
                (currentUser.roles.includes('Manager') && isHosteler);

              return (
                <div
                  key={user.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded object-cover border border-[#E5E0D8] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#1F2933]">{user.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#CBD5E1] text-[10px] text-[#52606D]">
                          {user.group} {user.hostelBlock ? `(${user.hostelBlock})` : ''}
                        </span>
                        {user.verifiedCollegeId ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#3F7D4E] border border-emerald-200 text-[10px] font-semibold">
                            Verified ID
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-[#B7791F] border border-amber-200 text-[10px] font-semibold">
                            Pending ID Review
                          </span>
                        )}
                      </div>
                      <p className="text-[#627D98] mt-0.5">
                        {user.email} • ID: <strong className="font-mono text-[#1F2933]">{user.collegeIdNumber || 'Not provided'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isPending ? (
                      canVerify ? (
                        <>
                          <button
                            onClick={() => verifyUser(user.id, 'verified')}
                            className="px-3 py-1.5 rounded bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold transition-colors cursor-pointer"
                          >
                            Verify College ID
                          </button>
                          <button
                            onClick={() => verifyUser(user.id, 'rejected')}
                            className="px-3 py-1.5 rounded border border-[#E5E0D8] text-[#B42318] hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#829AB1] italic">
                          Warden approval required
                        </span>
                      )
                    ) : (
                      <span className="text-[#3F7D4E] text-xs font-medium">
                        ✓ ID Verified & Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Global Audit log */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="font-serif text-lg font-semibold text-[#1F2933]">
              Activity audit trail
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or note..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="px-2.5 py-1 text-xs border border-[#E5E0D8] rounded"
              />
              <select
                value={auditFilterAction}
                onChange={(e) => setAuditFilterAction(e.target.value)}
                className="px-2.5 py-1 text-xs border border-[#E5E0D8] rounded"
              >
                <option value="all">All actions</option>
                <option value="USER_SIGNED_UP">User signed up</option>
                <option value="USER_VERIFIED">User ID verified</option>
                <option value="USER_LOGIN">User login</option>
                <option value="USER_LOGOUT">User logout</option>
                <option value="LISTING_CREATED">Listing created</option>
                <option value="BOOKING_REQUESTED">Booking requested</option>
                <option value="BOOKING_APPROVED">Approved</option>
                <option value="CHECKED_OUT">Checked out</option>
                <option value="RETURNED">Returned</option>
                <option value="RATING_SUBMITTED">Rating submitted</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8] text-xs">
            {filteredAuditLogs.length === 0 ? (
              <p className="p-4 text-center text-[#829AB1]">No matching logs.</p>
            ) : (
              filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-2.5 flex justify-between items-baseline gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#1F2933]">
                      {log.title} <span className="text-[#829AB1] font-normal">• {log.details}</span>
                    </p>
                    <p className="text-[11px] text-[#627D98]">
                      By {log.actorName} ({log.actorRole}) {log.reason && `• "${log.reason}"`}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#829AB1] shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                    {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Ratings moderation */}
      {activeTab === 'ratings' && (
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-[#1F2933]">
            Two-way ratings status
          </h2>

          <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8] text-xs">
            {bookings
              .filter((b) => b.twoWayRating?.borrowerRated || b.twoWayRating?.lenderRated)
              .map((b) => {
                const twoWay = b.twoWayRating;
                return (
                  <div key={b.id} className="p-3.5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#1F2933]">{b.resourceName}</span>
                      <span className={`text-[11px] font-semibold ${twoWay.revealed ? 'text-[#3F7D4E]' : 'text-[#B7791F]'}`}>
                        {twoWay.revealed ? 'Unlocked & visible' : 'Hidden until both submit'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-[#52606D] pt-1">
                      <div>
                        <strong>{b.borrowerName}:</strong>{' '}
                        {twoWay.borrowerRated ? `★ ${twoWay.borrowerRating} ("${twoWay.borrowerComment || ''}")` : 'Pending'}
                      </div>
                      <div>
                        <strong>{b.ownerName}:</strong>{' '}
                        {twoWay.lenderRated ? `★ ${twoWay.lenderRating} ("${twoWay.lenderComment || ''}")` : 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Admin ruling modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full border border-[#E5E0D8] p-5 space-y-3 text-sm">
            <h3 className="font-serif font-semibold text-base text-[#1F2933]">
              Admin ruling for {selectedIncident.resourceName}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Findings and decision note
              </label>
              <textarea
                rows={3}
                value={adminDecisionNote}
                onChange={(e) => setAdminDecisionNote(e.target.value)}
                placeholder="e.g. Inspected in person; normal wear confirmed. Deposit released in full."
                required
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-xs text-[#1F2933]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Deposit deduction (₹, 0 if no penalty)
              </label>
              <input
                type="number"
                min="0"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-xs text-[#1F2933]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-3 py-1.5 rounded border border-[#E5E0D8] text-xs text-[#52606D]"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-1.5 rounded bg-[#0F766E] text-white text-xs font-semibold"
              >
                Resolve incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
