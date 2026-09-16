import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Course, Enrollment, Assignment, Submission, AdmissionLetterData } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { CertificateGenerator } from '../components/CertificateGenerator';
import { TranscriptModal } from '../components/TranscriptModal';
import { CourseSessionsViewer } from '../components/student/CourseSessionsViewer';
import { AdmissionLetter } from '../components/AdmissionLetter';
import { SmartTutorModal } from '../components/SmartTutorModal';
import {
  BookOpen,
  Award,
  FileText,
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Bell,
  Sparkles,
  Layers,
  GraduationCap,
  FolderKanban,
  FileCheck,
  Bot,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenIDCard: () => void;
  onBrowseCatalog: () => void;
  activeSubtab?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenIDCard,
  onBrowseCatalog,
  activeSubtab = 'enrolled',
}) => {
  const { user, token } = useAuth();
  const { settings } = useSettings();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Active section inside the course view: 'sessions' | 'assignments' | 'announcements' | 'resources'
  const [courseTab, setCourseTab] = useState<string>('sessions');

  useEffect(() => {
    if (activeSubtab) {
      if (activeSubtab === 'sessions' || activeSubtab === 'enrolled') {
        setCourseTab('sessions');
      } else if (activeSubtab === 'assignments') {
        setCourseTab('assignments');
      } else if (activeSubtab === 'announcements') {
        setCourseTab('announcements');
      } else if (activeSubtab === 'resources') {
        setCourseTab('resources');
      }
    }
  }, [activeSubtab]);

  // Modal states
  const [showCertificateFor, setShowCertificateFor] = useState<{ course: Course; enrollment: Enrollment } | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAdmissionLetter, setShowAdmissionLetter] = useState(false);
  const [admissionLetterData, setAdmissionLetterData] = useState<AdmissionLetterData | null>(null);
  const [submitAssignmentModal, setSubmitAssignmentModal] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionAttachment, setSubmissionAttachment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCertificatesView, setShowCertificatesView] = useState(false);
  const [certificateCourseFocus, setCertificateCourseFocus] = useState<string | undefined>(undefined);
  const [showSmartTutor, setShowSmartTutor] = useState(false);

  useEffect(() => {
    if (activeSubtab === 'certificates') {
      setShowCertificatesView(true);
    } else if (activeSubtab && activeSubtab !== 'certificates') {
      setShowCertificatesView(false);
    }
  }, [activeSubtab]);

  // Load admission letter if requested
  const handleOpenAdmissionLetter = async () => {
    if (user?.admissionLetter) {
      setAdmissionLetterData(user.admissionLetter);
      setShowAdmissionLetter(true);
      return;
    }
    try {
      const res = await fetch(`/api/admissions/letter/${user?._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAdmissionLetterData(data.letter);
      } else {
        // Fallback default structure
        setAdmissionLetterData({
          letterNumber: `SST-ADM-2026-${user?.idNumber?.split('-').pop() || '001'}`,
          issuedDate: user?.issueDate || '2025-01-10',
          programTitle: user?.programTrack || `Level ${user?.programLevel || 100} Digital Foundation Track`,
          programLevel: user?.programLevel || 100,
          studentId: user?.idNumber || 'SST-2026-001',
          studentName: user?.fullName || user?.name || 'Enrolled Scholar',
          studentEmail: user?.email || '',
          studentPhone: user?.phone || '+234 800 000 0000',
          tempPassword: '••••••••',
          tempPin: '•••••',
          portalUrl: 'https://portal.startsmart.tech',
          approvedBy: 'Admissions Board & Academic Affairs',
        });
      }
    } catch {
      setAdmissionLetterData({
        letterNumber: `SST-ADM-2026-${user?.idNumber?.split('-').pop() || '001'}`,
        issuedDate: user?.issueDate || '2025-01-10',
        programTitle: user?.programTrack || `Level ${user?.programLevel || 100} Track`,
        programLevel: user?.programLevel || 100,
        studentId: user?.idNumber || 'SST-2026-001',
        studentName: user?.fullName || user?.name || 'Enrolled Scholar',
        studentEmail: user?.email || '',
        studentPhone: user?.phone || '+234 800 000 0000',
        tempPassword: '••••••••',
        tempPin: '•••••',
        portalUrl: 'https://portal.startsmart.tech',
        approvedBy: 'Admissions Board & Academic Affairs',
      });
    }
    setShowAdmissionLetter(true);
  };

  useEffect(() => {
    if (activeSubtab === 'admission-letter') {
      handleOpenAdmissionLetter();
    }
  }, [activeSubtab]);

  // Load student enrollments
  const loadStudentData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/enrollments/student/${user._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
        if (data.length > 0 && !selectedCourse) {
          const firstCourse = data[0].course;
          setSelectedCourse(firstCourse);
          setActiveEnrollment(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load student enrollments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [user]);

  // Load course-specific materials, assignments & submissions & fresh course sessions
  const loadCourseContext = async (courseId: string) => {
    if (!user) return;
    try {
      const [crsRes, asgRes, subRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/assignments/course/${courseId}`),
        fetch(`/api/submissions/student/${user._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (crsRes.ok) {
        const freshCourse = await crsRes.json();
        setSelectedCourse(freshCourse);
      }
      if (asgRes.ok) setAssignments(await asgRes.json());
      if (subRes.ok) setSubmissions(await subRes.json());
    } catch (e) {
      console.error('Failed to load course details:', e);
    }
  };

  useEffect(() => {
    if (selectedCourse?._id) {
      loadCourseContext(selectedCourse._id);
    }
  }, [selectedCourse?._id]);

  // Submit assignment
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitAssignmentModal || !selectedCourse || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          assignment: submitAssignmentModal._id,
          course: selectedCourse._id,
          content: submissionContent,
          attachmentUrl: submissionAttachment,
        }),
      });

      if (res.ok) {
        setSubmitAssignmentModal(null);
        setSubmissionContent('');
        setSubmissionAttachment('');
        if (selectedCourse) loadCourseContext(selectedCourse._id);
      }
    } catch (e) {
      console.error('Failed to submit assignment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const completedEnrollments = enrollments.filter(e => e.status === 'completed');

  return (
    <div className="space-y-6 pb-20">
      {/* Student Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900 p-5 rounded-3xl border border-blue-200/80 dark:border-sky-500/20 shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
              Student Portal
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-mono font-bold">ID: {user?.idNumber}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {user?.department || 'School of Technology'} • {enrollments.length} Active Courses
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowSmartTutor(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SmartTutor AI</span>
          </button>
          <button
            onClick={() => {
              setCertificateCourseFocus(undefined);
              setShowCertificatesView(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Certificates ({completedEnrollments.length})</span>
          </button>
          <button
            onClick={handleOpenAdmissionLetter}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-sky-950 dark:hover:bg-sky-900 border border-slate-200 dark:border-sky-800 text-xs font-semibold text-slate-700 dark:text-sky-300 transition cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Admission Letter</span>
          </button>
          <button
            onClick={() => setShowTranscript(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Official Transcript</span>
          </button>
          <button
            onClick={onOpenIDCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Digital ID</span>
          </button>
        </div>
      </div>

      {/* Certificate View or Enrolled Programs Dashboard */}
      {showCertificatesView || activeSubtab === 'certificates' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCertificatesView(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Course Dashboard</span>
            </button>
          </div>

          <CertificateGenerator
            student={user!}
            enrollments={enrollments}
            onRefreshEnrollments={loadStudentData}
            initialCourseId={certificateCourseFocus || selectedCourse?._id}
            token={token}
          />
        </div>
      ) : (
        <>
          {/* Course Navigation Tabs (Enrolled vs Completed) */}
          <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Your Enrolled Programs ({enrollments.length})
          </h3>
          <button
            onClick={onBrowseCatalog}
            className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All 25 Courses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs transition-colors">
            <GraduationCap className="w-10 h-10 text-blue-600 dark:text-sky-400 mx-auto opacity-80" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No courses enrolled yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Explore the StartSmart 100–400 level catalog to enroll in tech tracks and bootcamps.
            </p>
            <button
              onClick={onBrowseCatalog}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow transition cursor-pointer"
            >
              Browse Course Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrollments.map(enr => {
              const course: any = enr.course;
              const isSelected = selectedCourse?._id === course?._id;
              const isCompleted = enr.status === 'completed';

              return (
                <div
                  key={enr._id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setActiveEnrollment(enr);
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-slate-800 border-blue-500 dark:border-sky-500/60 shadow-md ring-1 ring-blue-500/40 dark:ring-sky-500/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-sky-500/20">
                      {course?.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] line-clamp-1">
                    {course?.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{course?.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Level {course?.level} • {course?.credits || 3} Credits</span>
                    {isCompleted && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Grade: {enr.grade || 'A'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Course Classroom View */}
      {selectedCourse && (
        <div className="space-y-6">
          {/* Active Course Banner */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">{selectedCourse.code}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Level {selectedCourse.level} Program</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{selectedCourse.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{selectedCourse.description}</p>
              </div>

              {/* Certificate Download or Request Action */}
              {activeEnrollment && (
                <button
                  type="button"
                  onClick={() => {
                    setCertificateCourseFocus(selectedCourse._id);
                    setShowCertificatesView(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 shrink-0 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {activeEnrollment.status === 'completed'
                      ? 'Official Signed Certificate'
                      : 'Request Course Certificate'}
                  </span>
                </button>
              )}
            </div>

            {/* Course Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Lead Facilitator</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">
                  {selectedCourse.facilitatorName || 'Engr. Sarah Jenkins'}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Track Category</span>
                <span className="font-semibold text-blue-600 dark:text-sky-300">{selectedCourse.category}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Credits & Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedCourse.credits || 3} Credits ({selectedCourse.durationWeeks || 8} Weeks)
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Your Current Score</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {activeEnrollment?.score ? `${activeEnrollment.score}% (${activeEnrollment.grade})` : 'In Progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Course Navigation Tabs for Active Course Tools */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setCourseTab('sessions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                courseTab === 'sessions'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Course Sessions & Materials</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-slate-950/50">
                {selectedCourse.sessions?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setCourseTab('assignments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                courseTab === 'assignments'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Assignments & Labs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-slate-950/50">
                {assignments.length}
              </span>
            </button>

            <button
              onClick={() => setCourseTab('announcements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                courseTab === 'announcements'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Announcements</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-slate-950/50">
                {selectedCourse.announcements?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setCourseTab('resources')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                courseTab === 'resources'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>General Resources</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-slate-950/50">
                {selectedCourse.materials?.length || 0}
              </span>
            </button>
          </div>

          {/* TAB 1: SESSIONS & DETAILED MODULES */}
          {courseTab === 'sessions' && (
            <CourseSessionsViewer course={selectedCourse} />
          )}

          {/* TAB 2: ASSIGNMENTS & LABS */}
          {courseTab === 'assignments' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Course Tasks, Labs & Assessments ({assignments.length})
                  </h4>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Due before cohort completion</span>
              </div>

              {assignments.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No assignments pending for this course.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map(asg => {
                    const submission = submissions.find(s => s.assignmentId === asg._id || s.assignment === asg._id);
                    const isSubmitted = !!submission;
                    const isGraded = submission?.status === 'graded';

                    return (
                      <div
                        key={asg._id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">{asg.title}</h5>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{asg.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Due: {asg.dueDate}</span>
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">Max: {asg.maxScore} pts</span>
                          </div>
                        </div>

                        {/* Submission Status or Trigger Button */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                          {isGraded ? (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Graded: {submission?.score} / {asg.maxScore}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                                "{submission?.feedback}"
                              </span>
                            </div>
                          ) : isSubmitted ? (
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Submitted — Awaiting Facilitator Review
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">Pending submission</span>
                          )}

                          <button
                            onClick={() => setSubmitAssignmentModal(asg)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                              isSubmitted
                                ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'
                            }`}
                          >
                            {isSubmitted ? 'Resubmit Solution' : 'Submit Assignment'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENTS */}
          {courseTab === 'announcements' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">Instructor Announcements ({selectedCourse.announcements?.length || 0})</h4>
              </div>

              {!selectedCourse.announcements || selectedCourse.announcements.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No announcements posted yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedCourse.announcements.map((ann, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">{ann.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{ann.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GENERAL RESOURCES */}
          {courseTab === 'resources' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <FolderKanban className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">General Resources & Downloads ({selectedCourse.materials?.length || 0})</h4>
              </div>

              {!selectedCourse.materials || selectedCourse.materials.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No general resources uploaded yet. Check Course Sessions for session-specific files.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCourse.materials.map((mat, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{mat.title}</p>
                        <span className="text-[10px] text-blue-600 dark:text-sky-400 font-mono uppercase tracking-wider">{mat.type}</span>
                      </div>
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-transparent text-xs flex items-center gap-1 transition shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Access</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit Assignment Modal */}
      {submitAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Submit Task: {submitAssignmentModal.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">{submitAssignmentModal.description}</p>

            <form onSubmit={handleSubmitAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Code / Solution Text
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionContent}
                  onChange={e => setSubmissionContent(e.target.value)}
                  placeholder="Paste code explanation, architecture summary, or repo notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Artifact Link / GitHub Repo / File URL
                </label>
                <input
                  type="text"
                  value={submissionAttachment}
                  onChange={e => setSubmissionAttachment(e.target.value)}
                  placeholder="https://github.com/your-username/startsmart-lab"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitAssignmentModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Turn In Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* Certificate Modal */}
      {showCertificateFor && user && (
        <CertificateModal
          course={showCertificateFor.course}
          student={user}
          enrollment={showCertificateFor.enrollment}
          onClose={() => setShowCertificateFor(null)}
        />
      )}

      {/* Official Transcript Modal */}
      {showTranscript && user && (
        <TranscriptModal
          student={user}
          enrollments={enrollments}
          onClose={() => setShowTranscript(false)}
        />
      )}

      {/* Official Admission Letter Modal */}
      {showAdmissionLetter && admissionLetterData && settings && (
        <AdmissionLetter
          letterData={admissionLetterData}
          settings={settings}
          student={user || undefined}
          onClose={() => setShowAdmissionLetter(false)}
          isAdminView={false}
        />
      )}

      {/* SmartTutor AI Modal */}
      <SmartTutorModal
        isOpen={showSmartTutor}
        onClose={() => setShowSmartTutor(false)}
        selectedCourse={selectedCourse}
        studentName={user?.name}
      />
    </div>
  );
};

export default StudentDashboard;
