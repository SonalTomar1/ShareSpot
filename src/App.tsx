import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserSwitcher } from './components/UserSwitcher';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { BookingModal } from './components/BookingModal';
import { ListingModal } from './components/ListingModal';
import { CheckoutReturnModal } from './components/CheckoutReturnModal';
import { RatingModal } from './components/RatingModal';
import { IncidentModal } from './components/IncidentModal';
import { TimelineModal } from './components/TimelineModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AboutModal } from './components/AboutModal';
import { AuthPage } from './pages/AuthPage';
import { Resource, Booking } from './types';
import {
  Compass,
  Calendar,
  PlusSquare,
  User,
  RotateCcw,
  X,
  AlertCircle,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    bookings,
    toasts,
    dismissToast,
    resetAllData,
  } = useApp();

  // Modals
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookingResource, setBookingResource] = useState<Resource | null>(null);
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Flow modals
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  const [returnBooking, setReturnBooking] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [timelineBooking, setTimelineBooking] = useState<Booking | null>(null);
  const [incidentBooking, setIncidentBooking] = useState<Booking | null>(null);
  const [incidentDiffData, setIncidentDiffData] = useState<any>(null);

  // Route protection: If no user is logged in, show AuthPage
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <AuthPage />
        {/* Toast alerts */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3 rounded shadow text-xs font-medium flex items-center justify-between border ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-[#3F7D4E] border-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-red-50 text-[#B42318] border-red-200'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 text-[#B7791F] border-amber-200'
                  : 'bg-white text-[#1F2933] border-[#E5E0D8]'
              }`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-3 text-[#829AB1] hover:text-[#1F2933]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleSelectBookingFromNotif = (bookingId: string) => {
    const b = bookings.find((item) => item.id === bookingId);
    if (b) {
      setTimelineBooking(b);
    }
  };

  const isPendingVerification = !currentUser.verifiedCollegeId;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F2933] font-sans pb-16 sm:pb-0">
      {/* 1. Account Switcher Toolbar */}
      <UserSwitcher />

      {/* 2. Top Header with simple wordmark and clean navigation */}
      <Header
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenNewListing={() => setListingModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      {/* Pending verification info banner */}
      {isPendingVerification && (
        <div className="bg-amber-50 border-b border-[#B7791F]/30 px-4 py-2.5 text-xs text-[#B7791F]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>ID verification pending:</strong> You are browsing in read-only mode. Once campus administration verifies your college ID ({currentUser.collegeIdNumber || 'ID'}), you can request bookings and list equipment.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Views */}
      <main className="flex-1">
        {currentView === 'browse' && (
          <HomePage
            onSelectResource={(res) => setSelectedResource(res)}
            onRequestBooking={(res) => {
              setSelectedResource(null);
              setBookingResource(res);
            }}
            onOpenNewListing={() => setListingModalOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onOpenCheckout={(b) => setCheckoutBooking(b)}
            onOpenReturn={(b) => setReturnBooking(b)}
            onOpenRating={(b) => setRatingBooking(b)}
            onOpenTimeline={(b) => setTimelineBooking(b)}
            onOpenIncident={(b) => setIncidentBooking(b)}
            onOpenNewListing={() => setListingModalOpen(true)}
          />
        )}

        {currentView === 'admin' && <AdminPage />}

        {currentView === 'how-it-works' && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <AboutModal onClose={() => setCurrentView('browse')} />
          </div>
        )}
      </main>

      {/* 4. Mobile Bottom Navigation (4 items: Browse, My bookings, Listings, Profile/About) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E0D8] px-2 py-1.5 flex items-center justify-around text-xs">
        <button
          onClick={() => setCurrentView('browse')}
          className={`flex flex-col items-center py-1 px-3 rounded ${
            currentView === 'browse' ? 'text-[#0F766E] font-semibold' : 'text-[#52606D]'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Browse</span>
        </button>

        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded ${
            currentView === 'dashboard' ? 'text-[#0F766E] font-semibold' : 'text-[#52606D]'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>My bookings</span>
        </button>

        <button
          onClick={() => setListingModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded text-[#52606D] hover:text-[#1F2933]"
        >
          <PlusSquare className="w-5 h-5 mb-0.5" />
          <span>List item</span>
        </button>

        <button
          onClick={() => setAboutModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded text-[#52606D] hover:text-[#1F2933]"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>About</span>
        </button>
      </nav>

      {/* 5. Footer with required "Reset demo data" button */}
      <footer className="mt-auto bg-white border-t border-[#E5E0D8] text-xs text-[#52606D] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-serif text-base font-semibold text-[#1F2933]">ShareSpot</span>
              <p className="text-xs text-[#829AB1] mt-0.5">
                Campus equipment and space sharing platform.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setAboutModalOpen(true)}
                className="hover:text-[#1F2933] transition-colors"
              >
                How it works
              </button>
              <button
                onClick={() => setCurrentView('browse')}
                className="hover:text-[#1F2933] transition-colors"
              >
                Browse catalog
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="hover:text-[#1F2933] transition-colors"
              >
                My dashboard
              </button>

              {/* Reset Demo Data button */}
              <button
                onClick={resetAllData}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#E5E0D8] bg-[#FAF7F2] hover:bg-[#F0ECE4] text-[#1F2933] font-medium transition-colors"
                title="Reset demo data to default state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset demo data</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E0D8] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#829AB1] gap-1">
            <span>Decisions on condition and penalties are confirmed by human owners and campus administrators.</span>
            <span>ShareSpot Campus</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onRequestBooking={(res) => {
            setSelectedResource(null);
            setBookingResource(res);
          }}
          onSelectPairedResource={(paired) => setSelectedResource(paired)}
        />
      )}

      {bookingResource && (
        <BookingModal
          resource={bookingResource}
          onClose={() => setBookingResource(null)}
          onSuccess={() => {
            setBookingResource(null);
            setCurrentView('dashboard');
          }}
        />
      )}

      {listingModalOpen && (
        <ListingModal
          onClose={() => setListingModalOpen(false)}
          onSuccess={() => {
            setListingModalOpen(false);
            setCurrentView('browse');
          }}
        />
      )}

      {checkoutBooking && (
        <CheckoutReturnModal
          booking={checkoutBooking}
          mode="checkout"
          onClose={() => setCheckoutBooking(null)}
          onSuccess={() => setCheckoutBooking(null)}
        />
      )}

      {returnBooking && (
        <CheckoutReturnModal
          booking={returnBooking}
          mode="return"
          onClose={() => setReturnBooking(null)}
          onSuccess={() => {
            const b = returnBooking;
            setReturnBooking(null);
            setRatingBooking(b);
          }}
          onOpenDamageReport={(b, diffData) => {
            setReturnBooking(null);
            setIncidentBooking(b);
            setIncidentDiffData(diffData);
          }}
        />
      )}

      {ratingBooking && (
        <RatingModal
          booking={ratingBooking}
          onClose={() => setRatingBooking(null)}
          onSuccess={() => setRatingBooking(null)}
        />
      )}

      {incidentBooking && (
        <IncidentModal
          booking={incidentBooking}
          initialDiffData={incidentDiffData}
          onClose={() => {
            setIncidentBooking(null);
            setIncidentDiffData(null);
          }}
          onSuccess={() => {
            setIncidentBooking(null);
            setIncidentDiffData(null);
          }}
        />
      )}

      {timelineBooking && (
        <TimelineModal
          booking={timelineBooking}
          onClose={() => setTimelineBooking(null)}
        />
      )}

      {notificationsOpen && (
        <NotificationsDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          onSelectBooking={handleSelectBookingFromNotif}
        />
      )}

      {aboutModalOpen && <AboutModal onClose={() => setAboutModalOpen(false)} />}

      {/* Quiet Toast notification alert */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded border text-xs font-medium flex items-center justify-between gap-2.5 transition-all shadow-sm ${
              toast.type === 'error'
                ? 'bg-white border-[#B42318] text-[#B42318]'
                : toast.type === 'warning'
                ? 'bg-white border-[#B7791F] text-[#B7791F]'
                : 'bg-white border-[#0F766E] text-[#0F766E]'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#829AB1] hover:text-[#1F2933] shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
