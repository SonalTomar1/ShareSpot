import {
  User,
  Resource,
  Booking,
  AuditLogEntry,
  AppNotification,
  IncidentReport,
} from '../types';

const USERS_KEY = 'sharespot_users_v1';
const CURRENT_USER_KEY = 'sharespot_current_user_v1';
const RESOURCES_KEY = 'sharespot_resources_v1';
const BOOKINGS_KEY = 'sharespot_bookings_v1';
const AUDIT_LOGS_KEY = 'sharespot_audit_logs_v1';
const NOTIFICATIONS_KEY = 'sharespot_notifications_v1';
const INCIDENTS_KEY = 'sharespot_incidents_v1';

export async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

// SHA-256 hash for default password 'password123'
const DEFAULT_DEMO_PASSWORD_HASH = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

export const SEEDED_USERS: User[] = [
  {
    id: 'user_aarav',
    name: 'Aarav Patel',
    group: 'Student',
    roles: ['Seeker', 'Owner'],
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    email: 'aarav.p@campus.edu',
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    collegeIdNumber: 'STU-2023-8841',
    verifiedCollegeId: true,
    verificationStatus: 'verified',
    enrolledCourses: ['CS-301', 'CS-204', 'MATH-201'],
    safetyTrainingCompleted: true,
    rating: 4.9,
    reviewCount: 14,
    onTimeReturnsCount: 13,
    totalReturnsCount: 14,
    badges: ['Reliable Borrower', 'Top Lender', 'Safety Certified'],
    fairnessPriorityScore: 92,
    activeBookingsThisWeek: 1,
    daysBookedThisWeek: 2,
    priorityNotes: ['High rating (+10)', 'CS Capstone enrolled (+15)', 'No recent penalties (+5)'],
  },
  {
    id: 'user_meera',
    name: 'Meera Sen',
    group: 'Hosteler',
    roles: ['Seeker'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'meera.s@campus.edu',
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    collegeIdNumber: 'HST-2024-4192',
    hostelBlock: 'Block A',
    verifiedCollegeId: true,
    verificationStatus: 'verified',
    enrolledCourses: ['EE-201', 'PHYS-102'],
    safetyTrainingCompleted: false,
    rating: 4.8,
    reviewCount: 8,
    onTimeReturnsCount: 8,
    totalReturnsCount: 8,
    badges: ['Reliable Borrower', 'Block A Resident'],
    fairnessPriorityScore: 88,
    activeBookingsThisWeek: 0,
    daysBookedThisWeek: 1,
    priorityNotes: ['100% on-time record (+12)', 'Block A resident active (+8)'],
  },
  {
    id: 'user_sharma',
    name: 'Dr. Sharma',
    group: 'Teacher/Staff',
    roles: ['Owner'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'k.sharma@campus.edu',
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    collegeIdNumber: 'FAC-2015-1082',
    facultyRole: 'Associate Professor, Computer Engineering',
    verifiedCollegeId: true,
    verificationStatus: 'verified',
    enrolledCourses: [],
    safetyTrainingCompleted: true,
    rating: 5.0,
    reviewCount: 32,
    onTimeReturnsCount: 32,
    totalReturnsCount: 32,
    badges: ['Lab In-Charge', 'Faculty Sponsor', 'Distinguished Mentor'],
    fairnessPriorityScore: 98,
    activeBookingsThisWeek: 0,
    daysBookedThisWeek: 0,
    priorityNotes: ['Faculty exemption', 'Supervisor role'],
  },
  {
    id: 'user_kapoor',
    name: 'Ms. Kapoor',
    group: 'Teacher/Staff',
    roles: ['Owner'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 's.kapoor@campus.edu',
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    collegeIdNumber: 'STF-2019-3320',
    facultyRole: 'Campus Wellbeing & Student Counselor',
    verifiedCollegeId: true,
    verificationStatus: 'verified',
    enrolledCourses: [],
    safetyTrainingCompleted: true,
    rating: 5.0,
    reviewCount: 19,
    onTimeReturnsCount: 19,
    totalReturnsCount: 19,
    badges: ['Staff Counselor', 'Confidential Steward'],
    fairnessPriorityScore: 95,
    activeBookingsThisWeek: 0,
    daysBookedThisWeek: 0,
    priorityNotes: ['Confidential service steward'],
  },
  {
    id: 'user_warden',
    name: 'Warden Singh',
    group: 'Hosteler',
    roles: ['Manager', 'Owner'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'warden.blocka@campus.edu',
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    collegeIdNumber: 'WRD-2018-0914',
    hostelBlock: 'Block A',
    verifiedCollegeId: true,
    verificationStatus: 'verified',
    enrolledCourses: [],
    safetyTrainingCompleted: true,
    rating: 4.7,
    reviewCount: 45,
    onTimeReturnsCount: 44,
    totalReturnsCount: 45,
    badges: ['Hostel Warden', 'Block A Manager'],
    fairnessPriorityScore: 90,
    activeBookingsThisWeek: 0,
    daysBookedThisWeek: 0,
    priorityNotes: ['Block A Facilities authority'],
  },
  {
    id: 'user_admin',
    name: 'Campus Administrator',
    group: 'Teacher/Staff',
    roles: ['Admin', 'Manager', 'Seeker', 'Owner'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'admin.sharespot@campus.edu',
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    collegeIdNumber: 'ADM-2012-0001',
    facultyRole: 'Director of Campus Services',
    verifiedCollegeId: true,
    verificationStatus: 'verified',
    enrolledCourses: [],
    safetyTrainingCompleted: true,
    rating: 5.0,
    reviewCount: 50,
    onTimeReturnsCount: 50,
    totalReturnsCount: 50,
    badges: ['Super Admin', 'Platform Moderator'],
    fairnessPriorityScore: 100,
    activeBookingsThisWeek: 0,
    daysBookedThisWeek: 0,
    priorityNotes: ['System supervisor'],
  },
];

export const SEEDED_RESOURCES: Resource[] = [
  {
    id: 'res_camera',
    name: 'Sony Alpha A6400 Mirrorless Camera + 16-50mm Lens',
    groupTag: 'Student',
    category: 'Audio/Visual',
    description: '4K video capable camera with fast autofocus. Perfect for college project documentaries, club event shoots, or photography portfolios. Includes battery, charger, and 64GB SD card.',
    photos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block B, Room 314 (or Central Canteen handover)',
    ownerId: 'user_aarav',
    ownerName: 'Aarav Patel',
    ownerGroup: 'Student',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.9,
    ownerReviewsCount: 14,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '08:00',
      endTime: '21:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 500,
    maxDurationHours: 48,
    usageRules: [
      'Must use provided neck strap at all times',
      'Do not take out in heavy rain without raincover',
      'Return with SD card wiped or files backed up',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 94,
      issues: ['Minimal hairline scuff on tripod mounting plate', 'Lens glass crystal clear'],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-25T14:30:00Z',
      verdict: 'Excellent condition, optics clean, fully functional',
      item_detected: 'Sony Alpha Mirrorless Camera',
    },
    pairedItemIds: ['res_tripod'],
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'res_tripod',
    name: 'Heavy Duty 65-Inch Aluminum Tripod with Fluid Head',
    groupTag: 'Student',
    category: 'Audio/Visual',
    description: 'Smooth pan/tilt fluid head with quick-release plate. Sturdy up to 5kg load, ideal for video interviews and long-exposure campus night shoots.',
    photos: [
      'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block B, Room 314',
    ownerId: 'user_aarav',
    ownerName: 'Aarav Patel',
    ownerGroup: 'Student',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.9,
    ownerReviewsCount: 14,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '08:00',
      endTime: '22:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 48,
    usageRules: ['Lock leg latches securely before mounting camera', 'Carry in the zip bag provided'],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 96,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-25T14:35:00Z',
      verdict: 'Pristine condition, smooth fluid movement',
      item_detected: 'Aluminum Tripod',
    },
    pairedItemIds: ['res_camera'],
    createdAt: '2026-10-16T11:00:00Z',
  },
  {
    id: 'res_blazer',
    name: 'Navy Slim-Fit Placement Interview Blazer (Size 38 / M)',
    groupTag: 'Student',
    category: 'Apparel',
    description: 'Tailored Raymond dark navy blazer. Worn only twice for placement rounds. Available to any batchmate who needs formal attire for internship interviews or presentations.',
    photos: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block B, 3rd Floor',
    ownerId: 'user_aarav',
    ownerName: 'Aarav Patel',
    ownerGroup: 'Student',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.9,
    ownerReviewsCount: 14,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '07:00',
      endTime: '22:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 24,
    usageRules: ['Return on hanger inside protective garment bag', 'No food spills or smoking in garment'],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 98,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-20T09:00:00Z',
      verdict: 'Freshly dry-cleaned, zero stains, crisp lapels',
      item_detected: 'Navy Formal Blazer',
    },
    createdAt: '2026-10-18T12:00:00Z',
  },
  {
    id: 'res_iron',
    name: 'Philips Steam Iron & Folding Ironing Board',
    groupTag: 'Hosteler',
    category: 'Hostel Essentials',
    description: 'Heavy steam output iron with ceramic soleplate and padded board. Kept in the Block A common utility room. Auto-approved for all Block A hostel residents.',
    photos: [
      'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block A, Ground Floor Utility Rm',
    hostelBlock: 'Block A',
    ownerId: 'user_warden',
    ownerName: 'Warden Singh',
    ownerGroup: 'Hosteler',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.7,
    ownerReviewsCount: 45,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '06:00',
      endTime: '23:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      hostelBlockRequired: 'Block A',
      facultySupervisorApprovalRequired: false,
      allowedGroups: ['Hosteler'],
    },
    depositAmount: 0,
    maxDurationHours: 2,
    usageRules: [
      'Empty water reservoir after use',
      'Do not leave hot iron unattended on fabrics',
      'Return board folded against wall hook',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 91,
      issues: ['Minor water stain on ironing board cover'],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-26T16:00:00Z',
      verdict: 'Soleplate smooth and clean, heats up promptly',
      item_detected: 'Steam Iron and Board',
    },
    createdAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'res_toolkit',
    name: '120-Piece Complete Mechanical Toolkit & Cordless Drill',
    groupTag: 'Hosteler',
    category: 'Hostel Essentials',
    description: 'Bosch 12V cordless drill + screwdriver bits, hex keys, pliers, claw hammer, spirit level, and measuring tape. Great for room fixes, bike tune-ups, or science fair rigs.',
    photos: [
      'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block A Warden Office',
    hostelBlock: 'Block A',
    ownerId: 'user_warden',
    ownerName: 'Warden Singh',
    ownerGroup: 'Hosteler',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.7,
    ownerReviewsCount: 45,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '09:00',
      endTime: '18:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      hostelBlockRequired: 'Block A',
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 300,
    maxDurationHours: 6,
    usageRules: [
      'Check all drill bits are slotted back in numbered slots',
      'Wear safety glasses when drilling',
      'Return battery to charger base',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 89,
      issues: ['One 3mm drill bit missing from kit', 'Case latch has cosmetic scuff'],
      confidence: 'medium',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-24T10:15:00Z',
      verdict: 'Battery holds full charge, motor runs crisp',
      item_detected: 'Toolbox with Cordless Drill',
    },
    createdAt: '2026-10-12T09:30:00Z',
  },
  {
    id: 'res_studyroom',
    name: 'Silent Group Study Room 302 (Whiteboard & Display)',
    groupTag: 'Teacher/Staff',
    category: 'Study & Spaces',
    description: 'Sound-insulated collaborative study room with 6-seat table, 55" HDMI presentation screen, wall-to-wall dry-erase board, and ergonomic mesh chairs.',
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Central Library, 3rd Floor East Wing',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 32,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '08:00',
      endTime: '22:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 3,
    usageRules: [
      'Wipe dry-erase board clean before leaving',
      'No hot food or non-capped beverages',
      'Keep door closed to respect library quiet zone',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 97,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-27T08:00:00Z',
      verdict: 'Immaculate presentation screen and clean whiteboard',
      item_detected: 'Study Room with Display',
    },
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'res_3dprinter',
    name: 'Creality Ender-3 Pro Rapid 3D Printer (Heated Bed)',
    groupTag: 'Teacher/Staff',
    category: 'Lab & Tech',
    description: 'Precision 0.4mm nozzle 3D printer for prototyping robotics chassis, architectural models, and mechanical gears. Heated glass build bed supports PLA and PETG.',
    photos: [
      'https://images.unsplash.com/photo-1631556097152-c39479cbfeab?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Makerspace Lab 104, Engineering Annex',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 32,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '19:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: true, // Requires safety cert!
      enrolledCourse: 'CS-301',       // Or relevant engineering course!
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 6,
    usageRules: [
      'Must complete Level-1 Makerspace Safety Workshop',
      'Use only lab-approved PLA filaments',
      'Wait for bed to cool to 35°C before scraping prints',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 92,
      issues: ['Light glue-stick residue on glass bed (normal consumable)'],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-28T11:00:00Z',
      verdict: 'Bed leveled, extruder clean, calibrated belts',
      item_detected: '3D Printer',
    },
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'res_oscilloscope',
    name: 'Rigol DS1104Z Plus 100MHz 4-Channel Digital Oscilloscope',
    groupTag: 'Teacher/Staff',
    category: 'Lab & Tech',
    description: 'Research-grade 4-channel scope with 1 GSa/s real-time sample rate and waveform record/playback. Essential for senior design hardware debugging.',
    photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'VLSI & Circuits Lab 210',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 32,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '10:00',
      endTime: '17:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: true,
      facultySupervisorApprovalRequired: true, // Faculty supervisor check!
    },
    depositAmount: 0,
    maxDurationHours: 4,
    usageRules: [
      'Do not exceed 300V input threshold on BNC channels',
      'Ground probe alligator clips properly before energizing circuits',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 95,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-23T15:00:00Z',
      verdict: 'Calibrated probe sets intact, crisp LCD display',
      item_detected: 'Digital Storage Oscilloscope',
    },
    createdAt: '2026-10-08T14:00:00Z',
  },
  {
    id: 'res_seminarhall',
    name: 'Central Seminar Hall (150 Pax, Dual Laser Projectors)',
    groupTag: 'Teacher/Staff',
    category: 'Study & Spaces',
    description: 'Auditorium style hall with sound system, wireless collar mics, stage lighting, and hybrid Zoom broadcast bridge. High demand space managed with automated fair waitlisting.',
    photos: [
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Academic Block 1, Central Wing',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 32,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '09:00',
      endTime: '20:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: true,
    },
    depositAmount: 0,
    maxDurationHours: 4,
    usageRules: [
      'Event schedule must be registered with Dean Student Affairs',
      'No sticking posters on wood acoustic paneling',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 95,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-26T09:00:00Z',
      verdict: 'AV rack tested, wireless microphones charged',
      item_detected: 'Auditorium Seminar Hall',
    },
    createdAt: '2026-10-02T10:00:00Z',
  },
  {
    id: 'res_counseling',
    name: 'Student Wellbeing Consultation Suite (Confidential)',
    groupTag: 'Teacher/Staff',
    category: 'Study & Spaces',
    description: 'Private, sound-proofed consultation space designed for confidential peer mentoring, stress alleviation, and counselor appointments. Privacy-first: external calendars show only "Slot Booked".',
    photos: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Health & Wellbeing Pavilion, Room 102',
    ownerId: 'user_kapoor',
    ownerName: 'Ms. Kapoor',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 19,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '10:00',
      endTime: '17:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 2,
    usageRules: ['Confidential space; respect peaceful ambience', 'No video recording allowed'],
    privacyLevel: 'restricted', // RESTRICTED PRIVACY
    status: 'active',
    aiCondition: {
      score: 99,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-27T10:00:00Z',
      verdict: 'Serene, clean, comfortable seating setup',
      item_detected: 'Counseling Consultation Room',
    },
    createdAt: '2026-10-03T09:00:00Z',
  },
  {
    id: 'res_wellbeingkit',
    name: 'Ergonomic Desk & Light Therapy Focus Kit',
    groupTag: 'Teacher/Staff',
    category: 'Hostel Essentials',
    description: 'Includes a 10,000 lux circadian focus lamp, ergonomic memory foam lumbar support cushion, and noise-dampening active headset for exam revision weeks.',
    photos: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Wellbeing Center Front Desk',
    ownerId: 'user_kapoor',
    ownerName: 'Ms. Kapoor',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 19,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 72,
    usageRules: ['Keep headphones sanitized with supplied alcohol wipes'],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 96,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-25T11:00:00Z',
      verdict: 'Clean cushions, tested bright spectrum LED',
      item_detected: 'Headphones and Ergonomic Accessories',
    },
    createdAt: '2026-10-14T11:00:00Z',
  },
  {
    id: 'res_arduino',
    name: 'Arduino Mega 2560 Pro IoT Sensor & Robotics Kit',
    groupTag: 'Student',
    category: 'Lab & Tech',
    description: 'Includes Arduino Mega board, 2x breadboards, ultrasonic distance sensors, servo motors, ESP8266 WiFi module, LCD screen, and 65 jumper wires.',
    photos: [
      'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block B, Room 314',
    ownerId: 'user_aarav',
    ownerName: 'Aarav Patel',
    ownerGroup: 'Student',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.9,
    ownerReviewsCount: 14,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '09:00',
      endTime: '21:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 150,
    maxDurationHours: 72,
    usageRules: ['Do not short-circuit 5V to GND', 'Return all sensor modules into their antistatic bags'],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 93,
      issues: ['One 220-ohm resistor leads slightly bent'],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-24T12:00:00Z',
      verdict: 'Microcontroller boots correctly, all GPIO headers intact',
      item_detected: 'Arduino Microcontroller Kit',
    },
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'res_badminton',
    name: 'Yonex Nanoray Badminton Rackets Pair + Mavis Shuttles',
    groupTag: 'Hosteler',
    category: 'Sports',
    description: 'Pair of lightweight graphite badminton rackets with high-tension strings and a tube of 3 nylon shuttles. Ready for evening hostel courtyard matches.',
    photos: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block A Sports Locker',
    hostelBlock: 'Block A',
    ownerId: 'user_warden',
    ownerName: 'Warden Singh',
    ownerGroup: 'Hosteler',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.7,
    ownerReviewsCount: 45,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '06:00',
      endTime: '21:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      hostelBlockRequired: 'Block A',
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 3,
    usageRules: ['Do not drag racket frames along concrete surface', 'Return inside zippered thermal cover'],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 87,
      issues: ['Minor cosmetic paint chip on upper frame bumper of Racket #2'],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-26T18:00:00Z',
      verdict: 'Strings tight at 24lbs, grips clean',
      item_detected: 'Badminton Rackets and Cover',
    },
    createdAt: '2026-10-11T15:00:00Z',
  },
  {
    id: 'res_calculator',
    name: 'Casio FX-991EX ClassWiz Advanced Scientific Calculator',
    groupTag: 'Student',
    category: 'Lab & Tech',
    description: '552 functions high-resolution natural textbook display scientific calculator. Approved for university engineering and mathematics semester exams.',
    photos: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block B, Room 204',
    ownerId: 'user_aarav',
    ownerName: 'Aarav Patel',
    ownerGroup: 'Student',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.9,
    ownerReviewsCount: 14,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '08:00',
      endTime: '22:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 72,
    usageRules: ['Do not scratch solar panel or display', 'Return with plastic slide-on hard case'],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 98,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-27T14:00:00Z',
      verdict: 'Clean casing, responsive tactile keys, clear high-contrast LCD',
      item_detected: 'Scientific Calculator',
    },
    createdAt: '2026-10-19T09:00:00Z',
  },
  {
    id: 'res_student_badminton',
    name: 'Badminton Racket Set (Pair with Cork Shuttles)',
    groupTag: 'Student',
    category: 'Sports',
    description: 'Pair of lightweight alloy student rackets with protective carrying sleeve and 3 feather shuttles. Great for gym courts and open lawns.',
    photos: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block B Common Lounge',
    ownerId: 'user_aarav',
    ownerName: 'Aarav Patel',
    ownerGroup: 'Student',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.9,
    ownerReviewsCount: 14,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '08:00',
      endTime: '21:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 4,
    usageRules: ['Play on indoor court or turf', 'Return inside zip case'],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 91,
      issues: ['Light cosmetic wear on grip tape'],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-26T15:00:00Z',
      verdict: 'Frame balanced, tight strings, ready for play',
      item_detected: 'Badminton Rackets',
    },
    createdAt: '2026-10-20T11:00:00Z',
  },
  {
    id: 'res_microscope',
    name: 'Olympus CX23 Educational Binocular Lab Microscope',
    groupTag: 'Teacher/Staff',
    category: 'Lab & Tech',
    description: 'High-precision binocular biological microscope with quadruple revolving nosepiece (4x, 10x, 40x, 100x oil) and LED illumination. Used for histology and botany project work.',
    photos: [
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Bioengineering Research Lab 304',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 32,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: true,
      facultySupervisorApprovalRequired: true,
    },
    depositAmount: 0,
    maxDurationHours: 6,
    usageRules: [
      'Wipe 100x lens with lens paper only after immersion oil use',
      'Store covered with dust drape',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 97,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-25T11:00:00Z',
      verdict: 'Optical prisms aligned, lenses clean without mold or dust',
      item_detected: 'Laboratory Microscope',
    },
    createdAt: '2026-10-10T14:00:00Z',
  },
  {
    id: 'res_caliper',
    name: 'Mitutoyo 150mm Precision Digital Caliper Set',
    groupTag: 'Teacher/Staff',
    category: 'Lab & Tech',
    description: '0.01mm resolution digital vernier caliper with carbide-tipped outside jaws and depth gauge. Stored in foam-lined protective hard shell case with spare SR44 battery.',
    photos: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Mechanical Metrology Lab 112',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    ownerGroup: 'Teacher/Staff',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ownerRating: 5.0,
    ownerReviewsCount: 32,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
    },
    eligibility: {
      collegeIdVerified: true,
      safetyTrainingCompleted: true,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 8,
    usageRules: [
      'Clean measuring faces before zeroing',
      'Do not apply excessive force to thumb wheel',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 99,
      issues: [],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-26T16:00:00Z',
      verdict: 'Zero repeatability certified, zero backlash',
      item_detected: 'Precision Digital Caliper',
    },
    createdAt: '2026-10-12T16:00:00Z',
  },
  {
    id: 'res_induction',
    name: 'Pigeon Cruise 1800W Portable Induction Cooktop',
    groupTag: 'Hosteler',
    category: 'Hostel Essentials',
    description: 'Fast heating crystal glass induction cooktop with pre-set cooking menus and auto-off safety shut-off. Includes compatible 2-litre stainless steel boiling pot.',
    photos: [
      'https://images.unsplash.com/photo-1584990347449-399a9b19e273?w=800&auto=format&fit=crop&q=80',
    ],
    location: 'Hostel Block A Pantry 2nd Floor',
    hostelBlock: 'Block A',
    ownerId: 'user_warden',
    ownerName: 'Warden Singh',
    ownerGroup: 'Hosteler',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ownerRating: 4.7,
    ownerReviewsCount: 45,
    availabilitySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '07:00',
      endTime: '22:00',
    },
    eligibility: {
      collegeIdVerified: true,
      hostelBlockRequired: 'Block A',
      safetyTrainingCompleted: false,
      facultySupervisorApprovalRequired: false,
    },
    depositAmount: 0,
    maxDurationHours: 3,
    usageRules: [
      'Only use flat-bottom induction cookware',
      'Wipe glass surface once cooled',
    ],
    privacyLevel: 'public',
    status: 'active',
    aiCondition: {
      score: 92,
      issues: ['Light heat mark on center circle (normal cosmetic)'],
      confidence: 'high',
      photoQualityOk: true,
      lastCheckedAt: '2026-10-27T17:00:00Z',
      verdict: 'Tempered glass clear, cord and plug firmly sealed',
      item_detected: 'Induction Cooker',
    },
    createdAt: '2026-10-15T12:00:00Z',
  },
];

