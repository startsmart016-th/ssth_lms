import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoClient, ServerApiVersion, Db } from 'mongodb';

// --- Mongoose Schemas ---
export interface IInstitutionSettings extends Document {
  name: string;
  tagline: string;
  logoUrl: string;
  adminName: string;
  principalName?: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  adminSignatureUrl: string;
  principalSignatureUrl?: string;
  sealOrStampUrl: string;
  updatedAt: Date;
}

const InstitutionSettingsSchema = new Schema<IInstitutionSettings>({
  name: { type: String, required: true, default: 'StartSmart Tech Hub' },
  tagline: { type: String, default: 'Empowering Next-Gen Digital Leaders & Tech Innovators' },
  logoUrl: { type: String, default: 'https://i.imgur.com/x45FW8G.png' },
  adminName: { type: String, default: 'Mr. Seidu Mahamadu' },
  principalName: { type: String, default: 'Mr. Seidu Mahamadu' },
  location: { type: String, default: 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23' },
  contactEmail: { type: String, default: 'registrar@startsmart.tech' },
  contactPhone: { type: String, default: '+234 (0) 800-STARTSMART / +1 (555) 019-2831' },
  websiteUrl: { type: String, default: 'https://startsmart.tech' },
  adminSignatureUrl: { type: String, default: '/admin-signature.png' },
  principalSignatureUrl: { type: String, default: '/principal-signature.svg' },
  sealOrStampUrl: { type: String, default: 'https://i.imgur.com/BrpD2i3.png' },
  updatedAt: { type: Date, default: Date.now },
});

export const InstitutionSettings = (mongoose.models.InstitutionSettings || mongoose.model<IInstitutionSettings>('InstitutionSettings', InstitutionSettingsSchema)) as mongoose.Model<IInstitutionSettings>;

export interface IUser extends Document {
  _id: any;
  name: string;
  fullName?: string;
  email: string;
  password: string;
  pin: string;
  role: 'admin' | 'facilitator' | 'student';
  idNumber: string;
  avatarUrl: string;
  signatureUrl?: string;
  phone?: string;
  department?: string;
  status: 'pending' | 'active' | 'suspended' | 'graduated' | 'rejected';
  issueDate: string;
  expiryDate: string;
  idCardIssuedDate?: string;
  idCardExpiryDate?: string;
  bio?: string;
  programLevel?: number;
  programTrack?: string;
  admissionLetter?: {
    letterNumber: string;
    issuedDate: string;
    programTitle: string;
    programLevel: number;
    tempPassword?: string;
    tempPin?: string;
    portalUrl?: string;
    approvedAt?: string;
    approvedBy?: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String },
  name: { type: String, required: true },
  fullName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pin: { type: String, required: true },
  role: { type: String, enum: ['admin', 'facilitator', 'student'], required: true },
  idNumber: { type: String, required: true },
  avatarUrl: { type: String, default: 'https://i.imgur.com/J1pnjB4.png' },
  signatureUrl: { type: String },
  phone: { type: String, default: '+1 (555) 019-2831' },
  department: { type: String, default: 'Information & Applied Technology' },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'graduated', 'rejected'], default: 'active' },
  issueDate: { type: String, default: '2025-01-10' },
  expiryDate: { type: String, default: '2027-12-31' },
  idCardIssuedDate: { type: String, default: '2025-01-10' },
  idCardExpiryDate: { type: String, default: '2027-12-31' },
  bio: { type: String, default: '' },
  programLevel: { type: Number, default: 100 },
  programTrack: { type: String, default: 'Computer Fundamentals & IT Tools' },
  admissionLetter: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as mongoose.Model<any>;

export interface ICourseSession {
  id: string;
  sessionNumber: number;
  title: string;
  date?: string;
  description: string;
  materials: {
    id: string;
    title: string;
    type: string;
    url: string;
    description: string;
    addedAt: string;
  }[];
  createdAt?: string;
}

export interface ICourse extends Document {
  _id: any;
  code: string;
  title: string;
  level: number;
  category: string;
  description: string;
  facilitator?: any;
  facilitatorName?: string;
  syllabus: string[];
  materials: {
    id: string;
    title: string;
    type: string;
    url: string;
    description: string;
    addedAt: string;
  }[];
  sessions?: ICourseSession[];
  announcements: {
    id: string;
    title: string;
    content: string;
    authorName: string;
    date: string;
  }[];
  credits: number;
  durationWeeks: number;
}

const CourseSchema = new Schema<ICourse>({
  _id: { type: String },
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  level: { type: Number, required: true, enum: [100, 200, 300, 400] },
  category: { type: String, required: true },
  description: { type: String, required: true },
  facilitator: { type: Schema.Types.Mixed },
  facilitatorName: { type: String },
  syllabus: [{ type: String }],
  materials: [{
    id: { type: String },
    title: { type: String },
    type: { type: String },
    url: { type: String },
    description: { type: String },
    addedAt: { type: String },
  }],
  sessions: [{
    id: { type: String },
    sessionNumber: { type: Number, default: 1 },
    title: { type: String, required: true },
    date: { type: String, default: '' },
    description: { type: String, default: '' },
    materials: [{
      id: { type: String },
      title: { type: String },
      type: { type: String },
      url: { type: String },
      description: { type: String },
      addedAt: { type: String },
    }],
    createdAt: { type: String },
  }],
  announcements: [{
    id: { type: String },
    title: { type: String },
    content: { type: String },
    authorName: { type: String },
    date: { type: String },
  }],
  credits: { type: Number, default: 3 },
  durationWeeks: { type: Number, default: 8 },
});

