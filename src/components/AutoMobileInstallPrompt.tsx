import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useSettings } from '../context/SettingsContext';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

export const AutoMobileInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isMobile, showAutoPrompt, dismissAutoPrompt, install } =
    usePWAInstall();
  const { settings } = useSettings();

  // If already installed as standalone app or dismissed, do not render
  if (isInstalled || !showAutoPrompt) {
    return null;
  }

  // Only show automated prompt if installable on Android/Chrome or on iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <aside
      aria-label="App installation notification"
      id="auto-mobile-install-banner"
      className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-white dark:bg-[#071530] rounded-2xl border-2 border-[#05286f]/30 dark:border-[#0e2a66] p-4 shadow-2xl text-slate-900 dark:text-white backdrop-blur-md relative overflow-hidden">
        {/* Subtle top accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#05286f] via-[#4ea836] to-[#05286f]" />

        <div className="flex items-start gap-3">
          {/* Logo Icon */}
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src={settings.logoUrl || '/logo.png'}
              alt="StartSmart Tech Hub"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#05286f]/10 dark:bg-[#05286f]/40 text-[#05286f] dark:text-sky-300 border border-[#05286f]/20">
                Official Mobile App
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Offline Ready
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white font-['Outfit'] leading-snug">
              Install {settings.name || 'StartSmart Tech Hub'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {isIOS
                ? 'Tap Share and select "Add to Home Screen" for instant mobile access and offline ID pass.'
                : 'Install on your mobile home screen for 1-tap access, lab timetable, and verified credentials.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-3 flex items-center gap-2">
              {isInstallable && (
                <button
                  type="button"
                  id="auto-install-action-btn"
                  onClick={install}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#05286f] hover:bg-[#073aa0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#05286f]/20 transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App Now</span>
                </button>
              )}

              {isIOS && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Share className="w-3.5 h-3.5 text-[#05286f] dark:text-sky-400" />
                  <span>Tap <strong>Share</strong> then <strong>Add to Home Screen</strong></span>
                </div>
              )}

              <button
                type="button"
                id="auto-install-dismiss-btn"
                onClick={dismissAutoPrompt}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={dismissAutoPrompt}
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