export const SEEDED_BOOKINGS: Booking[] = [
  // 1. Past completed booking with two-way rating revealed!
  {
    id: 'book_past_1',
    resourceId: 'res_blazer',
    resourceName: 'Navy Slim-Fit Placement Interview Blazer (Size 38 / M)',
    resourcePhoto: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    resourceLocation: 'Hostel Block B, 3rd Floor',
    resourcePrivacy: 'public',
    borrowerId: 'user_meera',
    borrowerName: 'Meera Sen',
    borrowerGroup: 'Hosteler',
    borrowerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    borrowerRating: 4.8,
    borrowerOnTimeRecord: '8 of 8',
    ownerId: 'user_aarav',
    ownerName: 'Aarav Patel',
    startDate: '2026-10-22',
    startTime: '09:00',
    endDate: '2026-10-22',
    endTime: '17:00',
    purpose: 'Campus placement interview with Goldman Sachs engineering team',
    status: 'Completed',
    decisionReason: 'Verified placement round schedule; best wishes!',
    decisionDate: '2026-10-21T18:00:00Z',
    checkoutCondition: {
      workingOrder: true,
      noScratches: true,
      allPartsPresent: true,
      clean: true,
      notes: 'Handed over in protective garment cover with hanger.',
      photos: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'],
      confirmedByBorrower: true,
      confirmedByLender: true,
      timestamp: '2026-10-22T08:50:00Z',
    },
    returnCondition: {
      workingOrder: true,
      noScratches: true,
      allPartsPresent: true,
      clean: true,
      notes: 'Returned in pristine state. Clean and folded nicely.',
      photos: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'],
      confirmedByBorrower: true,
      confirmedByLender: true,
      timestamp: '2026-10-22T16:45:00Z',
    },
    twoWayRating: {
      borrowerRated: true,
      borrowerRating: 5,
      borrowerTags: ['Item as described', 'Helpful handover', 'Friendly & prompt'],
      borrowerComment: 'Aarav is super helpful! The blazer fitted great and gave me real confidence.',
      borrowerRatedAt: '2026-10-22T17:10:00Z',
      lenderRated: true,
      lenderRating: 5,
      lenderTags: ['On time', 'Careful with item', 'Clean equipment'],
      lenderComment: 'Meera returned it on time and in spotless shape. 10/10 borrower!',
      lenderRatedAt: '2026-10-22T17:30:00Z',
      revealed: true,
    },
    hasIncidentReport: false,
    createdAt: '2026-10-20T14:00:00Z',
    updatedAt: '2026-10-22T17:30:00Z',
  },

  // 2. Currently active checked-out booking: Aarav borrowing 3D Printer from Dr. Sharma
  {
    id: 'book_active_1',
    resourceId: 'res_3dprinter',
    resourceName: 'Creality Ender-3 Pro Rapid 3D Printer (Heated Bed)',
    resourcePhoto: 'https://images.unsplash.com/photo-1631556097152-c39479cbfeab?w=800&auto=format&fit=crop&q=80',
    resourceLocation: 'Makerspace Lab 104, Engineering Annex',
    resourcePrivacy: 'public',
    borrowerId: 'user_aarav',
    borrowerName: 'Aarav Patel',
    borrowerGroup: 'Student',
    borrowerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    borrowerRating: 4.9,
    borrowerOnTimeRecord: '13 of 14',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    startDate: '2026-10-29',
    startTime: '10:00',
    endDate: '2026-10-29',
    endTime: '16:00',
    purpose: 'Fabricating robot arm gear housing for CS-301 Capstone project milestone',
    teamMembers: 'Pooja (CS-301), Rohan (ME-204)',
    status: 'Checked out',
    decisionReason: 'Verified CS-301 capstone registration and safety cert. Approved.',
    decisionDate: '2026-10-28T16:00:00Z',
    checkoutCondition: {
      workingOrder: true,
      noScratches: true,
      allPartsPresent: true,
      clean: true,
      notes: 'Nozzle clean, 1.75mm PLA loaded, bed leveled at 60C.',
      photos: ['https://images.unsplash.com/photo-1631556097152-c39479cbfeab?w=800&auto=format&fit=crop&q=80'],
      confirmedByBorrower: true,
      confirmedByLender: true,
      timestamp: '2026-10-29T10:05:00Z',
    },
    twoWayRating: {
      borrowerRated: false,
      lenderRated: false,
      revealed: false,
    },
    hasIncidentReport: false,
    createdAt: '2026-10-28T12:00:00Z',
    updatedAt: '2026-10-29T10:05:00Z',
  },

  // 3. Overdue booking (due earlier today, highlighted in red)
  {
    id: 'book_overdue_1',
    resourceId: 'res_badminton',
    resourceName: 'Yonex Nanoray Badminton Rackets Pair + Mavis Shuttles',
    resourcePhoto: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    resourceLocation: 'Hostel Block A Sports Locker',
    resourcePrivacy: 'public',
    borrowerId: 'user_aarav',
    borrowerName: 'Aarav Patel',
    borrowerGroup: 'Student',
    borrowerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    borrowerRating: 4.9,
    borrowerOnTimeRecord: '13 of 14',
    ownerId: 'user_warden',
    ownerName: 'Warden Singh',
    startDate: '2026-10-29',
    startTime: '06:30',
    endDate: '2026-10-29',
    endTime: '08:30', // Overdue since 08:30!
    purpose: 'Morning hostel tournament practice with batchmates',
    status: 'Checked out',
    decisionReason: 'Auto-approved for Block sports facility.',
    decisionDate: '2026-10-28T21:00:00Z',
    checkoutCondition: {
      workingOrder: true,
      noScratches: true,
      allPartsPresent: true,
      clean: true,
      notes: 'Handed over both rackets in zip cover.',
      photos: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80'],
      confirmedByBorrower: true,
      confirmedByLender: true,
      timestamp: '2026-10-29T06:30:00Z',
    },
    twoWayRating: {
      borrowerRated: false,
      lenderRated: false,
      revealed: false,
    },
    hasIncidentReport: false,
    createdAt: '2026-10-28T20:30:00Z',
    updatedAt: '2026-10-29T06:30:00Z',
  },

  // 4. Pending request awaiting owner/manager decision
  {
    id: 'book_pending_1',
    resourceId: 'res_iron',
    resourceName: 'Philips Steam Iron & Folding Ironing Board',
    resourcePhoto: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=800&auto=format&fit=crop&q=80',
    resourceLocation: 'Hostel Block A, Ground Floor Utility Rm',
    resourcePrivacy: 'public',
    borrowerId: 'user_meera',
    borrowerName: 'Meera Sen',
    borrowerGroup: 'Hosteler',
    borrowerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    borrowerRating: 4.8,
    borrowerOnTimeRecord: '8 of 8',
    ownerId: 'user_warden',
    ownerName: 'Warden Singh',
    startDate: '2026-10-29',
    startTime: '17:00',
    endDate: '2026-10-29',
    endTime: '18:30',
    purpose: 'Pressing laboratory lab coat and presentation shirt for tomorrow morning',
    status: 'Requested',
    twoWayRating: {
      borrowerRated: false,
      lenderRated: false,
      revealed: false,
    },
    hasIncidentReport: false,
    createdAt: '2026-10-29T09:15:00Z',
    updatedAt: '2026-10-29T09:15:00Z',
  },

  // 5. Waitlisted booking (queue position 1)
  {
    id: 'book_waitlist_1',
    resourceId: 'res_seminarhall',
    resourceName: 'Central Seminar Hall (150 Pax, Dual Laser Projectors)',
    resourcePhoto: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    resourceLocation: 'Academic Block 1, Central Wing',
    resourcePrivacy: 'public',
    borrowerId: 'user_aarav',
    borrowerName: 'Aarav Patel',
    borrowerGroup: 'Student',
    borrowerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    borrowerRating: 4.9,
    borrowerOnTimeRecord: '13 of 14',
    ownerId: 'user_sharma',
    ownerName: 'Dr. Sharma',
    startDate: '2026-10-30',
    startTime: '14:00',
    endDate: '2026-10-30',
    endTime: '18:00',
    purpose: 'College Tech Club open hackathon kickoff workshop',
    teamMembers: 'Dev Club core team (5 organizers)',
    status: 'Waitlisted',
    waitlistPosition: 1,
    decisionReason: 'Currently waitlisted in position #1 behind IEEE annual keynote. If IEEE cancels, slot will automatically transfer to you.',
    decisionDate: '2026-10-27T17:00:00Z',
    twoWayRating: {
      borrowerRated: false,
      lenderRated: false,
      revealed: false,
    },
    hasIncidentReport: false,
    createdAt: '2026-10-27T16:00:00Z',
    updatedAt: '2026-10-27T17:00:00Z',
  },
];

