import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadElementAsPng, downloadElementAsPdf } from '../utils/exportUtils';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink,
  RotateCw,
  FileDown,
  Printer,
} from 'lucide-react';
import { PrintableIdCardSheet } from './PrintableIdCardSheet';

/**
 * Interface for User Profile matching Mongoose User Schema
 */
export interface UserData {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email: string;
  role: 'admin' | 'facilitator' | 'student';
  idNumber: string;
  avatarUrl?: string;
  signatureUrl?: string;
  department?: string;
  status: 'active' | 'suspended' | 'graduated';
  idCardIssuedDate?: string;
  idCardExpiryDate?: string;
  issueDate?: string;
  expiryDate?: string;
  phone?: string;
}

/**
 * Interface for Institution Settings matching Singleton Mongoose Schema
 */
export interface InstitutionSettingsData {
  name: string;
  tagline: string;
  logoUrl: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  adminSignatureUrl: string;
  sealOrStampUrl: string;
}

interface DigitalIdCardProps {
  /** Optional initial or injected user data (if omitted, fetched from /api/users/me) */
  user?: UserData | null;
  /** Optional initial or injected settings (if omitted, fetched from /api/settings) */
  settings?: InstitutionSettingsData | null;
  /** Optional callback when user clicks to test verification */
  onOpenVerify?: (idNumber: string) => void;
  /** Optional custom container CSS class */
  className?: string;
}

/**
 * Helper to split full name into Last Name, First Name, and Middle Name
 */
export const parseStudentName = (fullNameStr?: string, deptStr?: string) => {
  const clean = (fullNameStr || 'STUDENT NAME').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return {
      lastName: parts[0].toUpperCase(),
      firstName: parts[0].toUpperCase(),
      middleName: (deptStr || 'TECHNOLOGY INNOVATION').toUpperCase(),
    };
  } else if (parts.length === 2) {
    return {
      lastName: parts[1].toUpperCase(),
      firstName: parts[0].toUpperCase(),
      middleName: (deptStr || 'DIGITAL SYSTEMS').toUpperCase(),
    };
  } else {
    return {
      lastName: parts[parts.length - 1].toUpperCase(),
      firstName: parts[0].toUpperCase(),
      middleName: parts.slice(1, -1).join(' ').toUpperCase(),
    };
  }
};

/**
 * Realistic full-width Barcode SVG generator matching Code-128 aesthetic
 */
export const BarcodePattern: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
  const bars: { width: number; space: number }[] = [];
  const seed = (value || 'STARTSMART').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < 54; i++) {
    const pseudo = Math.abs(Math.sin(seed + i * 1.93) * 100);
    const width = 1.6 + (pseudo % 3.6);
    const space = 1.3 + ((pseudo * 1.4) % 3.0);
    bars.push({ width, space });
  }

  let currentX = 6;
  return (
    <svg viewBox="0 0 540 45" className={className} preserveAspectRatio="none">
      <rect width="100%" height="100%" fill="#ffffff" />
      {bars.map((bar, idx) => {
        const x = currentX;
        currentX += bar.width + bar.space;
        if (x > 530) return null;
        return <rect key={idx} x={x} y={0} width={bar.width} height={45} fill="#000000" />;
      })}
    </svg>
  );
};

/**
 * ============================================================================
 * DIGITAL ID CARD COMPONENT (DigitalIdCard.tsx)
 * ============================================================================
 * Professional Identification Card designed to match the official credential
 * specifications (CR80 landscape standard):
 * - Top Header: Crest Logo (Left), "STARTSMART TECH HUB" & "PROFESSIONAL IDENTIFICATION CARD" (Center), Official Seal/Stamp (Right)
 * - Body: Framed Photo (Left), Underlined Fields with Right Arrow Markers (Center/Right), Motivational Reminder Quote
 * - Bottom: Full-width vibrant green accent bar, realistic barcode with brand overlay tag
 * - Dynamic Front & Back flip capability
 * - High-resolution PNG and PDF exports
 */