export const Course = (mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)) as mongoose.Model<any>;

export interface IEnrollment extends Document {
  _id: any;
  student: any;
  course: any;
  enrolledAt: Date;
  status: 'enrolled' | 'completed' | 'dropped';
  grade: string;
  score: number;
  facilitatorSignOff: boolean;
  signedAt?: Date;
  signedBy?: any;
  adminApproved?: boolean;
  adminApprovedAt?: Date;
  adminApprovedBy?: string;
  certificateId?: string;
  certificateIssuedAt?: Date;
  certificateRequested?: boolean;
  certificateRequestedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  _id: { type: String },
  student: { type: Schema.Types.Mixed, required: true },
  course: { type: Schema.Types.Mixed, required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
  grade: { type: String, default: 'Pending' },
  score: { type: Number, default: 0 },
  facilitatorSignOff: { type: Boolean, default: false },
  signedAt: { type: Date },
  signedBy: { type: Schema.Types.Mixed },
  adminApproved: { type: Boolean, default: false },
  adminApprovedAt: { type: Date },
  adminApprovedBy: { type: String },
  certificateId: { type: String },
  certificateIssuedAt: { type: Date },
  certificateRequested: { type: Boolean, default: false },
  certificateRequestedAt: { type: Date },
});

export const Enrollment = (mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)) as mongoose.Model<any>;

export interface IAssignment extends Document {
  _id: any;
  course: any;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  _id: { type: String },
  course: { type: Schema.Types.Mixed, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: String, required: true },
  maxScore: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
});

export const Assignment = (mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema)) as mongoose.Model<any>;

export interface ISubmission extends Document {
  _id: any;
  assignment: any;
  course: any;
  student: any;
  studentName: string;
  studentIdNumber: string;
  submittedAt: Date;
  content: string;
  attachmentUrl?: string;
  score?: number;
  feedback?: string;
  gradedBy?: any;
  gradedAt?: Date;
  status: 'submitted' | 'graded';
}

const SubmissionSchema = new Schema<ISubmission>({
  _id: { type: String },
  assignment: { type: Schema.Types.Mixed, required: true },
  course: { type: Schema.Types.Mixed, required: true },
  student: { type: Schema.Types.Mixed, required: true },
  studentName: { type: String, required: true },
  studentIdNumber: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  content: { type: String, required: true },
  attachmentUrl: { type: String },
  score: { type: Number },
  feedback: { type: String },
  gradedBy: { type: Schema.Types.Mixed },
  gradedAt: { type: Date },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
});

export const Submission = (mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)) as mongoose.Model<any>;

// --- In-Memory / Local Persistence Fallback Store ---
// Guarantees zero downtime even if MongoDB Atlas isn't provisioned or connected!
export class LocalDataStore {
  settings: any = null;
  users: any[] = [];
  courses: any[] = [];
  enrollments: any[] = [];
  assignments: any[] = [];
  submissions: any[] = [];
  isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    // 1. Initial Institution Settings singleton
    this.settings = {
      _id: 'settings_singleton_01',
      name: 'StartSmart Tech Hub',
      tagline: 'Empowering Next-Gen Digital Leaders & Tech Innovators',
      logoUrl: 'https://i.imgur.com/x45FW8G.png',
      adminName: 'Mr. Seidu Mahamadu',
      principalName: 'Mr. Seidu Mahamadu',
      location: 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23',
      contactEmail: 'registrar@startsmart.tech',
      contactPhone: '+234 (0) 800-STARTSMART / +1 (555) 019-2831',
      websiteUrl: 'https://startsmart.tech',
      adminSignatureUrl: '/admin-signature.png',
      principalSignatureUrl: '/principal-signature.svg',
      sealOrStampUrl: '/official-stamp.png',
      updatedAt: new Date().toISOString(),
    };

    // Hashes for the exact required accounts
    const adminPasswordHash = await bcrypt.hash('11316638', 10);
    const adminPinHash = await bcrypt.hash('70723', 10);

    const facilitatorPasswordHash = await bcrypt.hash('11318142', 10);
    const facilitatorPinHash = await bcrypt.hash('48617', 10);

    const studentPasswordHash = await bcrypt.hash('11037000', 10);
    const studentPinHash = await bcrypt.hash('21408', 10);

    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    const defaultPinHash = await bcrypt.hash('12345', 10);

    // 2. Default Seed Users (Exact specified credentials)
    const adminUser = {
      _id: 'usr_admin_001',
      name: 'Mr. Seidu Mahamadu',
      fullName: 'Mr. Seidu Mahamadu',
      email: 'seidu.admin@startsmart.tech',
      password: adminPasswordHash,
      pin: adminPinHash,
      role: 'admin',
      idNumber: 'SST-ADM-001',
      avatarUrl: 'https://i.imgur.com/J1pnjB4.png',
      signatureUrl: '/admin-signature.png',
      phone: '+234 803 113 1663',
      department: 'Executive Academic Council & Administration',
      status: 'active',
      issueDate: '2025-01-01',
      expiryDate: '2028-12-31',
      bio: 'Chief Executive Officer (CEO) & System Administrator at StartSmart Tech Hub.',
      createdAt: new Date().toISOString(),
    };

