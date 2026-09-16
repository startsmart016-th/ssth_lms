import React, { useRef, useState } from 'react';
import { downloadElementAsPdf } from '../utils/exportUtils';
import { User, Enrollment } from '../types';
import { useSettings } from '../context/SettingsContext';
import { X, FileText, Download, Printer, CheckCircle2, ShieldCheck, Building } from 'lucide-react';

interface TranscriptModalProps {
  student: User;
  enrollments: Enrollment[];
  onClose: () => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  student,
  enrollments,
  onClose,
}) => {
  const { settings } = useSettings();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Compute GPA and statistics
  const gradePoints: Record<string, number> = {
    'A+': 4.0,
    A: 4.0,
    'B+': 3.5,
    B: 3.0,
    'C+': 2.5,
    C: 2.0,
    D: 1.0,
    F: 0.0,
  };

  const completed = enrollments.filter(e => e.status === 'completed');
  let totalPoints = 0;
  let totalCredits = 0;

  completed.forEach(e => {
    const courseObj: any = e.course;
    const credits = courseObj?.credits || 3;
    const grade = e.grade || 'A';
    const points = gradePoints[grade] !== undefined ? gradePoints[grade] : 4.0;
    totalPoints += points * credits;
    totalCredits += credits;
  });

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '3.90';

  const downloadPDF = async () => {
    if (!transcriptRef.current) return;
    try {
      setDownloading(true);
      await downloadElementAsPdf(
        transcriptRef.current,
        `Official-Transcript-${student.idNumber}.pdf`,
        {
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          imgX: 10,
          imgY: 10,
          imgW: 190,
          imgH: 260,
          pixelRatio: 2.5,
          backgroundColor: '#0f172a',
        }
      );
    } catch (e) {
      console.error('Failed to generate transcript PDF:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 my-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-bold text-white">Official Academic Transcript & Report Card</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Transcript Frame */}
        <div className="overflow-x-auto">
          <div
            ref={transcriptRef}
            id="transcript-printable-canvas"
            className="w-[600px] mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative"
          >
            {/* Institution Header from InstitutionSettings */}
            <div className="flex items-center justify-between border-b-2 border-sky-500/40 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={settings.logoUrl || 'https://i.imgur.com/x45FW8G.png'}
                  alt="Institution Logo"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-12 h-12 object-contain p-1 rounded-xl bg-slate-900 border border-slate-800"
                />
                <div>
                  <h2 className="text-lg font-black text-white uppercase font-['Outfit'] tracking-wide">
                    {settings.name}
                  </h2>
                  <p className="text-xs text-sky-400 font-medium">{settings.tagline}</p>
                  <p className="text-[10px] text-slate-400">{settings.location}</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <span className="font-mono block text-amber-400 font-bold">OFFICIAL RECORD</span>
                <span>Date: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Student Biodata */}
            <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-xs mb-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">CANDIDATE NAME</span>
                <span className="text-sm font-bold text-white font-['Outfit']">{student.name}</span>
                <span className="text-[10px] text-slate-300 block">{student.department || 'School of Technology'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">STUDENT ID</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{student.idNumber}</span>
                <span className="text-[10px] text-emerald-400 block font-semibold">CUMULATIVE GPA: {gpa} / 4.0</span>
              </div>
            </div>

            {/* Academic Courses Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800 mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Course Title</th>
                    <th className="py-2 px-2 text-center">Lvl</th>
                    <th className="py-2 px-2 text-center">Crd</th>
                    <th className="py-2 px-2 text-center">Score</th>
                    <th className="py-2 px-2 text-center">Grd</th>
                    <th className="py-2 px-3 text-right">Facilitator Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {enrollments.map((enr, idx) => {
                    const c: any = enr.course || {};
                    return (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-400 text-[11px]">
                          {c.code || 'SST'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200 text-[11px]">
                          {c.title || 'Course Module'}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-400 text-[10px]">
                          {c.level || 100}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-300 font-mono text-[11px]">
                          {c.credits || 3}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-200 text-[11px]">
                          {enr.score ? `${enr.score}%` : '—'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-emerald-400 text-[11px]">
                          {enr.grade || 'In Prog'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {enr.facilitatorSignOff ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Signed Off
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">In Progress</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Endorsements & Seal */}
            <div className="grid grid-cols-2 items-end pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-700/60">
                  <img
                    src={settings.sealOrStampUrl || '/official-stamp.png'}
                    alt="Institutional Stamp"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/official-stamp.png')) {
                        target.src = '/official-stamp.png';
                      }
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  <span className="font-bold text-sky-400 uppercase block">StartSmart Registry</span>
                  <span>Registrar Academic Validation</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="h-8 flex items-center justify-end overflow-hidden">
                  {settings.adminSignatureUrl ? (
                    <img
                      src={settings.adminSignatureUrl || '/admin-signature.png'}
                      alt="Director Signature"
                      className="max-h-full max-w-[130px] object-contain filter invert opacity-90"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/admin-signature.png')) {
                          target.src = '/admin-signature.png';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xs font-serif italic text-slate-300">Mr. Seidu Mahamadu</span>
                  )}
                </div>
                <div className="border-t border-slate-700 w-36 ml-auto pt-0.5">
                  <span className="text-[9px] font-bold text-slate-300 block uppercase">
                    Director / Provost
                  </span>
                  <span className="text-[8px] text-slate-400 block">Board of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compiling PDF...' : 'Download Official Transcript (PDF)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
