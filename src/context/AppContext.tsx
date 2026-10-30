import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import {
  User,
  Resource,
  Booking,
  AuditLogEntry,
  AppNotification,
  IncidentReport,
  UserGroup,
  ConditionReport,
  TwoWayRating,
} from '../types';
import { storageService, subscribeToStorage, SEEDED_USERS, hashPassword } from '../services/storageService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  resources: Resource[];
  bookings: Booking[];
  notifications: AppNotification[];
  auditLogs: AuditLogEntry[];
  incidents: IncidentReport[];
  unreadNotifCount: number;
  activeTab: UserGroup;
  setActiveTab: (tab: UserGroup) => void;
  currentView: 'browse' | 'dashboard' | 'admin' | 'how-it-works';
  setCurrentView: (view: 'browse' | 'dashboard' | 'admin' | 'how-it-works') => void;
  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Auth actions
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsUser: (user: User) => void;
  signUpUser: (data: {
    name: string;
    email: string;
    password: string;
    group: UserGroup;
    hostelBlock?: string;
    collegeIdNumber: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyUser: (userId: string, status: 'verified' | 'rejected') => void;

  // Actions
  switchUserById: (userId: string) => void;
  resetAllData: () => void;
  addResource: (res: Resource) => void;
  updateResource: (res: Resource) => void;
  deleteResource: (id: string) => void;
  createBookingRequest: (req: {
    resourceId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    purpose: string;
    teamMembers?: string;
  }) => { success: boolean; error?: string; booking?: Booking };
  ownerDecideBooking: (
    bookingId: string,
    decision: 'Approved' | 'Rejected' | 'Waitlisted',
    reason: string
  ) => void;
  processCheckout: (bookingId: string, condition: ConditionReport) => void;
  processReturn: (
    bookingId: string,
    condition: ConditionReport,
    isSafeReturn: boolean,
    aiDiff?: any
  ) => void;
  submitRating: (
    bookingId: string,
    rating: number,
    tags: string[],
    comment: string
  ) => void;
  reportIncident: (
    bookingId: string,
    type: IncidentReport['incidentType'],
    description: string,
    photos: string[],
    aiData?: { summary?: string; suggested_action?: string; severity?: 'low' | 'medium' | 'high' }
  ) => void;
  cancelBooking: (bookingId: string, reason: string) => void;
  requestExtension: (bookingId: string, extraHours: number, reason: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resolveIncident: (incidentId: string, adminDecision: string, penaltyAmount?: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize storage once
  useEffect(() => {
    storageService.init();
  }, []);

  const [currentUser, setCurrentUserState] = useState<User | null>(() => storageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => storageService.getUsers());
  const [resources, setResources] = useState<Resource[]>(() => storageService.getResources());
  const [bookings, setBookings] = useState<Booking[]>(() => storageService.getBookings());
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storageService.getNotifications()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => storageService.getAuditLogs());
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => storageService.getIncidents());

  const [activeTab, setActiveTab] = useState<UserGroup>('Student');
  const [currentView, setCurrentView] = useState<'browse' | 'dashboard' | 'admin' | 'how-it-works'>('browse');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state on storage event
  const refreshFromStorage = () => {
    setCurrentUserState(storageService.getCurrentUser());
    setAllUsers(storageService.getUsers());
    setResources(storageService.getResources());
    setBookings(storageService.getBookings());
    setNotifications(storageService.getNotifications());
    setAuditLogs(storageService.getAuditLogs());
    setIncidents(storageService.getIncidents());
  };

  useEffect(() => {
    const unsub = subscribeToStorage(refreshFromStorage);
    return unsub;
  }, []);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Authentication implementations
  const loginWithCredentials = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const user = storageService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Email or password is incorrect.' };
    }
    const hash = await hashPassword(password);
    if (user.passwordHash && user.passwordHash !== hash) {
      return { success: false, error: 'Email or password is incorrect.' };
    }
    storageService.setCurrentUser(user);
    storageService.addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.group,
      action: 'USER_LOGIN',
      title: 'User Signed In',
      details: `${user.name} signed in with college credentials.`,
    });
    showToast(`Signed in as ${user.name}`, 'success');
    return { success: true };
  };

  const loginAsUser = (user: User) => {
    storageService.setCurrentUser(user);
    storageService.addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.group,
      action: 'USER_LOGIN',
      title: 'User Signed In (Demo)',
      details: `${user.name} switched in via demo role selector.`,
    });
    showToast(`Signed in as ${user.name}`, 'success');
  };

  const logout = () => {
    if (currentUser) {
      storageService.addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.group,
        action: 'USER_LOGOUT',
        title: 'User Signed Out',
        details: `${currentUser.name} signed out of session.`,
      });
    }
    storageService.setCurrentUser(null);
    setCurrentView('browse');
    showToast('Signed out successfully.', 'info');
  };

  const signUpUser = async (data: {
    name: string;
    email: string;
    password: string;
    group: UserGroup;
    hostelBlock?: string;
    collegeIdNumber: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const existing = storageService.getUserByEmail(data.email);
    if (existing) {
      return { success: false, error: 'An account with this college email already exists. Please sign in.' };
    }

    const passwordHash = await hashPassword(data.password);
    const newUserId = `user_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: data.name,
      group: data.group,
      roles: data.group === 'Teacher/Staff' ? ['Owner'] : ['Seeker'],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      email: data.email,
      hostelBlock: data.hostelBlock,
      collegeIdNumber: data.collegeIdNumber,
      verifiedCollegeId: false,
      verificationStatus: 'pending',
      passwordHash,
      enrolledCourses: [],
      safetyTrainingCompleted: false,
      rating: 5.0,
      reviewCount: 0,
      onTimeReturnsCount: 0,
      totalReturnsCount: 0,
      badges: ['New Member', 'ID Verification Pending'],
      fairnessPriorityScore: 75,
      activeBookingsThisWeek: 0,
      daysBookedThisWeek: 0,
      priorityNotes: ['New account pending verification'],
    };

    storageService.createUser(newUser);
    storageService.setCurrentUser(newUser);

    storageService.addAuditLog({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.group,
      action: 'USER_SIGNED_UP',
      title: 'New Account Created',
      details: `${newUser.name} registered with ID ${newUser.collegeIdNumber} (pending verification).`,
    });

    storageService.addNotification({
      userId: newUser.id,
      type: 'approval',
      title: 'Welcome to ShareSpot! ID Verification Pending',
      message: 'Your college ID has been submitted for verification. You can browse all campus listings in read-only mode while waiting for approval.',
    });

    showToast(`Account created! Welcome, ${newUser.name}. ID verification is pending.`, 'info');
    return { success: true };
  };

  const verifyUser = (userId: string, status: 'verified' | 'rejected') => {
    const updated = storageService.verifyUser(userId, status);
    if (updated) {
      storageService.addAuditLog({
        actorId: currentUser?.id || 'admin',
        actorName: currentUser?.name || 'Administrator',
        actorRole: 'Admin',
        action: 'USER_VERIFIED',
        title: status === 'verified' ? 'College ID Verified' : 'College ID Rejected',
        details: `${updated.name}'s college ID (${updated.collegeIdNumber || 'N/A'}) was marked as ${status}.`,
      });

      storageService.addNotification({
        userId: updated.id,
        type: 'approval',
        title: status === 'verified' ? 'College ID Verified!' : 'ID Verification Update',
        message:
          status === 'verified'
            ? 'Your college ID has been verified by campus administration. You can now request bookings and list equipment!'
            : 'Your college ID verification could not be approved. Please contact campus services.',
      });

      showToast(`User ${updated.name} verification set to ${status}.`, 'success');
    }
  };

  const switchUserById = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      storageService.setCurrentUser(user);
      showToast(`Switched user to ${user.name} (${user.group})`, 'info');
    }
  };

  const resetAllData = () => {
    storageService.resetAllData();
    showToast('Demo data successfully reset to pristine seed state', 'success');
  };

  const addResource = (res: Resource) => {
    if (!currentUser) {
      showToast('Please sign in to list an item.', 'warning');
      return;
    }
    if (!currentUser.verifiedCollegeId) {
      showToast('Your college ID is pending verification. You can browse in read-only mode until approved.', 'warning');
      return;
    }
    storageService.saveResource(res);
    storageService.addAuditLog({
      resourceId: res.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: 'LISTING_CREATED',
      title: 'New Resource Listed',
      details: `Listed "${res.name}" under ${res.groupTag} (${res.category})`,
      reason: 'Owner created equipment listing with AI condition verification',
    });
    showToast(`"${res.name}" published successfully!`, 'success');
  };

  const updateResource = (res: Resource) => {
    storageService.saveResource(res);
    showToast(`Updated "${res.name}"`, 'success');
  };

  const deleteResource = (id: string) => {
    storageService.deleteResource(id);
    showToast('Listing removed', 'info');
  };

  // CHECK ELIGIBILITY HELPER
  const checkEligibility = (
    user: User,
    resource: Resource
  ): { eligible: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    const rules = resource.eligibility;

    if (rules.collegeIdVerified && !user.verifiedCollegeId) {
      reasons.push('Verified College ID required');
    }

    if (rules.safetyTrainingCompleted && !user.safetyTrainingCompleted) {
      reasons.push('Makerspace Safety Training certificate required');
    }

    if (rules.enrolledCourse && !user.enrolledCourses.includes(rules.enrolledCourse)) {
      reasons.push(`Must be enrolled in ${rules.enrolledCourse}`);
    }

    if (rules.hostelBlockRequired && user.hostelBlock !== rules.hostelBlockRequired) {
      reasons.push(`Restricted to residents of ${rules.hostelBlockRequired}`);
    }

    if (rules.allowedGroups && rules.allowedGroups.length > 0 && !rules.allowedGroups.includes(user.group)) {
      reasons.push(`Restricted to ${rules.allowedGroups.join(', ')}`);
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  };

  // BOOKING REQUEST
  const createBookingRequest = (req: {
    resourceId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    purpose: string;
    teamMembers?: string;
  }): { success: boolean; error?: string; booking?: Booking } => {
    const resource = resources.find((r) => r.id === req.resourceId);
    if (!resource) return { success: false, error: 'Resource not found' };

    if (!currentUser) {
      return { success: false, error: 'Please sign in to request a booking.' };
    }

    if (!currentUser.verifiedCollegeId) {
      return {
        success: false,
        error: 'Your college ID is pending verification. You can browse in read-only mode until approved.',
      };
    }

    // 1. Eligibility Check
    const { eligible, reasons } = checkEligibility(currentUser, resource);
    if (!eligible) {
      return {
        success: false,
        error: `Ineligible: ${reasons.join(', ')}`,
      };
    }

    // 2. Fair Access: Active bookings limit (max 2 active)
    const activeUserBookings = bookings.filter(
      (b) =>
        b.borrowerId === currentUser.id &&
        ['Requested', 'Approved', 'Checked out', 'Waitlisted'].includes(b.status)
    );
    if (activeUserBookings.length >= 2) {
      return {
        success: false,
        error:
          'Fair Access Limit reached: You currently have 2 active bookings/requests. Complete or cancel an existing booking before requesting a new one.',
      };
    }

    // 3. Double-Booking Conflict Check
    const hasConflict = bookings.some((b) => {
      if (b.resourceId !== resource.id) return false;
      if (!['Approved', 'Checked out'].includes(b.status)) return false;

      // Date check
      const bStart = `${b.startDate}T${b.startTime}`;
      const bEnd = `${b.endDate}T${b.endTime}`;
      const reqStart = `${req.startDate}T${req.startTime}`;
      const reqEnd = `${req.endDate}T${req.endTime}`;

      return reqStart < bEnd && reqEnd > bStart;
    });

    // If conflict exists on high-demand resource, allow waitlisting instead of hard failure
    const isWaitlistCandidate = hasConflict;

    const newBooking: Booking = {
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      resourceId: resource.id,
      resourceName: resource.name,
      resourcePhoto: resource.photos[0] || '',
      resourceLocation: resource.location,
      resourcePrivacy: resource.privacyLevel,
      borrowerId: currentUser.id,
      borrowerName: currentUser.name,
      borrowerGroup: currentUser.group,
      borrowerAvatar: currentUser.avatar,
      borrowerRating: currentUser.rating,
      borrowerOnTimeRecord: `${currentUser.onTimeReturnsCount} of ${currentUser.totalReturnsCount}`,
      ownerId: resource.ownerId,
      ownerName: resource.ownerName,
      startDate: req.startDate,
      startTime: req.startTime,
      endDate: req.endDate,
      endTime: req.endTime,
      purpose: req.purpose.trim(),
      teamMembers: req.teamMembers?.trim(),
      status: isWaitlistCandidate ? 'Waitlisted' : 'Requested',
      waitlistPosition: isWaitlistCandidate ? 1 : undefined,
      decisionReason: isWaitlistCandidate
        ? 'Time slot is currently occupied. Placed in Waitlist Queue #1.'
        : undefined,
      twoWayRating: {
        borrowerRated: false,
        lenderRated: false,
        revealed: false,
      },
      hasIncidentReport: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveBooking(newBooking);

    // Audit log
    storageService.addAuditLog({
      bookingId: newBooking.id,
      resourceId: resource.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: isWaitlistCandidate ? 'BOOKING_WAITLISTED' : 'BOOKING_REQUESTED',
      title: isWaitlistCandidate ? 'Waitlist Joined' : 'Booking Requested',
      details: `${currentUser.name} requested "${resource.name}" for ${req.startDate} (${req.startTime} - ${req.endTime})`,
      reason: req.purpose,
    });

    // Notify Owner
    storageService.addNotification({
      userId: resource.ownerId,
      type: isWaitlistCandidate ? 'waitlist' : 'approval',
      title: isWaitlistCandidate ? 'New Waitlist Entry' : 'New Booking Request',
      message: `${currentUser.name} requested "${resource.name}" for ${req.startDate} (${req.startTime} - ${req.endTime}). Purpose: "${req.purpose}"`,
      bookingId: newBooking.id,
    });

    showToast(
      isWaitlistCandidate
        ? 'Slot occupied! You have been placed in waitlist queue position #1.'
        : 'Booking request submitted to owner!',
      'success'
    );

    return { success: true, booking: newBooking };
  };

  // OWNER APPROVE / REJECT / WAITLIST
  const ownerDecideBooking = (
    bookingId: string,
    decision: 'Approved' | 'Rejected' | 'Waitlisted',
    reason: string
  ) => {
    if (!currentUser) return;
    const booking = storageService.getBookingById(bookingId);
    if (!booking) return;

    if (!reason.trim()) {
      showToast('A written reason is required for any decision', 'warning');
      return;
    }

    const updated: Booking = {
      ...booking,
      status: decision,
      decisionReason: reason.trim(),
      decisionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      waitlistPosition: decision === 'Waitlisted' ? 1 : undefined,
    };

    storageService.saveBooking(updated);

    const actionMap = {
      Approved: 'BOOKING_APPROVED',
      Rejected: 'BOOKING_REJECTED',
      Waitlisted: 'BOOKING_WAITLISTED',
    } as const;

    storageService.addAuditLog({
      bookingId: booking.id,
      resourceId: booking.resourceId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: actionMap[decision],
      title: `Booking ${decision}`,
      details: `${currentUser.name} marked booking as ${decision}`,
      reason: reason.trim(),
    });

    // Notify borrower
    const notifTypeMap = {
      Approved: 'approval',
      Rejected: 'rejection',
      Waitlisted: 'waitlist',
    } as const;

    storageService.addNotification({
      userId: booking.borrowerId,
      type: notifTypeMap[decision],
      title: `Booking ${decision}: ${booking.resourceName}`,
      message: `Your request was ${decision.toLowerCase()} by ${currentUser.name}. Reason: "${reason.trim()}"`,
      bookingId: booking.id,
    });

    showToast(`Request marked as ${decision}`, 'success');
  };

  // CHECKOUT
  const processCheckout = (bookingId: string, condition: ConditionReport) => {
    if (!currentUser) return;
    const booking = storageService.getBookingById(bookingId);
    if (!booking) return;

    const updated: Booking = {
      ...booking,
      status: 'Checked out',
      checkoutCondition: condition,
      updatedAt: new Date().toISOString(),
    };

    storageService.saveBooking(updated);

    storageService.addAuditLog({
      bookingId: booking.id,
      resourceId: booking.resourceId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: 'CHECKED_OUT',
      title: 'Item Checked Out',
      details: `Condition verified by both parties. Notes: "${condition.notes || 'Good'}"`,
      reason: 'Physical handover checklist completed with condition photos',
    });

    // Notify both parties
    const otherUserId = currentUser.id === booking.borrowerId ? booking.ownerId : booking.borrowerId;
    storageService.addNotification({
      userId: otherUserId,
      type: 'pickup_reminder',
      title: `Checked out: ${booking.resourceName}`,
      message: `Check-out record confirmed at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Due on ${booking.endDate} at ${booking.endTime}.`,
      bookingId: booking.id,
    });

    showToast('Check-out successfully completed! Have a great session.', 'success');
  };

  // RETURN
  const processReturn = (
    bookingId: string,
    condition: ConditionReport,
    isSafeReturn: boolean,
    aiDiff?: any
  ) => {
    if (!currentUser) return;
    const booking = storageService.getBookingById(bookingId);
    if (!booking) return;

    const updated: Booking = {
      ...booking,
      status: isSafeReturn ? 'Completed' : 'Returned',
      returnCondition: condition,
      aiReturnDiff: aiDiff,
      updatedAt: new Date().toISOString(),
    };

    storageService.saveBooking(updated);

    storageService.addAuditLog({
      bookingId: booking.id,
      resourceId: booking.resourceId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: isSafeReturn ? 'SAFE_RETURN_CONFIRMED' : 'RETURNED',
      title: isSafeReturn ? 'Safe Return Confirmed' : 'Item Returned (Under Review)',
      details: isSafeReturn
        ? 'Owner verified condition. Booking marked completed; ratings unlocked.'
        : 'Item returned with condition flags; damage/dispute review open.',
      reason: condition.notes || (isSafeReturn ? 'Safe return verified' : 'Potential wear detected'),
    });

    // Notify borrower
    storageService.addNotification({
      userId: booking.borrowerId,
      type: 'return_confirmed',
      title: isSafeReturn ? 'Item Returned Safely!' : 'Return Received',
      message: isSafeReturn
        ? `Thanks for returning "${booking.resourceName}" safely! Please rate your lending experience.`
        : `Your return of "${booking.resourceName}" was registered and is under owner verification.`,
      bookingId: booking.id,
    });

    showToast(
      isSafeReturn
        ? 'Return confirmed! You can now rate each other.'
        : 'Return registered with flags for review.',
      'success'
    );
  };

  // TWO-WAY RATINGS (Rapido-style: hidden until both have submitted!)
  const submitRating = (
    bookingId: string,
    rating: number,
    tags: string[],
    comment: string
  ) => {
    const booking = storageService.getBookingById(bookingId);
    if (!booking) return;

    const isBorrower = currentUser.id === booking.borrowerId;
    const isOwner = currentUser.id === booking.ownerId;

    if (!isBorrower && !isOwner) {
      showToast('Only borrower or owner can rate this booking', 'error');
      return;
    }

    const twoWay: TwoWayRating = { ...booking.twoWayRating };

    if (isBorrower) {
      twoWay.borrowerRated = true;
      twoWay.borrowerRating = rating;
      twoWay.borrowerTags = tags;
      twoWay.borrowerComment = comment.trim();
      twoWay.borrowerRatedAt = new Date().toISOString();
    } else {
      twoWay.lenderRated = true;
      twoWay.lenderRating = rating;
      twoWay.lenderTags = tags;
      twoWay.lenderComment = comment.trim();
      twoWay.lenderRatedAt = new Date().toISOString();
    }

    // Check if both have now submitted
    const bothSubmitted = twoWay.borrowerRated && twoWay.lenderRated;
    twoWay.revealed = bothSubmitted;

    const updatedBooking: Booking = {
      ...booking,
      twoWayRating: twoWay,
      status: 'Completed',
      updatedAt: new Date().toISOString(),
    };

    storageService.saveBooking(updatedBooking);

    // Audit log
    storageService.addAuditLog({
      bookingId: booking.id,
      resourceId: booking.resourceId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: 'RATING_SUBMITTED',
      title: 'Rating Submitted',
      details: `${currentUser.name} rated ${rating}★ (${tags.join(', ')})`,
      reason: bothSubmitted ? 'Both ratings submitted; now unlocked on profiles' : 'Rating stored confidentially until counterparty rates',
    });

    if (bothSubmitted) {
      storageService.addAuditLog({
        bookingId: booking.id,
        resourceId: booking.resourceId,
        actorId: 'system',
        actorName: 'ShareSpot Platform',
        actorRole: 'System',
        action: 'RATINGS_REVEALED',
        title: 'Two-Way Ratings Revealed! ⭐️',
        details: 'Both borrower and lender ratings are now publicly visible.',
      });

      // Update user aggregate ratings
      const borrowerUser = allUsers.find((u) => u.id === booking.borrowerId);
      if (borrowerUser && twoWay.lenderRating) {
        const newTotal = borrowerUser.reviewCount + 1;
        const newAvg = Number(
          ((borrowerUser.rating * borrowerUser.reviewCount + twoWay.lenderRating) / newTotal).toFixed(1)
        );
        storageService.updateUser({
          ...borrowerUser,
          rating: newAvg,
          reviewCount: newTotal,
        });

        storageService.addNotification({
          userId: borrowerUser.id,
          type: 'rating_revealed',
          title: `New Review Unlocked! ⭐️ ${twoWay.lenderRating}.0`,
          message: `${booking.ownerName} rated you ${twoWay.lenderRating} stars with tags: ${twoWay.lenderTags?.join(', ')}`,
          bookingId: booking.id,
        });
      }

      const ownerUser = allUsers.find((u) => u.id === booking.ownerId);
      if (ownerUser && twoWay.borrowerRating) {
        const newTotal = ownerUser.reviewCount + 1;
        const newAvg = Number(
          ((ownerUser.rating * ownerUser.reviewCount + twoWay.borrowerRating) / newTotal).toFixed(1)
        );
        storageService.updateUser({
          ...ownerUser,
          rating: newAvg,
          reviewCount: newTotal,
        });

        storageService.addNotification({
          userId: ownerUser.id,
          type: 'rating_revealed',
          title: `New Review Unlocked! ⭐️ ${twoWay.borrowerRating}.0`,
          message: `${booking.borrowerName} rated your item ${twoWay.borrowerRating} stars with tags: ${twoWay.borrowerTags?.join(', ')}`,
          bookingId: booking.id,
        });
      }

      showToast('Both parties have rated! Ratings are now revealed on your profiles 🎉', 'success');
    } else {
      showToast('Rating submitted! It will remain private until the other party rates you.', 'info');
    }
  };

  // REPORT PROBLEM / INCIDENT
  const reportIncident = (
    bookingId: string,
    type: IncidentReport['incidentType'],
    description: string,
    photos: string[],
    aiData?: { summary?: string; suggested_action?: string; severity?: 'low' | 'medium' | 'high' }
  ) => {
    const booking = storageService.getBookingById(bookingId);
    if (!booking) return;

    const newIncident: IncidentReport = {
      id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingId,
      resourceId: booking.resourceId,
      resourceName: booking.resourceName,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterRole: currentUser.group,
      incidentType: type,
      description: description.trim(),
      photos,
      aiSummary: aiData?.summary,
      aiSuggestedAction: aiData?.suggested_action,
      aiSeverity: aiData?.severity || 'medium',
      resolutionStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    storageService.saveIncident(newIncident);

    // Update booking flag
    storageService.saveBooking({
      ...booking,
      hasIncidentReport: true,
      updatedAt: new Date().toISOString(),
    });

    storageService.addAuditLog({
      bookingId,
      resourceId: booking.resourceId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: 'INCIDENT_REPORTED',
      title: `Incident Filed: ${type}`,
      details: description.trim(),
      reason: aiData?.summary || 'Report filed for campus review desk',
    });

    // Notify admins and owner/borrower
    storageService.addNotification({
      userId: 'user_admin',
      type: 'incident',
      title: `Incident Filed: ${type} on "${booking.resourceName}"`,
      message: `${currentUser.name} reported: "${description.slice(0, 100)}"`,
      bookingId,
    });

    showToast('Incident reported. Campus dispute desk will review and contact you.', 'warning');
  };

  // CANCEL BOOKING & AUTO-PROMOTE WAITLIST
  const cancelBooking = (bookingId: string, reason: string) => {
    const booking = storageService.getBookingById(bookingId);
    if (!booking) return;

    const updated: Booking = {
      ...booking,
      status: 'Cancelled',
      decisionReason: reason.trim() || 'Cancelled by user',
      updatedAt: new Date().toISOString(),
    };

    storageService.saveBooking(updated);

    storageService.addAuditLog({
      bookingId,
      resourceId: booking.resourceId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      details: `${currentUser.name} cancelled booking for "${booking.resourceName}"`,
      reason: reason || 'User cancellation',
    });

    // CHECK WAITLIST: AUTO-OFFER TO NEXT IN QUEUE!
    const waitlisted = storageService
      .getBookings()
      .filter((b) => b.resourceId === booking.resourceId && b.status === 'Waitlisted')
      .sort((a, b) => (a.waitlistPosition || 99) - (b.waitlistPosition || 99));

    if (waitlisted.length > 0) {
      const nextInLine = waitlisted[0];
      const promoted: Booking = {
        ...nextInLine,
        status: 'Approved',
        waitlistPosition: undefined,
        decisionReason: 'Auto-promoted from Waitlist queue #1 due to cancellation by previous borrower.',
        decisionDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storageService.saveBooking(promoted);

      storageService.addAuditLog({
        bookingId: promoted.id,
        resourceId: promoted.resourceId,
        actorId: 'system',
        actorName: 'ShareSpot Fair Access System',
        actorRole: 'System',
        action: 'WAITLIST_AUTO_PROMOTED',
        title: 'Waitlist Auto-Promoted!',
        details: `${promoted.borrowerName} was auto-promoted to Approved status.`,
        reason: 'Slot opened up due to cancellation',
      });

      storageService.addNotification({
        userId: promoted.borrowerId,
        type: 'approval',
        title: `Good news! Your waitlist booking was Approved: ${promoted.resourceName}`,
        message: `A previous booking was cancelled. You have been auto-promoted to Approved! Please pick up at the scheduled time.`,
        bookingId: promoted.id,
      });
    }

    showToast('Booking cancelled.', 'info');
  };

  // REQUEST EXTENSION
  const requestExtension = (bookingId: string, extraHours: number, reason: string) => {
    const booking = storageService.getBookingById(bookingId);
    if (!booking) return;

    // Extend end time
    storageService.addAuditLog({
      bookingId,
      resourceId: booking.resourceId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.group,
      action: 'EXTENSION_REQUESTED',
      title: `Extension Requested (+${extraHours}h)`,
      details: `${currentUser.name} requested +${extraHours} hours`,
      reason: reason.trim(),
    });

    storageService.addNotification({
      userId: booking.ownerId,
      type: 'approval',
      title: `Extension Request: ${booking.resourceName}`,
      message: `${currentUser.name} requested +${extraHours}h extension. Reason: "${reason.trim()}"`,
      bookingId,
    });

    showToast(`Extension request of +${extraHours}h sent to owner.`, 'info');
  };

  const markNotificationRead = (id: string) => {
    storageService.markNotificationRead(id);
  };

  const markAllNotificationsRead = () => {
    if (currentUser) {
      storageService.markAllNotificationsRead(currentUser.id);
    }
  };

  const resolveIncident = (incidentId: string, adminDecision: string, penaltyAmount?: number) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    const updated: IncidentReport = {
      ...inc,
      resolutionStatus: 'resolved',
      adminDecision,
      penaltyAmount,
      resolvedAt: new Date().toISOString(),
    };
    storageService.saveIncident(updated);
    showToast('Incident marked resolved by campus administration', 'success');
  };

  const unreadNotifCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length;
  }, [notifications, currentUser?.id]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        resources,
        bookings,
        notifications,
        auditLogs,
        incidents,
        unreadNotifCount,
        activeTab,
        setActiveTab,
        currentView,
        setCurrentView,
        selectedResourceId,
        setSelectedResourceId,
        toasts,
        showToast,
        dismissToast,
        loginWithCredentials,
        loginAsUser,
        signUpUser,
        logout,
        verifyUser,
        switchUserById,
        resetAllData,
        addResource,
        updateResource,
        deleteResource,
        createBookingRequest,
        ownerDecideBooking,
        processCheckout,
        processReturn,
        submitRating,
        reportIncident,
        cancelBooking,
        requestExtension,
        markNotificationRead,
        markAllNotificationsRead,
        resolveIncident,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
