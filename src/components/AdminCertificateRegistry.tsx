import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileCheck,
  User,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Printer,
  Download,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { CertificateGenerator } from './CertificateGenerator';

interface AdminCertificateRegistryProps {
  onRefreshStats?: () => void;
}

export const AdminCertificateRegistry: React.FC<AdminCertificateRegistryProps> = ({
  onRefreshStats,
}) => {
  const { token, user: currentUser } = useAuth();
  const { settings } = useSettings();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'in_progress'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview Certificate Modal state
  const [previewEnrollment, setPreviewEnrollment] = useState<any | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const authToken = token || localStorage.getItem('token') || '';
      const res = await fetch('/api/certificates/admin-registry', {
        headers: {
          Accept: 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve academic registry records.');
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned an invalid format for academic registry records.');
      }

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.enrollments)
        ? data.enrollments
        : Array.isArray(data?.records)
        ? data.records
        : [];
      setRecords(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading certificate registry.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  // Admin approves certificate
  const handleApprove = async (enrollmentId: string) => {
    setApprovingId(enrollmentId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const authToken = token || localStorage.getItem('token') || '';
      const adminName = settings.adminName || currentUser?.fullName || currentUser?.name || 'Mr. Seidu Mahamadu';
      const adminSignatureUrl = settings.adminSignatureUrl || currentUser?.signatureUrl || '';

      const res = await fetch(`/api/certificates/admin-approve/${enrollmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          adminName,
          adminSignatureUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to approve certificate.');
      }

      const data = await res.json();
      setSuccessMsg(
        `Certificate officially approved and signed by ${adminName}! Credential ID: ${data.enrollment?.certificateId || 'Generated'}.`
      );

      // Refresh registry
      await fetchRegistry();
      if (onRefreshStats) {
        onRefreshStats();
      }

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing certificate approval.');
    } finally {
      setApprovingId(null);
    }
  };

  // Safe array of records
  const safeRecords = Array.isArray(records) ? records : [];

  // Filtered records
  const filteredRecords = safeRecords.filter(rec => {
    // Status filter
    if (statusFilter === 'pending') {
      if (rec.adminApproved || !rec.certificateRequested) return false;
    } else if (statusFilter === 'approved') {
      if (!rec.adminApproved) return false;
    } else if (statusFilter === 'in_progress') {
      if (rec.adminApproved || rec.certificateRequested) return false;
    }

    // Search term
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const studentName = (rec.student?.name || '').toLowerCase();
    const studentId = (rec.student?.idNumber || '').toLowerCase();
    const courseCode = (rec.course?.code || '').toLowerCase();
    const courseTitle = (rec.course?.title || '').toLowerCase();
    const certId = (rec.certificateId || '').toLowerCase();

    return (
      studentName.includes(term) ||
      studentId.includes(term) ||
      courseCode.includes(term) ||
      courseTitle.includes(term) ||
      certId.includes(term)
    );
  });

  // Calculate metrics
  const totalCount = safeRecords.length;
  const pendingCount = safeRecords.filter(r => r.certificateRequested && !r.adminApproved).length;
  const approvedCount = safeRecords.filter(r => r.adminApproved).length;
  const completedRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            Official Certificate Approvals & Institutional Registry
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Formal administrative review and digital seal sign-off. Certificates require Admin verification before issuance to students and registry release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRegistry}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Refresh certificate registry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition-colors">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Total Candidates</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {totalCount}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">All registered enrollments</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-amber-300 dark:border-amber-500/40 space-y-1 shadow-xs transition-colors relative overflow-hidden">
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Admin Approval
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Outfit']">
            {pendingCount}
          </p>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">Requires your sign-off</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-emerald-300 dark:border-emerald-500/40 space-y-1 shadow-xs transition-colors">
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Officially Approved
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {approvedCount}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Dual-signed & certified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition-colors">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Issuance Rate</span>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-['Outfit']">
            {completedRate}%
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Institutional average</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Candidates ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Approval ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'in_progress'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            In-Progress
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student, course, ID..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Registry Table / Cards */}
      {loading ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Querying Academic Certificate Registry...
          </p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No certificate records match the active criteria.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {statusFilter === 'pending'
              ? 'Great work! There are no pending certificate requests awaiting administrative sign-off right now.'
              : 'Try clearing your search query or adjusting the status filter above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(rec => {
            const isApproved = Boolean(rec.adminApproved);
            const isRequested = Boolean(rec.certificateRequested);
            const isPending = isRequested && !isApproved;

            const studentName = rec.student?.name || 'Academic Student';
            const studentId = rec.student?.idNumber || 'SST-STU-001';
            const studentAvatar =
              rec.student?.avatarUrl ||
              'https://i.imgur.com/J1pnjB4.png';
            const courseCode = rec.course?.code || 'SST-201';
            const courseTitle = rec.course?.title || 'Course of Study';
            const facilitatorName = rec.course?.facilitatorName || 'Engr. Sarah Jenkins';
            const adminName = rec.adminApprovedBy || settings.adminName || 'Mr. Seidu Mahamadu';

            return (
              <div
                key={rec._id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs ${
                  isPending
                    ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10 ring-1 ring-amber-400/30'
                    : isApproved
                    ? 'border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-400'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Student & Course Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={studentAvatar}
                      alt={studentName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                    {isApproved ? (
                      <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900" title="Officially Approved by Admin">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </span>
                    ) : isPending ? (
                      <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-full border border-white dark:border-slate-900 animate-bounce" title="Awaiting Admin Approval">
                        <Clock className="w-3.5 h-3.5 text-white" />
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit'] truncate">
                        {studentName}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {studentId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                      <span className="font-bold text-sky-600 dark:text-sky-400">{courseCode}:</span>
                      <span className="truncate max-w-xs">{courseTitle}</span>
                      <span>•</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Score: <strong className="text-slate-800 dark:text-slate-200">{rec.score || 94}% ({rec.grade || 'A'})</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
                      <span>Facilitator: <strong className="text-slate-700 dark:text-slate-300">{facilitatorName}</strong></span>
                      {rec.certificateId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-amber-600 dark:text-amber-400">ID: {rec.certificateId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge & Action Controls */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                  {/* Status Indicator */}
                  <div>
                    {isApproved ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Approved by Admin
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {rec.adminApprovedAt ? new Date(rec.adminApprovedAt).toLocaleDateString() : 'Officially Certified'}
                        </span>
                      </div>
                    ) : isPending ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Pending Admin Approval
                        </span>
                        <span className="block text-[10px] text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                          Requested {rec.certificateRequestedAt ? new Date(rec.certificateRequestedAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                        Coursework In-Progress
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(rec._id)}
                        disabled={approvingId === rec._id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Formally sign and stamp official certificate with Admin approval"
                      >
                        {approvingId === rec._id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Approve & Sign Certificate</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Preview Certificate Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setPreviewEnrollment(rec)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
                      title="Inspect full digital certificate with signatures"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                      <span>{isApproved ? 'View Certificate' : 'Inspect Preview'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Certificate Preview Modal */}
      {previewEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Administrative Certificate Inspection & Validation
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Candidate: {previewEnrollment.student?.name} • Course: {previewEnrollment.course?.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!previewEnrollment.adminApproved && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleApprove(previewEnrollment._id);
                      setPreviewEnrollment((prev: any) => prev ? { ...prev, adminApproved: true, adminApprovedBy: settings.adminName || 'Mr. Seidu Mahamadu' } : null);
                    }}
                    disabled={approvingId === previewEnrollment._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve Now</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewEnrollment(null)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Render CertificateGenerator Component */}
            <div className="py-2">
              <CertificateGenerator
                student={{
                  idNumber: previewEnrollment.student?.idNumber || 'SST-STU-001',
                  name: previewEnrollment.student?.name || 'Academic Candidate',
                  email: previewEnrollment.student?.email || 'student@startsmart.edu',
                  department: previewEnrollment.student?.department || 'School of Technology',
                }}
                enrollments={[previewEnrollment]}
                courses={previewEnrollment.course ? [previewEnrollment.course] : []}
                token={token || undefined}
                onRefreshEnrollments={fetchRegistry}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
