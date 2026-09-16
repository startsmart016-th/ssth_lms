import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  Save,
  Lock,
  Moon,
  Sun,
  Layout,
  Clock,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { playClickSound, playSuccessSound, isSoundEnabled, setSoundEnabled } from '../../utils/soundEffects';

export const PreferencesView: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Settings state
  const [pin, setPin] = useState(() => localStorage.getItem('sst_security_pin') || '1234');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [forumAlerts, setForumAlerts] = useState(true);
  const [labReminders, setLabReminders] = useState(true);
  const [saveBanner, setSaveBanner] = useState(false);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinMessage({ text: 'PIN must be exactly 4 numerical digits.', type: 'error' });
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage({ text: 'PINs do not match. Please re-enter carefully.', type: 'error' });
      return;
    }

    localStorage.setItem('sst_security_pin', newPin);
    setPin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinMessage({ text: 'Security PIN updated successfully! Transcripts and certificates are secured.', type: 'success' });
    playSuccessSound();
    setTimeout(() => setPinMessage(null), 3000);
  };

  const handleSaveGeneral = () => {
    playSuccessSound();
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-[#071530] dark:to-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-[#0e2a66] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#05286f]/10 text-[#05286f] dark:bg-[#4ea836]/20 dark:text-[#8ee079] border border-[#05286f]/20 dark:border-[#4ea836]/30">
              System Settings
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Account Security & Interactive Controls
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Security PIN & Preferences
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Configure your 4-digit credential verification PIN, interface audio feedback, notification channels, and active security sessions.
          </p>
        </div>

        {saveBanner && (
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: 4-Digit Security PIN */}
        <div className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#0a1f47] text-[#05286f] dark:text-[#8ee079] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Credential Security PIN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Used to authorize certificate downloads and exam submissions.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">Current Security PIN:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-widest text-[#05286f] dark:text-[#8ee079]">
                {showPin ? pin : '••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {pinMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                pinMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{pinMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePin} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 4819"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] font-mono tracking-widest text-center text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="e.g. 4819"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] font-mono tracking-widest text-center text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Update Security PIN</span>
            </button>
          </form>
        </div>

        {/* Card 2: Interactive Feedback & Audio */}
        <div className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#4ea836] flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Audio Synthesis & Accessibility
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synthesized tactile sound cues for buttons, card flips, and scores.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Interface Sound Effects
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Play harmonic Web Audio chimes on clicks, card flips, and tests.
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  soundOn
                    ? 'bg-[#4ea836] text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundOn ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Color Mode Preference
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Current theme: <strong className="capitalize">{theme} mode</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  toggleTheme();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] text-xs font-bold text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Notification Alerts */}
        <div className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Notification Channels
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose alerts sent to your hub email and mobile terminal.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {[
              {
                title: 'Timetable & Class Schedule Alerts',
                desc: 'Alerts 15 minutes before scheduled lectures or lab sessions.',
                checked: labReminders,
                setter: setLabReminders,
              },
              {
                title: 'Tech Forum Replies & Mentions',
                desc: 'Notifications when someone answers or solves your question.',
                checked: forumAlerts,
                setter: setForumAlerts,
              },
              {
                title: 'Grade Releases & Certificates',
                desc: 'Instant alert upon transcript and diploma validation.',
                checked: emailAlerts,
                setter: setEmailAlerts,
              },
            ].map((item, idx) => (
              <label
                key={idx}
                className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-[#0a1f47]/40 transition"
              >
                <div className="pr-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {item.desc}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => {
                    playClickSound();
                    item.setter(e.target.checked);
                  }}
                  className="w-4 h-4 rounded text-[#4ea836] focus:ring-[#4ea836] cursor-pointer shrink-0 mt-1"
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSaveGeneral}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] text-xs font-bold text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Notification Preferences</span>
          </button>
        </div>

        {/* Card 4: Active Hardware & Sessions */}
        <div className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Active Security Sessions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified devices authenticated to your academic ID.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Current Web Session (Active Now)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    IP: 102.176.44.12 • Tamale Fiber Hub Node
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#071530] px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Online
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Mobile Pass NFC (Android)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Last active 4 hours ago • Hub Turnstile
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