    const facilitator1 = {
      _id: 'usr_fac_001',
      name: 'Prof. Seidu Mahamadu',
      fullName: 'Prof. Seidu Mahamadu',
      email: 'seidu.facilitator@startsmart.tech',
      password: facilitatorPasswordHash,
      pin: facilitatorPinHash,
      role: 'facilitator',
      idNumber: 'SST-FAC-001',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><path d="M15,45 Q50,15 80,30 T130,15 Q170,45 200,25" fill="none" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round"/><text x="20" y="52" font-family="cursive" font-size="14" fill="%2310b981">Prof. Seidu Mahamadu</text></svg>',
      phone: '+234 803 113 8142',
      department: 'Computer Science & Software Engineering',
      status: 'active',
      issueDate: '2025-01-15',
      expiryDate: '2027-12-31',
      bio: 'Professor of Computer Science & Lead Facilitator at StartSmart Tech Hub.',
      createdAt: new Date().toISOString(),
    };

    const student1 = {
      _id: 'usr_std_001',
      name: 'Seidu Abdul Rafiq',
      fullName: 'Seidu Abdul Rafiq',
      email: 'seidu.student@startsmart.tech',
      password: studentPasswordHash,
      pin: studentPinHash,
      role: 'student',
      idNumber: 'SST-STU-001',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      phone: '+234 803 110 3700',
      department: 'Software Engineering & Cloud Computing',
      status: 'active',
      programLevel: 300,
      programTrack: 'Full-Stack Web Engineering & Cloud Systems',
      admissionLetter: {
        letterNumber: 'SST-ADM-2025-001',
        issuedDate: '2025-02-01',
        programTitle: 'Full-Stack Web Engineering & Cloud Systems',
        programLevel: 300,
        tempPassword: '••••••••',
        tempPin: '21408',
        portalUrl: 'https://startsmart.tech',
        approvedAt: '2025-02-01T09:00:00.000Z',
        approvedBy: 'Seidu Mahamadu (Director)',
      },
      issueDate: '2025-02-01',
      expiryDate: '2027-12-31',
      bio: 'Undergraduate Software Engineering Scholar specializing in Cloud & Full Stack Systems.',
      createdAt: new Date().toISOString(),
    };

    // Secondary demo accounts for richer course enrollment and grading rosters
    const facilitator2 = {
      _id: 'usr_fac_002',
      name: 'Engr. Sarah Jenkins',
      fullName: 'Engr. Sarah Jenkins',
      email: 'sarah.jenkins@startsmart.tech',
      password: defaultPasswordHash,
      pin: defaultPinHash,
      role: 'facilitator',
      idNumber: 'SST-FAC-101',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><path d="M15,45 Q50,15 80,30 T130,15 Q170,45 200,25" fill="none" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round"/><text x="20" y="52" font-family="cursive" font-size="14" fill="%2310b981">Sarah Jenkins, MSc</text></svg>',
      phone: '+1 (555) 019-3344',
      department: 'Data Analytics & Business Applications',
      status: 'active',
      issueDate: '2025-01-15',
      expiryDate: '2027-12-31',
      bio: 'Senior Lead Facilitator for Excel Mastery, Financial Modeling & Data Science.',
      createdAt: new Date().toISOString(),
    };

    const student2 = {
      _id: 'usr_std_002',
      name: 'Amara Claire Williams',
      fullName: 'Amara Claire Williams',
      email: 'amara.student@startsmart.tech',
      password: defaultPasswordHash,
      pin: defaultPinHash,
      role: 'student',
      idNumber: 'SST-STD-2026',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 304-9821',
      department: 'Creative Design & Visual Media',
      status: 'active',
      programLevel: 200,
      programTrack: 'Intermediate Data & Digital Analytics',
      admissionLetter: {
        letterNumber: 'SST-ADM-2025-002',
        issuedDate: '2025-02-01',
        programTitle: 'Intermediate Data & Digital Analytics',
        programLevel: 200,
        tempPassword: '••••••••',
        tempPin: '12345',
        portalUrl: 'https://startsmart.tech',
        approvedAt: '2025-02-01T10:00:00.000Z',
        approvedBy: 'Seidu Mahamadu (Director)',
      },
      issueDate: '2025-02-01',
      expiryDate: '2026-12-31',
      bio: 'Graphic Design and Digital Brand Strategy Enthusiast.',
      createdAt: new Date().toISOString(),
    };

