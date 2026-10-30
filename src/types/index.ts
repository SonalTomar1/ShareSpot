export type UserGroup = 'Student' | 'Teacher/Staff' | 'Hosteler';

export type UserRole = 'Seeker' | 'Owner' | 'Manager' | 'Admin';

export interface User {
  id: string;
  name: string;
  group: UserGroup;
  roles: UserRole[];
  avatar: string;
  email: string;
  hostelBlock?: string; // e.g. "Block A"
  verifiedCollegeId: boolean;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  collegeIdNumber?: string;
  passwordHash?: string;
  enrolledCourses: string[]; // e.g. ["CS-301", "ME-102"]
  safetyTrainingCompleted: boolean;
  facultyRole?: string;
  rating: number; // e.g. 4.9
  reviewCount: number;
  onTimeReturnsCount: number;
  totalReturnsCount: number;
  badges: string[];
  fairnessPriorityScore: number; // 0 - 100
  activeBookingsThisWeek: number;
  daysBookedThisWeek: number;
  priorityNotes: string[];
}

export type ItemCategory =
  | 'Lab & Tech'
  | 'Audio/Visual'
  | 'Sports'
  | 'Study & Spaces'
  | 'Hostel Essentials'
  | 'Apparel';

export interface EligibilityRules {
  collegeIdVerified: boolean;
  safetyTrainingCompleted: boolean;
  enrolledCourse?: string; // e.g. "CS-301"
  hostelBlockRequired?: string; // e.g. "Block A"
  facultySupervisorApprovalRequired: boolean;
  allowedGroups?: UserGroup[];
}

export interface AIConditionCheck {
  score: number; // 0-100
  issues: string[];
  confidence: 'low' | 'medium' | 'high';
  photoQualityOk: boolean;
  lastCheckedAt: string;
  verdict: string;
  item_detected?: string;
}

export interface Resource {
  id: string;
  name: string;
  groupTag: UserGroup;
  category: ItemCategory;
  description: string;
  photos: string[];
  location: string;
  hostelBlock?: string;
  ownerId: string;
  ownerName: string;
  ownerGroup: UserGroup;
  ownerAvatar: string;
  ownerRating: number;
  ownerReviewsCount: number;
  availabilitySchedule: {
    days: string[];
    startTime: string; // "09:00"
    endTime: string;   // "19:00"
  };
  eligibility: EligibilityRules;
  depositAmount: number; // 0 is Free
  maxDurationHours: number;
  usageRules: string[];
  privacyLevel: 'public' | 'restricted';
  status: 'active' | 'paused';
  aiCondition: AIConditionCheck;
  pairedItemIds?: string[]; // "Students also borrowed"
  createdAt: string;
}

export type BookingStatus =
  | 'Requested'
  | 'Approved'
  | 'Rejected'
  | 'Waitlisted'
  | 'Checked out'
  | 'Returned'
  | 'Completed'
  | 'Cancelled';

export interface ConditionReport {
  workingOrder: boolean;
  noScratches: boolean;
  allPartsPresent: boolean;
  clean: boolean;
  notes: string;
  photos: string[];
  confirmedByBorrower: boolean;
  confirmedByLender: boolean;
  timestamp: string;
}

export interface TwoWayRating {
  borrowerRated: boolean;
  borrowerRating?: number; // 1-5
  borrowerTags?: string[];
  borrowerComment?: string;
  borrowerRatedAt?: string;

  lenderRated: boolean;
  lenderRating?: number; // 1-5
  lenderTags?: string[];
  lenderComment?: string;
  lenderRatedAt?: string;

  revealed: boolean; // True ONLY when both have submitted!
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  resourcePhoto: string;
  resourceLocation: string;
  resourcePrivacy: 'public' | 'restricted';
  borrowerId: string;
  borrowerName: string;
  borrowerGroup: UserGroup;
  borrowerAvatar: string;
  borrowerRating: number;
  borrowerOnTimeRecord: string;
  ownerId: string;
  ownerName: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:MM
  purpose: string;
  teamMembers?: string;
  status: BookingStatus;
  decisionReason?: string; // Required for approval, rejection, waitlist
  decisionDate?: string;
  waitlistPosition?: number;
  checkoutCondition?: ConditionReport;
  returnCondition?: ConditionReport;
  aiReturnDiff?: {
    new_damage_detected: boolean;
    detected_changes: string[];
    wear_score: number;
    summary: string;
    recommendation: string;
  };
  twoWayRating: TwoWayRating;
  hasIncidentReport: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  bookingId?: string;
  resourceId?: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action:
    | 'LISTING_CREATED'
    | 'BOOKING_REQUESTED'
    | 'BOOKING_APPROVED'
    | 'BOOKING_WAITLISTED'
    | 'BOOKING_REJECTED'
    | 'CHECKED_OUT'
    | 'RETURNED'
    | 'SAFE_RETURN_CONFIRMED'
    | 'RATING_SUBMITTED'
    | 'RATINGS_REVEALED'
    | 'INCIDENT_REPORTED'
    | 'BOOKING_CANCELLED'
    | 'EXTENSION_REQUESTED'
    | 'EXTENSION_APPROVED'
    | 'WAITLIST_AUTO_PROMOTED'
    | 'USER_SIGNED_UP'
    | 'USER_VERIFIED'
    | 'USER_LOGIN'
    | 'USER_LOGOUT';
  title: string;
  details: string;
  reason?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type:
    | 'approval'
    | 'rejection'
    | 'waitlist'
    | 'pickup_reminder'
    | 'due_soon'
    | 'overdue'
    | 'return_confirmed'
    | 'rating_pending'
    | 'rating_revealed'
    | 'incident';
  title: string;
  message: string;
  bookingId?: string;
  isRead: boolean;
  isOverdue?: boolean;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  bookingId: string;
  resourceId: string;
  resourceName: string;
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  incidentType: 'damage' | 'late_return' | 'dispute' | 'safety' | 'missing_parts';
  description: string;
  photos: string[];
  aiSummary?: string;
  aiSuggestedAction?: string;
  aiSeverity?: 'low' | 'medium' | 'high';
  resolutionStatus: 'pending' | 'in_review' | 'resolved';
  adminDecision?: string;
  penaltyAmount?: number;
  resolvedAt?: string;
  createdAt: string;
}
