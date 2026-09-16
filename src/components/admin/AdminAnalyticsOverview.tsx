import React from 'react';
import {
  Users,
  BookOpen,
  Award,
  GraduationCap,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Monitor,
  Activity,
  ArrowUpRight,
  Download,
  Plus,
  Megaphone,
  CheckCircle2,
  Check,
  FileSpreadsheet,
  BarChart3,
} from 'lucide-react';
import { Course, User } from '../../types';

interface AdminAnalyticsOverviewProps {
  metrics: any;
  usersList: User[];
  coursesList: Course[];
  loading: boolean;
  onRefresh: () => void;
  onSelectSubtab: (tab: string) => void;
  onOpenAddUser: () => void;
  onOpenBroadcast: () => void;
  onExportReport: () => void;
}

export const AdminAnalyticsOverview: React.FC<AdminAnalyticsOverviewProps> = ({
  metrics,
  usersList,
  coursesList,
  loading,
  onRefresh,
  onSelectSubtab,
  onOpenAddUser,
  onOpenBroadcast,
  onExportReport,
}) => {
  const pendingCount = metrics?.pendingApplicants ?? usersList.filter(u => u.status === 'pending').length;
  const activeStudentsCount = metrics?.activeStudents ?? usersList.filter(u => u.role === 'student' && u.status === 'active').length;
  const facilitatorsCount = metrics?.totalFacilitators ?? usersList.filter(u => u.role === 'facilitator').length;
  const totalCourses = metrics?.totalCourses ?? coursesList.length;
  const completionRate = metrics?.completionRate ?? metrics?.avgCompletionRate ?? 92;
  const certsIssued = metrics?.certificatesIssued ?? 2;

  // Level breakdown
  const level100 = metrics?.levelBreakdown?.level100 || { courses: 4, enrolledEst: 16 };
  const level200 = metrics?.levelBreakdown?.level200 || { courses: 3, enrolledEst: 12 };
  const level300 = metrics?.levelBreakdown?.level300 || { courses: 3, enrolledEst: 8 };
  const level400 = metrics?.levelBreakdown?.level400 || { courses: 2, enrolledEst: 6 };

  // Workstations
  const workstations = metrics?.labWorkstations || [
    { id: 'WS-01', name: 'Workstation 1 (Dual 4K)', status: 'occupied', student: 'Ibrahim Alhassan', task: 'SST 301 Python Modeling' },
    { id: 'WS-02', name: 'Workstation 2 (CAD/GPU)', status: 'occupied', student: 'Sarah K.', task: 'SST 202 Linux Kernel Build' },
    { id: 'WS-03', name: 'Workstation 3 (Web Dev)', status: 'available', student: null, task: null },
    { id: 'WS-04', name: 'Workstation 4 (Cloud/DevOps)', status: 'occupied', student: 'Kwame Mensah', task: 'SST 401 Capstone Pipeline' },
    { id: 'WS-05', name: 'Workstation 5 (Data Analytics)', status: 'available', student: null, task: null },
    { id: 'WS-06', name: 'Workstation 6 (Graphic Design)', status: 'occupied', student: 'Fatima Z.', task: 'SST 104 Typography Lab' },
    { id: 'WS-07', name: 'Workstation 7 (General)', status: 'available', student: null, task: null },
    { id: 'WS-08', name: 'Workstation 8 (General)', status: 'available', student: null, task: null },
  ];

  const occupiedCount = workstations.filter((w: any) => w.status === 'occupied').length;

  return (
    <div className="space-y-6">
      {/* Executive Header with Operational Quick Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CAMPUS EXECUTIVE OPERATIONS ACTIVE
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Academic Term 2025/2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
            Institutional Management & Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time administrative telemetry, student credential registry, curriculum level allocations (100–400), and Tamale Tech Hub lab surveillance.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectSubtab('system-overview')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
            title="Inspect Recharts & D3 Performance Telemetry"
          >
            <BarChart3 className="w-4 h-4" />
            <span>System Overview & Telemetry</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddUser}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
          <button
            type="button"
            onClick={onOpenBroadcast}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/30 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Post Broadcast</span>
          </button>
          <button
            type="button"
            onClick={onExportReport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Download CSV Snapshot"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Report</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pending Admissions Action Alert if any */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {pendingCount} Candidate Admission Application{pendingCount > 1 ? 's' : ''} Awaiting Review
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Review applicant dossiers, assign student IDs, and generate secure dual-factor credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectSubtab('admissions')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>Review Admissions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6 Key Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onSelectSubtab('users')}
          className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition hover:border-emerald-500 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Active Students</span>
            <Users className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {activeStudentsCount}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Enrolled in Tracks
          </span>
        </div>

        <div
          onClick={() => onSelectSubtab('users')}
          className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition hover:border-emerald-500 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Facilitators</span>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-['Outfit']">
            {facilitatorsCount}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Instructors / Leads</span>
        </div>

        <div
          onClick={() => onSelectSubtab('catalog')}
          className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition hover:border-amber-500 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Total Courses</span>
            <BookOpen className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-amber-500 dark:text-amber-400 font-['Outfit']">
            {totalCourses}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Levels 100–400</span>
        </div>

        <div
          onClick={() => onSelectSubtab('attendance')}
          className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition hover:border-indigo-500 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Lab Workstations</span>
            <Monitor className="w-3.5 h-3.5 text-indigo-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-['Outfit']">
            {occupiedCount}/8
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {Math.round((occupiedCount / 8) * 100)}% Occupancy
          </span>
        </div>

        <div
          onClick={() => onSelectSubtab('certificates')}
          className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition hover:border-emerald-500 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Certificates</span>
            <Award className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100 transition" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {certsIssued}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Dual Endorsed</span>
        </div>

        <div
          className="p-4 rounded-2xl bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 space-y-1 shadow-xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Completion Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {completionRate}%
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Institutional Avg</span>
        </div>
      </div>

      {/* Main Analytics Grid: 100–400 Curriculum Allocation & Workstation Live Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Course Catalog 100–400 Level Allocation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Curriculum Allocations (100–400 Levels)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active course distribution and student pipeline across levels
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSubtab('catalog')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Manage Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Level 100 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Level 100 — Foundation Courses
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {level100.courses} Courses • ~{level100.enrolledEst} Students
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Level 200 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Level 200 — Intermediate Technical Tracks
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {level200.courses} Courses • ~{level200.enrolledEst} Students
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            {/* Level 300 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Level 300 — Advanced Engineering & Systems
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {level300.courses} Courses • ~{level300.enrolledEst} Students
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            {/* Level 400 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Level 400 — Capstone & Enterprise Projects
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {level400.courses} Courses • ~{level400.enrolledEst} Students
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '9%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tamale Tech Hub Workstation & Lab Occupancy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <Monitor className="w-4 h-4 text-sky-500" />
                Tamale Tech Hub Hardware Terminal Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Workstations WS-01 through WS-08 live seat sensor telemetry
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSubtab('attendance')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Attendance Lab</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {workstations.map((ws: any) => {
              const isOccupied = ws.status === 'occupied';
              return (
                <div
                  key={ws.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 transition ${
                    isOccupied
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-slate-900 dark:text-white">
                      {ws.id}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOccupied ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] font-semibold truncate text-slate-700 dark:text-slate-300">
                    {isOccupied ? ws.student : 'Available Station'}
                  </p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                    {isOccupied ? ws.task : 'Ready for QR check-in'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Academic Grade Distribution summary */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-400">Cohort Academic Standing:</span>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                42% Distinction
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                36% Merit
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                16% Pass
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Administrative Navigators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectSubtab('users')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition cursor-pointer group shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            User Directory & Access Control
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, edit student & staff records, reset 5-digit security PINs, and perform bulk suspensions or activations.
          </p>
        </div>

        <div
          onClick={() => onSelectSubtab('certificates')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition cursor-pointer group shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            Certificate Endorsement Registry
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Apply institutional dual-authority signatures, audit cryptographic hashes, and issue tamper-evident diplomas.
          </p>
        </div>

        <div
          onClick={() => onSelectSubtab('audit-logs')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition cursor-pointer group shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/30 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            System Health & Audit Trail
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect real-time administrative action logs, server uptime, database latency, and export CSV compliance audits.
          </p>
        </div>
      </div>
    </div>
  );
};
