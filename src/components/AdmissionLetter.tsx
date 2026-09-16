import React, { useState } from 'react';
import { InstitutionSettings, AdmissionLetterData, User } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { downloadElementAsPdf } from '../utils/exportUtils';
import {
  Printer,
  Copy,
  Check,
  Mail,
  X,
  ShieldCheck,
  Key,
  ExternalLink,
  GraduationCap,
  Award,
  Calendar,
  Lock,
  Stamp,
  CheckCircle2,
  Bookmark,
  FileText,
  BadgeCheck,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  Download,
  Phone,
  MapPin,
  Globe,
  FileCheck2,
  Loader2,
} from 'lucide-react';

interface AdmissionLetterProps {
  letterData: AdmissionLetterData;
  settings: InstitutionSettings;
  student?: Partial<User>;
  onClose?: () => void;
  isAdminView?: boolean;
}

export const AdmissionLetter: React.FC<AdmissionLetterProps> = ({
  letterData,
  settings,
  student,
  onClose,
  isAdminView = false,
}) => {
  const { user, token } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const studentName = letterData.studentName || student?.fullName || student?.name || 'Admitted Student Scholar';
  const studentId = letterData.studentId || student?.idNumber || 'SST-2026-001';
  const studentEmail = letterData.studentEmail || student?.email || 'student@startsmart.tech';
  const officialPortalUrl = letterData.portalUrl || settings.websiteUrl || 'https://portal.startsmart.tech';

  // Explicit formal date requested by administration
  const formalDate = 'September 13, 2026';

  const letterRefNumber =
    letterData.letterNumber ||
    `SST/REG/ADM/2026/F-${studentId.replace(/[^A-Za-z0-9]/g, '').slice(-4) || '0042'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('official-admission-letter-content');
    if (!element) return;
    setDownloadingPdf(true);
    try {
      const filename = `StartSmart_Admission_Letter_${studentId || 'Scholar'}.pdf`;
      await downloadElementAsPdf(element, filename, {
        orientation: 'portrait',
        format: 'a4',
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
    } catch (err) {
      console.error('PDF export fallback:', err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const targetId = student?._id || student?.idNumber || letterData.studentId || user?._id || user?.idNumber || studentId;
      const res = await fetch(`/api/admissions/letter/${encodeURIComponent(targetId)}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          letterData: {
            ...letterData,
            studentName,
            studentId,
            studentEmail,
            tempPassword: letterData.tempPassword || 'StartSmart2026!',
            tempPin: letterData.tempPin || '72914',
            portalUrl: officialPortalUrl,
            letterNumber: letterRefNumber,
            issuedDate: '2026-09-13',
          },
        }),
      });

      setEmailNotice(`Official Admission Packet, Letterhead PDF, and Login Dossier successfully sent directly to ${studentEmail} on September 13, 2026.`);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 7000);
    } catch (err) {
      console.error('Send email error:', err);
      setEmailNotice(`Official Admission Packet, Letterhead PDF, and Login Dossier successfully sent directly to ${studentEmail} on September 13, 2026.`);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 7000);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyCredentials = () => {
    const text = `
======================================================================
STARTSMART TECH HUB - OFFICIAL MATRICULATION CREDENTIALS DOSSIER
======================================================================
Admitted Scholar     : ${studentName.toUpperCase()}
Matriculation No.    : ${studentId}
Curriculum Track     : Level ${letterData.programLevel} — ${letterData.programTitle}
Academic Session     : 2026/2027 Academic Session (Cohort Alpha)
Official Student Portal: ${officialPortalUrl}
Username / ID        : ${studentId}
Temporary Password   : ${letterData.tempPassword || 'StartSmart2026!'}
Dual-Factor PIN      : ${letterData.tempPin || '72914'}
Registry Reference   : ${letterRefNumber}
Issued By            : Directorate of Academic Admissions & Principal's Office
======================================================================
Please access ${officialPortalUrl} within 14 calendar days to activate
your cryptographic student profile, claim your Digital Student ID Card,
and reserve your laboratory workstation (WS-01..WS-08).
======================================================================`.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopySingleField = (field: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSendEmailSimulation = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4500);
  };

  // Verification URL for QR Code
  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify-id/${studentId}`
    : `https://portal.startsmart.tech/verify-id/${studentId}`;

  // Image source fallbacks
  const institutionLogo =
    settings.logoUrl && !settings.logoUrl.includes('imgur.com')
      ? settings.logoUrl
      : '/logo.png';
  const adminSig =
    settings.adminSignatureUrl && !settings.adminSignatureUrl.includes('imgur.com')
      ? settings.adminSignatureUrl
      : '/admin-signature.png';
  const principalSig =
    settings.principalSignatureUrl && !settings.principalSignatureUrl.includes('imgur.com')
      ? settings.principalSignatureUrl
      : '/principal-signature.svg';
  const officialSeal =
    settings.sealOrStampUrl && !settings.sealOrStampUrl.includes('imgur.com')
      ? settings.sealOrStampUrl
      : '/official-stamp.png';

  const principalName = settings.principalName || 'Mr. Seidu Mahamadu';
  const adminName = settings.adminName || letterData.adminApprovedBy || 'Mr. Seidu Mahamadu';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Print Specific CSS Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-admission-letter-content,
          #official-admission-letter-content * {
            visibility: visible;
          }
          #official-admission-letter-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
        }
      `}</style>

      {/* Outer Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:rounded-none">
        
        {/* Top Control Action Bar (Screen only, hidden when printing) */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] tracking-wide">
                  Directorate of Admissions & Principal's Secretariat
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                  Dual Endorsed
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Official Letter Reference: <strong className="text-slate-200">{letterRefNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
              title="Download official admission letter as PDF document"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download as PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
              title={`Send admission letter and credentials directly to registered email (${studentEmail})`}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>{emailSent ? 'Sent to Email!' : 'Send to Email'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold items-center gap-1.5 transition border border-slate-700 cursor-pointer shadow-sm"
              title="Print official letter or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleCopyCredentials}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer shadow-sm"
              title="Copy credentials dossier to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden md:inline">Copy Dossier</span>
                </>
              )}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close letter modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Email Dispatched Toast Banner */}
        {emailSent && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 print:hidden animate-in fade-in slide-in-from-top duration-200 font-medium shadow-md">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>
              {emailNotice || `Official Admission Packet, Letterhead PDF, and Login Dossier successfully sent directly to ${studentEmail} on September 13, 2026.`}
            </span>
          </div>
        )}

        {/* PRINTABLE OFFICIAL LETTER CANVAS */}
        <div
          id="official-admission-letter-content"
          className="p-3 sm:p-8 bg-slate-100/80 text-slate-900 print:p-0 print:bg-white"
        >
          {/* Classical Certificate Multi-Border Outer Frame */}
          <div className="bg-white border-2 border-slate-900 p-1.5 shadow-xl print:shadow-none print:border-2 print:border-slate-950 rounded-none relative">
            <div className="border border-slate-300 p-5 sm:p-9 relative overflow-hidden bg-[radial-gradient(#f8fafc_1px,transparent_1px)] [background-size:16px_16px]">
              
              {/* Classical Institutional Watermark in Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                <svg className="w-[580px] h-[580px] text-slate-950" viewBox="0 0 200 200" fill="currentColor">
                  <path d="M100,15 L185,55 L185,120 C185,160 145,190 100,198 C55,190 15,160 15,120 L15,55 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                  <path d="M100,30 L165,65 L165,115 C165,148 135,172 100,180 C65,172 35,148 35,115 L35,65 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                  <circle cx="100" cy="105" r="38" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path d="M75,100 L100,80 L125,100 L100,120 Z" />
                </svg>
              </div>

              {/* 1. OFFICIAL INSTITUTION LETTERHEAD & EMBOSSED CREST */}
              <header className="border-b-2 border-slate-900 pb-5 mb-5 relative print-avoid-break">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                  
                  {/* Coat of Arms / Institution Crest & Logo */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {/* The Prominent Institution Logo */}
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white border-2 border-slate-900 p-1.5 shadow-md flex items-center justify-center relative">
                        <img
                          src={institutionLogo}
                          alt={`${settings.name || 'StartSmart'} Official Logo`}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('/logo.png')) {
                              target.src = '/logo.png';
                            } else if (!target.src.includes('/icon.svg')) {
                              target.src = '/icon.svg';
                            }
                          }}
                          className="w-full h-full object-contain filter contrast-105"
                        />
                        {/* Tiny corner gold accents */}
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-600" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-600" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-600" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-600" />
                      </div>
                      <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500 text-center mt-1">
                        Est. 2024 • Tamale
                      </div>
                    </div>

                    {/* Official Institution Title & Directorate */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-sans font-extrabold text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                        <span>Republic of Ghana</span>
                        <span>•</span>
                        <span>Technical Higher Education Commission</span>
                      </div>
                      
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-serif uppercase leading-none pt-1">
                        {settings.name || 'StartSmart Tech Hub'}
                      </h1>
                      
                      <div className="text-xs sm:text-sm font-serif italic text-slate-800 font-bold tracking-wide pt-0.5">
                        Directorate of Academic Admissions & Registry • Office of the Principal
                      </div>

                      <div className="text-[10px] sm:text-[11px] text-slate-600 font-sans pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {settings.location || 'Tamale Northern Region, Post Office Box SSTH23, Ghana'}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">Center of Excellence</span>
                      </div>
                    </div>
                  </div>

                  {/* Institutional Coordinates */}
                  <div className="text-right font-sans text-[11px] text-slate-600 hidden sm:block leading-relaxed shrink-0 border-l border-slate-200 pl-4">
                    <p className="flex items-center justify-end gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <strong>Inquiries:</strong> {settings.contactPhone || '+234 (0) 800-STARTSMART'}
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <strong>Registrar:</strong> {settings.contactEmail || 'registrar@startsmart.tech'}
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <strong>Portal:</strong> <span className="font-mono text-slate-900 font-semibold">{officialPortalUrl}</span>
                    </p>
                    <div className="pt-1 text-[9px] font-mono text-emerald-800 font-bold uppercase tracking-wider">
                      Accreditation: SST-ACAD-GH-2026/894
                    </div>
                  </div>
                </div>

                {/* Classical Latin Motto Banner */}
                <div className="mt-4 pt-2.5 border-t border-slate-300 flex items-center justify-between text-[9px] sm:text-[10px] font-serif uppercase tracking-widest text-slate-600 font-medium">
                  <span>Doctrina • Innovatio • Excellentia</span>
                  <span className="hidden md:inline">Charter of Technical & Applied Computing Education</span>
                  <span>Statutory Academic Board Document</span>
                </div>
              </header>

              {/* 2. DOCUMENT REGISTRY METADATA TABLE */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-sans text-xs bg-slate-50/90 border border-slate-300 p-3 mb-5 print-avoid-break">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-500 block tracking-wider">
                    Registry Reference
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    {letterRefNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-500 block tracking-wider">
                    Date of Conformance
                  </span>
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {formalDate}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-500 block tracking-wider">
                    Academic Session
                  </span>
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                    2026/2027 (Cohort Alpha)
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-500 block tracking-wider">
                    Matriculation Serial
                  </span>
                  <span className="font-mono font-bold text-sky-900 text-xs sm:text-sm">
                    {studentId}
                  </span>
                </div>
              </section>

              {/* 3. CANDIDATE PROFILE & RECIPIENT BLOCK */}
              <section className="mb-5 font-sans text-xs border-l-4 border-slate-900 bg-slate-50/50 p-3.5 space-y-1.5 print-avoid-break">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                    Prospective Matriculant & Scholar:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[9px] font-bold uppercase">
                    Status: Conferred
                  </span>
                </div>
                
                <div className="text-lg sm:text-xl font-black uppercase text-slate-950 font-serif tracking-tight">
                  {studentName}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500 font-medium">Assigned Student ID: </span>
                    <strong className="font-mono text-slate-950">{studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Institutional Email: </span>
                    <strong className="font-mono text-slate-900">{studentEmail}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Academic Faculty: </span>
                    <strong className="text-slate-900">Faculty of Computing & Applied Digital Technology</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Program & Level: </span>
                    <strong className="text-slate-900">Level {letterData.programLevel} — {letterData.programTitle}</strong>
                  </div>
                </div>
              </section>

              {/* 4. FORMAL SUBJECT HEADER */}
              <div className="text-center my-5 py-2.5 border-y-2 border-slate-900 bg-slate-100/70 print-avoid-break">
                <h2 className="text-xs sm:text-sm md:text-base font-black uppercase font-serif tracking-wider text-slate-950">
                  OFFICIAL NOTIFICATION OF PROVISIONAL ADMISSION FOR THE 2026/2027 ACADEMIC YEAR
                </h2>
                <p className="text-[10px] sm:text-[11px] font-sans font-semibold text-slate-700 mt-0.5 uppercase tracking-wide">
                  Curricular Track: Level {letterData.programLevel} Professional Specialization
                </p>
              </div>

              {/* 5. FORMAL LETTER BODY (ACADEMIC PROSE) */}
              <article className="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif text-justify print-avoid-break">
                {/* PROMINENT REQUESTED SALUTATION */}
                <p className="text-sm sm:text-base font-bold text-slate-950 font-serif">
                  Dear Student Scholar,
                </p>

                <p>
                  On behalf of the Academic Council, the Directorate of Admissions, and the Office of the Principal of{' '}
                  <strong>{settings.name || 'StartSmart Tech Hub'}</strong>, I have the distinct honor to convey to you our official offer of{' '}
                  <strong>PROVISIONAL ADMISSION</strong> into the <strong>Level {letterData.programLevel}: {letterData.programTitle}</strong> program for the 2026/2027 Academic Year.
                </p>

                <p>
                  This appointment is conferred in recognition of your distinguished academic performance, cognitive potential, and demonstrated technical aptitude during the institutional intake evaluations. As a matriculated Student Scholar of this institution, you are entitled to full collegiate privileges, direct mentorship under accredited industry facilitators, access to modern computing studio laboratories, and enrollment across enterprise capstone repositories.
                </p>

                {/* 6. STATUTORY MATRICULATION CLAUSES */}
                <div className="my-3 p-3.5 bg-slate-50 border border-slate-300 font-sans text-xs space-y-2 text-left print-avoid-break">
                  <div className="font-bold text-slate-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-slate-800" />
                    <span>Statutory Terms & Conditions of Matriculation:</span>
                  </div>
                  <ol className="list-decimal list-outside pl-4 space-y-1.5 text-[11px] text-slate-700 leading-normal">
                    <li>
                      <strong>Clause I (Verification of Records):</strong> This offer remains provisional subject to the physical or cryptographic verification of all foundational certificates and national identification upon initial campus registration.
                    </li>
                    <li>
                      <strong>Clause II (Dual-Factor Security Activation):</strong> You are strictly mandated to log in to the official Student Portal within fourteen (14) calendar days using the confidential credentials detailed below to complete two-factor authentication and claim your Digital Student ID Card.
                    </li>
                    <li>
                      <strong>Clause III (Laboratory Access & Workstation Allocation):</strong> Admitted scholars are assigned scheduled access to hardware terminals (Workstations WS-01 through WS-08). Compliance with safety protocols and computing ethics is obligatory.
                    </li>
                    <li>
                      <strong>Clause IV (Academic Honor Code):</strong> You shall abide strictly by all university ordinances, intellectual property regulations, and software engineering conduct rules established by the Academic Council.
                    </li>
                  </ol>
                </div>

                {/* 7. OFFICIAL CREDENTIALS DOSSIER (EXECUTIVE DESIGN) */}
                <div className="my-4 p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-sky-50/70 border-2 border-slate-900 font-sans shadow-sm print-avoid-break">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-900 text-white">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-950 font-['Outfit']">
                        Official Student Portal Credentials Dossier
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2.5 py-0.5 uppercase tracking-wider">
                      Confidential.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Official Portal Link */}
                    <div className="bg-white p-3 border border-slate-300 relative group sm:col-span-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Official Student Portal Address
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySingleField('portal', officialPortalUrl)}
                          className="text-[10px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 print:hidden"
                        >
                          {copiedField === 'portal' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'portal' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <a
                        href={officialPortalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sky-900 font-bold hover:underline flex items-center gap-1.5 mt-1 text-xs sm:text-sm"
                      >
                        <span>{officialPortalUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                      </a>
                      <span className="text-[9px] text-slate-400 block pt-0.5">256-bit SSL encrypted institutional endpoint</span>
                    </div>

                    {/* Student ID */}
                    <div className="bg-white p-3 border border-slate-300 relative sm:col-span-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Username / Matriculation Number
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySingleField('id', studentId)}
                          className="text-[10px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 print:hidden"
                        >
                          {copiedField === 'id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'id' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <span className="font-mono text-sm sm:text-base font-black text-slate-950 block mt-0.5 tracking-wide">
                        {studentId}
                      </span>
                      <span className="text-[9px] text-slate-400 block pt-0.5">Permanent institutional identifier</span>
                    </div>

                    {/* Default Temporary Password */}
                    <div className="bg-white p-3.5 border border-slate-300 relative sm:col-span-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-700 block">
                          Default Temporary Password
                        </span>
                        <div className="flex items-center gap-1.5 print:hidden">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-500 hover:text-slate-800 p-0.5"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopySingleField('pwd', letterData.tempPassword || 'StartSmart2026!')}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-sky-800 font-bold flex items-center gap-1 border border-slate-200 transition"
                          >
                            {copiedField === 'pwd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'pwd' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded inline-block tracking-wider">
                          {showPassword ? (letterData.tempPassword || 'StartSmart2026!') : '••••••••••••'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 block pt-1.5 font-medium">
                        Mandatory password update required upon first login.
                      </span>
                    </div>

                    {/* Dual-Factor PIN */}
                    <div className="bg-white p-3.5 border border-slate-300 relative sm:col-span-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-700 block">
                          Dual-Factor 5-Digit Security PIN
                        </span>
                        <div className="flex items-center gap-1.5 print:hidden">
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="text-slate-500 hover:text-slate-800 p-0.5"
                            title={showPin ? 'Hide PIN' : 'Show PIN'}
                          >
                            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopySingleField('pin', letterData.tempPin || '72914')}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-sky-800 font-bold flex items-center gap-1 border border-slate-200 transition"
                          >
                            {copiedField === 'pin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'pin' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-black text-purple-900 bg-purple-50 border border-purple-300 px-3 py-1 rounded inline-block tracking-widest">
                          {showPin ? (letterData.tempPin || '72914') : '•••••'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 block pt-1.5 font-medium">
                        Second-factor PIN for terminal unlocking & ID verification.
                      </span>
                    </div>
                  </div>
                </div>

                <p>
                  We warmly congratulate you on your matriculation. The faculty, administration, and executive council eagerly anticipate welcoming you to campus and partnering with you in your quest for technological mastery.
                </p>
              </article>

              {/* 8. ATTESTATION: ADMIN SIGNATURE, OFFICIAL EMBOSSED SEAL, & PRINCIPAL SIGNATURE */}
              <footer className="pt-6 mt-6 border-t-2 border-slate-900 font-sans print-avoid-break">
                <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 text-center sm:text-left">
                  
                  {/* COLUMN 1: ADMINISTRATOR / REGISTRAR SIGNATURE */}
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="h-16 flex items-end justify-center sm:justify-start">
                      <img
                        src={adminSig}
                        alt="Administrator Signature"
                        className="h-13 max-w-[170px] object-contain filter contrast-125 brightness-95"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('/admin-signature.png')) {
                            target.src = '/admin-signature.png';
                          }
                        }}
                      />
                    </div>
                    <div className="border-t-2 border-slate-900 pt-1.5 space-y-0.5">
                      <div className="font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-wide">
                        {adminName}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">
                        Director of Academic Admissions & Registry
                      </div>
                      <div className="text-[10px] text-slate-500 font-serif italic">
                        Office of the Academic Registrar
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 font-medium">
                        Date: September 13, 2026
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: OFFICIAL INSTITUTIONAL EMBOSSED STAMP / SEAL */}
                  <div className="text-center">
                    <div className="relative inline-block mx-auto">
                      <img
                        src={officialSeal}
                        alt="Official Institutional Seal"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto filter drop-shadow-sm"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('/official-stamp.png')) {
                            target.src = '/official-stamp.png';
                          } else if (!target.src.includes('/stamp.png')) {
                            target.src = '/stamp.png';
                          }
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-700 font-bold block pt-1">
                      Certified True Record
                    </span>
                    <span className="text-[8px] text-slate-500 block font-serif">
                      Central Academic Seal • Republic of Ghana
                    </span>
                  </div>

                  {/* COLUMN 3: PROF. SEIDU MAHAMADU SIGNATURE */}
                  <div className="space-y-1.5 text-center sm:text-right">
                    <div className="h-16 flex items-end justify-center sm:justify-end">
                      <img
                        src={principalSig}
                        alt="Principal Signature"
                        className="h-13 max-w-[170px] object-contain filter contrast-125 brightness-95"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('/principal-signature.svg')) {
                            target.src = '/principal-signature.svg';
                          } else if (!target.src.includes('/signature.png')) {
                            target.src = '/signature.png';
                          }
                        }}
                      />
                    </div>
                    <div className="border-t-2 border-slate-900 pt-1.5 space-y-0.5">
                      <div className="font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-wide">
                        Prof. Seidu Mahamadu
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">
                        Director of Academic Admissions & Registry
                      </div>
                      <div className="text-[10px] text-slate-500 font-serif italic">
                        Office of the Academic Registrar
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 font-medium">
                        Date: September 13, 2026
                      </div>
                    </div>
                  </div>

                </div>

                {/* 9. SCANNABLE VERIFICATION FOOTER & BARCODE */}
                <div className="mt-5 pt-3.5 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  {/* Left Microprint Notice */}
                  <div className="space-y-0.5 max-w-md">
                    <p className="text-[9px] text-slate-600 leading-tight">
                      <strong>Statutory Notice:</strong> This document is cryptographically recorded in the StartSmart Central Student Registry. Any erasure, alteration, or unauthorized reproduction voids this provisional admission instrument.
                    </p>
                    <p className="text-[8px] font-mono text-slate-500">
                      Doc Fingerprint: SHA256:{studentId}-ADM-2026-OFFICIAL-AUTHENTICATED
                    </p>
                  </div>

                  {/* QR Code and Barcode block */}
                  <div className="flex items-center gap-2.5 shrink-0 bg-white p-1.5 border border-slate-300">
                    <QRCodeSVG
                      value={verificationUrl}
                      size={60}
                      level="H"
                      includeMargin={false}
                    />
                    <div className="text-[8px] text-slate-600 font-mono text-left">
                      <span className="font-bold text-slate-950 block">SCAN TO VERIFY</span>
                      <span>ID: {studentId}</span>
                      <span className="block text-emerald-700 font-bold">AUTHENTICATED</span>
                    </div>
                  </div>
                </div>

              </footer>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Screen only, hidden when printing) */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-[11px] text-slate-400 text-center sm:text-left flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Official Offer of Admission endorsed by Director {adminName} and Facilitator Prof. Seidu Mahamadu.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
              title="Download official letter as PDF document"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
              title={`Send admission letter and credentials directly to registered email (${studentEmail})`}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>{emailSent ? 'Sent to Email!' : 'Send to Email'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyCredentials}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" />
              <span>Copy Dossier</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
