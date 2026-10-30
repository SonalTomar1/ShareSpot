import React, { useState } from 'react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';
import { X, Star, Lock } from 'lucide-react';

interface RatingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

const POSITIVE_TAGS = [
  'On time',
  'Item as described',
  'Careful with item',
  'Friendly and prompt',
  'Clean equipment',
  'Helpful handover',
];

const CRITICAL_TAGS = [
  'Late return',
  'Rude',
  'Dirty item',
  'Missing accessory',
  'Slow communication',
];

export const RatingModal: React.FC<RatingModalProps> = ({
  booking,
  onClose,
  onSuccess,
}) => {
  const { currentUser, submitRating, showToast } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['On time', 'Careful with item']);
  const [comment, setComment] = useState('');

  if (!booking || !currentUser) return null;

  const isBorrower = currentUser.id === booking.borrowerId;
  const targetName = isBorrower ? booking.ownerName : booking.borrowerName;
  const targetRole = isBorrower ? 'lender' : 'borrower';

  const twoWay = booking.twoWayRating;
  const alreadySubmitted = isBorrower ? twoWay.borrowerRated : twoWay.lenderRated;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('Please select a star rating from 1 to 5.', 'warning');
      return;
    }

    submitRating(booking.id, rating, selectedTags, comment);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md max-w-md w-full border border-[#E5E0D8] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1F2933]">
              Rate {targetName}
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

        {alreadySubmitted && !twoWay.revealed ? (
          <div className="p-6 text-center space-y-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E5E0D8] text-[#52606D] flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-semibold text-[#1F2933]">Rating saved confidentially</h4>
            <p className="text-xs text-[#52606D]">
              Your rating is locked and will be revealed once {targetName} also submits their feedback.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-1.5 rounded bg-[#1F2933] text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        ) : twoWay.revealed ? (
          <div className="p-6 space-y-4 text-sm">
            <div className="text-center">
              <h4 className="font-serif font-semibold text-[#1F2933]">Two-way ratings revealed</h4>
              <p className="text-xs text-[#52606D] mt-0.5">Both of you have completed reviews.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded">
                <p className="font-semibold text-[#1F2933]">{booking.borrowerName}:</p>
                <div className="flex items-center text-[#B7791F] my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (twoWay.borrowerRating || 5)
                          ? 'fill-[#B7791F] text-[#B7791F]'
                          : 'text-[#E5E0D8]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[#52606D] text-[11px] italic">
                  "{twoWay.borrowerComment || 'Smooth handover'}"
                </p>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded">
                <p className="font-semibold text-[#1F2933]">{booking.ownerName}:</p>
                <div className="flex items-center text-[#B7791F] my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (twoWay.lenderRating || 5)
                          ? 'fill-[#B7791F] text-[#B7791F]'
                          : 'text-[#E5E0D8]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[#52606D] text-[11px] italic">
                  "{twoWay.lenderComment || 'Reliable borrower'}"
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 rounded bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
            <div className="p-2.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded text-xs text-[#52606D]">
              Ratings stay private until both parties submit. Neither of you sees the score until both have rated.
            </div>

            {/* Stars */}
            <div className="text-center py-1">
              <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
                How was your experience with this {targetRole}?
              </label>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-[#B7791F] text-[#B7791F]'
                          : 'text-[#E5E0D8]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#52606D] mt-1 font-medium">
                {rating === 5 && '5 stars - Great experience'}
                {rating === 4 && '4 stars - Good and smooth'}
                {rating === 3 && '3 stars - Fine'}
                {rating === 2 && '2 stars - Had some issues'}
                {rating === 1 && '1 star - Poor experience'}
              </p>
            </div>

            {/* Quick tags */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Tags (select any that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POSITIVE_TAGS.map((t) => {
                  const isSel = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-[#0F766E] text-white font-medium'
                          : 'bg-[#FAF7F2] border border-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E5E0D8]">
                {CRITICAL_TAGS.map((t) => {
                  const isSel = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-[#B42318] text-white font-medium'
                          : 'bg-red-50 text-[#B42318] border border-red-200'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Optional note
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any helpful notes for the community..."
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-xs text-[#1F2933]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded border border-[#E5E0D8] text-sm text-[#52606D] hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#115E59]"
              >
                Submit private rating
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
