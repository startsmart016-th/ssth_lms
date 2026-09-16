export type UserRole = 'admin' | 'facilitator' | 'student';

export interface InstitutionSettings {
  _id?: string;
  name: string;
  tagline: string;
  logoUrl: string;
  adminName?: string;
  principalName?: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  adminSignatureUrl: string;
  principalSignatureUrl?: string;
  sealOrStampUrl: string;
  updatedAt?: string;
}

export interface AdmissionLetterData {
  letterNumber: string;
  issuedDate: string;
  programTitle: string;
  programLevel: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  tempPassword?: string;
  tempPin?: string;
  portalUrl?: string;
  approvedAt?: string;
  approvedBy?: string;
  adminApprovedBy?: string;
  principalApprovedBy?: string;
  instructions?: string[];
}

export interface User {
  _id: string;
  name: string;
  fullName?: string;
  email: string;
  role: UserRole;
  idNumber: string; // e.g., SST-ADM-001, SST-FAC-001, SST-2026-004
  avatarUrl: string;
  signatureUrl?: string;
  phone?: string;
  department?: string;
  status: 'pending' | 'active' | 'suspended' | 'graduated' | 'rejected';
  programLevel?: number; // 100 | 200 | 300 | 400
  programTrack?: string;
  issueDate: string;
  expiryDate: string;
  idCardIssuedDate?: string;
  idCardExpiryDate?: string;
  pin?: string;
  bio?: string;
  admissionLetter?: AdmissionLetterData;
  createdAt: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'sheet' | 'link';
  url: string;
  description?: string;
  addedAt: string;
}

export type CourseSessionMaterial = CourseMaterial;

export interface CourseSession {
  id: string;
  sessionNumber: number;
  week?: number;
  title: string;
  date?: string;
  time?: string;
  duration?: string;
  meetingLink?: string;
  description: string;
  materials: CourseMaterial[];
  createdAt?: string;
}

export interface CourseAnnouncement {
  id: string;
  title: string;
  content: string;
  message?: string;
  authorName: string;
  date: string;
}

export interface Course {
  _id: string;
  code: string; // SST 101, SST 201, SST 301, SST 401 etc.
  title: string;
  level: 100 | 200 | 300 | 400;
  category: string;
  description: string;
  facilitator?: User | string;
  facilitatorName?: string;
  syllabus: any[];
  materials: CourseMaterial[];
  sessions?: CourseSession[];
  announcements: CourseAnnouncement[];
  credits: number;
  durationWeeks?: number;
  duration?: string;
  prerequisites?: string | string[];
  studentsCount?: number;
}

export interface Assignment {
  _id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  createdAt: string;
}

export interface Submission {
  _id: string;
  assignmentId: string;
  assignment?: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  submittedAt: string;
  content: string;
  attachmentUrl?: string;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  status: 'submitted' | 'graded';
}

export interface Enrollment {
  _id: string;
  student: string | User;
  course: string | Course;
  enrolledAt: string;
  status: 'enrolled' | 'completed' | 'dropped';
  grade?: string; // 'A', 'B', 'C', 'Pending'
  score?: number; // 0-100
  facilitatorSignOff?: boolean;
  signedAt?: string;
  signedBy?: string | User;
  adminApproved?: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  certificateId?: string;
  certificateIssuedAt?: string;
  certificateRequested?: boolean;
  certificateRequestedAt?: string;
}

export interface CampusMetrics {
  totalStudents: number;
  totalFacilitators: number;
  totalCourses: number;
  activeEnrollments: number;
  certificatesIssued: number;
  avgCompletionRate: number;
}

export interface MockEmailNotification {
  _id: string;
  to: string;
  recipientName: string;
  recipientIdNumber: string;
  studentId: string;
  from: string;
  subject: string;
  previewText: string;
  bodyText: string;
  bodyHtml: string;
  category: 'course_enrollment' | 'certificate_awarded' | 'admission_approved' | 'system';
  metadata?: {
    courseId?: string;
    courseCode?: string;
    courseTitle?: string;
    courseLevel?: number;
    credits?: number;
    certificateId?: string;
    grade?: string;
    score?: number;
    issuedAt?: string;
    facilitatorName?: string;
  };
  sentAt: string;
  status: 'delivered' | 'pending';
  read: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseCode: string;
  courseTitle: string;
  level: number;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  codeSnippet?: string;
  createdAt: string;
  isSolution?: boolean;
  upvotes: number;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: 'general' | 'react' | 'excel' | 'cloud' | 'capstone' | 'career';
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  codeSnippet?: string;
  tags: string[];
  createdAt: string;
  views: number;
  upvotes: number;
  isSolved: boolean;
  replies: ForumReply[];
}

export interface CapstoneProject {
  id: string;
  title: string;
  tagline: string;
  category: 'agritech' | 'cleantech' | 'healthtech' | 'fintech' | 'edtech';
  authors: { name: string; role: string; avatar: string }[];
  cohortYear: string;
  level: number;
  summary: string;
  techStack: string[];
  metrics: { label: string; value: string }[];
  demoUrl?: string;
  repoUrl?: string;
  likes: number;
  featured: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  courseCode: string;
  level: number;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
  facilitatorName: string;
  room: string;
  type: 'lecture' | 'lab' | 'office_hours' | 'capstone_clinic' | 'seminar';
  description: string;
  capacity: number;
  enrolledCount: number;
}

export interface AttendanceRecord {
  id: string;
  studentId?: string;
  studentName?: string;
  courseCode?: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  workstation?: string;
  workstationId?: string;
  durationMinutes?: number;
  hoursSpent?: number;
  status: 'present' | 'verified' | 'late' | 'excused';
  verifiedBy?: string;
  purpose?: string;
}
