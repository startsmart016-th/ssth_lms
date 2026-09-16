import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  FileDown,
  X,
  Scissors,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sliders,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { downloadElementAsPdf } from '../utils/exportUtils';
import { parseStudentName, BarcodePattern } from './DigitalIdCard';

interface PrintableUser {
  _id?: string;
  idNumber?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  avatarUrl?: string;
  idCardIssuedDate?: string;
  idCardExpiryDate?: string;
  issueDate?: string;
  expiryDate?: string;
}

interface PrintableSettings {
  name?: string;
  tagline?: string;
  logoUrl?: string;
  sealOrStampUrl?: string;
  adminSignatureUrl?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
}

interface PrintableIdCardSheetProps {
  user: PrintableUser;
  settings?: PrintableSettings | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVerify?: (idNumber: string) => void;
}

export const PrintableIdCardSheet: React.FC<PrintableIdCardSheetProps> = ({
  user,
  settings,
  isOpen,
  onClose,
  onOpenVerify,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Production Sheet Options
  const [sheetMode, setSheetMode] = useState<'dual' | 'front' | 'back'>('dual');
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [showFoldLine, setShowFoldLine] = useState<boolean>(true);
  const [showPunchSlot, setShowPunchSlot] = useState<boolean>(true);
  const [showProductionDocket, setShowProductionDocket] = useState<boolean>(true);
  const [cardScale, setCardScale] = useState<'cr80' | 'enlarged'>('cr80');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const displayName = user.fullName || user.name || 'STUDENT NAME';
  const nameDetails = parseStudentName(displayName, user.department);
  const displayIssue = user.idCardIssuedDate || user.issueDate || '2025-01-10';
  const displayExpiry = user.idCardExpiryDate || user.expiryDate || '2027-12-31';
  const userIdentifier = user.idNumber || user._id || 'SST-2025-001';

  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify-id/${encodeURIComponent(userIdentifier)}`
      : `https://startsmart.tech/verify-id/${encodeURIComponent(userIdentifier)}`;

  const logoSrc = settings?.logoUrl && !settings.logoUrl.includes('imgur.com')
    ? settings.logoUrl
    : '/logo.png';
  const sealSrc = settings?.sealOrStampUrl && !settings.sealOrStampUrl.includes('imgur.com')
    ? settings.sealOrStampUrl
    : '/official-stamp.png';
  const avatarSrc = user?.avatarUrl && !user.avatarUrl.includes('imgur.com')
    ? user.avatarUrl
    : '/admin-avatar.png';
  const adminSigSrc = settings?.adminSignatureUrl && !settings.adminSignatureUrl.includes('imgur.com')
    ? settings.adminSignatureUrl
    : '/admin-signature.png';

  const institutionName = settings?.name || 'StartSmart Tech Hub';
  const institutionLocation =
    settings?.location || 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23';

  // Direct Browser Print Trigger
  const handlePrint = () => {
    window.print();
  };

  // High-Resolution PDF Production Sheet Export
  const handleDownloadPdf = async () => {
    const el = sheetRef.current || document.getElementById('printable-id-card-sheet');
    if (!el) return;
    try {
      setIsExportingPdf(true);
      await downloadElementAsPdf(
        el,
        `StartSmart_Physical_ID_${user.idNumber || 'Badge'}_ProductionSheet.pdf`,
        {
          orientation: sheetMode === 'dual' ? 'landscape' : 'portrait',
          format: 'a4',
          unit: 'mm',
          pixelRatio: 3,
          backgroundColor: '#ffffff',
          skipFonts: true,
        }
      );
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export high-res PDF sheet:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Dimensions based on selected physical card scale
  // Standard CR80 is 85.6mm x 54mm (approx 3.37" x 2.125")
  const cardWidthClass =
    cardScale === 'cr80'
      ? 'w-[340px] sm:w-[380px] md:w-[410px] min-h-[235px] sm:min-h-[255px]'
      : 'w-[370px] sm:w-[440px] md:w-[480px] min-h-[265px] sm:min-h-[295px]';

  return (
    <div
      id="printable-id-card-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible print:block"
    >
      {/* ==================================================================== */}
      {/* SCREEN CONTROLS TOOLBAR (Strictly hidden during physical print)       */}
      {/* ==================================================================== */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl mb-4 overflow-hidden no-print print:hidden">
        {/* Top Header */}
        <div className="bg-[#05286f] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-[#4ea836]" />
            <div>
              <h3 className="font-bold text-sm sm:text-base font-['Outfit'] flex items-center gap-2">
                Physical ID Card Print & Production Studio
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#4ea836] text-white font-bold">
                  CR80 Ready
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Generate professional physical plastic badges or laminated paper credentials with precision cut & fold guides.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Close Print Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options & Action Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Layout Mode Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#05286f] dark:text-[#4ea836]" /> Layout:
            </span>
            <button
              type="button"
              onClick={() => setSheetMode('dual')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                sheetMode === 'dual'
                  ? 'bg-[#05286f] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Dual-Sided (Cut & Fold)
            </button>
            <button
              type="button"
              onClick={() => setSheetMode('front')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                sheetMode === 'front'
                  ? 'bg-[#05286f] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Front Face Only
            </button>
            <button
              type="button"
              onClick={() => setSheetMode('back')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                sheetMode === 'back'
                  ? 'bg-[#05286f] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Back Face Only
            </button>
          </div>

          {/* Scale Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">Scale:</span>
            <button
              type="button"
              onClick={() => setCardScale('cr80')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                cardScale === 'cr80'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
              title="Standard ISO/IEC 7810 ID-1 (CR80) format (85.6mm × 54.0mm)"
            >
              CR80 Standard (1:1)
            </button>
            <button
              type="button"
              onClick={() => setCardScale('enlarged')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                cardScale === 'enlarged'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
              title="Enlarged format for high visibility badges"
            >
              Large Conference Badge
            </button>
          </div>
        </div>

        {/* Feature Toggles & Actions */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Guide Checkboxes */}
          <div className="flex items-center gap-4 flex-wrap text-slate-700 dark:text-slate-300">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCropMarks}
                onChange={(e) => setShowCropMarks(e.target.checked)}
                className="w-4 h-4 rounded text-[#05286f] focus:ring-0 cursor-pointer"
              />
              <span className="font-medium">Corner Cut Marks</span>
            </label>
            {sheetMode === 'dual' && (
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFoldLine}
                  onChange={(e) => setShowFoldLine(e.target.checked)}
                  className="w-4 h-4 rounded text-[#05286f] focus:ring-0 cursor-pointer"
                />
                <span className="font-medium">Center Fold Guide</span>
              </label>
            )}
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPunchSlot}
                onChange={(e) => setShowPunchSlot(e.target.checked)}
                className="w-4 h-4 rounded text-[#05286f] focus:ring-0 cursor-pointer"
              />
              <span className="font-medium">Lanyard Punch Slot</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showProductionDocket}
                onChange={(e) => setShowProductionDocket(e.target.checked)}
                className="w-4 h-4 rounded text-[#05286f] focus:ring-0 cursor-pointer"
              />
              <span className="font-medium">Institutional Docket</span>
            </label>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-browser-print"
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-[#00A859] hover:bg-[#008f4c] text-white font-bold flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Physical ID Card (Ctrl+P)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-[#0038A8] hover:bg-[#002b82] text-white font-bold flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95 text-xs disabled:opacity-60"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Download Production PDF'}</span>
            </button>
          </div>
        </div>

        {/* Print Production Instructions Banner */}
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Printer Setup Tip:</strong> In your browser print dialog, set <strong>Scale to 100%</strong> (or "Actual Size") and enable <strong>"Background Graphics"</strong> so the institutional green accents and authentic seal print cleanly.
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* THE PHYSICAL ID PRINT TARGET SHEET                                  */}
      {/* ==================================================================== */}
      <div
        id="printable-id-card-sheet"
        ref={sheetRef}
        className="w-full max-w-5xl bg-white text-black p-4 sm:p-8 rounded-none sm:rounded-2xl shadow-xl print:shadow-none print:p-0 print:m-0 print:border-none print:w-full print:max-w-none relative print-avoid-break"
        style={{
          fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
          color: '#000000',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Optional Physical Production Header Docket */}
        {showProductionDocket && (
          <div className="border-b-2 border-black pb-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs print-avoid-break">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Logo"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div>
                <h1 className="font-black text-sm uppercase tracking-wider text-[#0038A8]">
                  {institutionName} • OFFICIAL CREDENTIAL PRODUCTION SHEET
                </h1>
                <p className="text-[10px] text-slate-700 font-semibold tracking-wide">
                  Central Academic Registry • Republic of Ghana • ISO/IEC 7810 Standard CR80 Specification
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-slate-800">
              <div>
                <strong>REGISTRATION NO:</strong> {user.idNumber}
              </div>
              <div>
                <strong>BEARER:</strong> {displayName.toUpperCase()}
              </div>
              <div>
                <strong>PRINTED:</strong> {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* CARDS CONTAINER (Dual-Sided or Single View)                         */}
        {/* ================================================================== */}
        <div
          className={`flex flex-wrap items-center justify-center gap-6 sm:gap-10 my-4 print:my-6 relative ${
            sheetMode === 'dual' ? 'flex-row' : 'flex-col'
          }`}
        >
          {/* ================================================================ */}
          {/* 1. FRONT FACE CARD                                               */}
          {/* ================================================================ */}
          {(sheetMode === 'dual' || sheetMode === 'front') && (
            <div className="relative p-3 flex flex-col items-center print-avoid-break">
              {/* Corner Crop Marks for Precision Cutting */}
              {showCropMarks && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black pointer-events-none" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black pointer-events-none" />
                </>
              )}

              {/* Lanyard Slot Punch Guideline */}
              {showPunchSlot && (
                <div
                  className="w-10 h-2 border border-dashed border-slate-500 rounded-full mb-1 flex items-center justify-center text-[7px] text-slate-500 font-mono select-none"
                  title="Badge punch hole alignment guide"
                >
                  SLOT
                </div>
              )}

              {/* Front Face Physical Card Container */}
              <div
                className={`${cardWidthClass} bg-white text-black border-2 border-black rounded-[14px] p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden select-none print-flat`}
                style={{
                  boxShadow: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* Header Sub-label */}
                <div>
                  <div className="text-center text-[9px] font-bold text-slate-700 tracking-wider uppercase mb-0.5">
                    StartSmart Tech Hub • Official Credential
                  </div>

                  {/* Top Bar: Crest (Left), Title (Center), Seal (Right) */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center">
                      <img
                        src={logoSrc}
                        alt="Crest"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 text-center px-1">
                      <div className="text-xs sm:text-sm font-black text-[#0038A8] uppercase tracking-wider leading-tight">
                        {institutionName}
                      </div>
                      <div className="text-[9px] sm:text-[10.5px] font-black text-black uppercase tracking-widest leading-tight mt-0.5">
                        PROFESSIONAL IDENTIFICATION CARD
                      </div>
                    </div>
                    <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center">
                      <img
                        src={sealSrc}
                        alt="Official Seal"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/official-stamp.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Body: Framed Portrait + Identity Details */}
                  <div className="mt-2.5 flex gap-2.5 sm:gap-3 items-start">
                    {/* Portrait Photo Frame with 2px solid black border */}
                    <div className="w-20 h-26 sm:w-24 sm:h-31 shrink-0 border-2 border-black bg-white p-0.5 overflow-hidden flex items-center justify-center">
                      <img
                        src={avatarSrc}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                        }}
                      />
                    </div>

                    {/* Personal & Academic Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between text-[9px] sm:text-[10.5px]">
                      {/* LAST NAME */}
                      <div className="flex items-center">
                        <span className="font-bold text-black w-20 sm:w-24 shrink-0">LAST NAME</span>
                        <span className="text-black mr-1.5 font-bold">▶</span>
                        <span className="flex-1 font-black text-black border-b-2 border-black pb-0.5 truncate uppercase">
                          {nameDetails.lastName}
                        </span>
                      </div>

                      {/* FIRST NAME */}
                      <div className="flex items-center mt-1">
                        <span className="font-bold text-black w-20 sm:w-24 shrink-0">FIRST NAME</span>
                        <span className="text-black mr-1.5 font-bold">▶</span>
                        <span className="flex-1 font-black text-black border-b-2 border-black pb-0.5 truncate uppercase">
                          {nameDetails.firstName}
                        </span>
                      </div>

                      {/* MIDDLE NAME */}
                      <div className="flex items-center mt-1">
                        <span className="font-bold text-black w-20 sm:w-24 shrink-0">MIDDLE NAME</span>
                        <span className="text-black mr-1.5 font-bold">▶</span>
                        <span className="flex-1 font-black text-black border-b-2 border-black pb-0.5 truncate uppercase">
                          {nameDetails.middleName}
                        </span>
                      </div>

                      {/* Lower Metadata Grid: Registration No. & Dates */}
                      <div className="grid grid-cols-2 gap-1.5 mt-2 pt-1 border-t border-slate-200 text-[8px] sm:text-[9px]">
                        <div>
                          <div className="font-bold text-slate-700">REGISTRATION NO.</div>
                          <div className="font-mono font-black text-black text-[9px] sm:text-[10px]">
                            {user.idNumber}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-700">VALIDITY</div>
                          <div className="font-mono text-black">
                            {displayIssue} - {displayExpiry}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Solid Green Accent Bar + Code-128 Barcode */}
                <div className="mt-2">
                  <div className="w-full h-3 sm:h-3.5 bg-[#00A859] rounded-xs" />
                  <div className="relative w-full h-8 sm:h-9 bg-white pt-0.5 flex items-center justify-center overflow-hidden">
                    <BarcodePattern value={user.idNumber || 'STARTSMART'} className="w-full h-full" />
                    <div className="absolute left-1 bottom-0.5 bg-black text-white text-[7px] font-bold px-1.5 py-0.2 rounded-xs">
                      @startsmart.tech (VERIFIED)
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Label below */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 select-none no-print print:hidden">
                Card Front Face (Obverse)
              </span>
            </div>
          )}

          {/* ================================================================ */}
          {/* FOLD LINE GUIDE (Between Front and Back for double-sided folding)  */}
          {/* ================================================================ */}
          {sheetMode === 'dual' && showFoldLine && (
            <div className="hidden md:flex flex-col items-center justify-center px-1 text-slate-600 select-none print-avoid-break">
              <div className="w-0.5 h-12 border-l-2 border-dashed border-black" />
              <div className="my-2 p-1.5 bg-slate-100 rounded-full border border-black flex items-center gap-1 text-[9px] font-bold font-mono">
                <Scissors className="w-3 h-3 text-black" />
                <span>FOLD</span>
              </div>
              <div className="w-0.5 h-12 border-l-2 border-dashed border-black" />
            </div>
          )}

          {/* ================================================================ */}
          {/* 2. BACK FACE CARD                                                */}
          {/* ================================================================ */}
          {(sheetMode === 'dual' || sheetMode === 'back') && (
            <div className="relative p-3 flex flex-col items-center print-avoid-break">
              {/* Corner Crop Marks for Precision Cutting */}
              {showCropMarks && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black pointer-events-none" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black pointer-events-none" />
                </>
              )}

              {/* Lanyard Slot Punch Guideline */}
              {showPunchSlot && (
                <div
                  className="w-10 h-2 border border-dashed border-slate-500 rounded-full mb-1 flex items-center justify-center text-[7px] text-slate-500 font-mono select-none"
                  title="Badge punch hole alignment guide"
                >
                  SLOT
                </div>
              )}

              {/* Back Face Physical Card Container */}
              <div
                className={`${cardWidthClass} bg-white text-black border-2 border-black rounded-[14px] p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden select-none print-flat`}
                style={{
                  boxShadow: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  {/* Top Bar: Hub Name & Registry Subtext */}
                  <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={logoSrc}
                        alt="Logo"
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                      <div>
                        <div className="text-xs font-black text-[#0038A8] uppercase tracking-wider">
                          {institutionName}
                        </div>
                        <div className="text-[8px] font-bold text-slate-700 uppercase tracking-wider">
                          TERMS & CRYPTOGRAPHIC VERIFICATION
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-black text-white rounded-xs">
                      {user.idNumber}
                    </span>
                  </div>

                  {/* Center Content: QR Code & Issuance Terms */}
                  <div className="grid grid-cols-3 gap-2.5 mt-2.5 items-center">
                    {/* QR Code Verification Box */}
                    <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center">
                      <div className="p-1 bg-white border border-black rounded-xs">
                        <QRCodeSVG
                          value={verificationUrl}
                          size={70}
                          level="H"
                          includeMargin={false}
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      </div>
                      <span className="text-[7.5px] font-black uppercase text-[#0038A8] mt-1 tracking-tight">
                        SCAN TO VERIFY
                      </span>
                    </div>

                    {/* Legal / Institutional Notices */}
                    <div className="col-span-2 space-y-1 text-[8px] sm:text-[9.5px] text-slate-800 leading-tight">
                      <p>
                        <strong>TERMS OF ISSUANCE:</strong> This credential confirms active status at <strong>{institutionName}</strong> and remains institutional property. Non-transferable.
                      </p>
                      <p>
                        <strong>ACCESS PRIVILEGES:</strong> Grants entry to computing clusters, IoT sandbox laboratories, proctored examinations, and tech incubators.
                      </p>
                      <p className="text-slate-600 italic text-[7.5px] sm:text-[8.5px]">
                        Surrender if found to StartSmart Tech Hub, Tamale Northern Region, Ghana.
                      </p>
                    </div>
                  </div>

                  {/* Institutional Sign-off: Principal Mr. Seidu Mahamadu */}
                  <div className="mt-2.5 pt-1.5 border-t border-slate-300 flex items-center justify-between text-[8px] sm:text-[9px]">
                    <div>
                      <span className="font-bold text-slate-600 block">CAMPUS ADDRESS</span>
                      <span className="font-medium text-slate-900 max-w-[170px] truncate block">
                        {institutionLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="h-6 max-w-[90px] flex items-center justify-end">
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
                        <span className="font-black uppercase tracking-wider text-black block border-t border-black pt-0.2 text-[7.5px] sm:text-[8.5px]">
                          Mr. Seidu Mahamadu, Principal
                        </span>
                      </div>
                      <div className="w-8 h-8 shrink-0">
                        <img
                          src={sealSrc}
                          alt="Official Stamp"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/official-stamp.png';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className="mt-1.5 w-full h-2.5 bg-[#00A859] rounded-xs" />
              </div>

              {/* Card Label below */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 select-none no-print print:hidden">
                Card Back Face (Reverse)
              </span>
            </div>
          )}
        </div>

        {/* Production Footer / Verification Guide */}
        {showProductionDocket && (
          <div className="mt-6 pt-3 border-t-2 border-black flex flex-wrap items-center justify-between text-[9px] text-slate-700 print-avoid-break font-sans">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00A859] shrink-0" />
              <span>
                <strong>Accredited Institutional Physical Credential</strong> • Issued under the authority of StartSmart Tech Hub Registry • Republic of Ghana
              </span>
            </div>
            <div className="font-mono text-slate-500">
              HASH: SHA256:{user.idNumber}-CR80-AUTHENTICATED
            </div>
          </div>
        )}
      </div>

      {/* Screen Only: Bottom Floating Print Trigger */}
      <div className="w-full max-w-5xl mt-3 flex items-center justify-between no-print print:hidden text-xs text-slate-300">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#4ea836]" />
          <span>Ready for physical ID badge generation • CR80 landscape standard (85.6mm × 54.0mm)</span>
        </span>
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-[#00A859] hover:bg-[#008f4c] text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Physical Card</span>
        </button>
      </div>
    </div>
  );
};

export default PrintableIdCardSheet;
