import React from 'react';
import { UserGroup, ItemCategory } from '../types';
import { useApp } from '../context/AppContext';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ItemCategory | 'All';
  setSelectedCategory: (cat: ItemCategory | 'All') => void;
  availableNowOnly: boolean;
  setAvailableNowOnly: (val: boolean) => void;
  eligibleOnly: boolean;
  setEligibleOnly: (val: boolean) => void;
  depositFilter: 'all' | 'free' | 'deposit';
  setDepositFilter: (val: 'all' | 'free' | 'deposit') => void;
  selectedHostelBlock: string;
  setSelectedHostelBlock: (block: string) => void;
}

const CATEGORIES: (ItemCategory | 'All')[] = [
  'All',
  'Lab & Tech',
  'Audio/Visual',
  'Sports',
  'Study & Spaces',
  'Hostel Essentials',
  'Apparel',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  availableNowOnly,
  setAvailableNowOnly,
  eligibleOnly,
  setEligibleOnly,
  depositFilter,
  setDepositFilter,
  selectedHostelBlock,
  setSelectedHostelBlock,
}) => {
  const { activeTab, setActiveTab } = useApp();

  const groups: { key: UserGroup; label: string }[] = [
    { key: 'Student', label: 'Students' },
    { key: 'Teacher/Staff', label: 'Teachers & staff' },
    { key: 'Hosteler', label: 'Hostelers' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Group tabs as clean underlined text tabs */}
      <div className="flex border-b border-[#E5E0D8] space-x-8 text-base">
        {groups.map((g) => {
          const isActive = activeTab === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setActiveTab(g.key)}
              className={`pb-3 font-medium transition-colors cursor-pointer border-b-2 -mb-px text-sm sm:text-base ${
                isActive
                  ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                  : 'border-transparent text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* 2. Search & filter row */}
      <div className="bg-white p-3 rounded-md border border-[#E5E0D8] space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search box with plain student placeholder */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#829AB1]" />
            <input
              type="text"
              placeholder="Search camera, iron, lab, study room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#FAF7F2] border border-[#E5E0D8] rounded text-sm text-[#1F2933] placeholder:text-[#829AB1] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#829AB1] hover:text-[#1F2933]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              aria-label="Filter by category"
              className="px-2.5 py-2 bg-white border border-[#E5E0D8] rounded text-xs sm:text-sm text-[#1F2933] font-medium"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All categories' : c}
                </option>
              ))}
            </select>

            {/* Deposit filter */}
            <select
              value={depositFilter}
              onChange={(e) => setDepositFilter(e.target.value as any)}
              aria-label="Filter by deposit requirement"
              className="px-2.5 py-2 bg-white border border-[#E5E0D8] rounded text-xs sm:text-sm text-[#1F2933] font-medium"
            >
              <option value="all">Free & deposit</option>
              <option value="free">Free only</option>
              <option value="deposit">Deposit required</option>
            </select>

            {/* Hostel block filter */}
            {activeTab === 'Hosteler' && (
              <select
                value={selectedHostelBlock}
                onChange={(e) => setSelectedHostelBlock(e.target.value)}
                aria-label="Filter by hostel block"
                className="px-2.5 py-2 bg-white border border-[#E5E0D8] rounded text-xs sm:text-sm text-[#1F2933] font-medium"
              >
                <option value="all">All hostel blocks</option>
                <option value="Block A">Block A only</option>
                <option value="Block B">Block B only</option>
                <option value="Block C">Block C only</option>
              </select>
            )}

            {/* "I'm eligible" toggle */}
            <button
              onClick={() => setEligibleOnly(!eligibleOnly)}
              className={`px-3 py-2 rounded text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                eligibleOnly
                  ? 'bg-[#0F766E] border-[#0F766E] text-white'
                  : 'bg-white border-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              I'm eligible
            </button>

            {/* "Available now" toggle */}
            <button
              onClick={() => setAvailableNowOnly(!availableNowOnly)}
              className={`px-3 py-2 rounded text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                availableNowOnly
                  ? 'bg-[#0F766E] border-[#0F766E] text-white'
                  : 'bg-white border-[#E5E0D8] text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              Available now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