export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({
  user: initialUser,
  settings: initialSettings,
  onOpenVerify,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserData | null>(initialUser || null);
  const [settings, setSettings] = useState<InstitutionSettingsData | null>(initialSettings || null);
  const [loading, setLoading] = useState<boolean>(!initialUser || !initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // 3D TACTILE CARD PHYSICS (Subtle tilt, specular glare, dynamic elevation)
  // --------------------------------------------------------------------------
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const isHoveredMotion = useMotionValue(0);

  // Smooth spring configuration replicating the tactile resistance of CR80 PVC card
  const springConfig = { damping: 22, stiffness: 220, mass: 0.6 };

  // Subtle tilt limits: -7.5 deg to +7.5 deg
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [7.5, -7.5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-7.5, 7.5]), springConfig);
  const scale = useSpring(useTransform(isHoveredMotion, [0, 1], [1, 1.018]), springConfig);

  // Holographic / specular glare position tracking
  const glareX = useSpring(useTransform(mouseX, [0, 1], ['0%', '100%']), springConfig);
  const glareY = useSpring(useTransform(mouseY, [0, 1], ['0%', '100%']), springConfig);
  const glareOpacity = useSpring(useTransform(isHoveredMotion, [0, 1], [0, 0.24]), {
    damping: 20,
    stiffness: 180,
  });

  // Dynamic shadow shifting opposite to card tilt for realistic physical illumination
  const dynamicShadow = useTransform(
    [mouseX, mouseY, isHoveredMotion],
    ([x, y, h]: any[]) => {
      if (!h || Number(h) < 0.05) {
        return '0 20px 45px -10px rgba(0, 0, 0, 0.22), 0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)';
      }
      const offsetX = ((0.5 - Number(x)) * 26).toFixed(1);
      const offsetY = ((0.5 - Number(y)) * 22 + 26).toFixed(1);
      return `${offsetX}px ${offsetY}px 46px -8px rgba(0, 0, 0, 0.30), 0 10px 22px -8px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08)`;
    }
  );

  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]: any[]) =>
      `radial-gradient(circle 380px at ${gx} ${gy}, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.18) 40%, rgba(255, 255, 255, 0) 75%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExporting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
    isHoveredMotion.set(1);
  };

  const handleMouseEnter = () => {
    if (isExporting) return;
    isHoveredMotion.set(1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    isHoveredMotion.set(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isExporting || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
    isHoveredMotion.set(1);
  };

  const handleTouchEnd = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    isHoveredMotion.set(0);
  };

  // Sync props if parent updates
  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  // Fetch Settings & User details if not provided via props
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedSettings = initialSettings;
        if (!fetchedSettings) {
          try {
            const res = await fetch('/api/settings');
            if (res.ok) {
              fetchedSettings = await res.json();
            }
          } catch (e) {
            console.warn('Failed to fetch /api/settings, using defaults:', e);
          }
        }

        let fetchedUser = initialUser;
        if (!fetchedUser) {
          const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
          if (token) {
            try {
              const res = await fetch('/api/users/me', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (res.ok) {
                fetchedUser = await res.json();
              }
            } catch (e) {
              console.warn('Failed to fetch /api/users/me:', e);
            }
          }
        }

        if (isMounted) {
          if (fetchedSettings) setSettings(fetchedSettings);
          if (fetchedUser) setUser(fetchedUser);

          if (!fetchedSettings) {
            setSettings({
              name: 'StartSmart Tech Hub',
              tagline: 'Empowering Next-Gen Digital Leaders & Tech Innovators',
              logoUrl: '/logo.png',
              location: 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23 CEO OF SSTH',
              contactEmail: 'registrar@startsmart.tech',
              contactPhone: '+234 (0) 800-STARTSMART / +1 (555) 019-2831',
              websiteUrl: 'https://startsmart.tech',
              adminSignatureUrl: '/admin-signature.png',
              sealOrStampUrl: '/official-stamp.png',
            });
          }

          if (!fetchedUser) {
            setUser({
              fullName: 'Chinedu Okafor',
              name: 'Chinedu Okafor',
              email: 'chinedu.student@startsmart.tech',
              role: 'student',
              idNumber: 'SST-2025-001',
              department: 'Software Engineering & Applied AI',
              status: 'active',
              idCardIssuedDate: '2025-01-10',
              idCardExpiryDate: '2027-12-31',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chinedu',
            });
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load ID card details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [initialUser, initialSettings]);

  // Dynamic QR Code Verification URL
  const userIdentifier = user?.idNumber || user?._id || 'SST-2025-001';
  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify-id/${encodeURIComponent(userIdentifier)}`
      : `https://startsmart.tech/verify-id/${encodeURIComponent(userIdentifier)}`;

  const logoSrc =
    settings?.logoUrl && !settings.logoUrl.includes('imgur.com')
      ? settings.logoUrl
      : '/logo.png';
  const sealSrc =
    settings?.sealOrStampUrl && !settings.sealOrStampUrl.includes('imgur.com')
      ? settings.sealOrStampUrl
      : '/official-stamp.png';
  const avatarSrc =
    user?.avatarUrl && !user.avatarUrl.includes('imgur.com')
      ? user.avatarUrl
      : '/admin-avatar.png';
  const adminSigSrc =
    settings?.adminSignatureUrl && !settings.adminSignatureUrl.includes('imgur.com')
      ? settings.adminSignatureUrl
      : '/admin-signature.png';

  /**
   * Functional Download Button using `downloadElementAsPng`
   */
  const handleDownloadPNG = async () => {
    const el = cardRef.current || document.getElementById('official-digital-id-badge');
    if (!el) return;
    try {
      setIsExporting(true);
      setExportError(null);
      mouseX.set(0.5);
      mouseY.set(0.5);
      isHoveredMotion.set(0);
      setExportSuccess(false);

      // Brief pause to allow DOM element to settle to flat 2D layout
      await new Promise((r) => setTimeout(r, 100));

      const captureEl = cardRef.current || document.getElementById('official-digital-id-badge') || el;
      if (!captureEl) throw new Error('ID card element not found in DOM');

      await downloadElementAsPng(
        captureEl,
        `StartSmart-ID-${user?.idNumber || 'Badge'}${isFlipped ? '-Back' : '-Front'}.png`,
        {
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
          skipFonts: true,
        }
      );

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to capture ID card with export engine:', err);
      setExportError(err?.message || 'Unable to download PNG. Please retry.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * High-quality PDF export using `downloadElementAsPdf`
   */
  const handleDownloadPDF = async () => {
    const el = cardRef.current || document.getElementById('official-digital-id-badge');
    if (!el) return;
    try {
      setIsExporting(true);
      setExportError(null);
      mouseX.set(0.5);
      mouseY.set(0.5);
      isHoveredMotion.set(0);
      setExportSuccess(false);

      // Brief pause to allow DOM element to settle to flat 2D layout
      await new Promise((r) => setTimeout(r, 100));

      const captureEl = cardRef.current || document.getElementById('official-digital-id-badge') || el;
      if (!captureEl) throw new Error('ID card element not found in DOM');

      await downloadElementAsPdf(
        captureEl,
        `StartSmart-ID-${user?.idNumber || 'Badge'}.pdf`,
        {
          orientation: 'landscape',
          unit: 'mm',
          format: [140, 90],
          imgX: 5,
          imgY: 5,
          imgW: 130,
          imgH: 80,
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
          skipFonts: true,
        }
      );

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      setExportError(err?.message || 'Unable to export PDF. Please retry.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div id="digital-id-loading" className="flex flex-col items-center justify-center p-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A859] mb-3" />
        <p className="text-sm font-medium">Generating Official Professional ID Card...</p>
      </div>
    );
  }

  if (error || !user || !settings) {
    return (
      <div id="digital-id-error" className="p-6 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-center">
        <p className="text-sm text-rose-300 mb-3">{error || 'ID card record unavailable'}</p>
        <button
          id="btn-retry-id-card"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </button>
      </div>
    );
  }

  const displayName = user.fullName || user.name || 'Student Name';
  const nameDetails = parseStudentName(displayName, user.department);
  const displayIssue = user.idCardIssuedDate || user.issueDate || '2025-01-10';
  const displayExpiry = user.idCardExpiryDate || user.expiryDate || '2027-12-31';

  return (
    <div className={`flex flex-col items-center w-full max-w-2xl mx-auto ${className}`}>
      {/* Top Action Bar */}
      <div className="flex items-center justify-between w-full mb-3 px-1 text-xs no-print print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00A859]" />
          <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Professional Identification Credential
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
            3D Tactile Card
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-quick-print-id-card"
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A859] hover:bg-[#008f4c] text-white font-bold transition cursor-pointer shadow-xs"
            title="Open physical ID card printing studio"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Show Front' : 'Show Back'}</span>
          </button>
          <button
            id="btn-test-verify-url"
            type="button"
            onClick={() => {
              if (onOpenVerify) {
                onOpenVerify(user.idNumber || user._id || '');
              } else {
                window.open(verificationUrl, '_blank');
              }
            }}
            className="inline-flex items-center gap-1 text-[#0038A8] dark:text-sky-400 hover:underline font-medium"
            title="Open verification portal"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Verify Link
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PROFESSIONAL IDENTIFICATION CARD (CR80 LANDSCAPE DESIGN - 3D TACTILE)*/}
      {/* ==================================================================== */}
      <div
        className={`w-full flex justify-center py-2 relative ${isExporting ? '' : '[perspective:1200px]'} print:[perspective:none] print:py-0`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          id="official-digital-id-badge"
          ref={cardRef}
          className="w-full bg-white text-slate-900 border-2 border-black rounded-[22px] overflow-hidden select-none relative p-3.5 sm:p-5 flex flex-col justify-between min-h-[360px] sm:min-h-[400px] cursor-grab active:cursor-grabbing transition-colors will-change-transform print-flat print-avoid-break print:shadow-none print:border-2 print:border-black"
          style={{
            transformStyle: isExporting ? 'flat' : 'preserve-3d',
            transform: isExporting ? 'none' : undefined,
            rotateX: isExporting ? 0 : rotateX,
            rotateY: isExporting ? 0 : rotateY,
            scale: isExporting ? 1 : scale,
            boxShadow: isExporting
              ? '0 20px 45px -10px rgba(0, 0, 0, 0.25)'
              : dynamicShadow,
          }}
        >
          {/* Holographic / Specular Glare Reflection Sheen */}
          {!isExporting && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[20px] z-30"
              style={{
                opacity: glareOpacity,
                background: glareBackground,
              }}
            />
          )}

          {/* Physical CR80 Card Lamination Edge Sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[20px] border border-black/10 ring-1 ring-inset ring-white/60 z-20"
          />
        {!isFlipped ? (
          // ==================== FRONT OF ID CARD ====================
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Top Sub-label */}
              <div className="text-center text-[10px] sm:text-[11px] font-semibold text-slate-600 mb-0.5 tracking-wide">
                StartSmart Tech Hub • Official Credential
              </div>

              {/* Header: Crest Logo (Left), Hub Name & Card Title (Center), Seal/Stamp (Right) */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                {/* Tech Hub Crest Logo */}
                <div className="w-12 h-12 sm:w-15 sm:h-15 shrink-0 flex items-center justify-center">
                  <img
                    src={logoSrc}
                    alt="Institutional Crest"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>

                {/* Center Title & Sub-header */}
                <div className="flex-1 text-center px-1">
                  <h2 className="text-sm sm:text-xl font-black tracking-wider text-[#0038A8] uppercase font-['Outfit'] leading-tight">
                    {settings.name || 'STARTSMART TECH HUB'}
                  </h2>
                  <h3 className="text-[11px] sm:text-[13px] font-black tracking-widest text-slate-900 uppercase mt-0.5 leading-tight">
                    PROFESSIONAL IDENTIFICATION CARD
                  </h3>
                </div>

                {/* Official Institutional Seal / Stamp */}
                <div className="w-12 h-12 sm:w-15 sm:h-15 shrink-0 flex items-center justify-center">
                  <img
                    src={sealSrc}
                    alt="Institutional Stamp"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/official-stamp.png';
                    }}
                  />
                </div>
              </div>

              {/* Main Body: Photo on Left, Details & Motivational Quote on Right */}
              <div className="mt-3 sm:mt-4 flex gap-3 sm:gap-4.5 items-start">
                {/* Photo Frame (Portrait with crisp 2px black border) */}
                <div className="w-28 h-36 sm:w-33 sm:h-42 shrink-0 border-2 border-black bg-white p-0.5 shadow-xs overflow-hidden flex items-center justify-center">
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                    }}
                  />
                </div>

                {/* Identity Fields with Right Arrows and Black Underlines */}
                <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[144px] sm:min-h-[168px]">
                  {/* LAST NAME */}
                  <div className="flex items-center text-[10px] sm:text-xs">
                    <span className="font-bold tracking-wider text-black w-26 sm:w-32 shrink-0">
                      LAST NAME
                    </span>
                    <span className="text-[10px] text-black mr-2 font-black">▶</span>
                    <span className="flex-1 font-extrabold tracking-wider text-black border-b-2 border-black pb-0.5 px-1 truncate">
                      {nameDetails.lastName}
                    </span>
                  </div>

                  {/* FIRST NAME */}
                  <div className="flex items-center text-[10px] sm:text-xs mt-1 sm:mt-1.5">
                    <span className="font-bold tracking-wider text-black w-26 sm:w-32 shrink-0">
                      FIRST NAME
                    </span>
                    <span className="text-[10px] text-black mr-2 font-black">▶</span>
                    <span className="flex-1 font-extrabold tracking-wider text-black border-b-2 border-black pb-0.5 px-1 truncate">
                      {nameDetails.firstName}
                    </span>
                  </div>

                  {/* MIDDLE NAME */}
                  <div className="flex items-center text-[10px] sm:text-xs mt-1 sm:mt-1.5">
                    <span className="font-bold tracking-wider text-black w-26 sm:w-32 shrink-0">
                      MIDDLE NAME
                    </span>
                    <span className="text-[10px] text-black mr-2 font-black">▶</span>
                    <span className="flex-1 font-extrabold tracking-wider text-black border-b-2 border-black pb-0.5 px-1 truncate">
                      {nameDetails.middleName}
                    </span>
                  </div>

                  {/* Lower Section: Registration Details on Left, Motivational Quote on Right */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 sm:mt-3 items-center">
                    {/* Left: Registration Details */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center text-[9px] sm:text-[11px]">
                        <span className="font-bold text-black w-26 sm:w-28 shrink-0">
                          REGISTRATION NO.
                        </span>
                        <span className="text-[9px] text-black mr-1.5 font-black">▶</span>
                        <span className="flex-1 font-mono font-bold text-black border-b-2 border-black pb-0.5 px-1 truncate">
                          {user.idNumber}
                        </span>
                      </div>
                      <div className="flex items-center text-[9px] sm:text-[11px]">
                        <span className="font-bold text-black w-26 sm:w-28 shrink-0">
                          REGISTRATION DATE
                        </span>
                        <span className="text-[9px] text-black mr-1.5 font-black">▶</span>
                        <span className="flex-1 font-mono font-bold text-black border-b-2 border-black pb-0.5 px-1 truncate">
                          {displayIssue}
                        </span>
                      </div>
                      <div className="flex items-center text-[9px] sm:text-[11px]">
                        <span className="font-bold text-black w-26 sm:w-28 shrink-0">
                          VALID UNTIL
                        </span>
                        <span className="text-[9px] text-black mr-1.5 font-black">▶</span>
                        <span className="flex-1 font-mono font-bold text-black border-b-2 border-black pb-0.5 px-1 truncate">
                          {displayExpiry}
                        </span>
                      </div>
                    </div>

                    {/* Right: Motivational Reminder Quote matching reference screenshot */}
                    <div className="pl-1 sm:pl-2 flex flex-col justify-center text-[9px] sm:text-[11px] font-bold text-slate-400 tracking-wider leading-tight select-none uppercase">
                      <span>REMINDER: A FEW MONTHS</span>
                      <span>OF SACRIFICES WILL REWARD</span>
                      <span>YOU WITH A LIFELONG TITLE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Solid Green Accent Bar + Barcode with Brand Badge */}
            <div className="mt-3 sm:mt-4">
              {/* Solid Green Accent Stripe */}
              <div className="w-full h-5 sm:h-6 bg-[#00A859] rounded-xs shrink-0 shadow-xs" />

              {/* Full-width Barcode */}
              <div className="relative w-full h-11 sm:h-13 bg-white pt-1 pb-0.5 flex items-center justify-center overflow-hidden">
                <BarcodePattern value={user.idNumber} className="w-full h-full" />
                {/* Overlaid pill badge on bottom left of barcode */}
                <div className="absolute left-1.5 bottom-1 bg-black text-white text-[8px] sm:text-[9.5px] font-semibold px-2.5 py-0.5 rounded-sm tracking-tight shadow-sm z-10 select-none">
                  @startsmart.tech (OFFICIAL TECH HUB CREDENTIAL)
                </div>
              </div>
            </div>
          </div>
        ) : (
          // ==================== BACK OF ID CARD ====================
          <div className="flex flex-col justify-between h-full p-2">
            <div>
              {/* Back Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#0038A8] uppercase tracking-wider font-['Outfit']">
                      {settings.name || 'STARTSMART TECH HUB'}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      CREDENTIAL TERMS & LIVE VERIFICATION REGISTRY
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black text-white rounded-xs">
                  {user.idNumber}
                </span>
              </div>

              {/* Back Content: QR Code & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 items-center">
                {/* QR Code Verification */}
                <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center">
                  <div className="p-1 bg-white border border-black rounded-lg shadow-xs">
                    <QRCodeSVG
                      value={verificationUrl}
                      size={86}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <span className="text-[8px] font-black tracking-wider uppercase text-[#0038A8] mt-1.5">
                    SCAN TO VERIFY STATUS
                  </span>
                </div>

                {/* Legal / Institutional Notices */}
                <div className="sm:col-span-2 space-y-2 text-[9.5px] sm:text-[10.5px] text-slate-700 leading-relaxed">
                  <p>
                    <strong>TERMS OF ISSUANCE:</strong> This identification credential confirms the bearer's active enrollment and status at <strong>{settings.name}</strong>. It remains the exclusive property of the institution and is non-transferable.
                  </p>
                  <p>
                    <strong>FACILITY PRIVILEGES:</strong> Grants verified entry to physical tech studios, enterprise computing laboratories, cloud testing clusters, and proctored technical evaluations.
                  </p>
                  <p className="text-slate-500 italic">
                    If found, please surrender to any StartSmart Tech Hub campus or email <span className="font-mono text-[#0038A8]">{settings.contactEmail}</span>.
                  </p>
                </div>
              </div>

              {/* Institutional Sign-off: Principal Mr. Seidu Mahamadu */}
              <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-500 block">Campus Address</span>
                  <span className="text-[10px] font-medium text-slate-800">{settings.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="h-8 max-w-[120px] flex items-center justify-end">
                      {adminSigSrc ? (
                        <img
                          src={adminSigSrc}
                          alt="Signature"
                          className="h-full object-contain"
                        />
                      ) : (
                        <span className="font-cursive text-xs text-black italic">Mr. Seidu Mahamadu</span>
                      )}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-black block border-t border-black pt-0.5">
                      Mr. Seidu Mahamadu, Principal
                    </span>
                  </div>
                  <div className="w-10 h-10 shrink-0">
                    <img
                      src={sealSrc}
                      alt="Stamp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="mt-2 w-full h-3 bg-[#00A859] rounded-xs" />
          </div>
        )}
        </motion.div>
      </div>

      {/* ==================================================================== */}
      {/* EXPORT TOOLBAR: PNG, PDF & PRINT ACTIONS (Screen only, hidden on print)*/}
      {/* ==================================================================== */}
      <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 no-print print:hidden">
        <button
          id="btn-download-id-card-png"
          type="button"
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="py-3 px-3 rounded-xl bg-[#00A859] hover:bg-[#008f4c] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-60"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating PNG...</span>
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>PNG Saved!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </>
          )}
        </button>

        <button
          id="btn-download-id-card-pdf"
          type="button"
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="py-3 px-3 rounded-xl bg-[#0038A8] hover:bg-[#002b82] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-60"
        >
          <FileDown className="w-4 h-4" />
          <span>Download PDF</span>
        </button>

        <button
          id="btn-print-id-card"
          type="button"
          onClick={() => setShowPrintModal(true)}
          className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Physical ID</span>
        </button>
      </div>

      {/* Export Feedback Alerts */}
      {exportError && (
        <div className="w-full mt-2 p-2.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center justify-between no-print print:hidden">
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-xs font-bold underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {exportSuccess && (
        <div className="w-full mt-2 p-2.5 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 no-print print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Credential file downloaded successfully to your device!</span>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-500 mt-2 no-print print:hidden">
        Official StartSmart Tech Hub Credential • Hover or touch to interact with 3D tilt • Valid for physical facility access & online examination verification
      </p>

      {/* Physical ID Card Print & Production Studio Modal */}
      {showPrintModal && user && (
        <PrintableIdCardSheet
          user={user}
          settings={settings}
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          onOpenVerify={onOpenVerify}
        />
      )}
    </div>
  );
};

export default DigitalIdCard;
