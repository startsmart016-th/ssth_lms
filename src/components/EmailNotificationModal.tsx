import React, { useState } from 'react';
import {
  X,
  Mail,
  Award,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Send,
  Eye,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { MockEmailNotification } from '../types';
import { markMockEmailRead, deleteMockEmail } from '../services/notificationService';

interface EmailNotificationModalProps {
  email: MockEmailNotification | null;
  onClose: () => void;
  onEmailUpdated?: () => void;
  onNavigateToCourse?: (courseId: string) => void;
  onNavigateToCertificates?: () => void;
  token?: string;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  email,
  onClose,
  onEmailUpdated,
  onNavigateToCourse,
  onNavigateToCertificates,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'formatted' | 'html'>('formatted');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!email) return null;

  const isCourseEnrollment = email.category === 'course_enrollment';
  const isCertificateAward = email.category === 'certificate_awarded';

  const handleMarkAsRead = async () => {
    await markMockEmailRead(email._id, token);
    email.read = true;
    if (onEmailUpdated) onEmailUpdated();
  };

  const handleDelete = async () => {
    if (confirm('Delete this mock email notification?')) {
      setIsDeleting(true);
      await deleteMockEmail(email._id, token);
      setIsDeleting(false);
      if (onEmailUpdated) onEmailUpdated();
      onClose();
    }
  };

  const sentDate = new Date(email.sentAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#081b14] border border-slate-200 dark:border-emerald-900/50 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon: 50% Green, 10% Gold Accent */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {isCourseEnrollment && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/40">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Course Enrollment Notice</span>
                  </span>
                )}
                {isCertificateAward && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/30 text-amber-200 border border-amber-300/40">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Official Certificate Award</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white border border-white/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  <span>MOCK DELIVERED</span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-white leading-tight">
                {email.subject}
              </h2>

              <p className="text-xs text-emerald-100/90 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-300" />
                <span>Dispatched on {sentDate}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Envelope Metadata Bar (Crisp White Canvas, Tech Blue highlights) */}
        <div className="bg-slate-50 dark:bg-[#06140f] border-b border-slate-200 dark:border-emerald-950 px-5 py-3.5 text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 dark:text-slate-500 font-semibold w-12">From:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{email.from}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 dark:text-slate-500 font-semibold w-12">To:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{email.recipientName}</span>
              <span className="text-slate-400 font-mono text-[11px]">&lt;{email.to}&gt;</span>
              <span className="px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-mono text-[10px] font-bold">
                {email.recipientIdNumber}
              </span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-200/80 dark:bg-emerald-950/80 border border-slate-300/60 dark:border-emerald-900/50 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('formatted')}
              className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'formatted'
                  ? 'bg-white dark:bg-emerald-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reader View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'html'
                  ? 'bg-white dark:bg-emerald-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>HTML Email</span>
            </button>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-5 sm:p-6 max-h-[58vh] overflow-y-auto">
          {activeTab === 'formatted' ? (
            <div className="space-y-5">
              
              {/* Highlight Card */}
              {isCourseEnrollment && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
                      Confirmed Course Details
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
                      {email.metadata?.courseCode || 'COURSE'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100 font-['Outfit']">
                    {email.metadata?.courseTitle}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Academic Level</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Level {email.metadata?.courseLevel || 100}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Credit Units</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {email.metadata?.credits || 3}.0 Credits
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Lead Facilitator</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {email.metadata?.facilitatorName || 'Faculty Lead'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Status</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active Enrolled</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isCertificateAward && (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Verified Digital Credential</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-mono text-[10px] font-bold">
                      GRADE {email.metadata?.grade || 'A'} ({email.metadata?.score || 94}%)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-amber-950 dark:text-amber-100 font-['Outfit']">
                    {email.metadata?.courseTitle || email.metadata?.courseCode}
                  </h3>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Certificate Serial ID</span>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs sm:text-sm">
                        {email.metadata?.certificateId}
                      </span>
                    </div>
                    {onNavigateToCertificates && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToCertificates();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View Certificate Badge</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Text Format Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06140f] border border-slate-200 dark:border-emerald-950">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                  Official Communication Transcript
                </span>
                <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {email.bodyText}
                </pre>
              </div>

            </div>
          ) : (
            /* HTML Email Rendering Preview */
            <div className="w-full rounded-2xl border border-slate-200 dark:border-emerald-900/60 overflow-hidden bg-white shadow-inner">
              <iframe
                title="HTML Email Preview"
                srcDoc={email.bodyHtml}
                className="w-full h-[480px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-[#06140f] border-t border-slate-200 dark:border-emerald-950 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!email.read && (
              <button
                type="button"
                onClick={handleMarkAsRead}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark as Read</span>
              </button>
            )}
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete Notice</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isCourseEnrollment && onNavigateToCourse && email.metadata?.courseId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToCourse(email.metadata!.courseId!);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Go to Course Workspace</span>
              </button>
            )}
            {isCertificateAward && onNavigateToCertificates && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToCertificates();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Open Digital Certificate</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
