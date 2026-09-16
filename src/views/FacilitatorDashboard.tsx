import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Course, Assignment, Submission, Enrollment } from '../types';
import { CourseSessionsManager } from '../components/facilitator/CourseSessionsManager';
import {
  BookOpen,
  Bell,
  Upload,
  CheckCircle,
  FileCheck,
  Award,
  Plus,
  Calendar,
  MessageSquare,
  FileText,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Layers,
  FolderKanban,
  Clock,
} from 'lucide-react';

interface FacilitatorDashboardProps {
  onOpenIDCard: () => void;
  activeSubtab?: string;
  currentSiteId?: string;
}

export const FacilitatorDashboard: React.FC<FacilitatorDashboardProps> = ({
  onOpenIDCard,
  activeSubtab = 'sessions',
  currentSiteId,
}) => {
  const { user, token } = useAuth();
  const { settings } = useSettings();

  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Active section inside the course view: 'sessions' | 'submissions' | 'cohort' | 'announcements' | 'materials'
  const [courseViewTab, setCourseViewTab] = useState<string>('sessions');

  useEffect(() => {
    if (activeSubtab) {
      if (activeSubtab === 'sessions' || activeSubtab === 'my-courses') {
        setCourseViewTab('sessions');
      } else if (activeSubtab === 'assignments') {
        setCourseViewTab('submissions');
      } else if (activeSubtab === 'gradebook' || activeSubtab === 'certificates' || activeSubtab === 'roster') {
        setCourseViewTab('cohort');
      } else if (activeSubtab === 'announcements') {
        setCourseViewTab('announcements');
      } else if (activeSubtab === 'materials') {
        setCourseViewTab('materials');
      }
    }
  }, [activeSubtab]);

  // Synchronize selected course with top portal site selector if active
  useEffect(() => {
    if (currentSiteId && currentSiteId !== 'workspace' && assignedCourses.length > 0) {
      const cleanSite = currentSiteId.toLowerCase().replace(/\s+/g, '');
      const matched = assignedCourses.find(
        c => c.code.toLowerCase().replace(/\s+/g, '') === cleanSite || c._id === currentSiteId
      );
      if (matched) {
        setSelectedCourse(matched);
      }
    }
  }, [currentSiteId, assignedCourses]);

  // Modal forms
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'pdf' | 'video' | 'link' | 'worksheet'>('pdf');
  const [materialUrl, setMaterialUrl] = useState('');

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentMaxScore, setAssignmentMaxScore] = useState(100);

  // Grading state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(90);
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Load assigned courses
  const loadFacilitatorData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/facilitator/${user._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const courses = await res.json();
        setAssignedCourses(courses);
        if (courses.length > 0 && !selectedCourse) {
          setSelectedCourse(courses[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load facilitator courses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilitatorData();
  }, [user]);

  // Load course-specific details (enrollments, assignments, submissions, and fresh course object)
  const loadCourseDetails = async (courseId: string) => {
    try {
      const [crsRes, enrRes, asgRes, subRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/enrollments/course/${courseId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(`/api/assignments/course/${courseId}`),
        fetch(`/api/submissions/course/${courseId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (crsRes.ok) {
        const fresh = await crsRes.json();
        setSelectedCourse(fresh);
        setAssignedCourses(prev => prev.map(c => c._id === fresh._id ? fresh : c));
      }
      if (enrRes.ok) setEnrollments(await enrRes.json());
      if (asgRes.ok) setAssignments(await asgRes.json());
      if (subRes.ok) setSubmissions(await subRes.json());
    } catch (e) {
      console.error('Failed to load course details:', e);
    }
  };

  useEffect(() => {
    if (selectedCourse?._id) {
      loadCourseDetails(selectedCourse._id);
    }
  }, [selectedCourse?._id]);

  const handleCourseUpdated = (updated: Course) => {
    setSelectedCourse(updated);
    setAssignedCourses(prev => prev.map(c => c._id === updated._id ? updated : c));
  };

  // Post Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse._id}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMessage,
        }),
      });
      if (res.ok) {
        const updatedCourse = await res.json();
        setSelectedCourse(updatedCourse);
        setShowAnnouncementModal(false);
        setAnnouncementTitle('');
        setAnnouncementMessage('');
      }
    } catch (e) {
      console.error('Error posting announcement:', e);
    }
  };

  // Upload Material
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse._id}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: materialTitle,
          type: materialType,
          url: materialUrl || 'https://startsmart.tech/resources/guide.pdf',
        }),
      });
      if (res.ok) {
        const updatedCourse = await res.json();
        setSelectedCourse(updatedCourse);
        setShowMaterialModal(false);
        setMaterialTitle('');
        setMaterialUrl('');
      }
    } catch (e) {
      console.error('Error uploading material:', e);
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          course: selectedCourse._id,
          title: assignmentTitle,
          description: assignmentDesc,
          dueDate: assignmentDueDate || '2025-05-30',
          maxScore: assignmentMaxScore,
        }),
      });
      if (res.ok) {
        setShowAssignmentModal(false);
        setAssignmentTitle('');
        setAssignmentDesc('');
        if (selectedCourse) loadCourseDetails(selectedCourse._id);
      }
    } catch (e) {
      console.error('Error creating assignment:', e);
    }
  };

  // Grade Submission
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setSubmittingGrade(true);
    try {
      const res = await fetch(`/api/submissions/${selectedSubmission._id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          score: gradingScore,
          feedback: gradingFeedback,
        }),
      });
      if (res.ok) {
        setSelectedSubmission(null);
        if (selectedCourse) loadCourseDetails(selectedCourse._id);
      }
    } catch (e) {
      console.error('Error grading submission:', e);
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Official Facilitator Sign-Off on Student Grade
  const handleSignOff = async (enrollmentId: string, score: number, grade: string) => {
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/sign-off`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ score, grade }),
      });
      if (res.ok) {
        if (selectedCourse) loadCourseDetails(selectedCourse._id);
      }
    } catch (e) {
      console.error('Sign-off error:', e);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-5 rounded-3xl border border-emerald-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Facilitator Workspace
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {user?.idNumber}</span>
          </div>
          <h2 className="text-xl font-black text-white font-['Outfit']">
            Instructor Portal: {user?.name}
          </h2>
          <p className="text-xs text-slate-400">
            Assigned strictly to your course cohort. Manage materials, grade assessments, and execute official sign-offs.
          </p>
        </div>

        <button
          onClick={onOpenIDCard}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95 self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>My Facilitator ID</span>
        </button>
      </div>

      {/* Assigned Courses Selector */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Your Assigned Courses ({assignedCourses.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {assignedCourses.map(c => {
            const isSelected = selectedCourse?._id === c._id;
            return (
              <div
                key={c._id}
                onClick={() => setSelectedCourse(c)}
                className={`p-4 rounded-2xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Level {c.level}</span>
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] line-clamp-1">{c.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{c.materials?.length || 0} Materials</span>
                  <span>{c.announcements?.length || 0} Announcements</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCourse && (
        <div className="space-y-6">
          {/* Action Hub & Course Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-black text-white font-['Outfit']">
                {selectedCourse.code}: {selectedCourse.title}
              </h3>
              <p className="text-xs text-emerald-400 font-medium">{selectedCourse.category} • Level {selectedCourse.level}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCourseViewTab('sessions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  courseViewTab === 'sessions'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sessions & Curriculum</span>
              </button>
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Post Announcement</span>
              </button>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Upload General File</span>
              </button>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task / Quiz</span>
              </button>
            </div>
          </div>

          {/* Course Navigation Tabs for Active Course Tools */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-800 pb-2">
            <button
              onClick={() => setCourseViewTab('sessions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                courseViewTab === 'sessions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Course Sessions & Materials</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50">
                {selectedCourse.sessions?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setCourseViewTab('submissions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                courseViewTab === 'submissions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Student Submissions</span>
              {submissions.filter(s => s.status === 'submitted').length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                  {submissions.filter(s => s.status === 'submitted').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCourseViewTab('cohort')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                courseViewTab === 'cohort'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Cohort & Sign-Off</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50">
                {enrollments.length}
              </span>
            </button>

            <button
              onClick={() => setCourseViewTab('announcements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                courseViewTab === 'announcements'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Announcements</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50">
                {selectedCourse.announcements?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setCourseViewTab('materials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                courseViewTab === 'materials'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>General Files</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50">
                {selectedCourse.materials?.length || 0}
              </span>
            </button>
          </div>

          {/* TAB 1: SESSIONS & COURSE DESCRIPTION & MATERIALS */}
          {courseViewTab === 'sessions' && (
            <CourseSessionsManager
              course={selectedCourse}
              token={token}
              onCourseUpdated={handleCourseUpdated}
            />
          )}

          {/* TAB 2: Submissions to Grade */}
          {courseViewTab === 'submissions' && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Student Submissions ({submissions.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {submissions.filter(s => s.status === 'submitted').length} pending grading
              </span>
            </div>

            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No student submissions yet for this course.</p>
            ) : (
              <div className="space-y-2.5">
                {submissions.map(sub => (
                  <div
                    key={sub._id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-['Outfit']">{sub.studentName}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold">{sub.studentIdNumber}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            sub.status === 'graded'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{sub.content}</p>
                      {sub.attachmentUrl && (
                        <a
                          href={sub.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Submitted Code / Artifact
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sub.status === 'graded' && (
                        <div className="text-right mr-2">
                          <span className="text-xs font-mono font-bold text-emerald-400">{sub.score} / 100</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                            {sub.feedback}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setGradingScore(sub.score || 90);
                          setGradingFeedback(sub.feedback || 'Well structured and tested code solution!');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
                      >
                        {sub.status === 'graded' ? 'Edit Grade' : 'Grade Task'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {/* TAB 3: Student Cohort & Official Facilitator Sign-Off */}
          {courseViewTab === 'cohort' && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Student Cohort & Official Facilitator Sign-Off ({enrollments.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Sign-off applies your instructor signature to official certificates
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Final Score</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Facilitator Endorsement</th>
                      <th className="py-2.5 px-3">Admin Certificate Approval</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {enrollments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No students enrolled in this course yet.
                        </td>
                      </tr>
                    ) : (
                      enrollments.map(enr => {
                        const studentObj: any = enr.student || {};
                        return (
                          <tr key={enr._id} className="hover:bg-slate-800/50">
                            <td className="py-3 px-4">
                              <p className="font-bold text-white text-xs">{studentObj.name || 'Student'}</p>
                              <p className="text-[10px] text-amber-400 font-mono">{studentObj.idNumber}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className="capitalize text-slate-300">{enr.status}</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                              {enr.score ? `${enr.score}%` : 'Pending'}
                            </td>
                            <td className="py-3 px-3 font-bold text-emerald-400">{enr.grade || '—'}</td>
                            <td className="py-3 px-3">
                              {enr.facilitatorSignOff ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Signed Off by You
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-400">Needs Endorsement</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {enr.adminApproved ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Approved by Admin
                                </span>
                              ) : enr.certificateRequested ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                  <Clock className="w-3 h-3 text-amber-400" /> Pending Admin Approval
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Course In-Progress</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {!enr.facilitatorSignOff ? (
                                <button
                                  onClick={() => handleSignOff(enr._id, 94, 'A')}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white shadow-sm transition active:scale-95"
                                >
                                  Sign Off & Award (A)
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-mono">Endorsed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: Course Announcements */}
          {courseViewTab === 'announcements' && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Course Announcements ({selectedCourse.announcements?.length || 0})
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition"
                >
                  + Post New Announcement
                </button>
              </div>

              {(!selectedCourse.announcements || selectedCourse.announcements.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No announcements posted yet. Keep students informed of schedule adjustments or reminders.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedCourse.announcements.map((ann: any, aIdx: number) => (
                    <div
                      key={ann.id || aIdx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {ann.date ? new Date(ann.date).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 5: General Files & Materials */}
          {courseViewTab === 'materials' && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    General Course Files & Resources ({selectedCourse.materials?.length || 0})
                  </h3>
                </div>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition"
                >
                  + Upload General File
                </button>
              </div>

              {(!selectedCourse.materials || selectedCourse.materials.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No general files uploaded. You can also organize materials directly under Course Sessions!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCourse.materials.map((mat: any, mIdx: number) => (
                    <div
                      key={mat.id || mIdx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{mat.title}</p>
                        <span className="text-[10px] text-sky-400 uppercase font-mono font-semibold">
                          {mat.type}
                        </span>
                      </div>
                      <a
                        href={mat.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-200"
                      >
                        Access
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Grade Submission Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Grade Student Assessment</h3>
            <p className="text-xs text-slate-300">
              Student: <strong className="text-white">{selectedSubmission.studentName}</strong> ({selectedSubmission.studentIdNumber})
            </p>

            <form onSubmit={handleGradeSubmission} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Score (0 - 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gradingScore}
                  onChange={e => setGradingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback & Recommendations</label>
                <textarea
                  rows={3}
                  value={gradingFeedback}
                  onChange={e => setGradingFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition"
                >
                  {submittingGrade ? 'Saving...' : 'Submit Final Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Post Course Announcement</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Headline</label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Lab 4 Code Review Session scheduled"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={announcementMessage}
                  onChange={e => setAnnouncementMessage(e.target.value)}
                  placeholder="Provide instructions or zoom links..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-lg transition"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Upload Course Resource</h3>
            <form onSubmit={handleUploadMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  value={materialTitle}
                  onChange={e => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Week 3 Architecture Diagram"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={materialType}
                    onChange={e => setMaterialType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video Lecture</option>
                    <option value="link">Resource Link</option>
                    <option value="worksheet">Worksheet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL / File Path</label>
                  <input
                    type="text"
                    value={materialUrl}
                    onChange={e => setMaterialUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-lg transition"
                >
                  Attach Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Create New Assignment / Quiz</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={assignmentTitle}
                  onChange={e => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Build REST API with JWT Auth"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={assignmentDesc}
                  onChange={e => setAssignmentDesc(e.target.value)}
                  placeholder="Task instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={assignmentDueDate}
                    onChange={e => setAssignmentDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Score</label>
                  <input
                    type="number"
                    value={assignmentMaxScore}
                    onChange={e => setAssignmentMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitatorDashboard;