    // Pending Applicants for immediate review in Admin Admissions queue
    const pendingApplicant1 = {
      _id: 'usr_app_001',
      name: 'Amina Bello',
      fullName: 'Amina Bello',
      email: 'amina.bello@example.com',
      password: defaultPasswordHash,
      pin: defaultPinHash,
      role: 'student',
      idNumber: 'PENDING-001',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
      phone: '+234 802 345 6789',
      department: 'Foundational Computer Science',
      status: 'pending',
      programLevel: 100,
      programTrack: 'Computer Fundamentals & IT Tools',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: `${new Date().getFullYear() + 2}-12-31`,
      bio: 'Aspiring software developer with keen interest in computer systems and digital office tools.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    };

    const pendingApplicant2 = {
      _id: 'usr_app_002',
      name: 'David Kwame Mensah',
      fullName: 'David Kwame Mensah',
      email: 'david.mensah@example.com',
      password: defaultPasswordHash,
      pin: defaultPinHash,
      role: 'student',
      idNumber: 'PENDING-002',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      phone: '+233 24 567 8901',
      department: 'Software Engineering',
      status: 'pending',
      programLevel: 300,
      programTrack: 'Full-Stack Web Engineering & Distributed Systems',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: `${new Date().getFullYear() + 2}-12-31`,
      bio: 'Diploma graduate seeking specialized project-based full stack engineering training.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    };

    this.users = [adminUser, facilitator1, facilitator2, student1, student2, pendingApplicant1, pendingApplicant2];

    // 3. Pre-configured Catalog across 100, 200, 300, 400 Levels
    const rawCatalog = [
      // 100 LEVEL (Foundation)
      {
        code: 'SST 101',
        title: 'Intro to Computers',
        level: 100,
        category: 'Foundation',
        description: 'Comprehensive orientation covering computer architecture, operating systems, hardware components, peripheral management, and digital environment navigation.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Computer Hardware Anatomy & Storage Devices', 'Operating Systems (Windows & Linux basics)', 'File Management, Cloud Drives & Data Security', 'Internet Networking, Browsers & Cyber Hygiene'],
        credits: 2,
        durationWeeks: 4,
      },
      {
        code: 'SST 102',
        title: 'Basic Computer Literacy',
        level: 100,
        category: 'Foundation',
        description: 'Core keyboarding, touch typing, basic word processing, safe internet navigation, email protocols, and cloud collaboration essentials.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Keyboarding Speed & Ergonomics', 'Email Etiquette & Professional Correspondence', 'Cloud Workspace Navigation & Modern File Storage', 'Basic Document Creation & Printing Controls'],
        credits: 2,
        durationWeeks: 4,
      },
      {
        code: 'SST 103',
        title: 'MS Excel Beginner',
        level: 100,
        category: 'Foundation',
        description: 'Foundations of Microsoft Excel: workbook setup, cell referencing, arithmetic formulas, basic formatting, table styles, and elementary charting.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['The Excel Interface, Ribbons & Worksheets', 'Relative vs Absolute Cell Referencing ($A$1)', 'Basic Functions: SUM, AVERAGE, COUNT, MIN, MAX', 'Creating Clean Bar & Column Charts'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 104',
        title: 'Intro to Graphic Design',
        level: 100,
        category: 'Foundation',
        description: 'Fundamental graphic design principles: visual hierarchy, color theory, typography, raster vs. vector graphics, and digital design tool intro.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Elements of Visual Design & Contrast', 'Color Systems (RGB vs CMYK, Warm vs Cool)', 'Typography & Font Pairing Fundamentals', 'Intro to Vector Canvas & Layout Composition'],
        credits: 3,
        durationWeeks: 6,
      },

