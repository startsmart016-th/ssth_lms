import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadElementAsPng, downloadElementAsPdf } from '../utils/exportUtils';
import { Course, User, Enrollment } from '../types';
import { useSettings } from '../context/SettingsContext';
import { X, Download, Award, CheckCircle, FileDown, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  course: Course;
  student: User;
  enrollment: Enrollment;
  facilitatorSignature?: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  student,
  enrollment,
  facilitatorSignature,
  onClose,
}) => {
  const { settings } = useSettings();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<'png' | 'pdf' | null>(null);

  const certId = `CERT-SST-${course.code.replace(/\s+/g, '')}-${student.idNumber}`;
  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?verify=${encodeURIComponent(certId)}`
    : `https://startsmart.edu/verify/${encodeURIComponent(certId)}`;
  const completionDate = enrollment.signedAt
    ? new Date(enrollment.signedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const downloadPNG = async () => {
    if (!certRef.current) return;
    try {
      setDownloading('png');
      await downloadElementAsPng(
        certRef.current,
        `Certificate-${course.code}-${student.name.replace(/\s+/g, '_')}.png`,
        {
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
        }
      );
    } catch (e) {
      console.error('Failed to export certificate:', e);
    } finally {
      setDownloading(null);
    }
  };

  const downloadPDF = async () => {
    if (!certRef.current) return;
    try {
      setDownloading('pdf');
      await downloadElementAsPdf(
        certRef.current,
        `Certificate-${course.code}-${student.name.replace(/\s+/g, '_')}.pdf`,
        {
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
          imgX: 10,
          imgY: 10,
          imgW: 277,
          imgH: 190,
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
        }
      );
    } catch (e) {
      console.error('Failed to export PDF certificate:', e);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 my-auto">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#09286F] dark:text-[#53AD34]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Official Certificate of Completion</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Render Frame */}
        <div className="overflow-x-auto p-1 flex justify-center">
          <div
            ref={certRef}
            id="certificate-print-canvas"
            className="w-[720px] min-w-[720px] relative bg-white p-2.5 text-slate-900 border-[4px] border-[#09286F] shadow-xl select-none"
          >
            {/* Inner Navy Border Frame */}
            <div className="border-[1.5px] border-[#09286F] p-7 sm:p-8 relative bg-white flex flex-col justify-between min-h-[540px]">
              
              {/* Top Header: StartSmart Tech Hub */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={settings.logoUrl || 'https://i.imgur.com/x45FW8G.png'}
                      alt="Logo"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 leading-none">
                      <span className="text-lg sm:text-xl font-black tracking-wider text-[#09286F] uppercase font-['Outfit']">
                        {settings.name || 'STARTSMART TECH HUB'}
                      </span>
                      <div className="flex items-center gap-0.5 ml-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#53AD34]" />
                        <span className="w-2 h-2 rounded-full bg-[#09286F]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#53AD34]" />
                      </div>
                    </div>
                    <p className="text-[10px] font-semibold text-[#53AD34] tracking-widest uppercase mt-0.5">
                      {settings.tagline || 'Empowering Next-Gen Digital Leaders & Tech Innovators'}
                    </p>
                  </div>
                </div>

                {/* Certificate Title */}
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#09286F] tracking-normal pt-1 mb-1">
                  Certificate of Completion
                </h1>

                {/* Introductory Phrase */}
                <p className="text-xs sm:text-sm font-serif italic text-slate-700 font-normal">
                  This is to certify that
                </p>

                {/* Recipient Name */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#09286F] tracking-wide my-1.5 font-['Outfit']">
                  {student.name}
                </h2>

                {/* Completion Statement */}
                <p className="text-xs sm:text-sm text-slate-700 font-normal max-w-lg mx-auto leading-relaxed">
                  Has successfully completed all academic, laboratory, and instructional hours for Level {course.level || 1} in
                </p>

                {/* Course Title */}
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#09286F] my-1">
                  {course.title}
                </h3>
                <p className="text-[10px] font-mono font-semibold text-[#53AD34] uppercase tracking-wider mb-1.5">
                  Course Code: {course.code} • Level {course.level} • Grade: {enrollment.grade || 'A'} ({enrollment.score || 94}%)
                </p>

                {/* Verified by block */}
                <div className="text-center space-y-0.5 my-1.5">
                  <p className="text-[11px] text-slate-500 font-serif italic">verified by</p>
                  <p className="text-xs sm:text-sm font-bold text-[#09286F] uppercase tracking-wider font-['Outfit']">
                    {settings.name || 'StartSmart Tech Hub'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-serif italic">and</p>
                  <p className="text-xs sm:text-sm font-bold text-[#09286F] uppercase tracking-wider font-['Outfit']">
                    {student.department || 'School of Technology & Applied Sciences'}
                  </p>
                </div>

                {/* Date Awarded block */}
                <div className="text-center my-1.5">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    Date Awarded
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#09286F]">
                    {completionDate}
                  </p>
                </div>
              </div>

              {/* Lower Section: Dual Circular Seals & 3 Signatures */}
              <div className="mt-3 pt-1">
                {/* Flanking Circular Seals (Left & Right) */}
                <div className="flex items-center justify-between px-4 mb-2">
                  {/* Left Seal: Institutional Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#09286F] p-1 bg-white shadow-xs flex items-center justify-center overflow-hidden">
                      <img
                        src={settings.sealOrStampUrl || 'https://i.imgur.com/BrpD2i3.png'}
                        alt="Institutional Seal"
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('BrpD2i3.png') && !target.src.includes('/official-stamp.png')) {
                            target.src = '/official-stamp.png';
                          }
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-bold text-[#09286F] uppercase tracking-wider mt-0.5 block">
                      Institutional Seal
                    </span>
                  </div>

                  {/* Right Seal: Accreditation & QR Verification */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#09286F] p-1 bg-white shadow-xs flex flex-col items-center justify-center relative">
                      <QRCodeSVG value={verificationUrl} size={40} level="M" />
                      <span className="text-[6px] font-bold text-[#09286F] uppercase tracking-tighter font-mono">
                        VERIFIED
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-[#09286F] uppercase tracking-wider mt-0.5 block">
                      Academic Accreditation
                    </span>
                    <span className="text-[7px] font-mono text-slate-500 block">{certId}</span>
                  </div>
                </div>

                {/* 3 Authentic Signatures Across Bottom */}
                <div className="grid grid-cols-3 gap-3 items-end pt-2 border-t border-slate-200">
                  {/* Signature 1: Facilitator / Superintendent */}
                  <div className="text-center">
                    <div className="h-8 flex items-center justify-center">
                      {facilitatorSignature ? (
                        <img
                          src={facilitatorSignature}
                          alt="Instructor Signature"
                          className="max-h-full max-w-[120px] object-contain"
                        />
                      ) : (
                        <svg width="130" height="32" viewBox="0 0 130 32">
                          <path
                            d="M10,22 Q30,6 50,20 T90,12 T120,22"
                            fill="none"
                            stroke="#09286F"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <text
                            x="15"
                            y="22"
                            fontFamily="cursive, Georgia, serif"
                            fontSize="15"
                            fill="#09286F"
                            fontStyle="italic"
                          >
                            {course.facilitatorName || 'Instructor'}
                          </text>
                        </svg>
                      )}
                    </div>
                    <div className="border-t-2 border-[#09286F] w-32 sm:w-36 mx-auto mt-0.5 pt-0.5">
                      <span className="text-[10px] font-bold text-[#09286F] block truncate">
                        {course.facilitatorName || 'Superintendent'}
                      </span>
                    </div>
                  </div>

                  {/* Signature 2: Principal / Director */}
                  <div className="text-center">
                    <div className="h-8 flex items-center justify-center">
                      {settings.adminSignatureUrl ? (
                        <img
                          src={settings.adminSignatureUrl}
                          alt="Admin Signature"
                          className="max-h-full max-w-[120px] object-contain"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('/admin-signature.png')) {
                              target.src = '/admin-signature.png';
                            }
                          }}
                        />
                      ) : (
                        <svg width="130" height="32" viewBox="0 0 130 32">
                          <path
                            d="M10,18 Q35,5 55,22 T95,10 T122,20"
                            fill="none"
                            stroke="#09286F"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <text
                            x="15"
                            y="20"
                            fontFamily="cursive, Georgia, serif"
                            fontSize="15"
                            fill="#09286F"
                            fontStyle="italic"
                          >
                            {settings.adminName || 'Mr. Seidu Mahamadu'}
                          </text>
                        </svg>
                      )}
                    </div>
                    <div className="border-t-2 border-[#09286F] w-32 sm:w-36 mx-auto mt-0.5 pt-0.5">
                      <span className="text-[10px] font-bold text-[#09286F] block truncate">
                        {settings.adminName || 'Mr. Seidu Mahamadu'}, Principal
                      </span>
                    </div>
                  </div>

                  {/* Signature 3: Externship Coordinator */}
                  <div className="text-center">
                    <div className="h-8 flex items-center justify-center">
                      <svg width="130" height="32" viewBox="0 0 130 32">
                        <path
                          d="M12,20 Q32,6 50,21 T85,12 T118,22"
                          fill="none"
                          stroke="#09286F"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <text
                          x="16"
                          y="21"
                          fontFamily="cursive, Georgia, serif"
                          fontSize="14"
                          fill="#09286F"
                          fontStyle="italic"
                        >
                          Lea Heredia
                        </text>
                      </svg>
                    </div>
                    <div className="border-t-2 border-[#09286F] w-32 sm:w-36 mx-auto mt-0.5 pt-0.5">
                      <span className="text-[10px] font-bold text-[#09286F] block truncate">
                        Lea Heredia, Externship Coordinator
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={downloadPDF}
            disabled={downloading !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-white border border-slate-700 transition active:scale-95 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-rose-400" />
            <span>{downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
          </button>
          <button
            onClick={downloadPNG}
            disabled={downloading !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading === 'png' ? 'Generating PNG...' : 'Download PNG Certificate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