export const SEEDED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_1',
    bookingId: 'book_past_1',
    resourceId: 'res_blazer',
    timestamp: '2026-10-20T14:00:00Z',
    actorId: 'user_meera',
    actorName: 'Meera Sen',
    actorRole: 'Seeker',
    action: 'BOOKING_REQUESTED',
    title: 'Booking Requested',
    details: 'Requested blazer for 2026-10-22 (09:00 - 17:00)',
    reason: 'Campus placement interview with Goldman Sachs',
  },
  {
    id: 'log_2',
    bookingId: 'book_past_1',
    resourceId: 'res_blazer',
    timestamp: '2026-10-21T18:00:00Z',
    actorId: 'user_aarav',
    actorName: 'Aarav Patel',
    actorRole: 'Owner',
    action: 'BOOKING_APPROVED',
    title: 'Booking Approved',
    details: 'Owner approved request',
    reason: 'Verified placement round schedule; best wishes!',
  },
  {
    id: 'log_3',
    bookingId: 'book_past_1',
    resourceId: 'res_blazer',
    timestamp: '2026-10-22T08:50:00Z',
    actorId: 'user_meera',
    actorName: 'Meera Sen',
    actorRole: 'Seeker',
    action: 'CHECKED_OUT',
    title: 'Item Checked Out',
    details: 'Condition checklist completed by borrower and owner with photos',
    reason: 'Handover complete in Room 314',
  },
  {
    id: 'log_4',
    bookingId: 'book_past_1',
    resourceId: 'res_blazer',
    timestamp: '2026-10-22T16:45:00Z',
    actorId: 'user_meera',
    actorName: 'Meera Sen',
    actorRole: 'Seeker',
    action: 'RETURNED',
    title: 'Item Returned',
    details: 'Borrower submitted return checklist and photos',
    reason: 'Returned on hanger inside cover',
  },
  {
    id: 'log_5',
    bookingId: 'book_past_1',
    resourceId: 'res_blazer',
    timestamp: '2026-10-22T16:55:00Z',
    actorId: 'user_aarav',
    actorName: 'Aarav Patel',
    actorRole: 'Owner',
    action: 'SAFE_RETURN_CONFIRMED',
    title: 'Safe Return Confirmed',
    details: 'Owner verified item condition; marked completed',
    reason: 'Returned in pristine condition without any stains',
  },
  {
    id: 'log_6',
    bookingId: 'book_past_1',
    resourceId: 'res_blazer',
    timestamp: '2026-10-22T17:30:00Z',
    actorId: 'user_aarav',
    actorName: 'ShareSpot System',
    actorRole: 'System',
    action: 'RATINGS_REVEALED',
    title: 'Two-Way Ratings Revealed',
    details: 'Both borrower and lender submitted ratings. Unlocked simultaneously on profiles.',
    reason: 'Rapido two-way rating rule fulfilled',
  },
  {
    id: 'log_7',
    bookingId: 'book_waitlist_1',
    resourceId: 'res_seminarhall',
    timestamp: '2026-10-27T17:00:00Z',
    actorId: 'user_sharma',
    actorName: 'Dr. Sharma',
    actorRole: 'Owner',
    action: 'BOOKING_WAITLISTED',
    title: 'Waitlist Assigned',
    details: 'User placed in Waitlist queue position #1',
    reason: 'Currently queued behind IEEE Student Chapter event',
  },
];

