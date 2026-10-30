import React, { useState, useMemo } from 'react';
import { Resource, ItemCategory } from '../types';
import { useApp } from '../context/AppContext';
import { FilterBar } from '../components/FilterBar';
import { ResourceCard } from '../components/ResourceCard';

interface HomePageProps {
  onSelectResource: (resource: Resource) => void;
  onRequestBooking: (resource: Resource) => void;
  onOpenNewListing: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectResource,
  onRequestBooking,
  onOpenNewListing,
}) => {
  const { resources, activeTab, currentUser, bookings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'All'>('All');
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [depositFilter, setDepositFilter] = useState<'all' | 'free' | 'deposit'>('all');
  const [selectedHostelBlock, setSelectedHostelBlock] = useState('all');

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Group filter
      if (res.groupTag !== activeTab) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = res.name.toLowerCase().includes(q);
        const mDesc = res.description.toLowerCase().includes(q);
        const mLoc = res.location.toLowerCase().includes(q);
        const mOwner = res.ownerName.toLowerCase().includes(q);
        if (!mName && !mDesc && !mLoc && !mOwner) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && res.category !== selectedCategory) return false;

      // Deposit filter
      if (depositFilter === 'free' && res.depositAmount > 0) return false;
      if (depositFilter === 'deposit' && res.depositAmount === 0) return false;

      // Hostel block filter
      if (selectedHostelBlock !== 'all') {
        if (res.hostelBlock && res.hostelBlock !== selectedHostelBlock) return false;
      }

      // Available now
      if (availableNowOnly) {
        const isBooked = bookings.some(
          (b) => b.resourceId === res.id && ['Approved', 'Checked out'].includes(b.status)
        );
        if (isBooked) return false;
      }

      // I'm eligible
      if (eligibleOnly) {
        if (!currentUser) return false;
        const rules = res.eligibility;
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
      }

      return true;
    });
  }, [
    resources,
    activeTab,
    searchQuery,
    selectedCategory,
    depositFilter,
    selectedHostelBlock,
    availableNowOnly,
    eligibleOnly,
    bookings,
    currentUser,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Calm Left-aligned Page Heading (No hero banner) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F2933]">
            Borrow what you need on campus
          </h1>
          <p className="text-sm text-[#52606D] mt-1">
            Lend and borrow equipment, tools, and study rooms with classmates and staff.
          </p>
        </div>

        <button
          onClick={onOpenNewListing}
          className="self-start sm:self-auto text-xs font-semibold text-[#0F766E] hover:underline"
        >
          + Have something to lend?
        </button>
      </div>

      {/* Underlined Group Tabs and Filters */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        availableNowOnly={availableNowOnly}
        setAvailableNowOnly={setAvailableNowOnly}
        eligibleOnly={eligibleOnly}
        setEligibleOnly={setEligibleOnly}
        depositFilter={depositFilter}
        setDepositFilter={setDepositFilter}
        selectedHostelBlock={selectedHostelBlock}
        setSelectedHostelBlock={setSelectedHostelBlock}
      />

      {/* Catalog List / Grid */}
      <div>
        <div className="flex justify-between items-center text-xs text-[#52606D] mb-3">
          <span>{filteredResources.length} items listed in this section</span>
          {activeTab === 'Hosteler' && (
            <span className="text-[11px] text-[#627D98]">Items for hostel students and block rooms</span>
          )}
        </div>

        {filteredResources.length === 0 ? (
          <div className="bg-white rounded border border-[#E5E0D8] p-8 text-center space-y-2">
            <p className="text-sm text-[#1F2933]">No items match your search or filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setAvailableNowOnly(false);
                setEligibleOnly(false);
                setDepositFilter('all');
                setSelectedHostelBlock('all');
              }}
              className="text-xs text-[#0F766E] font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onSelect={onSelectResource}
                onRequestBooking={onRequestBooking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