      // 200 LEVEL (Intermediate)
      {
        code: 'SST 201',
        title: 'MS Excel Intermediate',
        level: 200,
        category: 'Intermediate',
        description: 'Intermediate formula construction, logical operations, lookup fundamentals (VLOOKUP, XLOOKUP), conditional formatting, and multi-sheet consolidation.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['IF, AND, OR Nested Logical Formulas', 'VLOOKUP, INDEX-MATCH & modern XLOOKUP', 'Conditional Formatting with Custom Rules', 'Linking Workbooks & Data Validation Dropdowns'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 202',
        title: 'Data Analysis with Excel',
        level: 200,
        category: 'Intermediate',
        description: 'Exploratory data analysis using Pivot Tables, slicers, timeline filters, statistical summaries, trendlines, and dynamic data cleansing.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Data Cleansing: Flash Fill, Text-to-Columns, Remove Duplicates', 'Pivot Tables & Dynamic Calculated Fields', 'Interactive Slicers & Timeline Filters', 'Descriptive Statistics & Variance Summaries'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 203',
        title: 'Excel for Business Apps',
        level: 200,
        category: 'Intermediate',
        description: 'Developing automated business tools: inventory logs, petty cash ledgers, employee timesheets, and invoice generators within Excel.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Inventory Reconciliation Models', 'Automated Invoicing & Tax Calculation Templates', 'Payroll & Timesheet Overtime Trackers', 'Protecting Worksheets & Template Deployment'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 204',
        title: 'Graphic Design Intermediate',
        level: 200,
        category: 'Intermediate',
        description: 'Branding identity development, logo design, social media asset creation, photo manipulation, pen tool mastery, and vector illustration.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Brand Identity Systems & Style Guides', 'Vector Pen Tool Precision & Bezier Curves', 'Photo Masking, Blending & Color Grading', 'Exporting Multi-Platform Campaign Assets'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 205',
        title: 'AI in Research Fundamentals',
        level: 200,
        category: 'Intermediate',
        description: 'Harnessing generative AI, prompt engineering, literature review synthesis, citation validation, and ethical AI utilization for technical research.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Prompt Engineering Frameworks for Inquiry', 'Literature Synthesis & Paper Extraction', 'Fact Verification & Mitigating Hallucinations', 'Academic Integrity & Ethical AI Governance'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 206',
        title: 'Professional PowerPoint',
        level: 200,
        category: 'Intermediate',
        description: 'Executive slide design, visual storytelling, master layouts, data visualization integration, and high-impact presentation delivery.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Slide Master Templating & Brand Grid Systems', 'Executive Data Charts & Diagram Simplification', 'Animation Timing, Morph Transitions & Visual Rhythm', 'Presenter View & Rehearsal Metrics'],
        credits: 2,
        durationWeeks: 4,
      },
      {
        code: 'SST 207',
        title: 'Advanced MS Word',
        level: 200,
        category: 'Intermediate',
        description: 'Long-document authoring, styles and numbering hierarchies, automated table of contents, mail merge, collaborative review, and layout styling.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Document Hierarchy Styles & Multilevel Lists', 'Automated Tables of Contents, Figures & Indexing', 'Mail Merge with Excel Datasets', 'Track Changes, Comments & Document Security'],
        credits: 2,
        durationWeeks: 4,
      },
      {
        code: 'SST 208',
        title: 'Public Speaking & Communication',
        level: 200,
        category: 'Intermediate',
        description: 'Verbal articulation, stage presence, visual aid integration, client pitch readiness, Q&A handling, and persuasive communication in tech.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Speech Structuring: Hook, Value, Climax & CTA', 'Vocal Inflection, Cadence & Body Language', 'Navigating Challenging Stakeholder Q&A', 'Delivering High-Stakes Tech Demos'],
        credits: 2,
        durationWeeks: 4,
      },

      // 300 LEVEL (Specialization Tracks)
      {
        code: 'SST 301',
        title: 'Excel for Financial Analysis',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Discounted cash flow (DCF) models, financial statement forecasting, amortization schedules, NPV, IRR, and sensitivity analysis tables.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['3-Statement Financial Modeling (P&L, Balance Sheet, Cash Flow)', 'Time Value of Money: PV, FV, NPV, IRR, XIRR', 'Loan Amortization Schedules with Capital Breakdown', '1-Way and 2-Way Data Tables for Scenario Testing'],
        credits: 4,
        durationWeeks: 8,
      },
      {
        code: 'SST 302',
        title: 'Excel for HR Analytics',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Workforce turnover analysis, employee attrition modeling, salary benchmarking, performance appraisal metrics, and automated recruitment pipelines.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Headcount & Attrition Rate Calculators', 'Compensation Distribution & Equity Analysis', 'Employee Engagement & Performance Scorecards', 'HR Dashboard Visualizations'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 303',
        title: 'Excel for Sales System Management',
        level: 300,
        category: 'Specialization Tracks',
        description: 'CRM data pipelines, sales conversion funnels, quota tracking, commission tiers, and dynamic regional revenue dashboards.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Sales Pipeline Stages & Win-Rate Probabilities', 'Tiered Commission & Performance Bonus Calculators', 'Regional Revenue Forecasting & Target Attainment', 'Executive Sales Cockpit Dashboard Design'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 304',
        title: 'Excel for Hospital Management',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Patient admissions records, bed occupancy tracking, pharmacy inventory forecasting, medical billing, and clinical operations metrics.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Patient Census & Bed Occupancy Dynamics', 'Medical Inventory Par-Levels & Stockout Alerts', 'Insurance Claims Billing Reconciliation', 'Clinical KPI Dashboards (Wait Time, Length of Stay)'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 305',
        title: 'Excel for School Management',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Student academic grading systems, automated report cards, attendance registries, fee payment tracking, and cohort demographic reports.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Dynamic GPA Calculation & Grade Weighted Averaging', 'Automated Student Term Report Card Generator', 'Attendance Tracking with Visual Heatmaps', 'Tuition Fee Collection & Arrears Tracker'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 306',
        title: 'Professional Graphic Design',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Advanced typography, editorial publication layouts, packaging design, UI design systems, and client presentation mockup production.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Editorial Grid Systems & Multi-Page Magazines', 'Packaging Dielines & Physical Mockup Prototyping', 'Design Tokens & UI Component Libraries', 'Client Creative Pitching & Brand Asset Delivery'],
        credits: 4,
        durationWeeks: 8,
      },
      {
        code: 'SST 307',
        title: 'AI for Academic & Professional Research',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Advanced AI research workflows: systematic literature reviews, automated data synthesis, qualitative coding, and technical report drafting.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Systematic Review Methodology with AI Assistants', 'Qualitative Thematic Coding & Analysis', 'Statistical Inference Verification', 'Drafting Publishable Technical Whitepapers'],
        credits: 4,
        durationWeeks: 8,
      },
      {
        code: 'SST 308',
        title: 'Virtual Assistant Training',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Executive calendar management, asynchronous communication, travel itinerary logistics, project management software (Trello/Asana), and client onboarding.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Executive Time Blocking & Time Zone Scheduling', 'Inbox Zero Strategies & Filtering Automation', 'Global Travel Planning & Itinerary Compilations', 'Client Relationship Management & Invoicing'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 309',
        title: 'Mobile Apps Management',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Mobile product lifecycle, app store optimization (ASO), analytics event tracking, user retention funnels, and agile release cycles.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Mobile Product Roadmapping & User Stories', 'App Store Optimization (Keywords, Visuals, Ratings)', 'Retention Funnels & Churn Analytics', 'Cross-Functional Agile Sprints & QA Testing'],
        credits: 3,
        durationWeeks: 6,
      },
      {
        code: 'SST 310',
        title: 'Advanced PowerPoint for Business',
        level: 300,
        category: 'Specialization Tracks',
        description: 'Investment pitch deck design, interactive kiosk presentations, custom iconography, corporate template systems, and stakeholder storytelling.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['Venture Capital Pitch Deck Architecture', 'Custom Vector Iconography & Isometric Graphics', 'Interactive Non-Linear Navigation Slides', 'Mastering Corporate Presentation Guidelines'],
        credits: 3,
        durationWeeks: 6,
      },

      // 400 LEVEL (Advanced Programs)
      {
        code: 'SST 401',
        title: 'Excel VBA Programming / Automation',
        level: 400,
        category: 'Advanced Programs',
        description: 'Visual Basic for Applications (VBA), custom macro functions, UserForms, event-driven procedures, and automated workbook robotic workflows.',
        facilitator: facilitator1._id,
        facilitatorName: facilitator1.name,
        syllabus: ['VBA Editor, Object Model & Range Manipulations', 'Loops (For Each, Do While) & Decision Structures', 'Designing Interactive UserForms with Input Checks', 'Automated Email Dispatch & File System Integration'],
        credits: 4,
        durationWeeks: 8,
      },
      {
        code: 'SST 402',
        title: 'Software Development / Full Stack Basics',
        level: 400,
        category: 'Advanced Programs',
        description: 'Modern full-stack web engineering: HTML5/Tailwind, TypeScript, React components, Node.js REST APIs, MongoDB data modeling, and Git collaboration.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Responsive Web Layouts & Component Systems', 'Modern State Management & React Hooks', 'Building RESTful APIs with Node.js & Express', 'Relational & Document Databases with Mongoose'],
        credits: 4,
        durationWeeks: 10,
      },
      {
        code: 'SST 403',
        title: 'Office Automation with AI & Tools',
        level: 400,
        category: 'Advanced Programs',
        description: 'Enterprise workflow automation: linking Excel, cloud spreadsheets, AI document summarization, webhook triggers, and autonomous departmental agents.',
        facilitator: facilitator2._id,
        facilitatorName: facilitator2.name,
        syllabus: ['Cloud Webhook Triggers & Zapier/Make Automation', 'Deploying AI Document Processors for Invoices & Contracts', 'Building Automated Daily Digest Telegram/Slack Bots', 'Auditing & Securing Automated Enterprise Workflows'],
        credits: 4,
        durationWeeks: 8,
      },
    ];

    this.courses = rawCatalog.map((c, index) => ({
      _id: `crs_${c.code.replace(/\s+/g, '_').toLowerCase()}`,
      ...c,
      materials: [
        {
          id: `mat_${index}_1`,
          title: `${c.code} - Complete Course Guide & Syllabus`,
          type: 'pdf',
          url: 'https://example.com/syllabus.pdf',
          description: 'Official academic syllabus, prerequisite expectations, and grading rubric.',
          addedAt: '2025-01-20',
        },
        {
          id: `mat_${index}_2`,
          title: `${c.code} - Hands-on Project Workbook`,
          type: 'sheet',
          url: 'https://example.com/workbook.xlsx',
          description: 'Practical exercise datasets, real-world case studies, and lab instructions.',
          addedAt: '2025-01-25',
        }
      ],
      announcements: [
        {
          id: `anc_${index}_1`,
          title: `Welcome to ${c.code}: ${c.title}`,
          content: `Welcome to our ${c.category} cohort! Please download your workbook and review module 1. Facilitator office hours are posted.`,
          authorName: c.facilitatorName || 'Course Lead',
          date: '2025-02-01',
        }
      ],
      sessions: [
        {
          id: `ses_${index}_1`,
          sessionNumber: 1,
          title: `Session 1: Orientation & Foundations of ${c.title}`,
          date: 'Week 1',
          description: `Comprehensive foundational lecture covering ${c.description}. Students will configure their learning workspace and master core principles.`,
          materials: [
            {
              id: `ses_mat_${index}_1`,
              title: `Session 1: Lecture Slide Deck & Guide`,
              type: 'pdf',
              url: 'https://example.com/slides-session-1.pdf',
              description: 'Official slide presentation and lecture transcript.',
              addedAt: '2025-01-22',
            },
            {
              id: `ses_mat_${index}_2`,
              title: `Session 1: Exercise Worksheet & Dataset`,
              type: 'sheet',
              url: 'https://example.com/exercise-1.xlsx',
              description: 'Hands-on practice problems and step-by-step instructions.',
              addedAt: '2025-01-22',
            }
          ],
          createdAt: '2025-01-20',
        },
        {
          id: `ses_${index}_2`,
          sessionNumber: 2,
          title: `Session 2: Applied Lab Work & Core Techniques`,
          date: 'Week 2',
          description: `Applied practical session exploring advanced techniques in ${c.code}. Students implement real-world solutions under facilitator guidance.`,
          materials: [
            {
              id: `ses_mat_${index}_3`,
              title: `Session 2: Lab Walkthrough & Resource Bundle`,
              type: 'pdf',
              url: 'https://example.com/lab-walkthrough.pdf',
              description: 'Code snippets, case studies, and reference architectural diagrams.',
              addedAt: '2025-01-29',
            }
          ],
          createdAt: '2025-01-27',
        }
      ],
    }));

    // 4. Initial Enrollments for Demo Student (Chinedu Okafor)
    // 1 completed with Facilitator Sign-Off & Official Certificate, 2 actively enrolled
    const completedCourse = this.courses.find(c => c.code === 'SST 103') || this.courses[2];
    const activeCourse1 = this.courses.find(c => c.code === 'SST 202') || this.courses[5];
    const activeCourse2 = this.courses.find(c => c.code === 'SST 402') || this.courses[this.courses.length - 2];

    this.enrollments = [
      {
        _id: 'enr_001',
        student: student1._id,
        course: completedCourse._id,
        enrolledAt: '2025-01-10T00:00:00.000Z',
        status: 'completed',
        grade: 'A',
        score: 94,
        facilitatorSignOff: true,
        signedAt: '2025-02-18T14:30:00.000Z',
        signedBy: facilitator1._id,
        adminApproved: true,
        adminApprovedAt: '2025-02-20T10:00:00.000Z',
        adminApprovedBy: 'Mr. Seidu Mahamadu (Principal)',
        certificateId: 'CERT-SST-SST103-SST-2026-001',
        certificateIssuedAt: '2025-02-20T10:00:00.000Z',
      },
      {
        _id: 'enr_002',
        student: student1._id,
        course: activeCourse1._id,
        enrolledAt: '2025-02-05T00:00:00.000Z',
        status: 'completed',
        grade: 'A',
        score: 91,
        facilitatorSignOff: true,
        signedAt: '2025-02-24T12:00:00.000Z',
        signedBy: facilitator1._id,
        adminApproved: false,
        certificateRequested: true,
        certificateRequestedAt: '2025-02-25T08:00:00.000Z',
      },
      {
        _id: 'enr_003',
        student: student1._id,
        course: activeCourse2._id,
        enrolledAt: '2025-02-10T00:00:00.000Z',
        status: 'enrolled',
        grade: 'Pending',
        score: 88,
        facilitatorSignOff: false,
        adminApproved: false,
      },
      // Student 2 enrolled in SST 104
      {
        _id: 'enr_004',
        student: student2._id,
        course: this.courses.find(c => c.code === 'SST 104')?._id || this.courses[3]._id,
        enrolledAt: '2025-02-01T00:00:00.000Z',
        status: 'completed',
        grade: 'B',
        score: 85,
        facilitatorSignOff: true,
        signedAt: '2025-02-26T09:00:00.000Z',
        signedBy: facilitator1._id,
        adminApproved: false,
        certificateRequested: true,
        certificateRequestedAt: '2025-02-26T14:30:00.000Z',
      }
    ];

    // 5. Initial Assignments
    this.assignments = [
      {
        _id: 'asg_001',
        courseId: activeCourse1._id,
        courseCode: activeCourse1.code,
        courseTitle: activeCourse1.title,
        title: 'Project 1: Multi-Sheet Financial Pivot Table Analysis',
        description: 'Construct a clean Pivot Table with dynamic slicers and timeline filters analyzing Q1-Q4 quarterly revenue performance across 5 regional departments.',
        dueDate: '2025-03-25',
        maxScore: 100,
        createdAt: '2025-02-15T00:00:00.000Z',
      },
      {
        _id: 'asg_002',
        courseId: activeCourse2._id,
        courseCode: activeCourse2.code,
        courseTitle: activeCourse2.title,
        title: 'Milestone 1: Express REST API & Mongoose Schema Architecture',
        description: 'Design and test 4 clean Express endpoints with JWT role verification and structured Mongoose relationships.',
        dueDate: '2025-03-28',
        maxScore: 100,
        createdAt: '2025-02-18T00:00:00.000Z',
      }
    ];

    // 6. Initial Submissions
    this.submissions = [
      {
        _id: 'sub_001',
        assignmentId: 'asg_001',
        courseId: activeCourse1._id,
        studentId: student1._id,
        studentName: student1.name,
        studentIdNumber: student1.idNumber,
        submittedAt: '2025-02-22T16:20:00.000Z',
        content: 'I have completed the multi-sheet data model with calculated fields, monthly slicers, and conditional formatting on margins.',
        attachmentUrl: 'https://example.com/chinedu-q1-pivot-project.xlsx',
        score: 92,
        feedback: 'Superb data modeling! The slicers and timeline filters function smoothly. Facilitator sign-off approved.',
        gradedBy: facilitator1._id,
        gradedAt: '2025-02-24T10:15:00.000Z',
        status: 'graded',
      }
    ];

    this.isInitialized = true;
    console.log('✅ StartSmart Tech Hub Local Data Store initialized successfully with 25 courses and RBAC entities.');
  }
}

