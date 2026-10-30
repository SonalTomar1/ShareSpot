import React, { useState } from 'react';
import { Booking, IncidentReport } from '../types';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { X, AlertTriangle } from 'lucide-react';

interface IncidentModalProps {
  booking: Booking | null;
  initialDiffData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  booking,
  initialDiffData,
  onClose,
  onSuccess,
}) => {
  const { currentUser, reportIncident, showToast } = useApp();

  const [incidentType, setIncidentType] = useState<IncidentReport['incidentType']>(
    initialDiffData ? 'damage' : 'late_return'
  );
  const [description, setDescription] = useState(
    initialDiffData?.summary
      ? `Visual check discrepancy: ${initialDiffData.summary}`
      : ''
  );
  const [photos, setPhotos] = useState<string[]>([
    booking?.resourcePhoto || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  ]);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>(initialDiffData?.summary || '');
  const [aiSuggestedAction, setAiSuggestedAction] = useState<string>(
    initialDiffData?.recommendation || ''
  );
  const [aiSeverity, setAiSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  if (!booking) return null;

  const handleGenerateAiSummary = async () => {
    if (!description.trim()) {
      showToast('Please type a brief description first.', 'warning');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await geminiService.summarizeIncident(incidentType, description, {
        resourceName: booking.resourceName,
        borrowerName: booking.borrowerName,
        ownerName: booking.ownerName,
        bookingDates: `${booking.startDate} to ${booking.endDate}`,
      });
      setAiSummary(res.summary);
      setAiSuggestedAction(res.suggested_action);
      setAiSeverity(res.severity);
      showToast('AI summary prepared.', 'info');
    } catch (e) {
      showToast('Prepared summary.', 'info');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      showToast('Please provide details for the report.', 'warning');
      return;
    }

    reportIncident(
      booking.id,
      incidentType,
      description,
      photos,
      aiSummary
        ? {
            summary: aiSummary,
            suggested_action: aiSuggestedAction,
            severity: aiSeverity,
          }
        : undefined
    );

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md max-w-lg w-full border border-[#E5E0D8] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1F2933]">
              Report a problem
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {/* Issue category */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Issue category
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
            >
              <option value="damage">Physical damage or broken part</option>
              <option value="late_return">Overdue item or late return</option>
              <option value="missing_parts">Missing accessories or cables</option>
              <option value="dispute">Condition disagreement or deposit dispute</option>
              <option value="safety">Safety concern</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              What happened?
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain plainly: what is damaged or delayed, and what was discussed..."
              required
              className="w-full px-3 py-2 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
            />
            <p className="text-[11px] text-[#627D98] mt-0.5">
              The owner and campus admin review this to resolve the issue fairly.
            </p>
          </div>

          {/* AI triage summary */}
          <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#1F2933]">AI incident summary (optional)</span>
              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={isGeneratingAi || !description.trim()}
                className="px-2.5 py-1 rounded bg-[#0F766E] text-white text-xs font-medium hover:bg-[#115E59] disabled:bg-[#E5E0D8] disabled:text-[#829AB1]"
              >
                {isGeneratingAi ? 'Summarizing...' : 'Generate summary'}
              </button>
            </div>

            {aiSummary ? (
              <div className="p-2.5 bg-white border border-[#E5E0D8] rounded text-xs space-y-1">
                <div className="flex justify-between items-center text-[#829AB1] text-[10px]">
                  <span>AI summary only</span>
                  <span>Human decision required</span>
                </div>
                <p className="text-[#1F2933]">{aiSummary}</p>
                {aiSuggestedAction && (
                  <p className="text-[#0F766E] font-medium pt-1 border-t border-[#E5E0D8]">
                    Suggested next step: {aiSuggestedAction}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[#627D98] text-[11px]">
                You can generate a neutral summary to help the warden or owner review faster.
              </p>
            )}
          </div>

          <p className="text-[11px] text-[#627D98]">
            Decisions on deposits or warnings are always made by humans, not by automated algorithms.
          </p>

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
              className="px-4 py-1.5 rounded bg-[#B42318] text-white text-sm font-semibold hover:bg-red-800"
            >
              Submit problem report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
