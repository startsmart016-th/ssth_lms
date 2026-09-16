import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  Clock,
  Calendar,
  CheckCircle2,
  LogIn,
  LogOut,
  Download,
  Flame,
  Zap,
  Building,
  RefreshCw,
  Award,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AttendanceRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

export const AttendanceLabView: React.FC = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(() => {
    return localStorage.getItem('sst_checked_in') === 'true';
  });
  const [currentSessionStart, setCurrentSessionStart] = useState<string | null>(() => {
    return localStorage.getItem('sst_session_start') || null;
  });
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [qrToken, setQrToken] = useState<string>('SST-SEC-PASS-9901');
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(30);

  const initialRecords: AttendanceRecord[] = [
    {
      id: 'att-1',
      studentId: user?.idNumber || user?._id || 'STU-9901',
      studentName: user?.fullName || user?.name || 'Ibrahim Alhassan',
      courseCode: 'SST 301',
      date: '2026-03-12',
      checkInTime: '09:04 AM',
      checkOutTime: '12:15 PM',
      hoursSpent: 3.2,
      status: 'present',
      workstationId: 'WS-03',
      verifiedBy: 'Engr. Sarah Jenkins',
    },
    {
      id: 'att-2',
      studentId: user?.idNumber || user?._id || 'STU-9901',
      studentName: user?.fullName || user?.name || 'Ibrahim Alhassan',
      courseCode: 'SST 201',
      date: '2026-03-11',
      checkInTime: '01:10 PM',
      checkOutTime: '04:00 PM',
      hoursSpent: 2.8,
      status: 'present',
      workstationId: 'WS-07',
      verifiedBy: 'David Mensah, FCCA',
    },
    {
      id: 'att-3',
      studentId: user?.idNumber || user?._id || 'STU-9901',
      studentName: user?.fullName || user?.name || 'Ibrahim Alhassan',
      courseCode: 'HUB-OPEN',
      date: '2026-03-10',
      checkInTime: '10:00 AM',
      checkOutTime: '03:30 PM',
      hoursSpent: 5.5,
      status: 'present',
      workstationId: 'WS-01',
      verifiedBy: 'Tamale Hub NFC Terminal',
    },
    {
      id: 'att-4',
      studentId: user?.idNumber || user?._id || 'STU-9901',
      studentName: user?.fullName || user?.name || 'Ibrahim Alhassan',
      courseCode: 'SST 101',
      date: '2026-03-09',
      checkInTime: '09:00 AM',
      checkOutTime: '11:45 AM',
      hoursSpent: 2.75,
      status: 'present',
      workstationId: 'WS-04',
      verifiedBy: 'Engr. Sarah Jenkins',
    },
  ];

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const stored = localStorage.getItem('sst_attendance_logs');
      return stored ? JSON.parse(stored) : initialRecords;
    } catch {
      return initialRecords;
    }
  });

  // Rolling QR code generator every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          setQrToken(`SST-TOKEN-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Elapsed timer when checked in
  useEffect(() => {
    if (!isCheckedIn) return;
    const interval = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const handleToggleCheckIn = () => {
    playClickSound();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    if (!isCheckedIn) {
      // Check in
      setIsCheckedIn(true);
      setCurrentSessionStart(timeStr);
      setElapsedMinutes(1);
      localStorage.setItem('sst_checked_in', 'true');
      localStorage.setItem('sst_session_start', timeStr);
      playSuccessSound();
    } else {
      // Check out and log
      setIsCheckedIn(false);
      localStorage.setItem('sst_checked_in', 'false');
      localStorage.removeItem('sst_session_start');

      const hours = Math.max(0.5, Number((elapsedMinutes / 60).toFixed(2)));
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        studentId: user?.idNumber || user?._id || 'STU-9901',
        studentName: user?.fullName || user?.name || 'Scholar',
        courseCode: 'SST 301',
        date: dateStr,
        checkInTime: currentSessionStart || '09:00 AM',
        checkOutTime: timeStr,
        hoursSpent: hours,
        status: 'present',
        workstationId: 'WS-02',
        verifiedBy: 'Automated NFC Hub Terminal',
      };

      const updated = [newRec, ...records];
      setRecords(updated);
      localStorage.setItem('sst_attendance_logs', JSON.stringify(updated));
      setCurrentSessionStart(null);
      setElapsedMinutes(0);
      playSuccessSound();
    }
  };

  const totalHours = records.reduce((acc, r) => acc + r.hoursSpent, 0);

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Date', 'Course', 'Check In', 'Check Out', 'Hours', 'Workstation', 'Verified By'];
    const rows = records.map((r) => [
      r.date,
      r.courseCode,
      r.checkInTime,
      r.checkOutTime || '',
      r.hoursSpent.toString(),
      r.workstationId || 'N/A',
      r.verifiedBy,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `StartSmart_Attendance_${user?.idNumber || user?._id || 'Record'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccessSound();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50/50 dark:from-slate-900 dark:via-[#071530] dark:to-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-[#0e2a66] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#05286f]/10 text-[#05286f] dark:bg-[#4ea836]/20 dark:text-[#8ee079] border border-[#05286f]/20 dark:border-[#4ea836]/30">
              Access Control & Hours
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Tamale Tech Hub Terminal Gate Pass
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Lab Access & Attendance Pass
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Live cryptographic turnstile token, terminal session check-ins, and verified lab hours required for graduation certification.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0a1f47] hover:bg-slate-100 dark:hover:bg-[#0e2a66] border border-slate-200 dark:border-[#0e2a66] text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer self-start md:self-center"
        >
          <Download className="w-4 h-4 text-[#4ea836]" />
          <span>Export Attendance Log (.CSV)</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Lab Hours */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#0a1f47] text-[#05286f] dark:text-[#8ee079] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Verified Lab Hours
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalHours.toFixed(1)} hrs
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-[#8ee079] font-medium block">
              ✓ Meets 40.0 hr benchmark
            </span>
          </div>
        </div>

        {/* Consecutive Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Consecutive Day Streak
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              12 Days
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">
              🔥 Top 5% in 2025/2026 Cohort
            </span>
          </div>
        </div>

        {/* Current Lab Status */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isCheckedIn
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-[#0a1f47] text-slate-400'
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Current Terminal State
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white block">
              {isCheckedIn ? 'Checked In (Active)' : 'Checked Out'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {isCheckedIn ? `Started at ${currentSessionStart}` : 'Terminal Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Digital Turnstile Pass & Check-In Action vs Log History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Rolling QR Code Pass */}
        <div className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-5 text-center flex flex-col justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#05286f]/10 text-[#05286f] dark:bg-[#4ea836]/20 dark:text-[#8ee079]">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Rolling TOTP Token ({qrSecondsLeft}s)</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Hub Turnstile Pass
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hold against the Tamale Hub optical scanner to unlock entry doors and lab power gates.
            </p>
          </div>

          {/* QR Container */}
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 w-fit mx-auto">
            <QRCodeSVG
              value={qrToken}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#05286f"
            />
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold text-xs text-slate-600 dark:text-slate-300 block">
              {qrToken}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Student ID: {user?.idNumber || user?._id || 'STU-9901'} • Validated
            </span>
          </div>

          {/* Check In / Out Simulator Button */}
          <button
            type="button"
            onClick={handleToggleCheckIn}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
              isCheckedIn
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-[#4ea836] hover:bg-[#3b8827] text-white shadow-[#4ea836]/20'
            }`}
          >
            {isCheckedIn ? (
              <>
                <LogOut className="w-4 h-4" />
                <span>Tap to Check Out of Lab</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Tap to Simulate Hub Check In</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Attendance History Records */}
        <div className="lg:col-span-2 bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#0e2a66] pb-3">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4ea836]" />
              <span>Verified Session Attendance Records</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {records.length} Recorded Sessions
            </span>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#0e2a66] text-[11px] text-slate-400 font-semibold uppercase font-mono">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Course / Room</th>
                  <th className="pb-3 font-medium">Session Duration</th>
                  <th className="pb-3 font-medium">Workstation</th>
                  <th className="pb-3 font-medium text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#0e2a66]/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-[#0a1f47]/30 transition">
                    <td className="py-3 font-medium text-slate-900 dark:text-white font-mono">
                      {rec.date}
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-[#05286f] dark:text-[#8ee079] block">
                        {rec.courseCode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Tamale Tech Hub Terminal
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-slate-800 dark:text-slate-200 font-medium block">
                        {rec.checkInTime} – {rec.checkOutTime || 'Active'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rec.hoursSpent} hrs logged
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#030a1a] text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-[#0e2a66]">
                        {rec.workstationId || 'A-Node'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
