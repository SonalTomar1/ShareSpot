import React from 'react';
import { Resource } from '../types';
import { useApp } from '../context/AppContext';
import { MapPin, Star, Lock } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onSelect: (resource: Resource) => void;
  onRequestBooking: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onSelect,
  onRequestBooking,
}) => {
  const { currentUser, bookings } = useApp();

  // Check if resource is booked today
  const isBooked = bookings.some(
    (b) => b.resourceId === resource.id && ['Approved', 'Checked out'].includes(b.status)
  );

  // Check eligibility
  const isEligible = (() => {
    if (!currentUser) return false;
    const rules = resource.eligibility;
    if (rules.collegeIdVerified && !currentUser.verifiedCollegeId) return false;
    if (rules.safetyTrainingCompleted && !currentUser.safetyTrainingCompleted) return false;
    if (rules.enrolledCourse && !currentUser.enrolledCourses.includes(rules.enrolledCourse))
      return false;
    if (rules.hostelBlockRequired && currentUser.hostelBlock !== rules.hostelBlockRequired)
      return false;
    if (
      rules.allowedGroups &&
      rules.allowedGroups.length > 0 &&
      !rules.allowedGroups.includes(currentUser.group)
    )
      return false;
    return true;
  })();

  const isRestricted = resource.privacyLevel === 'restricted';
  const isOwner = currentUser ? currentUser.id === resource.ownerId : false;

  // Deposit text
  const depositText = resource.depositAmount > 0 ? `₹${resource.depositAmount} deposit` : 'Free';

  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      onClick={() => onSelect(resource)}
      className="bg-white rounded-md border border-[#E5E0D8] hover:border-[#CBD5E1] transition-colors overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* Photo on top (160px height / h-40) */}
      <div className="relative h-40 w-full bg-[#F0ECE4] overflow-hidden flex items-center justify-center">
        {!imageError && resource.photos[0] ? (
          <img
            src={resource.photos[0]}
            alt={resource.name}
            className="w-full h-40 object-cover group-hover:scale-101 transition-transform duration-150"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#52606D] p-3 text-center bg-[#F7F5F0]">
            <span className="font-serif text-xs font-semibold text-[#1F2933] line-clamp-2">
              {resource.name}
            </span>
            <span className="text-[11px] text-[#829AB1] mt-1">{resource.category}</span>
          </div>
        )}

        {/* Small privacy indicator if restricted */}
        {isRestricted && (
          <div className="absolute top-2 left-2 bg-[#1F2933]/90 text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3" />
            <span>Confidential room</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Key line: Location • Deposit • Group */}
          <div className="text-xs text-[#627D98] flex items-center gap-1.5 mb-1 truncate">
            <span>{depositText}</span>
            <span>•</span>
            <span className="truncate">{resource.location.split(',')[0]}</span>
            <span>•</span>
            <span>{resource.groupTag}</span>
          </div>

          {/* Name in Fraunces serif */}
          <h3 className="font-serif text-base font-semibold text-[#1F2933] leading-snug line-clamp-2 group-hover:text-[#0F766E] transition-colors">
            {resource.name}
          </h3>

          {/* Small status line */}
          <div className="mt-2 text-xs">
            {isBooked ? (
              <span className="text-[#B7791F] font-medium">Currently booked (waitlist open)</span>
            ) : (
              <span className="text-[#3F7D4E] font-medium">
                Available today, {resource.availabilitySchedule.startTime} to {resource.availabilitySchedule.endTime}
              </span>
            )}
          </div>

          {/* Quiet AI condition estimate badge */}
          {resource.aiCondition && (
            <div className="mt-2 text-[11px] text-[#52606D] bg-[#FAF7F2] border border-[#E5E0D8] px-2 py-1 rounded flex items-center justify-between">
              <span>AI condition estimate: {resource.aiCondition.score}%</span>
              <span className="text-[10px] text-[#829AB1]">AI estimate, not a guarantee</span>
            </div>
          )}
        </div>

        {/* Footer: Owner & Action */}
        <div className="mt-3 pt-2.5 border-t border-[#E5E0D8] flex items-center justify-between text-xs">
          {/* Owner & rating */}
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={resource.ownerAvatar}
              alt=""
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
            <span className="font-medium text-[#1F2933] truncate">{resource.ownerName}</span>
            <span className="text-[#829AB1]">•</span>
            <span className="flex items-center text-[#B7791F] font-semibold">
              <Star className="w-3 h-3 fill-[#B7791F] text-[#B7791F] mr-0.5" />
              {resource.ownerReviewsCount > 0 ? resource.ownerRating : 'New'}
            </span>
          </div>

          {/* Plain status pill or button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isOwner) {
                onSelect(resource);
              } else {
                onRequestBooking(resource);
              }
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              isOwner
                ? 'bg-[#FAF7F2] text-[#1F2933] hover:bg-[#E5E0D8]'
                : isEligible
                ? 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                : 'bg-[#F0ECE4] text-[#52606D] hover:bg-[#E5E0D8]'
            }`}
          >
            {isOwner ? 'Manage' : isEligible ? 'Request' : 'Rules'}
          </button>
        </div>
      </div>
    </div>
  );
};
