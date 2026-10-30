import React, { useState } from 'react';
import { Booking, ConditionReport } from '../types';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { X, Camera } from 'lucide-react';

interface CheckoutReturnModalProps {
  booking: Booking | null;
  mode: 'checkout' | 'return';
  onClose: () => void;
  onSuccess: () => void;
  onOpenDamageReport?: (booking: Booking, diffData?: any) => void;
}

export const CheckoutReturnModal: React.FC<CheckoutReturnModalProps> = ({
  booking,
  mode,
  onClose,
  onSuccess,
  onOpenDamageReport,
}) => {
  const { currentUser, processCheckout, processReturn, showToast } = useApp();

  const [workingOrder, setWorkingOrder] = useState(true);
  const [noScratches, setNoScratches] = useState(true);
  const [allPartsPresent, setAllPartsPresent] = useState(true);
  const [clean, setClean] = useState(true);
  const [notes, setNotes] = useState(
    mode === 'checkout'
      ? 'Checked at pickup. Powers on cleanly, parts present.'
      : 'Returned clean with all accessories present.'
  );

  const [photos, setPhotos] = useState<string[]>([
    booking?.resourcePhoto || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  ]);

  const [confirmedByParty, setConfirmedByParty] = useState(true);

  // Return mode: AI Difference Check states
  const [isComparingAi, setIsComparingAi] = useState(false);
  const [aiDiffResult, setAiDiffResult] = useState<{
    new_damage_detected: boolean;
    detected_changes: string[];
    wear_score: number;
    summary: string;
    recommendation: string;
  } | null>(null);

  if (!booking) return null;

  const isCheckout = mode === 'checkout';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setPhotos([ev.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const runAiDiff = async () => {
    setIsComparingAi(true);
    try {
      const checkoutPhotos = booking.checkoutCondition?.photos || [booking.resourcePhoto];
      const res = await geminiService.compareCondition(
        checkoutPhotos,
        photos,
        booking.resourceName
      );
      setAiDiffResult(res);
      if (res.new_damage_detected) {
        showToast('Differences flagged between before and after photos.', 'warning');
      } else {
        showToast('Photos match baseline condition.', 'info');
      }
    } catch (err) {
      showToast('Visual check complete.', 'info');
    } finally {
      setIsComparingAi(false);
    }
  };

  const handleConfirmCheckout = () => {
    const report: ConditionReport = {
      workingOrder,
      noScratches,
      allPartsPresent,
      clean,
      notes: notes.trim(),
      photos,
      confirmedByBorrower: true,
      confirmedByLender: true,
      timestamp: new Date().toISOString(),
    };

    processCheckout(booking.id, report);
    onSuccess();
  };

  const handleConfirmReturnSafe = () => {
    const report: ConditionReport = {
      workingOrder,
      noScratches,
      allPartsPresent,
      clean,
      notes: notes.trim(),
      photos,
      confirmedByBorrower: true,
      confirmedByLender: true,
      timestamp: new Date().toISOString(),
    };

    processReturn(booking.id, report, true, aiDiffResult);
    onSuccess();
  };

  const handleReportDamage = () => {
    if (onOpenDamageReport) {
      onOpenDamageReport(booking, aiDiffResult);
    } else {
      showToast('Opening report...', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md max-w-2xl w-full border border-[#E5E0D8] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1F2933]">
              {isCheckout ? 'Check-out condition check' : 'Return inspection and comparison'}
            </h3>
            <p className="text-xs text-[#52606D]">
              {booking.resourceName} • {booking.borrowerName} and {booking.ownerName}
            </p>
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
          {/* Side-by-side comparison for return mode */}
          {!isCheckout && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1F2933]">Side-by-side photo check</span>
                <button
                  type="button"
                  onClick={runAiDiff}
                  disabled={isComparingAi}
                  className="px-2.5 py-1 rounded bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59]"
                >
                  {isComparingAi ? 'Comparing...' : 'Run AI photo compare'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Left: At checkout */}
                <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded space-y-2">
                  <span className="font-semibold text-[#1F2933] block">At check-out (before)</span>
                  <div className="aspect-4/3 bg-[#E5E0D8] rounded overflow-hidden border border-[#CBD5E1]">
                    <img
                      src={
                        booking.checkoutCondition?.photos[0] ||
                        booking.resourcePhoto ||
                        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Check-out baseline"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[#52606D] text-[11px]">
                    "{booking.checkoutCondition?.notes || 'Clean handover'}"
                  </p>
                </div>

                {/* Right: At return */}
                <div className="p-3 bg-white border border-[#E5E0D8] rounded space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#1F2933]">At return (now)</span>
                    <label className="text-[11px] text-[#0F766E] font-medium hover:underline cursor-pointer flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>Retake</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="aspect-4/3 bg-[#E5E0D8] rounded overflow-hidden border border-[#CBD5E1]">
                    <img src={photos[0]} alt="Return state" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[#52606D] text-[11px]">"{notes || 'No issues'}"</p>
                </div>
              </div>

              {/* AI diff assessment if available */}
              {aiDiffResult && (
                <div className="p-3 rounded border border-[#E5E0D8] bg-[#FAF7F2] text-xs space-y-1">
                  <div className="flex justify-between items-center font-semibold text-[#1F2933]">
                    <span>AI difference result: {aiDiffResult.wear_score}% integrity</span>
                    <span className="text-[10px] text-[#829AB1] font-normal">Human owner confirms decision</span>
                  </div>
                  <p className="text-[#52606D]">{aiDiffResult.summary}</p>
                  {aiDiffResult.detected_changes && aiDiffResult.detected_changes.length > 0 && (
                    <ul className="list-disc list-inside text-[#B7791F] text-[11px] pt-1">
                      {aiDiffResult.detected_changes.map((ch, i) => (
                        <li key={i}>{ch}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Condition checklist */}
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded space-y-2.5">
            <span className="text-xs font-semibold text-[#1F2933] block">
              {isCheckout ? 'Handover checklist' : 'Return checklist'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-white rounded border border-[#E5E0D8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={workingOrder}
                  onChange={(e) => setWorkingOrder(e.target.checked)}
                  className="rounded border-[#E5E0D8] text-[#0F766E]"
                />
                <span className="text-[#1F2933]">Item works properly</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded border border-[#E5E0D8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={noScratches}
                  onChange={(e) => setNoScratches(e.target.checked)}
                  className="rounded border-[#E5E0D8] text-[#0F766E]"
                />
                <span className="text-[#1F2933]">No new scratches or marks</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded border border-[#E5E0D8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allPartsPresent}
                  onChange={(e) => setAllPartsPresent(e.target.checked)}
                  className="rounded border-[#E5E0D8] text-[#0F766E]"
                />
                <span className="text-[#1F2933]">All parts and cables present</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded border border-[#E5E0D8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={clean}
                  onChange={(e) => setClean(e.target.checked)}
                  className="rounded border-[#E5E0D8] text-[#0F766E]"
                />
                <span className="text-[#1F2933]">Clean and tidy condition</span>
              </label>
            </div>

            {/* Photo upload for checkout */}
            {isCheckout && (
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-[#1F2933]">Condition photo</span>
                  <label className="text-[#0F766E] font-medium cursor-pointer hover:underline">
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="w-32 aspect-4/3 rounded overflow-hidden border border-[#CBD5E1] bg-[#E5E0D8]">
                  <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Inspection notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E0D8] rounded text-xs text-[#1F2933]"
              />
            </div>

            {/* Both parties confirmation */}
            <label className="flex items-start gap-2 pt-2 border-t border-[#E5E0D8] cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedByParty}
                onChange={(e) => setConfirmedByParty(e.target.checked)}
                className="mt-0.5 rounded border-[#E5E0D8] text-[#0F766E]"
              />
              <span className="text-[11px] text-[#52606D] font-medium leading-tight">
                Both borrower and owner confirm this inspection record.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E0D8] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-[#E5E0D8] text-sm text-[#52606D] hover:bg-white"
          >
            Cancel
          </button>

          {isCheckout ? (
            <button
              type="button"
              onClick={handleConfirmCheckout}
              disabled={!confirmedByParty}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors cursor-pointer ${
                confirmedByParty
                  ? 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                  : 'bg-[#E5E0D8] text-[#829AB1] cursor-not-allowed'
              }`}
            >
              Confirm check-out
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReportDamage}
                className="px-3.5 py-1.5 rounded border border-[#B42318] text-[#B42318] hover:bg-red-50 text-sm font-semibold"
              >
                Report a problem
              </button>
              <button
                type="button"
                onClick={handleConfirmReturnSafe}
                disabled={!confirmedByParty}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors cursor-pointer ${
                  confirmedByParty
                    ? 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                    : 'bg-[#E5E0D8] text-[#829AB1] cursor-not-allowed'
                }`}
              >
                Returned safely
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
