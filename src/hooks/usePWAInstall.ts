import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAutoPrompt, setShowAutoPrompt] = useState(false);

  useEffect(() => {
    // Detect standalone display mode (already installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // Detect mobile device
    const userAgent = (window.navigator.userAgent || '').toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    const isSmallScreen = window.innerWidth <= 840;
    const mobileDevice = isIOSDevice || isAndroidDevice || isSmallScreen;

    setIsIOS(isIOSDevice);
    setIsMobile(mobileDevice);

    // Check if dismissed recently (within 1 day)
    const dismissedAt = localStorage.getItem('startsmart_pwa_dismissed_at');
    const wasDismissedRecently =
      dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 24 * 60 * 60 * 1000;

    // Automatic prompt for iOS Safari after 2 seconds if not standalone and not recently dismissed
    let iosTimer: ReturnType<typeof setTimeout> | null = null;
    if (isIOSDevice && !isStandalone && !wasDismissedRecently) {
      iosTimer = setTimeout(() => {
        setShowAutoPrompt(true);
      }, 1800);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Automatically show install prompt on mobile devices if not installed
      if (!isStandalone && !wasDismissedRecently) {
        setShowAutoPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowAutoPrompt(false);
      localStorage.removeItem('startsmart_pwa_dismissed_at');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setShowAutoPrompt(false);
          return true;
        }
      } catch (err) {
        console.warn('Installation prompt error:', err);
      }
    }
    return false;
  };

  const dismissAutoPrompt = () => {
    setShowAutoPrompt(false);
    localStorage.setItem('startsmart_pwa_dismissed_at', Date.now().toString());
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isMobile,
    showAutoPrompt,
    setShowAutoPrompt,
    dismissAutoPrompt,
    install,
  };
}
