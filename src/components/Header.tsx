import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Menu,
  X,
  Plus,
  Star,
  LogOut,
  User as UserIcon,
  Check,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
  IdCard,
  Award,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenNewListing: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenNewListing,
  onOpenAbout,
}) => {
  const {
    currentUser,
    allUsers,
    unreadNotifCount,
    currentView,
    setCurrentView,
    bookings,
    notifications,
    logout,
    switchUserById,
    showToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
        setDemoSwitchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const hasOverdue = notifications.some(
    (n) => n.userId === currentUser.id && n.isOverdue && !n.isRead
  );
  const pendingForOwner = bookings.filter(
    (b) => b.ownerId === currentUser.id && b.status === 'Requested'
  ).length;

  const isAdmin = currentUser.roles.includes('Admin');
  const isOwnerOrManager =
    currentUser.roles.includes('Owner') ||
    currentUser.roles.includes('Manager') ||
    currentUser.roles.includes('Admin');

  // Exact demo account labels
  const getDemoRoleLabel = (userId: string, defaultName: string) => {
    switch (userId) {
      case 'user_aarav':
        return 'Aarav (Student)';
      case 'user_meera':
        return 'Meera (Hosteler, Block A)';
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

  const getGroupBadgeLabel = () => {
    if (currentUser.group === 'Hosteler' && currentUser.hostelBlock) {
      return `Hosteler (${currentUser.hostelBlock})`;
    }
    if (currentUser.id === 'user_kapoor') return 'Staff Counselor';
    if (currentUser.id === 'user_sharma') return 'Teacher / Faculty';
    if (currentUser.id === 'user_warden') return 'Hostel Warden';
    if (currentUser.id === 'user_admin') return 'Campus Administrator';
    return currentUser.group;
  };

  return (
    <>
      <header className="bg-white border-b border-[#E5E0D8] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Wordmark in Fraunces */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => {
                  setCurrentView('browse');
                  setMobileMenuOpen(false);
                }}
                className="text-left cursor-pointer group"
              >
                <span className="font-serif text-2xl font-semibold text-[#1F2933] tracking-tight group-hover:text-[#0F766E] transition-colors">
                  ShareSpot
                </span>
              </button>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center space-x-6 text-sm">
                <button
                  onClick={() => setCurrentView('browse')}
                  className={`py-5 border-b-2 font-medium transition-colors cursor-pointer ${
                    currentView === 'browse'
                      ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                      : 'border-transparent text-[#52606D] hover:text-[#1F2933]'
                  }`}
                >
                  Browse items
                </button>

                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`py-5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'dashboard'
                      ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                      : 'border-transparent text-[#52606D] hover:text-[#1F2933]'
                  }`}
                >
                  <span>My bookings & items</span>
                  {pendingForOwner > 0 && (
                    <span className="bg-[#B7791F] text-white text-[11px] font-semibold px-1.5 py-0.2 rounded">
                      {pendingForOwner}
                    </span>
                  )}
                </button>

                {/* Admin screen only for admin */}
                {isAdmin && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`py-5 border-b-2 font-medium transition-colors cursor-pointer ${
                      currentView === 'admin'
                        ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                        : 'border-transparent text-[#52606D] hover:text-[#1F2933]'
                    }`}
                  >
                    Admin desk
                  </button>
                )}

                <button
                  onClick={onOpenAbout}
                  className="py-5 border-b-2 border-transparent text-[#52606D] hover:text-[#1F2933] font-medium transition-colors cursor-pointer"
                >
                  How it works
                </button>
              </nav>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              {/* List an item button */}
              <button
                onClick={() => {
                  if (!currentUser.verifiedCollegeId) {
                    showToast(
                      'Your college ID is pending verification. You can browse in read-only mode until approved.',
                      'warning'
                    );
                    return;
                  }
                  onOpenNewListing();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold px-3.5 py-1.5 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>List an item</span>
              </button>

              {/* Notifications Bell */}
              <button
                onClick={onOpenNotifications}
                className={`relative p-2 rounded border transition-colors cursor-pointer ${
                  hasOverdue
                    ? 'border-[#B42318] bg-red-50 text-[#B42318]'
                    : unreadNotifCount > 0
                    ? 'border-[#B7791F] bg-amber-50 text-[#B7791F]'
                    : 'border-[#E5E0D8] bg-white text-[#52606D] hover:text-[#1F2933] hover:bg-[#FAF7F2]'
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                      hasOverdue ? 'bg-[#B42318]' : 'bg-[#0F766E]'
                    }`}
                  >
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Profile Menu Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 border-l border-[#E5E0D8] rounded hover:bg-[#FAF7F2] transition-colors cursor-pointer text-left"
                  aria-expanded={profileDropdownOpen}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded object-cover border border-[#E5E0D8]"
                  />
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-[#1F2933] leading-tight flex items-center gap-1">
                      <span>{currentUser.name.split(' ')[0]}</span>
                      {currentUser.verifiedCollegeId ? (
                        <Check className="w-3 h-3 text-[#3F7D4E]" />
                      ) : (
                        <span className="text-[10px] text-[#B7791F]">⏳</span>
                      )}
                    </p>
                    <p className="text-[#627D98] flex items-center gap-1 mt-0.5 text-[11px]">
                      <span>{currentUser.group}</span>
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#52606D] hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md border border-[#E5E0D8] shadow-lg py-2 z-50 text-xs text-[#1F2933]">
                    {/* User Summary Header */}
                    <div className="px-4 py-2 border-b border-[#E5E0D8] bg-[#FAF7F2]">
                      <p className="font-semibold text-sm text-[#1F2933]">{currentUser.name}</p>
                      <p className="text-[11px] text-[#52606D]">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[10px] font-medium text-[#1F2933]">
                          {getGroupBadgeLabel()}
                        </span>
                        {currentUser.verifiedCollegeId ? (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-[#3F7D4E] border border-emerald-200 rounded text-[10px] font-semibold flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            Verified ID
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-[#B7791F] border border-amber-200 rounded text-[10px] font-semibold">
                            ID verification pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] flex items-center gap-2.5 text-[#1F2933] cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-[#52606D]" />
                        <span>My profile</span>
                      </button>

                      <div className="border-t border-[#E5E0D8] my-1" />

                      {/* Switch demo account button / expandable list */}
                      <button
                        onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                        className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] flex items-center justify-between text-[#1F2933] cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <RefreshCw className="w-4 h-4 text-[#0F766E]" />
                          <span className="font-medium text-[#0F766E]">Switch demo account</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#0F766E] transition-transform ${demoSwitchOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {demoSwitchOpen && (
                        <div className="bg-[#FAF7F2] border-y border-[#E5E0D8] py-1 px-2 space-y-0.5 max-h-48 overflow-y-auto">
                          {allUsers.map((user) => {
                            const isCurrent = user.id === currentUser.id;
                            return (
                              <button
                                key={user.id}
                                onClick={() => {
                                  switchUserById(user.id);
                                  setProfileDropdownOpen(false);
                                  setDemoSwitchOpen(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-xs cursor-pointer ${
                                  isCurrent
                                    ? 'bg-[#0F766E] text-white font-semibold'
                                    : 'hover:bg-white text-[#1F2933]'
                                }`}
                              >
                                <span>{getDemoRoleLabel(user.id, user.name)}</span>
                                {isCurrent && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="border-t border-[#E5E0D8] my-1" />

                      {/* Log out */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-[#B42318] flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded text-[#52606D] hover:text-[#1F2933] border border-[#E5E0D8]"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E0D8] bg-white px-4 py-3 space-y-2">
            <button
              onClick={() => {
                setCurrentView('browse');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 rounded text-sm ${
                currentView === 'browse' ? 'bg-[#FAF7F2] font-semibold text-[#0F766E]' : 'text-[#1F2933]'
              }`}
            >
              Browse items
            </button>

            <button
              onClick={() => {
                setCurrentView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 rounded text-sm ${
                currentView === 'dashboard' ? 'bg-[#FAF7F2] font-semibold text-[#0F766E]' : 'text-[#1F2933]'
              }`}
            >
              My bookings & items {pendingForOwner > 0 && `(${pendingForOwner} pending)`}
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-3 rounded text-sm ${
                  currentView === 'admin' ? 'bg-[#FAF7F2] font-semibold text-[#0F766E]' : 'text-[#1F2933]'
                }`}
              >
                Admin desk
              </button>
            )}

            <button
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded text-sm text-[#52606D]"
            >
              How it works
            </button>

            <div className="pt-2 border-t border-[#E5E0D8]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-2 px-3 rounded text-sm text-[#B42318] font-medium"
              >
                Log out ({currentUser.name})
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Profile Detail Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-md max-w-md w-full border border-[#E5E0D8] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-serif text-lg font-semibold text-[#1F2933]">My College Profile</h3>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1 rounded hover:bg-[#E5E0D8] text-[#52606D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#1F2933]">
              {/* Top info */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5E0D8]">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded object-cover border border-[#E5E0D8]"
                />
                <div>
                  <h4 className="font-serif text-base font-semibold">{currentUser.name}</h4>
                  <p className="text-[#52606D]">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-semibold text-[#1F2933]">ID:</span>
                    <span className="font-mono text-[#52606D]">{currentUser.collegeIdNumber || 'N/A'}</span>
                    {currentUser.verifiedCollegeId ? (
                      <span className="text-[#3F7D4E] font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[#B7791F] font-semibold">Verification Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-[#FAF7F2] rounded border border-[#E5E0D8]">
                  <p className="text-[10px] uppercase text-[#627D98] font-semibold">Fairness Score</p>
                  <p className="text-lg font-serif font-semibold text-[#0F766E] mt-0.5">
                    {currentUser.fairnessPriorityScore}/100
                  </p>
                </div>
                <div className="p-2.5 bg-[#FAF7F2] rounded border border-[#E5E0D8]">
                  <p className="text-[10px] uppercase text-[#627D98] font-semibold">On-Time Returns</p>
                  <p className="text-lg font-serif font-semibold text-[#3F7D4E] mt-0.5">
                    {currentUser.onTimeReturnsCount} of {currentUser.totalReturnsCount}
                  </p>
                </div>
              </div>

              {/* Badges */}
              {currentUser.badges && currentUser.badges.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1F2933] block mb-1.5">Badges</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#FAF7F2] border border-[#CBD5E1] rounded text-[11px] text-[#1F2933] flex items-center gap-1"
                      >
                        <Award className="w-3 h-3 text-[#0F766E]" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrolled Courses / Certifications */}
              {currentUser.enrolledCourses && currentUser.enrolledCourses.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1F2933] block mb-1">Enrolled Courses</span>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.enrolledCourses.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-mono text-[#52606D]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hostel Block */}
              {currentUser.hostelBlock && (
                <div>
                  <span className="font-semibold text-[#1F2933] block mb-0.5">Hostel Residence</span>
                  <p className="text-[#52606D]">{currentUser.hostelBlock}</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#E5E0D8] bg-[#FAF7F2] flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-1.5 rounded bg-[#1F2933] text-white text-xs font-semibold hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
