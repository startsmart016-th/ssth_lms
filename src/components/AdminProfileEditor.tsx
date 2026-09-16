import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  RefreshCw,
  Award,
  IdCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminProfileEditorProps {
  onProfileUpdated?: () => void;
  onProfileSaved?: () => void;
}

const AVATAR_PRESETS = [
  {
    name: 'Official Admin (Seidu Mahamadu)',
    url: 'https://i.imgur.com/J1pnjB4.png',
  },
  {
    name: 'Local Backup Admin Photo',
    url: '/admin-avatar.png',
  },
  {
    name: 'Academic Dean',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tech Lead',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Research Faculty',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
];

export const AdminProfileEditor: React.FC<AdminProfileEditorProps> = ({ onProfileUpdated }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'Executive Academic Office');
  const [bio, setBio] = useState(user?.bio || 'Director of Academic Technologies & Lead Systems Architect.');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl && !user.avatarUrl.includes('photo-1534528741775')
      ? user.avatarUrl
      : 'https://i.imgur.com/J1pnjB4.png'
  );

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle local image file upload (converts to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPEG, WebP, or SVG).' });
      return;
    }

    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file size must be less than 3MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        setStatusMessage({ type: 'success', text: 'New photo loaded! Click "Save Changes" to apply.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    setAvatarUrl(url);
    setCustomUrlInput('');
    setShowUrlInput(false);
    setStatusMessage({ type: 'success', text: 'Custom image URL applied! Click "Save Changes" to apply.' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name is required.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'A valid email address is required.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const success = await updateProfile({
        name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department: department.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      if (success) {
        setStatusMessage({
          type: 'success',
          text: 'Admin profile details and avatar updated successfully! Changes are immediately active across the platform.',
        });
        if (onProfileUpdated) onProfileUpdated();
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to update profile. Please verify your connection and try again.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred while saving changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - 50% Green primary, 30% White clean canvas, 10% Gold honor, 10% Blue tech */}
      <div className="bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 rounded-3xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  Admin Profile & Identity
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>Executive Role</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your administrative credentials, contact information, departmental affiliation, and official profile photo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold">
              <IdCard className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{user?.idNumber || 'SST-ADM-001'}</span>
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Admin</span>
            </span>
          </div>
        </div>
      </div>

      {/* Status Feedback Banners */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 border transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
          }`}
        >
          <div className="flex items-center gap-2.5 font-medium">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Profile & Image Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Photo Customization (1 col) */}
        <div className="bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-200 dark:border-emerald-900/40 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Profile Image & Avatar</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Displayed on your Digital ID card, academic certificates, and dashboard header.
            </p>
          </div>

          {/* Avatar Showcase with Gold & Green Ring */}
          <div className="flex flex-col items-center justify-center pt-2 space-y-3">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-emerald-600 via-amber-400 to-sky-500 shadow-md">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                  }}
                  className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900 border-2 border-white dark:border-[#0a1f18]"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg border-2 border-white dark:border-[#0a1f18] transition cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                {fullName || 'Administrator'}
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Executive Academic Credential</span>
              </div>
            </div>
          </div>

          {/* Photo Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Upload Custom Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{showUrlInput ? 'Hide URL Input' : 'Use Direct Image Link'}</span>
            </button>

            {showUrlInput && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#06140f] border border-slate-200 dark:border-emerald-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Apply URL
                </button>
              </div>
            )}
          </div>

          {/* Quick Avatar Presets */}
          <div className="pt-2 border-t border-slate-200 dark:border-emerald-900/40 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider block">
              Curated Academic Presets
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(preset.url);
                    setStatusMessage({
                      type: 'success',
                      text: `Selected "${preset.name}". Click "Save Changes" to confirm.`,
                    });
                  }}
                  title={preset.name}
                  className={`p-1 rounded-xl border transition cursor-pointer flex flex-col items-center ${
                    avatarUrl === preset.url
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-9 h-9 rounded-lg object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Information Details (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0a1f18] border border-slate-200 dark:border-emerald-900/40 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-200 dark:border-emerald-900/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Administrative Profile Details</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Official directory records, academic affiliations, and institutional contact channels.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 px-2 py-0.5 rounded-full">
              Single-Source Record
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Full Name & Academic Title</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Seidu Mahamadu"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#06140f] border border-slate-200 dark:border-emerald-900/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Official Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Official Institutional Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@startsmart.tech"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#06140f] border border-slate-200 dark:border-emerald-900/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Contact Phone Number</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 (0) 800-STARTSMART"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#06140f] border border-slate-200 dark:border-emerald-900/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                <span>Department / Academic Division</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Office of the Director & Applied Tech Faculty"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#06140f] border border-slate-200 dark:border-emerald-900/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Professional Bio / Statement */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Professional Bio & Academic Responsibilities</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Provide an overview of your academic leadership, curriculum oversight, and executive responsibilities..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#06140f] border border-slate-200 dark:border-emerald-900/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition resize-none"
            />
          </div>

          {/* Security & Credential Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06140f] border border-slate-200 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Dual-Factor Verified Administrator</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Staff ID Number <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{user?.idNumber}</span> is authorized with high-privilege access.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
              Account Created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Profile & Avatar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