export const localStore = new LocalDataStore();

export const MONGODB_SRV_URI_TEMPLATE = 'mongodb+srv://startsmart016_db_user:<db_password>@cluster0.nejxoos.mongodb.net/?appName=Cluster0';

let nativeMongoClient: MongoClient | null = null;
let nativeMongoDb: Db | null = null;

export function getMongoClient(): MongoClient | null {
  return nativeMongoClient;
}

export function getNativeMongoDb(): Db | null {
  return nativeMongoDb;
}

let lastConnectionError: string | null = null;

export function getDatabaseStatus() {
  const rawUri = process.env.MONGODB_URI || MONGODB_SRV_URI_TEMPLATE;
  const isTemplate = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<db_password>');
  const mongooseConnected = mongoose.connection.readyState === 1;
  const nativeConnected = nativeMongoClient !== null;

  // Extract cluster and username from current URI if available
  let cluster = 'cluster0.mepvotl.mongodb.net';
  let username = 'memunatuabukari20616_db_user';
  try {
    const matchUser = rawUri.match(/mongodb\+srv:\/\/([^:]+):/);
    if (matchUser) username = matchUser[1];
    const matchCluster = rawUri.match(/@([^/?]+)/);
    if (matchCluster) cluster = matchCluster[1];
  } catch {
    // Ignore parse errors
  }

  const isConnected = mongooseConnected || nativeConnected;
  let diagnosticMessage = '';
  if (isConnected) {
    diagnosticMessage = `Connected and synchronized with MongoDB Atlas (${cluster}) database 'startsmart_lms'.`;
  } else if (isTemplate) {
    diagnosticMessage = 'Awaiting password: Set MONGODB_URI environment variable in .env or Settings.';
  } else if (lastConnectionError) {
    if (lastConnectionError.includes('SSL alert number 80') || lastConnectionError.includes('tlsv1 alert internal error')) {
      diagnosticMessage = 'Atlas Firewall Block (SSL Alert 80): In MongoDB Atlas > Network Access, click "+ Add IP Address" and select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).';
    } else if (lastConnectionError.includes('bad auth') || lastConnectionError.includes('Authentication failed')) {
      diagnosticMessage = 'Atlas Authentication Failed: Please check the database user password in MongoDB Atlas > Database Access.';
    } else {
      diagnosticMessage = `Atlas connection issue: ${lastConnectionError}. Note: Ensure 0.0.0.0/0 is enabled in Network Access.`;
    }
  } else {
    diagnosticMessage = 'Credentials configured! Note: Ensure Network Access in MongoDB Atlas has 0.0.0.0/0 enabled.';
  }

  return {
    connected: isConnected,
    mode: (mongooseConnected || nativeConnected) ? 'mongodb_atlas' : 'embedded_local_store',
    driver: 'mongodb (v6.x native driver) + mongoose (v9.x)',
    cluster,
    appName: 'Cluster0',
    username,
    hasPasswordConfigured: !isTemplate,
    connectionStringTemplate: rawUri.replace(/:([^:@]+)@/, ':<db_password>@'),
    message: diagnosticMessage,
    lastError: lastConnectionError,
  };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || MONGODB_SRV_URI_TEMPLATE;

  // If the user hasn't replaced the password placeholder yet, warn clearly and use local store
  if (uri.includes('<db_password>')) {
    console.log('ℹ️ MongoDB Driver SRV string registered: mongodb+srv://startsmart016_db_user:<db_password>@cluster0.nejxoos.mongodb.net/?appName=Cluster0');
    console.log('👉 To connect live to MongoDB Atlas, replace <db_password> with your database user password in the MONGODB_URI environment variable.');
    console.log('⚡ Operating in high-performance persistent store mode.');
    await localStore.init();
    return false;
  }

  try {
    // 1. Connect Mongoose ODM
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      appName: 'Cluster0',
      dbName: 'startsmart_lms',
    });
    console.log('✅ Connected to MongoDB Atlas via Mongoose ODM successfully.');

    // 2. Connect native MongoDB Node.js Driver client (with Stable API v1)
    try {
      nativeMongoClient = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        serverSelectionTimeoutMS: 5000,
      });
      await nativeMongoClient.connect();
      nativeMongoDb = nativeMongoClient.db('startsmart_lms');

      // Ping to confirm a successful connection
      await nativeMongoDb.command({ ping: 1 });
      console.log('✅ Pinged MongoDB deployment. Successfully connected with MongoDB native Node.js Driver!');
    } catch (nativeErr) {
      console.warn('⚠️ Native MongoClient ping notice (Mongoose is active):', nativeErr);
    }

    lastConnectionError = null;
    // Seed MongoDB Atlas if collections are empty
    await seedMongoIfEmpty();
    return true;
  } catch (error: any) {
    lastConnectionError = error?.message || String(error);
    console.warn('⚠️ MongoDB Atlas connection attempt failed or timed out. Falling back to local embedded store:', error);
    await localStore.init();
    return false;
  }
}

