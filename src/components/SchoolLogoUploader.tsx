import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Eye,
  Award,
  CreditCard,
  FileText,
  Building,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface SchoolLogoUploaderProps {
  currentLogoUrl?: string;
  onLogoUpdated?: (newUrl: string) => void;
}

const PRESET_LOGOS = [
  {
    name: 'StartSmart Tech Hub (Official Logo)',
    url: 'https://i.imgur.com/x45FW8G.png',
    desc: 'Official institutional insignia and emblem for the Tech Hub',
  },
  {
    name: 'Tech Crest (Green & Cyan)',
    url: '/icon.svg',
    desc: 'Official vector crest with digital micro-circuits',
  },
  {
    name: 'Academic Shield (Gold & Slate)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><path d="M50 5 L90 20 L90 55 C90 75 50 95 50 95 C50 95 10 75 10 55 L10 20 Z" fill="%230f172a" stroke="%23f59e0b" stroke-width="4"/><path d="M50 15 L80 27 L80 52 C80 68 50 82 50 82 C50 82 20 68 20 52 L20 27 Z" fill="%231e293b"/><path d="M50 25 L50 72 M28 48 L72 48" stroke="%23fbbf24" stroke-width="3"/><circle cx="50" cy="48" r="7" fill="%23059669"/></svg>',
    desc: 'Traditional heraldic shield for higher education',
  },
  {
    name: 'Modern Monogram (Emerald Hex)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="%23047857" stroke="%2334d399" stroke-width="4"/><text x="50" y="62" font-family="sans-serif" font-weight="900" font-size="34" fill="%23ffffff" text-anchor="middle">ST</text></svg>',
    desc: 'Minimalist geometric tech academy insignia',
  },
];

