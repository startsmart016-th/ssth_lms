import React, { useRef, useState } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, UserCheck, Camera, PenTool, Check, Eraser, Phone, Building, FileText } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [department, setDepartment] = useState(user.department || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [signatureUrl, setSignatureUrl] = useState(user.signatureUrl || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const isSigner = user.role === 'admin' || user.role === 'facilitator';

  // Drawing signature on canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureUrl('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await updateProfile({
      name,
      phone,
      department,
      bio,
      avatarUrl,
      ...(isSigner ? { signatureUrl } : {}),
    });
    setSaving(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    }
  };

  const sampleAvatars = [
    'https://i.imgur.com/J1pnjB4.png',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 my-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white font-['Outfit']">Profile & Credentials</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar / Passport Photo Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Passport Photo (Renders on Digital ID Card)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-sky-400 bg-slate-800 shrink-0">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={e => {
                    let val = e.target.value;
                    if (val.includes('lXiJnGI')) val = 'https://i.imgur.com/J1pnjB4.png';
                    setAvatarUrl(val);
                  }}
                  placeholder="Paste image URL..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Presets:</span>
                  {sampleAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-6 h-6 rounded-full overflow-hidden border-2 transition ${
                        avatarUrl === url ? 'border-sky-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Core Biodata */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official ID Number</label>
              <input
                type="text"
                value={user.idNumber}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+234..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Track</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Profile Summary</label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Short bio..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Official Signature Section (Admin & Facilitators only) */}
          {isSigner && (
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Official Endorsement Signature ({user.role.toUpperCase()})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400 transition"
                >
                  <Eraser className="w-3 h-3" />
                  <span>Clear Pad</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                {user.role === 'admin'
                  ? 'Admin signature renders on Digital ID cards, institution certificates, and transcripts.'
                  : 'Facilitator signature renders on completed course certificates and report cards.'}
              </p>

              {/* Interactive signature pad */}
              <div className="relative border-2 border-dashed border-slate-700 rounded-xl bg-slate-950 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={100}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-24 cursor-crosshair touch-none"
                />
                {!signatureUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-xs font-serif italic">
                    Draw signature here or sign with stylus / finger
                  </div>
                )}
              </div>

              {signatureUrl && (
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 shrink-0">Current Signature:</span>
                  <div className="h-7 max-w-[200px] overflow-hidden flex items-center">
                    <img src={signatureUrl} alt="Signature" className="h-full object-contain filter invert opacity-90" />
                  </div>
                  <span className="ml-auto text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" /> {saving ? 'Updating...' : 'Save Profile Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
