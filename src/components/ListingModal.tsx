import React, { useState } from 'react';
import {
  Resource,
  UserGroup,
  ItemCategory,
  AIConditionCheck,
} from '../types';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { X, Upload, Camera } from 'lucide-react';

interface ListingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Camera & lens',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: '3D Printer',
    url: 'https://images.unsplash.com/photo-1631556097152-c39479cbfeab?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Electronics kit',
    url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Toolkit',
    url: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sports gear',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
  },
];

export const ListingModal: React.FC<ListingModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser, addResource, showToast } = useApp();

  const [name, setName] = useState('');
  const [groupTag, setGroupTag] = useState<UserGroup>(currentUser?.group || 'Student');
  const [category, setCategory] = useState<ItemCategory>('Lab & Tech');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(
    currentUser?.hostelBlock ? `Hostel ${currentUser.hostelBlock}` : 'Campus Central'
  );
  const [photos, setPhotos] = useState<string[]>([SAMPLE_PHOTO_PRESETS[0].url]);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [maxDurationHours, setMaxDurationHours] = useState<number>(24);
  const [usageRules, setUsageRules] = useState<string>('Return in original condition; report issues promptly');
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'restricted'>('public');

  // Eligibility rules
  const [ruleCollegeId, setRuleCollegeId] = useState(true);
  const [ruleSafetyTraining, setRuleSafetyTraining] = useState(false);
  const [ruleCourse, setRuleCourse] = useState('');
  const [ruleHostelBlock, setRuleHostelBlock] = useState('');
  const [ruleSupervisorApproval, setRuleSupervisorApproval] = useState(false);

  // AI Condition Check state
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState<AIConditionCheck | null>(null);
  const [aiConfirmedByOwner, setAiConfirmedByOwner] = useState(false);

  if (!currentUser) return null;

  // Run AI Condition check
  const runAiConditionCheck = async (photoUrl: string) => {
    setAiChecking(true);
    setAiConfirmedByOwner(false);
    try {
      const res = await geminiService.checkCondition(photoUrl, name || 'Equipment');
      setAiResult(res);
      if (!res.photoQualityOk) {
        showToast('Photo was blurry or unclear. Please re-upload or inspect manually.', 'warning');
      } else {
        showToast(`AI check complete: ${res.score}% condition.`, 'info');
      }
    } catch (e) {
      showToast('Visual check fallback active.', 'info');
    } finally {
      setAiChecking(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setPhotos([base64]);
        runAiConditionCheck(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setPhotos([url]);
    runAiConditionCheck(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter an item name.', 'warning');
      return;
    }

    if (!aiResult) {
      showToast('Please run the photo condition check before listing.', 'warning');
      return;
    }

    if (!aiConfirmedByOwner) {
      showToast('Please confirm the condition before publishing.', 'warning');
      return;
    }

    const newResource: Resource = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      groupTag,
      category,
      description: description.trim() || 'Available for safe student & staff peer borrowing.',
      photos,
      location: location.trim(),
      hostelBlock: ruleHostelBlock || undefined,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerGroup: currentUser.group,
      ownerAvatar: currentUser.avatar,
      ownerRating: currentUser.rating,
      ownerReviewsCount: currentUser.reviewCount,
      availabilitySchedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        startTime: '08:00',
        endTime: '20:00',
      },
      eligibility: {
        collegeIdVerified: ruleCollegeId,
        safetyTrainingCompleted: ruleSafetyTraining,
        enrolledCourse: ruleCourse ? ruleCourse.trim() : undefined,
        hostelBlockRequired: ruleHostelBlock || undefined,
        facultySupervisorApprovalRequired: ruleSupervisorApproval,
      },
      depositAmount: Number(depositAmount) || 0,
      maxDurationHours: Number(maxDurationHours) || 24,
      usageRules: usageRules.split(';').map((s) => s.trim()).filter(Boolean),
      privacyLevel,
      status: 'active',
      aiCondition: aiResult,
      createdAt: new Date().toISOString(),
    };

    addResource(newResource);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md max-w-2xl w-full border border-[#E5E0D8] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1F2933]">List an item or space</h3>
            <p className="text-xs text-[#52606D]">Lend underused items to people on campus</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Item or space name
              </label>
              <input
                type="text"
                placeholder="e.g. Sony Alpha Camera, 3D Printer, Interview Blazer..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Primary group tag
              </label>
              <select
                value={groupTag}
                onChange={(e) => setGroupTag(e.target.value as UserGroup)}
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              >
                <option value="Student">Student</option>
                <option value="Teacher/Staff">Teacher / Staff</option>
                <option value="Hosteler">Hosteler</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              >
                <option value="Lab & Tech">Lab & Tech</option>
                <option value="Audio/Visual">Audio / Visual</option>
                <option value="Sports">Sports</option>
                <option value="Study & Spaces">Study & Spaces</option>
                <option value="Hostel Essentials">Hostel Essentials</option>
                <option value="Apparel">Apparel</option>
              </select>
            </div>
          </div>

          {/* Photo & AI condition inspection */}
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1F2933]">Photos and condition check</span>
              <span className="text-[#52606D]">AI condition inspection</span>
            </div>

            {/* Presets or upload */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[#627D98]">Demo photos:</span>
                {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p.url)}
                    className="px-2 py-0.5 rounded border border-[#E5E0D8] bg-white hover:bg-[#F0ECE4] text-xs text-[#1F2933]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded border border-[#E5E0D8] bg-white text-xs font-semibold text-[#1F2933] hover:bg-[#FAF7F2] cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload local photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => runAiConditionCheck(photos[0])}
                  disabled={aiChecking}
                  className="px-3 py-1.5 rounded bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59]"
                >
                  {aiChecking ? 'Inspecting...' : 'Run condition check'}
                </button>
              </div>
            </div>

            {/* Photo preview & AI assessment */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="w-36 aspect-4/3 bg-[#E5E0D8] rounded overflow-hidden shrink-0 border border-[#CBD5E1]">
                <img src={photos[0]} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 bg-white p-3 rounded border border-[#E5E0D8] text-xs space-y-1.5">
                {aiChecking ? (
                  <p className="text-[#52606D] italic">Inspecting photo condition...</p>
                ) : aiResult ? (
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-[#1F2933]">
                      <span>Condition estimate: {aiResult.score}%</span>
                      <span className="text-[10px] text-[#829AB1] font-normal">AI estimate, not a guarantee</span>
                    </div>
                    <p className="text-xs text-[#52606D] mt-0.5">{aiResult.verdict}</p>
                    {aiResult.issues && aiResult.issues.length > 0 && (
                      <p className="text-[11px] text-[#B7791F] mt-1">
                        Noted issues: {aiResult.issues.join(', ')}
                      </p>
                    )}

                    <label className="flex items-start gap-2 pt-2 mt-2 border-t border-[#E5E0D8] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiConfirmedByOwner}
                        onChange={(e) => setAiConfirmedByOwner(e.target.checked)}
                        className="mt-0.5 rounded border-[#E5E0D8] text-[#0F766E]"
                      />
                      <span className="text-[11px] text-[#1F2933] font-medium leading-tight">
                        I confirm this estimate reflects the physical condition of the item.
                      </span>
                    </label>
                  </div>
                ) : (
                  <p className="text-[#829AB1] text-xs">
                    Click "Run condition check" to inspect the photo.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description & rules */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Description & what's included
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Includes charging cable, protective case, clean and working order..."
              className="w-full px-3 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Borrower rules (separate by semicolon)
            </label>
            <input
              type="text"
              value={usageRules}
              onChange={(e) => setUsageRules(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
            />
          </div>

          {/* Handover location, deposit, duration, privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Handover location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hostel Block A, Room 102"
                className="w-full px-3 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Deposit amount (₹, 0 for free)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Max booking duration (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={maxDurationHours}
                onChange={(e) => setMaxDurationHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                Privacy level
              </label>
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-[#E5E0D8] rounded text-sm text-[#1F2933]"
              >
                <option value="public">Public</option>
                <option value="restricted">Restricted (Counseling / confidential space)</option>
              </select>
            </div>
          </div>

          {/* Eligibility rules */}
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded space-y-2 text-xs">
            <span className="font-semibold text-[#1F2933] block">Eligibility rules (who can borrow)</span>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleCollegeId}
                  onChange={(e) => setRuleCollegeId(e.target.checked)}
                  className="rounded border-[#E5E0D8] text-[#0F766E]"
                />
                <span>Requires verified college ID</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleSafetyTraining}
                  onChange={(e) => setRuleSafetyTraining(e.target.checked)}
                  className="rounded border-[#E5E0D8] text-[#0F766E]"
                />
                <span>Requires lab safety training completed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleSupervisorApproval}
                  onChange={(e) => setRuleSupervisorApproval(e.target.checked)}
                  className="rounded border-[#E5E0D8] text-[#0F766E]"
                />
                <span>Requires faculty supervisor approval</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-[#52606D] mb-0.5">
                  Specific course (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-301"
                  value={ruleCourse}
                  onChange={(e) => setRuleCourse(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#E5E0D8] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#52606D] mb-0.5">
                  Hostel block restriction (optional)
                </label>
                <select
                  value={ruleHostelBlock}
                  onChange={(e) => setRuleHostelBlock(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#E5E0D8] rounded text-xs"
                >
                  <option value="">Any campus member</option>
                  <option value="Block A">Block A only</option>
                  <option value="Block B">Block B only</option>
                  <option value="Block C">Block C only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E0D8] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-[#E5E0D8] text-sm text-[#52606D] hover:bg-[#FAF7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!aiConfirmedByOwner || aiChecking}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors cursor-pointer ${
                aiConfirmedByOwner && !aiChecking
                  ? 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                  : 'bg-[#E5E0D8] text-[#829AB1] cursor-not-allowed'
              }`}
            >
              Publish listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