export const SchoolLogoUploader: React.FC<SchoolLogoUploaderProps> = ({
  currentLogoUrl,
  onLogoUpdated,
}) => {
  const { settings, uploadLogo } = useSettings();
  const { token } = useAuth();

  const [previewUrl, setPreviewUrl] = useState<string>(currentLogoUrl || settings.logoUrl || 'https://i.imgur.com/x45FW8G.png');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeAspect, setActiveAspect] = useState<'all' | 'header' | 'certificate' | 'idcard' | 'letter'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process selected file to Base64/DataURL
  const handleProcessFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a PNG, SVG, JPG, or WebP image.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit. Please upload an optimized institutional logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Upload and persist to backend via SettingsContext uploadLogo handler
  const handleSaveLogo = async () => {
    if (!previewUrl) return;
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await uploadLogo(previewUrl);

      if (!result.success) {
        throw new Error(result.error || 'Failed to persist logo to server.');
      }

      if (onLogoUpdated && result.logoUrl) {
        onLogoUpdated(result.logoUrl);
      }

      setSuccessMessage('School logo uploaded successfully! Propagated to all certificates, ID cards, letters, and navigation headers.');
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating institutional logo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#0e2a66] pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#05286f] dark:text-[#8ee079]" />
            School Logo & Institutional Emblem
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your official school logo. Once saved, it immediately appears across certificates, digital ID badges, admission letters, and the portal header.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveLogo}
          disabled={isUploading || previewUrl === settings.logoUrl}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#05286f] hover:bg-[#041c50] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#05286f]/30 border border-[#4ea836]/40 transition active:scale-95 cursor-pointer shrink-0"
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Logo...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload & Apply School Logo</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-[#4ea836]/10 border border-[#4ea836]/30 flex items-center gap-2.5 text-xs text-[#05286f] dark:text-[#8ee079] font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#4ea836] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & URL Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Interactive Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[190px] ${
              isDragging
                ? 'border-[#4ea836] bg-[#4ea836]/10 scale-[1.01]'
                : 'border-slate-300 dark:border-[#0e2a66] hover:border-[#4ea836] dark:hover:border-[#4ea836] bg-slate-50/70 dark:bg-[#071530]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#05286f]/10 dark:bg-[#05286f]/40 text-[#05286f] dark:text-[#8ee079] border border-[#05286f]/20 dark:border-[#4ea836]/30 flex items-center justify-center mb-3 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Click to select or drag & drop school logo
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Supports PNG, SVG, JPG, or WebP (transparent background recommended)
            </p>
          </div>

          {/* Direct URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Or Enter Direct Web/CDN URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={previewUrl}
                onChange={e => setPreviewUrl(e.target.value)}
                placeholder="https://example.edu/logo.png"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4ea836] font-mono"
              />
              <button
                type="button"
                onClick={() => setPreviewUrl('https://i.imgur.com/x45FW8G.png')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#05286f]/30 border border-slate-200 dark:border-[#0e2a66] text-xs font-semibold text-[#05286f] dark:text-[#8ee079]"
                title="Reset to official tech hub logo"
              >
                Official Logo
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#0e2a66]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Or Choose Pre-Built Academic Crest:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_LOGOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewUrl(preset.url)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    previewUrl === preset.url
                      ? 'border-[#4ea836] bg-[#4ea836]/10 dark:bg-[#4ea836]/15 ring-1 ring-[#4ea836]'
                      : 'border-slate-200 dark:border-[#0e2a66] hover:bg-slate-100 dark:hover:bg-[#071530]'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-8 h-8 object-contain shrink-0 rounded-lg p-0.5 bg-slate-900 border border-slate-700"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {preset.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Aspect Live Visual Previews (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#05286f] dark:text-[#8ee079]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Live Aspect Previews (Where Logo Appears)
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'header', 'certificate', 'idcard'] as const).map(asp => (
                <button
                  key={asp}
                  type="button"
                  onClick={() => setActiveAspect(asp)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                    activeAspect === asp
                      ? 'bg-[#05286f] text-white dark:bg-[#4ea836]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#071530]'
                  }`}
                >
                  {asp}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {/* Aspect 1: Portal Navigation Header */}
            {(activeAspect === 'all' || activeAspect === 'header') && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079]" />
                    1. Portal Navigation Header Aspect
                  </span>
                  <span className="text-[10px] text-[#4ea836] font-mono font-semibold">Live Sync</span>
                </div>
                {/* Mock Header */}
                <div className="px-4 py-3 rounded-xl bg-slate-900 text-white flex items-center justify-between border border-slate-800 shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Logo Header Preview"
                      className="w-9 h-9 object-contain rounded-xl p-1 bg-slate-800 border border-slate-700"
                    />
                    <div>
                      <div className="text-sm font-extrabold tracking-wide uppercase font-['Outfit'] flex items-center gap-2">
                        {settings.name}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4ea836]/20 text-[#8ee079] font-mono border border-[#4ea836]/30">LMS</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {settings.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Workspace</span>
                    <span className="px-2 py-1 rounded bg-[#05286f] text-white font-bold border border-[#4ea836]/40">Portal Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Aspect 2: Official Certificate Crest */}
            {(activeAspect === 'all' || activeAspect === 'certificate') && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#09286F] dark:text-[#53AD34]" />
                    2. Official Certificate Header & Crest Aspect
                  </span>
                  <span className="text-[10px] text-[#53AD34] font-mono">Academic Credential</span>
                </div>
                {/* Mock Certificate Header */}
                <div className="p-4 rounded-xl bg-white text-slate-900 border-2 border-[#09286F] text-center relative overflow-hidden shadow-md">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <img
                      src={previewUrl}
                      alt="Certificate Crest Preview"
                      className="w-10 h-10 object-contain"
                    />
                    <div className="text-left">
                      <div className="flex items-center gap-1 leading-none">
                        <span className="text-sm font-black tracking-wider text-[#09286F] uppercase font-['Outfit']">
                          {settings.name || 'STARTSMART TECH HUB'}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#53AD34] uppercase tracking-wider font-semibold mt-0.5">
                        {settings.tagline || 'Empowering Next-Gen Digital Leaders'}
                      </p>
                    </div>
                  </div>
                  <h5 className="text-lg font-serif font-bold text-[#09286F] mt-2">
                    Certificate of Completion
                  </h5>
                  <p className="text-[10px] text-slate-600 font-serif italic">
                    Awarded for verified course competencies across all student levels
                  </p>
                </div>
              </div>
            )}

            {/* Aspect 3: Digital ID Card Badge */}
            {(activeAspect === 'all' || activeAspect === 'idcard') && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079]" />
                    3. Digital Student & Staff ID Card Badge Aspect
                  </span>
                  <span className="text-[10px] text-[#4ea836] font-mono">Microchip NFC Ready</span>
                </div>
                {/* Mock ID Card Header */}
                <div className="p-3.5 rounded-xl bg-white text-slate-900 border-2 border-black flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={previewUrl}
                      alt="ID Card Logo Preview"
                      className="w-8 h-8 object-contain rounded-lg p-0.5"
                    />
                    <div>
                      <span className="text-xs font-black text-[#0038A8] uppercase tracking-wide block font-['Outfit']">
                        {settings.name || 'STARTSMART TECH HUB'}
                      </span>
                      <span className="text-[9px] text-slate-900 font-bold block uppercase tracking-wider">
                        Professional Identification Card
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-sm bg-[#00A859] text-white font-bold">
                    VERIFIED
                  </span>
                </div>
              </div>
            )}

            {/* Aspect 4: Official Admission Letter Letterhead */}
            {(activeAspect === 'all' || activeAspect === 'letter') && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079]" />
                    4. Official Letterhead & Registry Verification Aspect
                  </span>
                  <span className="text-[10px] text-[#4ea836] font-mono">Admission Letter</span>
                </div>
                {/* Mock Letterhead */}
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                  <img
                    src={previewUrl}
                    alt="Letterhead Logo Preview"
                    className="w-10 h-10 object-contain rounded-xl p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-extrabold uppercase font-['Outfit'] block">
                      Office of the Registrar & Admissions
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      {settings.name} • {settings.location}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
