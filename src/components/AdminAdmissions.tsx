import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { User, AdmissionLetterData } from '../types';
import { AdmissionLetter } from './AdmissionLetter';
import { safeParseResponse } from '../utils/apiClient';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Key,
  Printer,
  Copy,
  Mail,
  FileText,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';

export interface AdminAdmissionsProps {
  onApproved?: () => void;
}

export const AdminAdmissions: React.FC<AdminAdmissionsProps> = ({ onApproved }) => {
  const { token } = useAuth();
  const { settings } = useSettings();

  const [applicants, setApplicants] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  // Approval action in progress
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Active Admission Letter Modal for viewing / printing
  const [selectedLetter, setSelectedLetter] = useState<{
    letterData: AdmissionLetterData;
    student: User;
  } | null>(null);

  // Load pending applicants and full directory
  const loadAdmissionsData = async () => {
    setLoading(true);
    setActionErrorMsg(null);
    try {
      const authHeaders: Record<string, string> = {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [pendingRes, usersRes] = await Promise.all([
        fetch('/api/admin/pending-students', { headers: authHeaders }),
        fetch('/api/users', { headers: authHeaders }),
      ]);

      const parseJsonSafe = async (res: Response) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            return await res.json();
          } catch {
            return null;
          }
        }
        return null;
      };

      const [pendingData, usersData] = await Promise.all([
        parseJsonSafe(pendingRes),
        parseJsonSafe(usersRes),
      ]);

      if (pendingData && Array.isArray(pendingData.applicants)) {
        setApplicants(pendingData.applicants);
      }
      if (Array.isArray(usersData)) {
        setAllUsers(usersData);
      }
    } catch (err: any) {
      console.error('Failed to load admissions:', err);
      setActionErrorMsg('Failed to sync admissions queue from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissionsData();
  }, [token]);

  // Approve student: Calls backend auto-generation for Student ID, 8-char password & 5-digit PIN
  const handleApproveStudent = async (applicant: User) => {
    setApprovingId(applicant._id);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/approve-student/${applicant._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const parsed = await safeParseResponse(res, { success: false });
      const data = parsed.data as any;
      if (res.ok && data?.success) {
        setActionSuccessMsg(
          `Success: ${applicant.fullName || applicant.name} approved! Assigned ID: ${data.credentials?.idNumber}.`
        );

        // Open official Admission Letter modal with generated credentials
        if (data.admissionLetter) {
          setSelectedLetter({
            letterData: data.admissionLetter,
            student: data.student,
          });
        }

        // Refresh data lists
        loadAdmissionsData();
        onApproved?.();
      } else {
        setActionErrorMsg(data?.error || parsed.error || 'Failed to approve applicant.');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Network error while approving student.');
    } finally {
      setApprovingId(null);
    }
  };

  // Reject student applicant
  const handleRejectStudent = async (applicantId: string) => {
    if (!window.confirm('Are you sure you want to reject this applicant?')) return;

    setRejectingId(applicantId);
    setActionErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/reject-student/${applicantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setApplicants((prev) => prev.filter((a) => a._id !== applicantId));
        setActionSuccessMsg('Applicant rejected and archived.');
        setTimeout(() => setActionSuccessMsg(null), 3000);
      } else {
        const parsed = await safeParseResponse(res, {});
        const errData = parsed.data as any;
        setActionErrorMsg(errData?.error || parsed.error || 'Failed to reject applicant.');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Network communication error.');
    } finally {
      setRejectingId(null);
    }
  };

  // View existing student's admission letter
  const handleViewStudentLetter = async (student: User) => {
    try {
      const res = await fetch(`/api/admissions/letter/${student._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const parsed = await safeParseResponse(res, {});
        const data = parsed.data as any;
        setSelectedLetter({
          letterData: data?.letter,
          student: data?.student || student,
        });
      } else {
        // Fallback synthesised letter
        setSelectedLetter({
          letterData: {
            letterNumber: `SST-ADM-2026-${student.idNumber.split('-').pop() || '001'}`,
            issuedDate: student.issueDate || '2025-01-10',
            programTitle: student.programTrack || `Level ${student.programLevel || 100} Technology Track`,
            programLevel: student.programLevel || 100,
            studentId: student.idNumber,
            studentName: student.fullName || student.name,
            studentEmail: student.email,
            studentPhone: student.phone,
            tempPassword: '••••••••',
            tempPin: '•••••',
            portalUrl: 'https://portal.startsmart.tech',
            approvedAt: student.createdAt,
            approvedBy: 'Academic Admissions Board',
          },
          student,
        });
      }
    } catch (e) {
      console.error('Failed to fetch letter:', e);
    }
  };

  const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];
  const safeApplicants = Array.isArray(applicants) ? applicants : [];

  const approvedStudents = safeAllUsers.filter(
    (u) => u && u.role === 'student' && u.status === 'active'
  );

  const filterList = (list: User[]) => {
    if (!Array.isArray(list)) return [];
    return list.filter((user) => {
      if (!user) return false;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        (user.fullName || user.name || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q) ||
        (user.idNumber || '').toLowerCase().includes(q) ||
        (user.phone || '').toLowerCase().includes(q);

      const matchLevel =
        levelFilter === 'all' ||
        Number(user.programLevel) === Number(levelFilter);

      return matchQuery && matchLevel;
    });
  };

  const filteredPending = filterList(safeApplicants);
  const filteredApproved = filterList(approvedStudents);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-sky-500/20 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <span>Admissions & Credential Generation</span>
                {applicants.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-mono font-bold">
                    {applicants.length} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review candidate registrations, generate official Student IDs & dual-factor credentials, and issue verified Admission Letters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdmissionsData}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent transition cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Statistical Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Pending Review</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Outfit'] mt-0.5">
              {applicants.length}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Awaiting approval</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Active Students</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-0.5">
              {approvedStudents.length}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Credentials issued</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Level 100/200</span>
            <div className="text-2xl font-black text-blue-600 dark:text-sky-400 font-['Outfit'] mt-0.5">
              {safeAllUsers.filter((u) => u && (u.programLevel === 100 || u.programLevel === 200)).length}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Foundation & Interm.</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Level 300/400</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-['Outfit'] mt-0.5">
              {safeAllUsers.filter((u) => u && (u.programLevel === 300 || u.programLevel === 400)).length}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Advanced Tracks</span>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-80">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-rose-600 dark:text-rose-400 hover:opacity-80">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Admissions Work Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs transition-colors">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Applicants ({applicants.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'approved'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved Students ({approvedStudents.length})</span>
            </button>
          </div>

          {/* Search and Level Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, email, phone..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition w-56 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1">
              <Filter className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Levels</option>
                <option value="100" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Level 100</option>
                <option value="200" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Level 200</option>
                <option value="300" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Level 300</option>
                <option value="400" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Level 400</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 1: PENDING APPLICANTS QUEUE */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {filteredPending.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  No Pending Applicants in Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All candidate registrations have been reviewed. New public admissions through the registration form will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredPending.map((applicant) => {
                  const isApproving = approvingId === applicant._id;
                  const isRejecting = rejectingId === applicant._id;

                  return (
                    <div
                      key={applicant._id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Applicant Avatar & Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <img
                          src={applicant.avatarUrl || 'https://i.imgur.com/J1pnjB4.png'}
                          alt={applicant.fullName || applicant.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                          }}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                              {applicant.fullName || applicant.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                              Pending Review
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                              Level {applicant.programLevel || 100}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>Email: <span className="font-mono text-slate-700 dark:text-slate-300">{applicant.email}</span></span>
                            <span>•</span>
                            <span>Phone: <span className="text-slate-700 dark:text-slate-300">{applicant.phone || 'N/A'}</span></span>
                            <span>•</span>
                            <span>Curriculum: <span className="text-blue-600 dark:text-sky-300 font-semibold">{applicant.programTrack || 'Technology Foundation'}</span></span>
                          </div>

                          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>Submitted on: {new Date(applicant.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRejectStudent(applicant._id)}
                          disabled={isRejecting || isApproving}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 hover:border-rose-300 dark:hover:border-rose-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApproveStudent(applicant)}
                          disabled={isApproving || isRejecting}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                        >
                          {isApproving ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Generating Credentials...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Approve & Issue Credentials</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE & APPROVED STUDENTS */}
        {activeTab === 'approved' && (
          <div className="space-y-3">
            {filteredApproved.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6">
                <p className="text-xs text-slate-500 dark:text-slate-400">No approved students matching the filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredApproved.map((student) => (
                  <div
                    key={student._id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl}
                        alt={student.fullName || student.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                            {student.fullName || student.name}
                          </h4>
                          <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-sky-400 bg-blue-50 dark:bg-sky-950/80 border border-blue-200 dark:border-sky-800/60 px-1.5 py-0.5 rounded">
                            {student.idNumber}
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 pt-0.5">
                          <span>{student.email}</span>
                          <span>•</span>
                          <span>Level {student.programLevel || 100}</span>
                          <span>•</span>
                          <span>{student.department || 'School of Technology'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleViewStudentLetter(student)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-sky-950 dark:hover:bg-sky-900 border border-blue-200 dark:border-sky-800 text-blue-700 dark:text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Admission Letter</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADMISSION LETTER MODAL */}
      {selectedLetter && (
        <AdmissionLetter
          letterData={selectedLetter.letterData}
          settings={settings}
          student={selectedLetter.student}
          onClose={() => setSelectedLetter(null)}
          isAdminView={true}
        />
      )}
    </div>
  );
};
