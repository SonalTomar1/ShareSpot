import React, { useState } from 'react';
import { Resource } from '../types';
import { useApp } from '../context/AppContext';
import { X, Check, Star, MapPin, Clock, Lock } from 'lucide-react';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
  onRequestBooking: (resource: Resource) => void;
  onSelectPairedResource?: (resource: Resource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  onRequestBooking,
  onSelectPairedResource,
}) => {
  const { currentUser, resources, bookings, showToast } = useApp();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!resource || !currentUser) return null;

  // Eligibility evaluation
  const rules = resource.eligibility;
  const eligibilityChecks = [
    {
      label: 'Verified college ID',
      met: currentUser.verifiedCollegeId,
      required: rules.collegeIdVerified,
      note: currentUser.verifiedCollegeId ? 'Verified' : 'College ID card verification needed',
    },
    {
      label: 'Lab safety training certificate',
      met: currentUser.safetyTrainingCompleted,
      required: rules.safetyTrainingCompleted,
      note: currentUser.safetyTrainingCompleted
        ? 'Completed'
        : 'Requires 30-min lab safety training induction',
    },
    {
      label: rules.enrolledCourse ? `Enrolled in ${rules.enrolledCourse}` : 'Open enrollment',
      met: !rules.enrolledCourse || currentUser.enrolledCourses.includes(rules.enrolledCourse),
      required: Boolean(rules.enrolledCourse),
      note:
        rules.enrolledCourse && currentUser.enrolledCourses.includes(rules.enrolledCourse)
          ? `Enrolled for current term`
          : `Must be registered in ${rules.enrolledCourse || 'course'}`,
    },
    {
      label: rules.hostelBlockRequired ? `Lives in ${rules.hostelBlockRequired}` : 'Open to all residences',
      met: !rules.hostelBlockRequired || currentUser.hostelBlock === rules.hostelBlockRequired,
      required: Boolean(rules.hostelBlockRequired),
      note:
        rules.hostelBlockRequired && currentUser.hostelBlock === rules.hostelBlockRequired
          ? `Verified resident`
          : `Limited to ${rules.hostelBlockRequired || 'hostel'} residents`,
    },
  ];

  const allEligible = eligibilityChecks
    .filter((c) => c.required)
    .every((c) => c.met);

  const activeBookings = bookings.filter(
    (b) => b.resourceId === resource.id && ['Approved', 'Checked out'].includes(b.status)
  );
  const isOccupied = activeBookings.length > 0;

  const pairedItems = (resource.pairedItemIds || [])
    .map((id) => resources.find((r) => r.id === id))
    .filter(Boolean) as Resource[];

  const isOwner = currentUser.id === resource.ownerId;
  const isRestrictedPrivacy = resource.privacyLevel === 'restricted';
  const depositText = resource.depositAmount > 0 ? `₹${resource.depositAmount} refundable deposit` : 'Free to borrow (no deposit)';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-lg max-w-4xl w-full border border-[#E5E0D8] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top bar with item title and close button */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#52606D]">{resource.groupTag}</span>
            <span className="text-[#829AB1]">/</span>
            <span className="text-xs text-[#52606D]">{resource.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#E5E0D8] text-[#52606D] hover:text-[#1F2933] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body: Two columns on desktop */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Photos, description, rules, owner */}
          <div className="md:col-span-7 space-y-5">
            {/* Main photo */}
            <div className="relative aspect-4/3 w-full bg-[#F0ECE4] rounded border border-[#E5E0D8] overflow-hidden">
              <img
                src={resource.photos[selectedPhotoIndex] || resource.photos[0]}
                alt={resource.name}
                className="w-full h-full object-cover"
              />
              {isRestrictedPrivacy && (
                <div className="absolute top-2 left-2 bg-[#1F2933]/90 text-white text-xs px-2.5 py-1 rounded flex items-center gap-1 font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidential space (bookings are private)</span>
                </div>
              )}
            </div>

            {/* Photo thumbnails */}
            {resource.photos.length > 1 && (
              <div className="flex gap-2">
                {resource.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`w-16 h-12 rounded border overflow-hidden ${
                      selectedPhotoIndex === idx
                        ? 'border-[#0F766E] ring-1 ring-[#0F766E]'
                        : 'border-[#E5E0D8] opacity-75'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & key line */}
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1F2933]">
                {resource.name}
              </h2>
              <p className="text-sm text-[#52606D] mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#829AB1] shrink-0" />
                <span>{resource.location}</span>
              </p>
            </div>

            {/* AI condition estimate */}
            {resource.aiCondition && (
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded text-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1F2933]">
                  <span>AI condition estimate: {resource.aiCondition.score}%</span>
                  <span className="text-[11px] text-[#829AB1] font-normal">AI estimate, not a guarantee</span>
                </div>
                <p className="text-xs text-[#52606D]">{resource.aiCondition.verdict}</p>
                {resource.aiCondition.issues && resource.aiCondition.issues.length > 0 && (
                  <p className="text-xs text-[#B7791F] pt-1">
                    Notes: {resource.aiCondition.issues.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#52606D] mb-1.5">
                About this item
              </h3>
              <p className="text-sm text-[#1F2933] leading-relaxed whitespace-pre-line">
                {resource.description}
              </p>
            </div>

            {/* Usage rules */}
            {resource.usageRules && resource.usageRules.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#52606D] mb-1.5">
                  Usage rules
                </h3>
                <ul className="text-sm text-[#1F2933] space-y-1 list-disc list-inside">
                  {resource.usageRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Owner profile card */}
            <div className="p-3.5 border border-[#E5E0D8] rounded bg-white flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <img
                  src={resource.ownerAvatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E0D8]"
                />
                <div>
                  <p className="font-semibold text-[#1F2933]">{resource.ownerName}</p>
                  <p className="text-xs text-[#52606D]">
                    {resource.ownerGroup} • {resource.ownerReviewsCount} completed loans
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center text-[#B7791F] font-semibold text-sm">
                  <Star className="w-3.5 h-3.5 fill-[#B7791F] mr-1" />
                  <span>{resource.ownerReviewsCount > 0 ? resource.ownerRating : 'New'}</span>
                </div>
                <p className="text-[11px] text-[#829AB1]">Owner rating</p>
              </div>
            </div>

            {/* Students also borrowed */}
            {pairedItems.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#52606D] mb-2">
                  Students often borrow together
                </h3>
                <div className="space-y-2">
                  {pairedItems.map((paired) => (
                    <div
                      key={paired.id}
                      onClick={() => onSelectPairedResource && onSelectPairedResource(paired)}
                      className="p-2.5 rounded border border-[#E5E0D8] bg-[#FAF7F2] hover:bg-white flex items-center justify-between text-sm cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={paired.photos[0]}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-semibold text-[#1F2933] text-xs sm:text-sm">{paired.name}</p>
                          <p className="text-xs text-[#52606D]">
                            {paired.depositAmount > 0 ? `₹${paired.depositAmount} deposit` : 'Free'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[#0F766E] font-medium">View item →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Sticky Request panel with eligibility checklist */}
          <div className="md:col-span-5 space-y-5">
            <div className="md:sticky md:top-2 border border-[#E5E0D8] rounded-md p-4 bg-[#FAF7F2] space-y-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#1F2933]">Borrowing details</h3>
                <div className="mt-2 space-y-1.5 text-xs text-[#52606D]">
                  <p>
                    <strong className="text-[#1F2933]">Cost:</strong> {depositText}
                  </p>
                  <p>
                    <strong className="text-[#1F2933]">Max booking duration:</strong> Up to{' '}
                    {resource.maxDurationHours} hours
                  </p>
                  <p>
                    <strong className="text-[#1F2933]">Handover hours:</strong>{' '}
                    {resource.availabilitySchedule.startTime} to {resource.availabilitySchedule.endTime}
                  </p>
                </div>
              </div>

              {/* Status note */}
              <div className="p-2.5 bg-white border border-[#E5E0D8] rounded text-xs">
                {isOccupied ? (
                  <p className="text-[#B7791F] font-medium">
                    This item has an active booking right now. You can request to join the waitlist.
                  </p>
                ) : (
                  <p className="text-[#3F7D4E] font-medium">
                    Available for request today.
                  </p>
                )}
              </div>

              {/* Plain Eligibility Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1F2933] pb-1 border-b border-[#E5E0D8]">
                  <span>Your eligibility check</span>
                  <span className={allEligible ? 'text-[#3F7D4E]' : 'text-[#B42318]'}>
                    {allEligible ? 'Eligible' : 'Not yet eligible'}
                  </span>
                </div>

                <div className="space-y-2">
                  {eligibilityChecks.map((check, i) => {
                    if (!check.required) return null;
                    return (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            check.met ? 'bg-[#3F7D4E] text-white' : 'bg-[#B42318] text-white'
                          }`}
                        >
                          {check.met ? '✓' : '✗'}
                        </span>
                        <div>
                          <p className={`font-medium ${check.met ? 'text-[#1F2933]' : 'text-[#B42318]'}`}>
                            {check.label}
                          </p>
                          <p className="text-[#627D98] text-[11px]">{check.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action button */}
              {isOwner ? (
                <p className="text-xs text-[#52606D] text-center italic">
                  This is your listing. Manage it from your dashboard.
                </p>
              ) : (
                <button
                  onClick={() => {
                    if (!allEligible) {
                      showToast('You do not meet all requirements for this item yet', 'warning');
                      return;
                    }
                    onRequestBooking(resource);
                  }}
                  disabled={!allEligible}
                  className={`w-full py-2.5 rounded text-sm font-semibold transition-colors cursor-pointer ${
                    allEligible
                      ? 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                      : 'bg-[#E5E0D8] text-[#829AB1] cursor-not-allowed'
                  }`}
                >
                  {isOccupied ? 'Join waitlist' : 'Request this'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
