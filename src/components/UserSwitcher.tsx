import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ChevronDown, ChevronUp, UserCheck } from 'lucide-react';

export const UserSwitcher: React.FC = () => {
  const { currentUser, allUsers, switchUserById } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentUser) return null;

  // Custom exact labels requested for judge demo evaluation
  const getDemoRoleLabel = (userId: string, defaultName: string) => {
    switch (userId) {
      case 'user_aarav':
        return 'Aarav (Student)';
      case 'user_meera':
        return 'Meera (Hosteler)';
      case 'user_sharma':
        return 'Dr. Sharma (Teacher)';
      case 'user_kapoor':
        return 'Ms. Kapoor (Counsellor)';
      case 'user_warden':
        return 'Warden Singh (Manager)';
      case 'user_admin':
        return 'Campus Admin (Admin)';
      default:
        return defaultName;
    }
  };

  return (
    <div className="bg-[#F7F5F0] border-b border-[#E5E0D8] text-[#1F2933] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3">
        {/* Toggle trigger */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#52606D] hover:text-[#1F2933] cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#0F766E] inline-block animate-pulse" />
          <span>Demo mode: Switch role</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Current user indicator */}
        <div className="text-[11px] text-[#627D98] flex items-center gap-1">
          <span>Active:</span>
          <span className="font-semibold text-[#1F2933]">
            {getDemoRoleLabel(currentUser.id, currentUser.name)}
          </span>
          {currentUser.verifiedCollegeId && (
            <span className="text-[#3F7D4E] font-medium">• Verified ID</span>
          )}
        </div>
      </div>

      {/* Collapsible panel with the 6 exact demo account buttons */}
      {isExpanded && (
        <div className="border-t border-[#E5E0D8] bg-[#FAF7F2] px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#627D98] mr-1">
              Select persona:
            </span>
            {allUsers.map((user) => {
              const isActive = user.id === currentUser.id;
              const label = getDemoRoleLabel(user.id, user.name);

              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUserById(user.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-[#0F766E] text-white border-[#0F766E] font-semibold'
                      : 'bg-white hover:bg-[#F0ECE4] text-[#1F2933] border-[#CBD5E1]'
                  }`}
                  title={`${user.name} - ${user.roles.join(', ')}`}
                >
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                  />
                  <span>{label}</span>
                  {user.verifiedCollegeId && (
                    <Check
                      className={`w-3 h-3 ${
                        isActive ? 'text-white' : 'text-[#3F7D4E]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
