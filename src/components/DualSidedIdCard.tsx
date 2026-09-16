import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadElementAsPng, downloadElementAsPdf } from '../utils/exportUtils';
import { User } from '../types';
import { useSettings } from '../context/SettingsContext';
import { parseStudentName } from './DigitalIdCard';
import {
  Download,
  ShieldCheck,
  RotateCw,
  Sparkles,
  QrCode,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  FileDown,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { PrintableIdCardSheet } from './PrintableIdCardSheet';

interface DigitalIDCardProps {
  user: User;
  onOpenVerify?: (userId: string) => void;
}

/**
 * Barcode component matching Code-128 density
 */
const BarcodePattern: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
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

export const DualSidedIdCard: React.FC<DigitalIDCardProps> = ({ user, onOpenVerify }) => {
  const { settings } = useSettings();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloading, setDownloading] = useState<'png' | 'pdf' | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // --------------------------------------------------------------------------
  // 3D TACTILE CARD PHYSICS (Subtle tilt, specular glare, dynamic elevation)
  // --------------------------------------------------------------------------
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const isHoveredMotion = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 220, mass: 0.6 };

  // Subtle tilt limits: -7.5 deg to +7.5 deg
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [7.5, -7.5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-7.5, 7.5]), springConfig);
  const scale = useSpring(useTransform(isHoveredMotion, [0, 1], [1, 1.018]), springConfig);

  // Specular glare tracking
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
    if (downloading !== null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
    isHoveredMotion.set(1);
  };

  const handleMouseEnter = () => {
    if (downloading !== null) return;
    isHoveredMotion.set(1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    isHoveredMotion.set(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (downloading !== null || e.touches.length === 0) return;
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

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify-id/${user.idNumber || user._id}`
    : `https://startsmart.tech/verify-id/${user.idNumber || user._id}`;

  const displayName = user.fullName || user.name || 'Student Name';
  const nameDetails = parseStudentName(displayName, user.department || user.programTrack);
  const displayIssue = user.idCardIssuedDate || user.issueDate || '2025-01-10';
  const displayExpiry = user.idCardExpiryDate || user.expiryDate || '2027-12-31';

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

  const downloadPNG = async () => {
    const el = cardRef.current || document.getElementById('digital-id-card-printable');
    if (!el) return;
    try {
      setDownloading('png');
      mouseX.set(0.5);
      mouseY.set(0.5);
      isHoveredMotion.set(0);
      await new Promise((r) => setTimeout(r, 80));

      const captureEl = cardRef.current || document.getElementById('digital-id-card-printable') || el;
      if (!captureEl) return;

      await downloadElementAsPng(
        captureEl,
        `StartSmart-ID-${user.idNumber}${isFlipped ? '-Back' : '-Front'}.png`,
        {
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
          skipFonts: true,
        }
      );
    } catch (e) {
      console.error('Failed to download PNG:', e);
    } finally {
      setDownloading(null);
    }
  };

  const downloadPDF = async () => {
    const el = cardRef.current || document.getElementById('digital-id-card-printable');
    if (!el) return;
    try {
      setDownloading('pdf');
      mouseX.set(0.5);
      mouseY.set(0.5);
      isHoveredMotion.set(0);
      await new Promise((r) => setTimeout(r, 80));

      const captureEl = cardRef.current || document.getElementById('digital-id-card-printable') || el;
      if (!captureEl) return;

      await downloadElementAsPdf(
        captureEl,
        `StartSmart-ID-${user.idNumber}.pdf`,
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
    } catch (e) {
      console.error('Failed to download PDF:', e);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Control Toolbar */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs no-print print:hidden">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#00A859]" />
          <span className="font-semibold uppercase tracking-wider">Dual-Sided Official Credential</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <RotateCw className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
            3D Flip Transition
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-dual-print-id-card"
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
            className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition active:scale-95 shadow-xs cursor-pointer"
            title="Flip ID card"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-700 ${isFlipped ? 'rotate-180 text-blue-600' : ''}`} />
            <span>{isFlipped ? 'Show Front' : 'Show Back'}</span>
          </button>
          {onOpenVerify && (
            <button
              onClick={() => onOpenVerify(user.idNumber || user._id)}
              className="inline-flex items-center gap-1 text-[#0038A8] dark:text-sky-400 hover:underline font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Verify Link
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CR80 LANDSCAPE PROFESSIONAL ID BADGE (3D TACTILE PERSPECTIVE + FLIP) */}
      {/* ==================================================================== */}
      <div
        className="w-full relative [perspective:1400px] print:[perspective:none] flex justify-center py-2 print:py-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="w-full relative will-change-transform rounded-[22px] print-flat print-avoid-break print:shadow-none"
          style={{
            transformStyle: 'preserve-3d',
            rotateX: downloading !== null ? 0 : rotateX,
            rotateY: downloading !== null ? 0 : rotateY,
            scale: downloading !== null ? 1 : scale,
            boxShadow: downloading !== null
              ? '0 20px 45px -10px rgba(0, 0, 0, 0.25)'
              : dynamicShadow,
          }}
        >
          {/* 3D CSS Flipper Container */}
          <div
            ref={cardRef}
            id="digital-id-card-printable"
            onClick={() => {
              if (downloading === null) {
                setIsFlipped((prev) => !prev);
              }
            }}
            className={`w-full relative rounded-[22px] cursor-pointer group ${
              downloading === null
                ? 'transition-transform duration-700 [transform-style:preserve-3d]'
                : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: downloading !== null
                ? 'none'
                : isFlipped
                ? 'rotateY(180deg)'
                : 'rotateY(0deg)',
              transition: downloading !== null
                ? 'none'
                : 'transform 0.75s cubic-bezier(0.4, 0.2, 0.2, 1)',
            }}
            title="Click card to flip between front and back"
          >
            {/* ==================== FRONT OF ID CARD ==================== */}
            <div
              className={`w-full bg-white text-slate-900 border-2 border-black rounded-[22px] overflow-hidden select-none relative p-3.5 sm:p-5 flex flex-col justify-between min-h-[360px] sm:min-h-[400px] ${
                downloading !== null && isFlipped ? 'hidden' : ''
              }`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: downloading !== null && !isFlipped ? 'none' : 'rotateY(0deg) translateZ(1px)',
              }}
            >
              {/* Front Specular Glare Reflection Sheen */}
              {downloading === null && (
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

              {/* Front Hover Flip Prompt Badge */}
              {downloading === null && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                >
                  <RotateCw className="w-2.5 h-2.5" />
                  <span>Click to flip</span>
                </div>
              )}

              <div className="flex flex-col justify-between h-full">
                <div>
                  {/* Top Subtle Sub-label */}
                  <div className="text-center text-[10px] sm:text-[11px] font-semibold text-slate-600 mb-0.5 tracking-wide">
                    StartSmart Tech Hub • Official Credential
                  </div>

                  {/* Header: Crest Logo (Left), Hub Name & Card Title (Center), Seal/Stamp (Right) */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    {/* Crest */}
                    <div className="w-12 h-12 sm:w-15 sm:h-15 shrink-0 flex items-center justify-center">
                      <img
                        src={logoSrc}
                        alt="Crest"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                    </div>

                    {/* Title */}
                    <div className="flex-1 text-center px-1">
                      <h2 className="text-sm sm:text-xl font-black tracking-wider text-[#0038A8] uppercase font-['Outfit'] leading-tight">
                        {settings.name || 'STARTSMART TECH HUB'}
                      </h2>
                      <h3 className="text-[11px] sm:text-[13px] font-black tracking-widest text-slate-900 uppercase mt-0.5 leading-tight">
                        PROFESSIONAL IDENTIFICATION CARD
                      </h3>
                    </div>

                    {/* Seal / Stamp */}
                    <div className="w-12 h-12 sm:w-15 sm:h-15 shrink-0 flex items-center justify-center">
                      <img
                        src={sealSrc}
                        alt="Stamp"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/official-stamp.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Main Body: Photo on Left, Details & Motivational Quote on Right */}
                  <div className="mt-3 sm:mt-4 flex gap-3 sm:gap-4.5 items-start">
                    {/* Photo Frame */}
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

                    {/* Fields with Arrows and Underlines */}
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

                      {/* Lower Section: Registration Details & Motivational Quote */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 sm:mt-3 items-center">
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

                        {/* Motivational Quote */}
                        <div className="pl-1 sm:pl-2 flex flex-col justify-center text-[9px] sm:text-[11px] font-bold text-slate-400 tracking-wider leading-tight select-none uppercase">
                          <span>REMINDER: A FEW MONTHS</span>
                          <span>OF SACRIFICES WILL REWARD</span>
                          <span>YOU WITH A LIFELONG TITLE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Solid Green Bar + Barcode */}
                <div className="mt-3 sm:mt-4">
                  <div className="w-full h-5 sm:h-6 bg-[#00A859] rounded-xs shrink-0 shadow-xs" />
                  <div className="relative w-full h-11 sm:h-13 bg-white pt-1 pb-0.5 flex items-center justify-center overflow-hidden">
                    <BarcodePattern value={user.idNumber} className="w-full h-full" />
                    <div className="absolute left-1.5 bottom-1 bg-black text-white text-[8px] sm:text-[9.5px] font-semibold px-2.5 py-0.5 rounded-sm tracking-tight shadow-sm z-10 select-none">
                      @startsmart.tech (OFFICIAL TECH HUB CREDENTIAL)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== BACK OF ID CARD ==================== */}
            <div
              className={`w-full bg-white text-slate-900 border-2 border-black rounded-[22px] overflow-hidden select-none p-3.5 sm:p-5 flex flex-col justify-between min-h-[360px] sm:min-h-[400px] ${
                downloading !== null
                  ? isFlipped
                    ? 'relative'
                    : 'hidden'
                  : 'absolute inset-0 h-full'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: downloading !== null && isFlipped ? 'none' : 'rotateY(180deg) translateZ(1px)',
              }}
            >
              {/* Back Specular Glare Reflection Sheen */}
              {downloading === null && (
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

              {/* Back Hover Flip Prompt Badge */}
              {downloading === null && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                >
                  <RotateCw className="w-2.5 h-2.5" />
                  <span>Click to flip</span>
                </div>
              )}

              <div className="flex flex-col justify-between h-full">
                <div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 items-center">
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

                    <div className="sm:col-span-2 space-y-2 text-[9.5px] sm:text-[10.5px] text-slate-700 leading-relaxed">
                      <p>
                        <strong>TERMS OF ISSUANCE:</strong> This credential confirms the bearer's valid matriculation and active standing at <strong>{settings.name}</strong>. It remains institutional property and must be produced upon request.
                      </p>
                      <p>
                        <strong>FACILITY ACCESS:</strong> Authorizes physical entrance to designated technical studios, laboratories, and specialized software testing platforms.
                      </p>
                      <p className="text-slate-500 italic">
                        If found, surrender to StartSmart Tech Hub, Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23 CEO OF SSTH or contact <span className="font-mono text-[#0038A8]">{settings.contactEmail}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">Campus Coordinates</span>
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

                <div className="mt-2 w-full h-3 bg-[#00A859] rounded-xs" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Export Toolbar (Screen only, hidden on print) */}
      <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 no-print print:hidden">
        <button
          type="button"
          onClick={downloadPNG}
          disabled={downloading !== null}
          className="py-3 px-3 rounded-xl bg-[#00A859] hover:bg-[#008f4c] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          <span>
            {downloading === 'png'
              ? 'Rendering PNG...'
              : `Download PNG (${isFlipped ? 'Back' : 'Front'})`}
          </span>
        </button>

        <button
          type="button"
          onClick={downloadPDF}
          disabled={downloading !== null}
          className="py-3 px-3 rounded-xl bg-[#0038A8] hover:bg-[#002b82] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-60"
        >
          <FileDown className="w-4 h-4" />
          <span>
            {downloading === 'pdf'
              ? 'Rendering PDF...'
              : `Download PDF (${isFlipped ? 'Back' : 'Front'})`}
          </span>
        </button>

        <button
          id="btn-dual-print-sheet"
          type="button"
          onClick={() => setShowPrintModal(true)}
          className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Physical ID</span>
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 no-print print:hidden">
        Click the ID card or use the button above to flip between Front and Back in realistic 3D space
      </p>

      {/* Physical ID Card Print & Production Studio Modal */}
      {showPrintModal && (
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

export const DigitalIDCard = DualSidedIdCard;
export default DualSidedIdCard;