export const SEEDED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_aarav',
    type: 'overdue',
    title: 'Action Required: Item Overdue',
    message: 'Yonex Badminton Rackets were due at 08:30 AM today. Please return to Hostel A locker immediately to avoid fair access priority deduction.',
    bookingId: 'book_overdue_1',
    isRead: false,
    isOverdue: true,
    createdAt: '2026-10-29T08:31:00Z',
  },
  {
    id: 'notif_2',
    userId: 'user_warden',
    type: 'approval',
    title: 'New Booking Request',
    message: 'Meera Sen requested Steam Iron & Board for today 17:00 - 18:30. Awaiting your approval.',
    bookingId: 'book_pending_1',
    isRead: false,
    createdAt: '2026-10-29T09:15:00Z',
  },
  {
    id: 'notif_3',
    userId: 'user_aarav',
    type: 'waitlist',
    title: 'Waitlist Status: Position #1',
    message: 'You are next in line for Central Seminar Hall on Oct 30. If the slot frees up, it will be automatically offered to you.',
    bookingId: 'book_waitlist_1',
    isRead: true,
    createdAt: '2026-10-27T17:00:00Z',
  },
  {
    id: 'notif_4',
    userId: 'user_aarav',
    type: 'rating_revealed',
    title: 'New Review Unlocked! ⭐️ 5.0',
    message: 'Meera Sen rated your blazer 5 stars: "Aarav is super helpful! Fitted great and gave me confidence."',
    bookingId: 'book_past_1',
    isRead: true,
    createdAt: '2026-10-22T17:30:00Z',
  },
];

