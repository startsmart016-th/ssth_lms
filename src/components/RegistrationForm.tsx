import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';
import { safeParseResponse, extractErrorMessage } from '../utils/apiClient';
import {
  GraduationCap,
  Upload,
  User,
  Mail,
  Phone,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  Camera,
  School,
  FileCheck,
} from 'lucide-react';

interface RegistrationFormProps {
  onBackToLogin: () => void;
  onRegistrationComplete?: (applicantData: any) => void;
}

const PROGRAM_LEVELS = [
  {
    level: 100,
    badge: 'Foundation',
    title: 'Computer Fundamentals & IT Tools',
    description: 'Hardware anatomy, operating systems, internet hygiene, and basic digital productivity.',
    courses: ['SST 101 Intro to Computers', 'SST 102 Basic Computer Literacy'],
  },
  {
    level: 200,
    badge: 'Intermediate',
    title: 'Intermediate Data & Digital Analytics',
    description: 'Spreadsheet engineering, advanced Excel formulas, pivot analytics, and financial models.',
    courses: ['SST 201 MS Excel Intermediate', 'SST 202 Data Visualization'],
  },
  {
    level: 300,
    badge: 'Specialization Track',
    title: 'Full-Stack Web Engineering & Distributed Systems',
    description: 'Modern full stack architectures, TypeScript, Node.js, databases, and secure authentication.',
    courses: ['SST 301 Full-Stack Web Development', 'SST 302 Database Management'],
  },
  {
    level: 400,
    badge: 'Advanced Program',
    title: 'Advanced Cloud Systems & Capstone Project',
    description: 'Enterprise deployment pipelines, containerization, microservices, and industry capstone.',
    courses: ['SST 401 Capstone Project', 'SST 402 Cloud Systems Architecture'],
  },
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onBackToLogin,
  onRegistrationComplete,
}) => {
  const { settings } = useSettings();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number>(100);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // File upload to base64 preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image file size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please provide your official Full Name as it should appear on your student records.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid institutional or personal email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide an active phone or WhatsApp number for admission correspondence.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        programLevel: selectedLevel,
        avatarUrl: avatarUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`,
      };

      let response = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Fallback to /api/auth/register if needed
      if (response.status === 404) {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const { ok, data: resData, error: parseError } = await safeParseResponse(response);

      if (!ok || !response.ok || !resData || resData.success === false) {
        const rawErr = resData?.error || parseError || 'Failed to process admission registration. Please try again.';
        throw new Error(extractErrorMessage(rawErr, 'Failed to process admission registration. Please try again.'));
      }

      const applicantData = resData.student || resData.applicant || {};

      setSubmittedData({
        ...payload,
        id: applicantData._id,
        idNumber: applicantData.idNumber,
        status: applicantData.status || 'pending',
      });

      if (onRegistrationComplete) {
        onRegistrationComplete(applicantData);
      }
    } catch (err: any) {
      setErrorMsg(extractErrorMessage(err, 'Network error encountered while submitting application.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================================
  // CONFIRMATION VIEW (When application is submitted)
  // ==========================================================================
  if (submittedData) {
    const matchedTrack = PROGRAM_LEVELS.find((p) => p.level === Number(submittedData.programLevel)) || PROGRAM_LEVELS[0];

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 dark:from-[#030919] dark:via-[#06132e] dark:to-[#020612] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#0038A8]/20 selection:text-[#0038A8] dark:selection:bg-[#00A859]/20 dark:selection:text-[#8ee079] transition-colors relative overflow-hidden">
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#0038A8]/10 dark:bg-[#0c2b74]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[300px] bg-[#00A859]/10 dark:bg-[#4ea836]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#071530]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="StartSmart Logo"
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
                className="w-10 h-10 rounded-xl object-contain p-1 border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#071530] shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0038A8] to-[#0a3ca3] flex items-center justify-center font-bold text-white text-base shadow-sm">
                SST
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight font-['Outfit']">
                  {settings?.name || 'StartSmart Tech Hub'}
                </span>
                <span className="text-[10px] uppercase font-bold bg-[#0038A8]/10 text-[#0038A8] border border-[#0038A8]/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full tracking-wider">
                  Admissions Office
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Academic Candidate Registration & Placement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" showLabel />
            <button
              onClick={onBackToLogin}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </button>
          </div>
        </header>

        {/* Confirmation Card */}
        <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center z-10 my-6">
          <div className="bg-white/95 dark:bg-[#071530]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/50 space-y-6 text-center transition-all">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Status: Pending Admissions Review
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                Application Successfully Received!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Thank you for applying to <span className="text-slate-900 dark:text-white font-bold">{settings?.name || 'StartSmart Tech Hub'}</span>.
                Your enrollment application has been recorded and queued for verification.
              </p>
            </div>

            {/* Applicant Summary Details */}
            <div className="bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Applicant Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{submittedData.fullName || submittedData.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Application Email:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{submittedData.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Phone Contact:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{submittedData.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Applied Level:</span>
                <span className="font-bold text-[#00A859] dark:text-[#8ee079]">Level {submittedData.programLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Curriculum Track:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-[60%]">{matchedTrack.title}</span>
              </div>
            </div>

            {/* Next Steps Notice */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-[#05286f]/20 border border-blue-200 dark:border-blue-900/60 text-left space-y-2">
              <div className="flex items-center gap-2 text-[#0038A8] dark:text-sky-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#00A859]" />
                <span>Next Steps & Security Protocol</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                Per institutional policy, accounts remain in <span className="text-amber-700 dark:text-amber-400 font-bold">Pending status</span> until verified by an Administrator.
                Upon approval, your official <strong className="text-slate-900 dark:text-white font-bold">Admission Letter</strong> will be issued containing your:
              </p>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5">
                <li>Permanent Student ID Number (e.g. SST-2026-004)</li>
                <li>Temporary Account Password</li>
                <li>Dual-Factor 5-Digit Security PIN</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onBackToLogin}
                className="flex-1 py-2.5 px-4 bg-[#0038A8] hover:bg-[#002b82] text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Return to Portal Sign-In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setFullName('');
                  setEmail('');
                  setPhone('');
                  setAvatarUrl('');
                  setAvatarPreview('');
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl font-semibold transition cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-3.5 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-[#071530]/60 backdrop-blur-sm">
          {settings?.name || 'StartSmart Tech Hub'} • Admissions Office • {settings?.contactEmail || 'admissions@startsmart.tech'}
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // MAIN REGISTRATION FORM (Professional Academic Colors)
  // ==========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 dark:from-[#030919] dark:via-[#06132e] dark:to-[#020612] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#0038A8]/20 selection:text-[#0038A8] dark:selection:bg-[#00A859]/20 dark:selection:text-[#8ee079] transition-colors relative overflow-hidden">
      {/* Subtle Ambient Background Lighting */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#0038A8]/10 dark:bg-[#0c2b74]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[300px] bg-[#00A859]/10 dark:bg-[#4ea836]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Academic Portal Institutional Banner */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#071530]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="StartSmart Logo"
              crossOrigin="anonymous"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
              className="w-10 h-10 rounded-xl object-contain p-1 border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#071530] shadow-2xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0038A8] to-[#0a3ca3] flex items-center justify-center font-bold text-white text-base shadow-sm">
              SST
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight font-['Outfit']">
                {settings?.name || 'StartSmart Tech Hub'}
              </span>
              <span className="text-[10px] uppercase font-bold bg-[#0038A8]/10 text-[#0038A8] border border-[#0038A8]/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full tracking-wider">
                Admissions
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Public Candidate Registration & Academic Placement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton />
          <ThemeToggle size="sm" showLabel />
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Already Admitted? Log In</span>
            <span className="sm:hidden">Log In</span>
          </button>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 my-4 z-10">
        <div className="bg-white/95 dark:bg-[#071530]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 dark:shadow-black/40 space-y-6 transition-all">
          {/* Header Banner */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0038A8]/10 text-[#0038A8] border border-[#0038A8]/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
              <GraduationCap className="w-3.5 h-3.5 text-[#00A859]" />
              <span>Academic Enrollment 2026/2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Student Registration & Admission
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Complete your application to enroll into <span className="font-semibold text-slate-900 dark:text-white">{settings?.name || 'StartSmart Tech Hub'}</span>.
              Upon review and approval by the Admissions Office, your official Student ID and dual-factor credentials will be issued.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {typeof errorMsg === 'string' ? errorMsg : extractErrorMessage(errorMsg)}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details Section */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 font-bold">
                <User className="w-4 h-4 text-[#00A859]" />
                <span>1. Personal & Contact Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kwame Mensah or Fatima Al-Hassan"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#030a1a] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20 dark:focus:border-[#00A859] dark:focus:ring-[#00A859]/20 transition-all shadow-2xs"
                    />
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Must match your official national identity documents.</p>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#030a1a] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20 dark:focus:border-[#00A859] dark:focus:ring-[#00A859]/20 transition-all shadow-2xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#030a1a] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20 dark:focus:border-[#00A859] dark:focus:ring-[#00A859]/20 transition-all shadow-2xs"
                    />
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Photo Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 font-bold">
                <Camera className="w-4 h-4 text-[#00A859]" />
                <span>2. Official Digital ID Photo</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-[#030a1a]/60 border border-slate-200 dark:border-slate-800">
                <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-[#071530] border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Applicant Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <User className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                      <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 block">ID Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <span className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 transition shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#00A859]" />
                        <span>Upload Photo from Device</span>
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const seed = fullName.trim() || 'student';
                        const generated = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
                        setAvatarPreview(generated);
                        setAvatarUrl(generated);
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00A859]" />
                      <span>Instant Avatar</span>
                    </button>
                  </div>

                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setAvatarPreview(e.target.value);
                    }}
                    placeholder="Or paste external image URL (https://...)"
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#030a1a] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0038A8] dark:focus:border-[#00A859] transition shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Your photo will be embedded into your verifiable Digital ID card and official transcript upon admission.
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Level & Program Track Selection */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 font-bold">
                  <Layers className="w-4 h-4 text-[#00A859]" />
                  <span>3. Academic Level & Curriculum Selection</span>
                </h2>
                <span className="text-[11px] text-[#00A859] font-mono font-bold">100–400 Track</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROGRAM_LEVELS.map((item) => {
                  const isSelected = selectedLevel === item.level;
                  return (
                    <div
                      key={item.level}
                      onClick={() => setSelectedLevel(item.level)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all text-left space-y-2 relative ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-[#05286f]/30 border-2 border-[#0038A8] dark:border-[#00A859] shadow-md shadow-blue-500/10'
                          : 'bg-white dark:bg-[#030a1a]/70 border-slate-200 dark:border-slate-800 hover:border-[#0038A8]/40 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-[#071530] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              isSelected
                                ? 'bg-[#0038A8] text-white dark:bg-[#00A859] dark:text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {item.level / 100}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                            Level {item.level}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isSelected
                              ? 'bg-[#0038A8]/10 text-[#0038A8] border-[#0038A8]/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>

                      <div className="pt-1 flex flex-wrap gap-1">
                        {item.courses.map((c) => (
                          <span
                            key={c}
                            className="text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00A859] shrink-0" />
                <span>All registrations are subject to approval by the Academic Admissions Board.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto py-2.5 px-6 bg-[#0038A8] hover:bg-[#002b82] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-800/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application for Admission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-3.5 px-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-[#071530]/60 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{settings?.name || 'StartSmart Tech Hub'} &copy; {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Official Admissions Portal</span>
          <span>•</span>
          <span>Support: {settings?.contactEmail || 'help@startsmart.tech'}</span>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationForm;
