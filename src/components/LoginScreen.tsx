import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ThemeToggle } from './ThemeToggle';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  School,
  CheckCircle2,
  Fingerprint,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess?: (role: string, redirectUrl: string) => void;
  onOpenRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenRegister }) => {
  const { login } = useAuth();
  const { settings } = useSettings();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    const cleanPin = pin.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your Full Name, Institutional ID Number, or Email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }
    if (!cleanPin || cleanPin.length !== 5 || !/^\d{5}$/.test(cleanPin)) {
      setErrorMessage('Security PIN must be exactly 5 numeric digits.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(cleanId, password, cleanPin);
      if (res.success && res.user) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user.role, res.redirectUrl || `/${res.user.role}/dashboard`);
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network connection failure.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 dark:from-[#030919] dark:via-[#06132e] dark:to-[#020612] flex flex-col justify-between text-slate-900 dark:text-slate-100 selection:bg-[#05286f]/20 selection:text-[#05286f] dark:selection:bg-[#4ea836]/20 dark:selection:text-[#8ee079] transition-colors relative overflow-hidden">
      {/* Subtle Ambient Background Lighting */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#05286f]/10 dark:bg-[#0c2b74]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[300px] bg-[#4ea836]/10 dark:bg-[#4ea836]/10 rounded-full blur-3xl pointer-events-none" />

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#05286f] to-[#0a3ca3] flex items-center justify-center font-bold text-white text-base shadow-sm">
              SST
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight font-['Outfit']">
                {settings?.name || 'StartSmart Tech Hub'}
              </span>
              <span className="text-[10px] uppercase font-bold bg-[#05286f]/10 text-[#05286f] border border-[#05286f]/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full tracking-wider">
                Official Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {settings?.tagline || 'Institutional Learning Management & Identity System'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" showLabel />
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ea836]" />
            <span>2FA PIN Protected</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-[460px] bg-white/95 dark:bg-[#071530]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-6 sm:p-8 space-y-6 transition-all">
          {/* Card Header & Official Tech Hub Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-2.5 rounded-2xl bg-white dark:bg-[#071530] border border-slate-200/90 dark:border-slate-700/80 shadow-md shadow-slate-200/50 dark:shadow-black/40 mb-0.5">
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt={settings?.name || "StartSmart Tech Hub"}
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                Institutional Sign-In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Access your personalized dashboard, coursework, transcripts, and administrative tools with institutional 2FA verification.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Full Name / ID / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
                Full Name / Institutional ID / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Seidu Mahamadu or SSTH-ADM-001"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-[#030a1a] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#05286f] focus:ring-2 focus:ring-[#05286f]/20 dark:focus:border-[#4ea836] dark:focus:ring-[#4ea836]/20 transition-all shadow-2xs"
                />
                <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-[#030a1a] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#05286f] focus:ring-2 focus:ring-[#05286f]/20 dark:focus:border-[#4ea836] dark:focus:ring-[#4ea836]/20 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 3: 5-Digit PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-[#4ea836]" />
                  5-Digit Security PIN
                </label>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#05286f] dark:text-[#8ee079]">
                  {pin.length}/5 digits
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  required
                  value={pin}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setPin(onlyNums);
                  }}
                  placeholder="•••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-[#030a1a] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono tracking-widest text-center sm:text-left focus:outline-none focus:border-[#05286f] focus:ring-2 focus:ring-[#05286f]/20 dark:focus:border-[#4ea836] dark:focus:ring-[#4ea836]/20 transition-all shadow-2xs"
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#05286f] to-[#083b9c] hover:from-[#041e57] hover:to-[#062d7a] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-[#05286f]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-[#4ea836]/30 mt-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Institutional Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Public Registration Prompt */}
            {onOpenRegister && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#030a1a] dark:hover:bg-[#091a3a] border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-[#05286f] dark:text-[#8ee079] hover:text-[#041c50] dark:hover:text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <GraduationCap className="w-4 h-4 text-[#4ea836]" />
                  <span>New Student? Apply for Public Admission</span>
                </button>
              </div>
            )}
          </form>

          {/* Security Features Bottom Pill */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ea836]" />
              TLS 1.3 Encrypted
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ea836]" />
              Role-Based Access
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-3.5 px-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-[#071530]/60 backdrop-blur-md z-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {settings?.name || 'StartSmart Tech Hub'} &copy; {new Date().getFullYear()}
          </span>
          <span>&bull;</span>
          <span>Institutional Academic Management & Identity System</span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#4ea836] shrink-0" />
            <span>{settings?.location || 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23'}</span>
          </span>
        </div>
      </footer>
    </div>
  );
};