// Reactive pub-sub listener so components automatically re-render when storage updates
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeToStorage(listener: StorageListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

// STORAGE API
export const storageService = {
  // Initialize seeded data if not already stored
  init() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEEDED_USERS));
    }
    // Always sync seeded resources so new items exist
    const storedRes = localStorage.getItem(RESOURCES_KEY);
    if (!storedRes || JSON.parse(storedRes).length < SEEDED_RESOURCES.length) {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(SEEDED_RESOURCES));
    }
    if (!localStorage.getItem(BOOKINGS_KEY)) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEEDED_BOOKINGS));
    }
    if (!localStorage.getItem(AUDIT_LOGS_KEY)) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(SEEDED_AUDIT_LOGS));
    }
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEEDED_NOTIFICATIONS));
    }
    if (!localStorage.getItem(INCIDENTS_KEY)) {
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify([]));
    }
  },

  resetAllData() {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEEDED_USERS));
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(SEEDED_RESOURCES));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEEDED_BOOKINGS));
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(SEEDED_AUDIT_LOGS));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEEDED_NOTIFICATIONS));
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify([]));
    notifyListeners();
  },

  getUsers(): User[] {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') || SEEDED_USERS;
    } catch {
      return SEEDED_USERS;
    }
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return this.getUsers().find((u) => u.email.trim().toLowerCase() === cleanEmail);
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    notifyListeners();
  },

  createUser(user: User): User {
    const list = this.getUsers();
    list.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
    notifyListeners();
    return user;
  },

  verifyUser(userId: string, status: 'verified' | 'rejected'): User | undefined {
    const list = this.getUsers();
    const user = list.find((u) => u.id === userId);
    if (user) {
      user.verificationStatus = status;
      user.verifiedCollegeId = status === 'verified';
      localStorage.setItem(USERS_KEY, JSON.stringify(list));
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
      notifyListeners();
    }
    return user;
  },

  updateUser(updated: User) {
    const users = this.getUsers().map((u) => (u.id === updated.id ? updated : u));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current && current.id === updated.id) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    }
    notifyListeners();
  },

  getResources(): Resource[] {
    try {
      return JSON.parse(localStorage.getItem(RESOURCES_KEY) || '[]') || SEEDED_RESOURCES;
    } catch {
      return SEEDED_RESOURCES;
    }
  },

  getResourceById(id: string): Resource | undefined {
    return this.getResources().find((r) => r.id === id);
  },

  saveResource(resource: Resource) {
    const list = this.getResources();
    const existingIndex = list.findIndex((r) => r.id === resource.id);
    if (existingIndex >= 0) {
      list[existingIndex] = resource;
    } else {
      list.unshift(resource);
    }
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(list));
    notifyListeners();
  },

  deleteResource(id: string) {
    const list = this.getResources().filter((r) => r.id !== id);
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(list));
    notifyListeners();
  },

  getBookings(): Booking[] {
    try {
      return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]') || SEEDED_BOOKINGS;
    } catch {
      return SEEDED_BOOKINGS;
    }
  },

  getBookingById(id: string): Booking | undefined {
    return this.getBookings().find((b) => b.id === id);
  },

  saveBooking(booking: Booking) {
    const list = this.getBookings();
    const existingIndex = list.findIndex((b) => b.id === booking.id);
    if (existingIndex >= 0) {
      list[existingIndex] = booking;
    } else {
      list.unshift(booking);
    }
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
    notifyListeners();
  },

  getAuditLogs(): AuditLogEntry[] {
    try {
      return JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]') || SEEDED_AUDIT_LOGS;
    } catch {
      return SEEDED_AUDIT_LOGS;
    }
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const list = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEntry);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(list));
    notifyListeners();
    return newEntry;
  },

  getNotifications(userId?: string): AppNotification[] {
    try {
      const all: AppNotification[] = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]') || SEEDED_NOTIFICATIONS;
      if (userId) {
        return all.filter((n) => n.userId === userId);
      }
      return all;
    } catch {
      return SEEDED_NOTIFICATIONS;
    }
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    list.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    notifyListeners();
    return newNotif;
  },

  markNotificationRead(id: string) {
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    notifyListeners();
  },

  markAllNotificationsRead(userId: string) {
    const list = this.getNotifications().map((n) => (n.userId === userId ? { ...n, isRead: true } : n));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    notifyListeners();
  },

  getIncidents(): IncidentReport[] {
    try {
      return JSON.parse(localStorage.getItem(INCIDENTS_KEY) || '[]') || [];
    } catch {
      return [];
    }
  },

  saveIncident(incident: IncidentReport) {
    const list = this.getIncidents();
    const existingIndex = list.findIndex((i) => i.id === incident.id);
    if (existingIndex >= 0) {
      list[existingIndex] = incident;
    } else {
      list.unshift(incident);
    }
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(list));
    notifyListeners();
  },
};