async function seedMongoIfEmpty() {
  try {
    const settingsCount = await InstitutionSettings.countDocuments();
    if (settingsCount === 0) {
      await localStore.init();
      await InstitutionSettings.create(localStore.settings);
      for (const u of localStore.users) {
        await User.create(u);
      }
      for (const c of localStore.courses) {
        await Course.create(c);
      }
      for (const e of localStore.enrollments) {
        await Enrollment.create(e);
      }
      for (const a of localStore.assignments) {
        await Assignment.create(a);
      }
      for (const s of localStore.submissions) {
        await Submission.create(s);
      }
      console.log('✅ MongoDB Atlas seeded with initial StartSmart catalog & settings.');
    } else {
      // Sync official seal, signature, address, admin, and facilitator in persistent Mongo record
      await InstitutionSettings.updateMany(
        {},
        {
          $set: {
            adminName: 'Mr. Seidu Mahamadu',
            principalName: 'Mr. Seidu Mahamadu',
            location: 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23',
            sealOrStampUrl: '/official-stamp.png',
            adminSignatureUrl: '/admin-signature.png',
            principalSignatureUrl: '/principal-signature.svg',
          }
        }
      );
      await User.updateMany(
        { role: 'admin' },
        {
          $set: {
            name: 'Mr. Seidu Mahamadu',
            fullName: 'Mr. Seidu Mahamadu',
            avatarUrl: 'https://i.imgur.com/J1pnjB4.png',
            signatureUrl: '/admin-signature.png',
            bio: 'Chief Executive Officer (CEO) & System Administrator at StartSmart Tech Hub.',
          }
        }
      );
      await User.updateMany(
        { role: 'facilitator' },
        {
          $set: {
            name: 'Prof. Seidu Mahamadu',
            fullName: 'Prof. Seidu Mahamadu',
            signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><path d="M15,45 Q50,15 80,30 T130,15 Q170,45 200,25" fill="none" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round"/><text x="20" y="52" font-family="cursive" font-size="14" fill="%2310b981">Prof. Seidu Mahamadu</text></svg>',
            bio: 'Professor of Computer Science & Lead Facilitator at StartSmart Tech Hub.',
          }
        }
      );
      await Course.updateMany(
        { $or: [{ facilitatorName: 'Prof Seidu Mohammed' }, { facilitatorName: { $exists: false } }] },
        {
          $set: {
            facilitatorName: 'Prof. Seidu Mahamadu',
          }
        }
      );
    }
  } catch (e) {
    console.error('Error seeding MongoDB Atlas:', e);
  }
}
