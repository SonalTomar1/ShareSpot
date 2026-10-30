import React from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md max-w-xl w-full border border-[#E5E0D8] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1F2933]">How ShareSpot works</h3>
            <p className="text-xs text-[#52606D]">Peer equipment lending on campus</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-[#1F2933]">
          <div>
            <h4 className="font-serif font-semibold text-base mb-1">About the project</h4>
            <p className="text-xs sm:text-sm text-[#52606D] leading-relaxed">
              ShareSpot was built by students to let people on campus borrow underused gear safely. Instead of buying a DSLR camera, a 3D printer, or a suit for an interview, you can borrow one from batchmates, hostels, or departments.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-base mb-2">The complete journey</h4>
            <ol className="text-xs sm:text-sm text-[#52606D] space-y-1.5 list-decimal list-inside">
              <li><strong>Owner lists item:</strong> Uploads photos with an AI condition check and sets rules.</li>
              <li><strong>Seeker finds item:</strong> Checks eligibility (college ID, course, hostel block).</li>
              <li><strong>Requests booking:</strong> System verifies active quotas and conflict times.</li>
              <li><strong>Owner approves or waitlists:</strong> A written reason is required for every decision.</li>
              <li><strong>Check-out:</strong> Both parties confirm condition checklist and take photos.</li>
              <li><strong>Return:</strong> Photos compared side-by-side with check-out state. Owner confirms safe return.</li>
              <li><strong>Two-way ratings:</strong> Both rate each other. Ratings stay private until both submit.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-base mb-1.5">Fair access rules</h4>
            <ul className="text-xs sm:text-sm text-[#52606D] space-y-1 list-disc list-inside">
              <li>Maximum 2 active bookings per person to prevent hoarding.</li>
              <li>Maximum 7 days per week on shared items.</li>
              <li>Waitlist auto-advances if an earlier booking is cancelled.</li>
            </ul>
          </div>

          <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded text-xs space-y-1">
            <span className="font-semibold text-[#1F2933] block">Authentication Note</span>
            <p className="text-[#52606D]">
              Demo authentication. A real deployment would use college SSO or Firebase Authentication. Passwords in this prototype are hashed using client-side SHA-256 before storage.
            </p>
          </div>

          <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded text-xs space-y-1">
            <span className="font-semibold text-[#1F2933] block">Known limitations</span>
            <p className="text-[#52606D]">
              AI condition checks are estimates only and do not replace human inspection. Financial deposits in this prototype are tracked digitally on demo ledgers.
            </p>
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
